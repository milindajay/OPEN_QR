import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const JSQR_SCRIPT_PATH = path.join(
  process.cwd(),
  "node_modules/jsqr/dist/jsQR.js"
);

async function exportAndDecodePng(page: Page): Promise<string | null> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("download-png-btn").click(),
  ]);
  const filePath = await download.path();
  if (!filePath) {
    return null;
  }
  const pngBytes = fs.readFileSync(filePath);
  const base64 = pngBytes.toString("base64");

  return page.evaluate(async (dataUri: string) => {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = dataUri;
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

    for (const targetSize of [400, img.naturalWidth, 256]) {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
      const decoded = jsqrFn(imageData.data, targetSize, targetSize);
      if (decoded?.data) {
        return decoded.data;
      }
    }
    return null;
  }, `data:image/png;base64,${base64}`);
}

test.describe("Phase 3 — All 12 QR Content Generator Forms & Independent jsQR Decoding", () => {
  test("generates, validates, switches, and independently decodes QR codes across all 12 types with zero external requests or storage", async ({
    page,
    context,
  }) => {
    const externalRequests: string[] = [];
    const appOriginRequests: string[] = [];
    const payloadLeakedRequests: string[] = [];
    const sensitiveTokens = [
      "UltraSecurePass123",
      "ada@openqr.studio",
      "442079460958",
      "Studio_5G",
      "openqr@upi",
    ];

    page.on("request", (req) => {
      const url = req.url();
      const postData = req.postData() ?? "";
      for (const token of sensitiveTokens) {
        if (url.includes(token) || postData.includes(token)) {
          payloadLeakedRequests.push(url);
        }
      }
      if (
        url.startsWith("http://localhost:3000") ||
        url.startsWith("data:") ||
        url.startsWith("blob:")
      ) {
        appOriginRequests.push(url);
      } else {
        externalRequests.push(url);
      }
    });

    await page.goto("/create");
    await page.addScriptTag({ path: JSQR_SCRIPT_PATH });

    // 1. URL QR (also apply Midnight preset to verify design settings persist across all 12 type switches)
    await page.getByTestId("preset-midnight").click();
    await expect(page.getByTestId("design-summary-bar")).toContainText(
      "rounded"
    );
    await page.getByLabel(/Website URL/i).fill("https://openqr.studio/phase3");
    expect(await exportAndDecodePng(page)).toBe("https://openqr.studio/phase3");

    // 2. Plain Text QR (Multilingual Unicode: English, Sinhala, Tamil, Japanese, Arabic, Emoji)
    await page.getByTestId("qr-type-text").click();
    const unicodeText =
      "OpenQR | ආයුබෝවන් | வணக்கம் | こんにちは | مرحبا 🚀";
    await page.getByLabel(/Plain Text \(UTF-8\)/i).fill(unicodeText);
    expect(await exportAndDecodePng(page)).toBe(unicodeText);

    // 3. vCard QR
    await page.getByTestId("qr-type-vcard").click();
    await page.getByLabel(/First Name/i).fill("Ada");
    await page.getByLabel(/Last Name/i).fill("Lovelace");
    await page.getByLabel(/Organization/i).fill("OpenQR Studio");
    await page.getByLabel(/Job Title/i).fill("Chief Architect");
    await page.getByLabel(/Phone Number/i).fill("+442079460958");
    await page.getByLabel(/Email Address/i).fill("ada@openqr.studio");
    await page.getByLabel(/Website/i).fill("https://openqr.studio");
    await page.getByLabel(/Street Address/i).fill("10 St James Square");
    await page.getByLabel(/^City$/i).fill("London");
    await page.getByLabel(/State \/ Province/i).fill("Greater London");
    await page.getByLabel(/Postal Code/i).fill("SW1Y 4LE");
    await page.getByLabel(/^Country$/i).fill("UK");
    const decodedVcard = await exportAndDecodePng(page);
    expect(decodedVcard).toContain("BEGIN:VCARD\r\nVERSION:3.0");
    expect(decodedVcard).toContain("FN:Ada Lovelace");
    expect(decodedVcard).toContain("EMAIL:ada@openqr.studio");
    expect(decodedVcard).toContain(
      "ADR;TYPE=WORK:;;10 St James Square;London;Greater London;SW1Y 4LE;UK"
    );

    // 4. Wi-Fi QR
    await page.getByTestId("qr-type-wifi").click();
    await page.getByLabel(/Network Name \(SSID\)/i).fill("Studio_5G");
    await page.getByLabel(/Network Password/i).fill("UltraSecurePass123");
    expect(await exportAndDecodePng(page)).toBe(
      "WIFI:T:WPA;S:Studio_5G;P:UltraSecurePass123;H:false;;"
    );

    // 5. Email QR
    await page.getByTestId("qr-type-email").click();
    await page.getByLabel(/Email Address/i).fill("team@openqr.studio");
    await page.getByLabel(/Subject/i).fill("Phase 3 Launch");
    await page.getByLabel(/Message/i).fill("Ready for review!");
    expect(await exportAndDecodePng(page)).toBe(
      "mailto:team@openqr.studio?subject=Phase%203%20Launch&body=Ready%20for%20review!"
    );

    // 6. Phone QR
    await page.getByTestId("qr-type-phone").click();
    await page.getByLabel(/Phone Number/i).fill("+1 (415) 555-0199");
    expect(await exportAndDecodePng(page)).toBe("tel:+14155550199");

    // 7. SMS QR
    await page.getByTestId("qr-type-sms").click();
    await page.getByLabel(/Phone Number/i).fill("+94 77 123 4567");
    await page.getByLabel(/Pre-filled Message/i).fill("Hello OpenQR!");
    expect(await exportAndDecodePng(page)).toBe(
      "sms:+94771234567?body=Hello%20OpenQR!"
    );

    // 8. Location QR
    await page.getByTestId("qr-type-location").click();
    await page.getByLabel(/Latitude/i).fill("6.9271");
    await page.getByLabel(/Longitude/i).fill("79.8612");
    await page.getByLabel(/Location Label/i).fill("Colombo Fort");
    expect(await exportAndDecodePng(page)).toBe(
      "geo:6.9271,79.8612?q=6.9271,79.8612(Colombo%20Fort)"
    );

    // 9. WhatsApp QR
    await page.getByTestId("qr-type-whatsapp").click();
    await page.getByLabel(/Country Code/i).fill("+94");
    await page.getByLabel(/International Phone Number/i).fill("077 123 4567");
    await page.getByLabel(/Pre-filled Message/i).fill("Hi via WhatsApp");
    expect(await exportAndDecodePng(page)).toBe(
      "https://wa.me/94771234567?text=Hi%20via%20WhatsApp"
    );

    // 10. Social Media QR (test invalid incomplete handle first, then valid Telegram handle)
    await page.getByTestId("qr-type-social").click();
    await page.getByTestId("social-provider-telegram").click();
    const socialInput = page.locator("#social-handle-input");
    await socialInput.fill("@");
    await expect(page.locator("#social-url-error")).toContainText(
      /complete username/i
    );
    await expect(page.getByTestId("qr-preview-empty")).toBeVisible();

    await socialInput.fill("@openqrstudio");
    expect(await exportAndDecodePng(page)).toBe("https://t.me/openqrstudio");

    // 11. Calendar Event QR (All-day toggle: inclusive 2026-11-20 to 2026-11-21 -> RFC 5545 exclusive DTEND 20261122)
    await page.getByTestId("qr-type-calendar").click();
    await page.getByLabel(/Event Title/i).fill("OpenQR Summit");
    await page.getByRole("switch", { name: /All-Day Event/i }).click();
    await page.getByLabel(/Start Date/i).fill("2026-11-20");
    await page.getByLabel(/End Date/i).fill("2026-11-21");
    await page.getByLabel(/Location/i).fill("Colombo");
    const decodedCalendar = await exportAndDecodePng(page);
    expect(decodedCalendar).toContain("SUMMARY:OpenQR Summit");
    expect(decodedCalendar).toContain("DTSTART;VALUE=DATE:20261120");
    expect(decodedCalendar).toContain("DTEND;VALUE=DATE:20261122");

    // 12. Custom Data QR
    await page.getByTestId("qr-type-custom").click();
    const rawCustom = "upi://pay?pa=openqr@upi&pn=OpenQRStudio&am=25.00";
    await page.getByLabel(/Custom Payload String/i).fill(rawCustom);
    expect(await exportAndDecodePng(page)).toBe(rawCustom);

    // Verify switching back to Wi-Fi restores the previously entered Wi-Fi SSID and preserves Midnight preset
    await page.getByTestId("qr-type-wifi").click();
    await expect(page.getByLabel(/Network Name \(SSID\)/i)).toHaveValue(
      "Studio_5G"
    );
    await expect(page.getByTestId("design-summary-bar")).toContainText(
      "#0F172A"
    );

    // Complete Browser Privacy Audit:
    // 1. Outbound external requests and payload-leaking requests must be empty
    expect(externalRequests).toEqual([]);
    expect(payloadLeakedRequests).toEqual([]);
    expect(appOriginRequests.length).toBeGreaterThan(0);

    // 2. Verify localStorage, sessionStorage, IndexedDB, document.cookie, Cache Storage, and Service Workers
    const browserPrivacyAudit = await page.evaluate(async () => {
      const localKeys = Object.keys(window.localStorage);
      const sessionKeys = Object.keys(window.sessionStorage);
      const cookieString = document.cookie;
      const idbDatabases =
        typeof window.indexedDB?.databases === "function"
          ? await window.indexedDB.databases()
          : [];
      const cacheNames =
        typeof window.caches?.keys === "function"
          ? await window.caches.keys()
          : [];
      const swRegistrations =
        typeof navigator.serviceWorker?.getRegistrations === "function"
          ? await navigator.serviceWorker.getRegistrations()
          : [];

      return {
        localKeys,
        sessionKeys,
        cookieString,
        idbDatabaseCount: idbDatabases.length,
        cacheNames,
        swRegistrationCount: swRegistrations.length,
      };
    });

    const contextCookies = await context.cookies();
    expect(browserPrivacyAudit).toEqual({
      localKeys: [],
      sessionKeys: [],
      cookieString: "",
      idbDatabaseCount: 0,
      cacheNames: [],
      swRegistrationCount: 0,
    });
    expect(contextCookies).toEqual([]);
  });

  test("mobile viewport (375x812) supports switching QR types and filling forms with sticky preview and zero horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/create");

    await page.getByTestId("qr-type-wifi").click();
    await page.getByLabel(/Network Name \(SSID\)/i).fill("Mobile_Net");
    await page.getByLabel(/Network Password/i).fill("MobilePass123");

    await expect(
      page.getByTestId("mobile-mini-qr-canvas").locator("svg")
    ).toBeVisible();

    await page.getByTestId("qr-type-calendar").click();
    await page.getByLabel(/Event Title/i).fill("Mobile Event");
    await page.getByLabel(/Start Date/i).fill("2026-12-01");
    await page.getByLabel(/End Date/i).fill("2026-12-01");

    await expect(
      page.getByTestId("mobile-mini-qr-canvas").locator("svg")
    ).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
