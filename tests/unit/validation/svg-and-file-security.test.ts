import { describe, expect, it } from "vitest";
import {
  processUploadedLogoFile,
  sanitizeSvgContent,
  validateLogoFile,
} from "@/lib/utils/file-utils";
import { buildDecoratedLogoDataUri } from "@/lib/qr/renderer/qr-adapter";
import { isValidHexColor, normalizeHexColor } from "@/lib/utils/color-utils";

describe("Hexadecimal Colour Validation & Normalization", () => {
  it("validates 3-digit and 6-digit hex colours", () => {
    expect(isValidHexColor("#171717")).toBe(true);
    expect(isValidHexColor("#fff")).toBe(true);
    expect(isValidHexColor("#2563EB")).toBe(true);
    expect(isValidHexColor("171717")).toBe(false);
    expect(isValidHexColor("#12345")).toBe(false);
    expect(isValidHexColor("#GGGGGG")).toBe(false);
  });

  it("normalizes short and unprefixed hex values to uppercase 6-digit #RRGGBB", () => {
    expect(normalizeHexColor("#abc")).toBe("#AABBCC");
    expect(normalizeHexColor("2563eb")).toBe("#2563EB");
    expect(normalizeHexColor("invalid", "#000000")).toBe("#000000");
  });
});

describe("Logo File Validation", () => {
  it("accepts valid PNG, JPEG, WebP, and SVG files within the 2 MB limit", () => {
    expect(
      validateLogoFile({
        name: "brand.png",
        type: "image/png",
        size: 150 * 1024,
      }).isValid
    ).toBe(true);

    expect(
      validateLogoFile({
        name: "logo.svg",
        type: "image/svg+xml",
        size: 12 * 1024,
      }).isValid
    ).toBe(true);
  });

  it("rejects empty files, files over 2 MB, and unsupported MIME types or extensions", () => {
    expect(
      validateLogoFile({ name: "empty.png", type: "image/png", size: 0 })
        .isValid
    ).toBe(false);

    expect(
      validateLogoFile({
        name: "huge.png",
        type: "image/png",
        size: 3 * 1024 * 1024,
      }).isValid
    ).toBe(false);

    expect(
      validateLogoFile({
        name: "payload.html",
        type: "text/html",
        size: 1024,
      }).isValid
    ).toBe(false);

    expect(
      validateLogoFile({
        name: "disguised.exe",
        type: "image/png",
        size: 1024,
      }).isValid
    ).toBe(false);
  });
});

describe("SVG Security Sanitizer (Multi-Layer XML Parser + AST + DOMPurify)", () => {
  it("accepts clean vector SVG markup and encodes to a safe base64 Data URI", () => {
    const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#2563EB"/></svg>`;
    const result = sanitizeSvgContent(cleanSvg);

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSvg).toContain("<circle");
    expect(result.dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("rejects SVG containing <script> elements", () => {
    const malicious = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert('xss')</script><rect width="10" height="10"/></svg>`;
    const result = sanitizeSvgContent(malicious);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/forbidden <script> element/i);
  });

  it("rejects SVG containing inline event-handler attributes (onload, onerror, onclick)", () => {
    const malicious = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="10" height="10"/></svg>`;
    const result = sanitizeSvgContent(malicious);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/event handler attribute/i);
  });

  it("rejects SVG containing <foreignObject> or embedded HTML", () => {
    const malicious = `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="100" height="100"><body xmlns="http://www.w3.org/1999/xhtml"><iframe src="https://evil.example"/></body></foreignObject></svg>`;
    const result = sanitizeSvgContent(malicious);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/forbidden <foreignobject> element/i);
  });

  it("rejects SVG referencing external HTTP/HTTPS resources", () => {
    const externalImage = `<svg xmlns="http://www.w3.org/2000/svg"><image href="https://tracker.example.com/pixel.png" width="10" height="10"/></svg>`;
    const result = sanitizeSvgContent(externalImage);

    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/external or unsafe URL reference/i);
  });

  it("rejects SVG with unsafe URI schemes (javascript:, data:text/html)", () => {
    const jsScheme = `<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect width="10" height="10"/></a></svg>`;
    expect(sanitizeSvgContent(jsScheme).isValid).toBe(false);

    const dataHtmlScheme = `<svg xmlns="http://www.w3.org/2000/svg"><image href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="/></svg>`;
    expect(sanitizeSvgContent(dataHtmlScheme).isValid).toBe(false);
  });

  it("rejects SVG containing unsafe CSS constructs (@import, external url(), relative url(), expression())", () => {
    const cssImport = `<svg xmlns="http://www.w3.org/2000/svg"><style>@import url("https://evil.example/xss.css");</style><rect width="10" height="10"/></svg>`;
    expect(sanitizeSvgContent(cssImport).isValid).toBe(false);

    const inlineCssUrl = `<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" style="fill: url(https://evil.example/leak)"/></svg>`;
    expect(sanitizeSvgContent(inlineCssUrl).isValid).toBe(false);

    const relativeCssUrl = `<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" style="fill: url('tracker.svg#g')"/></svg>`;
    expect(sanitizeSvgContent(relativeCssUrl).isValid).toBe(false);

    const relativeAttrUrl = `<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="url(external.svg#g)"/></svg>`;
    expect(sanitizeSvgContent(relativeAttrUrl).isValid).toBe(false);
  });

  it("preserves legitimate SVG logos containing internal <linearGradient> and url(#id) references", () => {
    const validGradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="brand-grad_1"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#brand-grad_1)" style="fill: url('#brand-grad_1')"/></svg>`;
    const result = sanitizeSvgContent(validGradientSvg);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedSvg).toContain("linearGradient");
    expect(result.dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("enforces defense-in-depth validation inside buildDecoratedLogoDataUri", () => {
    const safeSource =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    // Rejects external or javascript: logo.source
    expect(() =>
      buildDecoratedLogoDataUri({
        source: "https://evil.example/logo.png",
        size: 0.22,
        margin: 4,
        shape: "circle",
      })
    ).toThrow(/Unsafe or invalid logo Data URI/i);

    // Ignores/strips invalid or injected backgroundColor attributes
    const decoratedWithBadBg = buildDecoratedLogoDataUri({
      source: safeSource,
      size: 0.22,
      margin: 4,
      shape: "rounded",
      backgroundColor: '#FFFFFF" onload="alert(1)',
    });
    const decodedSvg = Buffer.from(
      decoratedWithBadBg.replace("data:image/svg+xml;base64,", ""),
      "base64"
    ).toString("utf-8");
    expect(decodedSvg).not.toContain("onload");
    expect(decodedSvg).not.toContain("alert(1)");
  });

  it("rejects XML DOCTYPE / ENTITY expansion payloads and malformed XML", () => {
    const xxeSvg = `<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"><text>&xxe;</text></svg>`;
    expect(sanitizeSvgContent(xxeSvg).isValid).toBe(false);

    const malformed = `<svg xmlns="http://www.w3.org/2000/svg"><rect width="10"></svg>`;
    expect(sanitizeSvgContent(malformed).isValid).toBe(false);
  });

  it("processes valid and malicious SVG File objects via processUploadedLogoFile", async () => {
    const validFile = new File(
      [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#171717"/></svg>`,
      ],
      "clean.svg",
      { type: "image/svg+xml" }
    );
    const okRes = await processUploadedLogoFile(validFile);
    expect(okRes.isValid).toBe(true);
    expect(okRes.dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);

    const badFile = new File(
      [
        `<svg xmlns="http://www.w3.org/2000/svg"><script>evil()</script></svg>`,
      ],
      "evil.svg",
      { type: "image/svg+xml" }
    );
    const badRes = await processUploadedLogoFile(badFile);
    expect(badRes.isValid).toBe(false);
    expect(badRes.error).toMatch(/forbidden <script>/i);
  });
});
