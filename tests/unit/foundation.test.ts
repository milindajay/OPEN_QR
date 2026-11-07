import { describe, expect, it } from "vitest";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { QR_TYPES, getQRTypeMetadata } from "@/lib/constants/qr-types";

describe("OpenQR Studio Foundation", () => {
  it("exposes 12 supported QR types", () => {
    expect(QR_TYPES).toHaveLength(12);
    const ids = QR_TYPES.map((t) => t.id);
    expect(ids).toEqual([
      "url",
      "text",
      "vcard",
      "wifi",
      "email",
      "phone",
      "sms",
      "location",
      "whatsapp",
      "social",
      "calendar",
      "custom",
    ]);
  });

  it("retrieves metadata for a specific QR type with safe export slugs", () => {
    const wifiMeta = getQRTypeMetadata("wifi");
    expect(wifiMeta.label).toBe("Wi-Fi Network");
    expect(wifiMeta.exportSlug).toBe("wifi");
  });

  it("enforces MIT license, official GitHub URL, and valid default dimensions", () => {
    expect(APP_CONFIG.license).toBe("MIT");
    expect(APP_CONFIG.githubUrl).toBe("https://github.com/milindajay/OPEN_QR");
    expect(APP_CONFIG.defaultDimensions.minMargin).toBeGreaterThanOrEqual(4);
  });
});
