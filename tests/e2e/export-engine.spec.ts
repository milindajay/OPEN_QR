import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import {
  inspectJpegBytes,
  inspectPngBytes,
} from "../../lib/qr/renderer/export-validation";

const JSQR_SCRIPT_PATH = path.join(
  process.cwd(),
  "node_modules/jsqr/dist/jsQR.js"
);

async function downloadFileBytes(
  page: Page,
  triggerTestId: string
): Promise<{
  suggestedFilename: string;
  bytes: Uint8Array;
  durationMs: number;
}> {
  const start = performance.now();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId(triggerTestId).click(),
  ]);
  const filePath = await download.path();
  const durationMs = Math.round(performance.now() - start);
  expect(filePath).toBeTruthy();
  const buf = fs.readFileSync(filePath!);
  return {
    suggestedFilename: download.suggestedFilename(),
    bytes: new Uint8Array(buf),
    durationMs,
  };
}

async function decodeRasterDataUriInPage(
  page: Page,
  dataUri: string
): Promise<{
  decoded: string | null;
  naturalWidth: number;
  naturalHeight: number;
  topLeftPixel: [number, number, number, number];
  centerPixel: [number, number, number, number];
}> {
  return page.evaluate(async (uri: string) => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load raster data URI"));
      img.src = uri;
    });

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    // Inspect raw pixels without compositing first (to verify alpha channel / background)
    const rawCanvas = document.createElement("canvas");
    rawCanvas.width = natW;
    rawCanvas.height = natH;
    const rawCtx = rawCanvas.getContext("2d")!;
    rawCtx.clearRect(0, 0, natW, natH);
    rawCtx.drawImage(img, 0, 0);
    const tl = Array.from(rawCtx.getImageData(2, 2, 1, 1).data) as [
      number,
      number,
      number,
      number,
    ];
    const center = Array.from(
      rawCtx.getImageData(Math.floor(natW / 2), Math.floor(natH / 2), 1, 1).data
    ) as [number, number, number, number];

    const jsqrFn = (
      window as unknown as {
        jsQR: (
          data: Uint8ClampedArray,
          width: number,
          height: number
        ) => { data: string } | null;
      }
    ).jsQR;

    let decoded: string | null = null;
    for (const targetSize of [512, natW, 384, 256]) {
      const decodeCanvas = document.createElement("canvas");
      decodeCanvas.width = targetSize;
      decodeCanvas.height = targetSize;
      const ctx = decodeCanvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
      const res = jsqrFn(imgData.data, targetSize, targetSize);
      if (res?.data) {
        decoded = res.data;
        break;
      }
    }

    rawCanvas.width = 0;
    rawCanvas.height = 0;

    return {
      decoded,
      naturalWidth: natW,
      naturalHeight: natH,
      topLeftPixel: tl,
      centerPixel: center,
    };
  }, dataUri);
}

async function validateAndDecodeSvgInPage(
  page: Page,
  svgText: string
): Promise<{
  isValidXml: boolean;
  rootTag: string;
  width: number;
  height: number;
  viewBox: string;
  vectorElementCount: number;
  hasLinearGradient: boolean;
  hasEmbeddedLogo: boolean;
  hasLogoBackingPlate: boolean;
  hasOpaqueBackgroundRect: boolean;
  hasForbiddenElements: boolean;
  hasExternalReferences: boolean;
  decoded: string | null;
}> {
  return page.evaluate(async (rawSvg: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
    const parserError = doc.querySelector("parsererror");
    const root = doc.documentElement;

    const width = Number.parseInt(root.getAttribute("width") ?? "0", 10) || 0;
    const height = Number.parseInt(root.getAttribute("height") ?? "0", 10) || 0;
    const viewBox = root.getAttribute("viewBox") ?? "";

    const vectorElementCount = root.querySelectorAll(
      "path, rect, circle, polygon"
    ).length;
    const hasLinearGradient =
      root.querySelectorAll("linearGradient").length > 0;
    const hasEmbeddedLogo = Boolean(root.querySelector("image"));
    const hasLogoBackingPlate = Boolean(
      root.querySelector('[data-logo-backing-plate="true"]')
    );
    const bgRect = root.querySelector('[data-qr-background="true"]');
    const hasOpaqueBackgroundRect = Boolean(bgRect);

    const hasForbiddenElements =
      root.querySelectorAll("script, foreignObject, iframe, object, embed")
        .length > 0;
    let hasExternalReferences = false;
    for (const el of Array.from(root.querySelectorAll("*"))) {
      for (const attr of Array.from(el.attributes)) {
        if (attr.name.startsWith("on")) {
          hasExternalReferences = true;
        }
        if (
          (attr.name === "href" || attr.name === "xlink:href") &&
          !attr.value.startsWith("#") &&
          !attr.value.startsWith("data:image/")
        ) {
          hasExternalReferences = true;
        }
      }
    }

    // Independently rasterize the standalone SVG and decode with jsQR
    const bytes = new TextEncoder().encode(rawSvg);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    const svgDataUri = `data:image/svg+xml;base64,${btoa(binary)}`;

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error("Failed to rasterize exported standalone SVG"));
      img.src = svgDataUri;
    });

    const jsqrFn = (
      window as unknown as {
        jsQR: (
          data: Uint8ClampedArray,
          width: number,
          height: number
        ) => { data: string } | null;
      }
    ).jsQR;

    let decoded: string | null = null;
    for (const size of [512, width || 512, 384]) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const res = jsqrFn(imageData.data, size, size);
      canvas.width = 0;
      canvas.height = 0;
      if (res?.data) {
        decoded = res.data;
        break;
      }
    }

    return {
      isValidXml: !parserError && root.tagName.toLowerCase() === "svg",
      rootTag: root.tagName.toLowerCase(),
      width,
      height,
      viewBox,
      vectorElementCount,
      hasLinearGradient,
      hasEmbeddedLogo,
      hasLogoBackingPlate,
      hasOpaqueBackgroundRect,
      hasForbiddenElements,
      hasExternalReferences,
      decoded,
    };
  }, svgText);
}

test.describe("Phase 4 — Production-Grade Export Engine E2E Verification", () => {
  test("exports and independently validates PNG, JPEG, and standalone vector SVG across 256, 512, 1024, 2048, and custom 640 dimensions", async ({
    page,
  }) => {
    await page.goto("/create");
    await page.addScriptTag({ path: JSQR_SCRIPT_PATH });

    const targetUrl = "https://openqr.studio/phase4-dimensions";
    await page.getByLabel(/Website URL/i).fill(targetUrl);

    const presetSizes = [256, 512, 1024, 2048] as const;

    for (const size of presetSizes) {
      await page.getByTestId(`export-size-${size}`).click();
      await expect(page.getByTestId("export-active-dimensions")).toHaveText(
        `${size} × ${size} px`
      );

      // 1. PNG Download & Validation
      const pngResult = await downloadFileBytes(page, "download-png-btn");
      expect(pngResult.suggestedFilename).toBe("openqr-website.png");
      const pngHeader = inspectPngBytes(pngResult.bytes);
      expect(pngHeader.isValidPng).toBe(true);
      expect(pngHeader.width).toBe(size);
      expect(pngHeader.height).toBe(size);
      expect(pngHeader.hasAlphaChannel).toBe(true);

      const pngDecode = await decodeRasterDataUriInPage(
        page,
        `data:image/png;base64,${Buffer.from(pngResult.bytes).toString("base64")}`
      );
      expect(pngDecode.naturalWidth).toBe(size);
      expect(pngDecode.naturalHeight).toBe(size);
      expect(pngDecode.decoded).toBe(targetUrl);

      // 2. JPEG Download & Validation
      const jpgResult = await downloadFileBytes(page, "download-jpg-btn");
      expect(jpgResult.suggestedFilename).toBe("openqr-website.jpg");
      const jpgHeader = inspectJpegBytes(jpgResult.bytes);
      expect(jpgHeader.isValidJpeg).toBe(true);
      expect(jpgHeader.width).toBe(size);
      expect(jpgHeader.height).toBe(size);

      const jpgDecode = await decodeRasterDataUriInPage(
        page,
        `data:image/jpeg;base64,${Buffer.from(jpgResult.bytes).toString("base64")}`
      );
      expect(jpgDecode.naturalWidth).toBe(size);
      expect(jpgDecode.naturalHeight).toBe(size);
      expect(jpgDecode.decoded).toBe(targetUrl);
    }

    // 3. Custom Dimension (640 × 640) across PNG, JPEG, and SVG
    await page.getByTestId("export-size-custom").click();
    const customInput = page.getByTestId("export-custom-dimension-input");
    await customInput.fill("640");
    await expect(page.getByTestId("export-active-dimensions")).toHaveText(
      "640 × 640 px"
    );

    const customPng = await downloadFileBytes(page, "download-png-btn");
    expect(inspectPngBytes(customPng.bytes).width).toBe(640);
    expect(inspectPngBytes(customPng.bytes).height).toBe(640);

    const customJpg = await downloadFileBytes(page, "download-jpg-btn");
    expect(inspectJpegBytes(customJpg.bytes).width).toBe(640);
    expect(inspectJpegBytes(customJpg.bytes).height).toBe(640);

    // Verify JPEG quality 100% vs 80% produces valid JPEGs with expected size ordering
    await page.getByTestId("export-format-tab-jpeg").click();
    await page.getByTestId("export-jpeg-quality-80").click();
    const jpg80 = await downloadFileBytes(page, "download-jpg-btn");
    await page.getByTestId("export-jpeg-quality-100").click();
    const jpg100 = await downloadFileBytes(page, "download-jpg-btn");
    expect(inspectJpegBytes(jpg80.bytes).isValidJpeg).toBe(true);
    expect(inspectJpegBytes(jpg100.bytes).isValidJpeg).toBe(true);
    expect(jpg100.bytes.byteLength).toBeGreaterThanOrEqual(
      jpg80.bytes.byteLength
    );

    const customSvg = await downloadFileBytes(page, "download-svg-btn");
    expect(customSvg.suggestedFilename).toBe("openqr-website.svg");
    const svgCheck = await validateAndDecodeSvgInPage(
      page,
      Buffer.from(customSvg.bytes).toString("utf-8")
    );
    expect(svgCheck.isValidXml).toBe(true);
    expect(svgCheck.width).toBe(640);
    expect(svgCheck.height).toBe(640);
    expect(svgCheck.viewBox).toBe("0 0 640 640");
    expect(svgCheck.decoded).toBe(targetUrl);
  });

  test("preserves state consistency across presets, gradients, transparent PNG alpha, JPEG white compositing, logo uploads (PNG & SVG), logo removal, and reset", async ({
    page,
  }) => {
    await page.goto("/create");
    await page.addScriptTag({ path: JSQR_SCRIPT_PATH });

    // 1. Switch to Multilingual Plain Text payload
    await page.getByTestId("qr-type-text").click();
    const unicodePayload =
      "OpenQR Phase 4 | ආයුබෝවන් | வணக்கம் | こんにちは | مرحبا 🚀";
    await page.getByLabel(/Plain Text \(UTF-8\)/i).fill(unicodePayload);

    // 2. Apply Sunset gradient preset and enable Transparent Background
    await page.getByTestId("preset-sunset").click();
    await page.getByTestId("export-size-512").click();
    await page.getByTestId("export-transparent-bg-switch").click();

    // Verify PNG export has true transparent alpha (topLeftPixel[3] === 0)
    const transPng = await downloadFileBytes(page, "download-png-btn");
    expect(transPng.suggestedFilename).toBe("openqr-text.png");
    const transPngInfo = await decodeRasterDataUriInPage(
      page,
      `data:image/png;base64,${Buffer.from(transPng.bytes).toString("base64")}`
    );
    expect(transPngInfo.topLeftPixel[3]).toBe(0);
    expect(transPngInfo.decoded).toBe(unicodePayload);

    // Verify JPEG export composites transparent background onto white (#FFFFFF -> RGB >= 250)
    const whiteCompJpg = await downloadFileBytes(page, "download-jpg-btn");
    expect(whiteCompJpg.suggestedFilename).toBe("openqr-text.jpg");
    const jpgInfo = await decodeRasterDataUriInPage(
      page,
      `data:image/jpeg;base64,${Buffer.from(whiteCompJpg.bytes).toString("base64")}`
    );
    expect(jpgInfo.topLeftPixel[0]).toBeGreaterThanOrEqual(250);
    expect(jpgInfo.topLeftPixel[1]).toBeGreaterThanOrEqual(250);
    expect(jpgInfo.topLeftPixel[2]).toBeGreaterThanOrEqual(250);
    expect(jpgInfo.topLeftPixel[3]).toBe(255);
    expect(jpgInfo.decoded).toBe(unicodePayload);

    // Verify SVG export has linearGradient and no opaque background rect
    const gradSvg = await downloadFileBytes(page, "download-svg-btn");
    expect(gradSvg.suggestedFilename).toBe("openqr-text.svg");
    const gradSvgInfo = await validateAndDecodeSvgInPage(
      page,
      Buffer.from(gradSvg.bytes).toString("utf-8")
    );
    expect(gradSvgInfo.isValidXml).toBe(true);
    expect(gradSvgInfo.hasLinearGradient).toBe(true);
    expect(gradSvgInfo.hasOpaqueBackgroundRect).toBe(false);
    expect(gradSvgInfo.decoded).toBe(unicodePayload);

    // 3. Upload sanitized SVG logo and configure circle backing plate
    await page.getByRole("tab", { name: "Logo" }).click();
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#DC2626"/></svg>`;
    await page.locator("#qr-logo-upload-input").setInputFiles({
      name: "studio-badge.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(logoSvg, "utf-8"),
    });
    await page.getByTestId("logo-shape-circle").click();
    await page
      .getByRole("switch", { name: "Enable solid logo backing plate" })
      .click();

    // Export SVG & PNG with logo -> verify embedded logo & backing plate & jsQR decode
    const logoSvgExport = await downloadFileBytes(page, "download-svg-btn");
    const logoSvgCheck = await validateAndDecodeSvgInPage(
      page,
      Buffer.from(logoSvgExport.bytes).toString("utf-8")
    );
    expect(logoSvgCheck.isValidXml).toBe(true);
    expect(logoSvgCheck.hasEmbeddedLogo).toBe(true);
    expect(logoSvgCheck.hasLogoBackingPlate).toBe(true);
    expect(logoSvgCheck.decoded).toBe(unicodePayload);

    const logoPngExport = await downloadFileBytes(page, "download-png-btn");
    const logoPngCheck = await decodeRasterDataUriInPage(
      page,
      `data:image/png;base64,${Buffer.from(logoPngExport.bytes).toString("base64")}`
    );
    // Center pixel must be red (#DC2626 -> R > 180, G < 60, B < 60) from the rendered logo!
    expect(logoPngCheck.centerPixel[0]).toBeGreaterThan(180);
    expect(logoPngCheck.centerPixel[1]).toBeLessThan(60);
    expect(logoPngCheck.decoded).toBe(unicodePayload);

    // 4. Remove logo -> immediately export SVG and verify logo is completely removed
    await page.getByTestId("remove-logo-btn").click();
    const removedLogoSvg = await downloadFileBytes(page, "download-svg-btn");
    const removedLogoCheck = await validateAndDecodeSvgInPage(
      page,
      Buffer.from(removedLogoSvg.bytes).toString("utf-8")
    );
    expect(removedLogoCheck.hasEmbeddedLogo).toBe(false);
    expect(removedLogoCheck.hasLogoBackingPlate).toBe(false);
    expect(removedLogoCheck.decoded).toBe(unicodePayload);

    // 5. Reset Design -> verify export reflects default 1024x1024 Classic Black solid state
    await page.getByTestId("reset-design-btn").click();
    const resetSvg = await downloadFileBytes(page, "download-svg-btn");
    const resetCheck = await validateAndDecodeSvgInPage(
      page,
      Buffer.from(resetSvg.bytes).toString("utf-8")
    );
    expect(resetCheck.width).toBe(1024);
    expect(resetCheck.height).toBe(1024);
    expect(resetCheck.hasLinearGradient).toBe(false);
    expect(resetCheck.hasOpaqueBackgroundRect).toBe(true);
    expect(resetCheck.decoded).toBe(unicodePayload);
  });

  test("copies QR image (PNG) and exact QR payload to clipboard, supports PNG download fallback, and preserves strict client-side privacy", async ({
    page,
    context,
  }) => {
    const externalRequests: string[] = [];
    const payloadLeakedRequests: string[] = [];
    const secretWifiPass = "Phase4UltraSecret!99";

    page.on("request", (req) => {
      const url = req.url();
      const post = req.postData() ?? "";
      if (url.includes(secretWifiPass) || post.includes(secretWifiPass)) {
        payloadLeakedRequests.push(url);
      }
      if (
        !url.startsWith("http://localhost:3000") &&
        !url.startsWith("data:") &&
        !url.startsWith("blob:")
      ) {
        externalRequests.push(url);
      }
    });

    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3000",
    });

    await page.goto("/create");
    await page.addScriptTag({ path: JSQR_SCRIPT_PATH });

    // Enter Wi-Fi credentials
    await page.getByTestId("qr-type-wifi").click();
    await page.getByLabel(/Network Name \(SSID\)/i).fill("OpenQR_Studio_5G");
    await page.getByLabel(/Network Password/i).fill(secretWifiPass);
    const expectedWifiPayload = `WIFI:T:WPA;S:OpenQR_Studio_5G;P:${secretWifiPass};H:false;;`;

    // 1. Copy Payload to clipboard and verify exact clipboard contents
    await page.getByTestId("copy-qr-payload-btn").click();
    await expect(page.getByTestId("export-status-banner")).toContainText(
      /Copied exact QR payload/i
    );
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardText).toBe(expectedWifiPayload);

    // 2. Copy QR Image (PNG) to clipboard, read back image/png Blob from clipboard, and decode with jsQR
    await page.getByTestId("export-size-512").click();
    await page.getByTestId("copy-qr-image-btn").click();
    await expect(page.getByTestId("export-status-banner")).toContainText(
      /Copied 512×512 PNG QR image to clipboard/i
    );

    const clipboardPngDecode = await page.evaluate(async () => {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("image/png")) {
          const blob = await item.getType("image/png");
          const dataUri = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.readAsDataURL(blob);
          });
          const img = new Image();
          await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej();
            img.src = dataUri;
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const jsqrFn = (
            window as unknown as {
              jsQR: (
                d: Uint8ClampedArray,
                w: number,
                h: number
              ) => { data: string } | null;
            }
          ).jsQR;
          const decoded = jsqrFn(imageData.data, canvas.width, canvas.height);
          return {
            width: img.naturalWidth,
            height: img.naturalHeight,
            decoded: decoded?.data ?? null,
          };
        }
      }
      return null;
    });

    expect(clipboardPngDecode).toEqual({
      width: 512,
      height: 512,
      decoded: expectedWifiPayload,
    });

    // 3. Verify graceful PNG download fallback when ClipboardItem is unavailable
    await page.evaluate(() => {
      // @ts-expect-error simulating browser without ClipboardItem
      delete window.ClipboardItem;
    });
    const [fallbackDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("copy-qr-image-btn").click(),
    ]);
    expect(fallbackDownload.suggestedFilename()).toBe("openqr-wifi.png");
    await expect(page.getByTestId("export-status-banner")).toContainText(
      /downloaded openqr-wifi\.png instead/i
    );

    // 4. Privacy & storage audit after exports and clipboard operations
    expect(externalRequests).toEqual([]);
    expect(payloadLeakedRequests).toEqual([]);

    const storageAudit = await page.evaluate(async () => ({
      localKeys: Object.keys(window.localStorage),
      sessionKeys: Object.keys(window.sessionStorage),
      cookieString: document.cookie,
      idbCount:
        typeof window.indexedDB?.databases === "function"
          ? (await window.indexedDB.databases()).length
          : 0,
      cacheKeys:
        typeof window.caches?.keys === "function"
          ? await window.caches.keys()
          : [],
    }));

    expect(storageAudit).toEqual({
      localKeys: [],
      sessionKeys: [],
      cookieString: "",
      idbCount: 0,
      cacheKeys: [],
    });
  });
});
