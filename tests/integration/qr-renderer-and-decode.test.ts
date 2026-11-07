import { describe, expect, it } from "vitest";
import QRCodeStyling from "qr-code-styling";
import jsQR from "jsqr";
import type { QRPayload } from "@/types/payload";
import { generatePayload } from "@/lib/qr/payloads";
import { createDefaultDesign } from "@/lib/qr/presets/design-presets";
import { mapDesignToEngineOptions } from "@/lib/qr/renderer/qr-adapter";
import { createQRRenderer } from "@/lib/qr/renderer/qr-engine";

/**
 * Renders a QR payload through the OpenQR Studio adapter + qr-code-styling engine,
 * rasterizes the resulting QR matrix into an RGBA image buffer with a 4-module quiet zone,
 * and decodes it independently using jsQR.
 */
function renderAndDecodeWithJsQr(encodedPayload: string): string | null {
  const design = createDefaultDesign();
  const options = mapDesignToEngineOptions(encodedPayload, design, "svg");
  const qrInstance = new QRCodeStyling(options);

  const internalQr = qrInstance._qr;
  if (!internalQr) {
    return null;
  }

  const moduleCount = internalQr.getModuleCount();
  const scale = 4;
  const quietZonePx = 4 * scale;
  const imageSize = moduleCount * scale + quietZonePx * 2;
  const rgba = new Uint8ClampedArray(imageSize * imageSize * 4).fill(255);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (internalQr.isDark(row, col)) {
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const x = quietZonePx + col * scale + dx;
            const y = quietZonePx + row * scale + dy;
            const idx = (y * imageSize + x) * 4;
            rgba[idx] = 0;
            rgba[idx + 1] = 0;
            rgba[idx + 2] = 0;
            rgba[idx + 3] = 255;
          }
        }
      }
    }
  }

  const decoded = jsQR(rgba, imageSize, imageSize);
  return decoded ? decoded.data : null;
}

describe("Independent QR Decoding via jsQR (All 12 Payload Types)", () => {
  const payloads: ReadonlyArray<{ label: string; payload: QRPayload }> = [
    {
      label: "URL",
      payload: {
        type: "url",
        url: "https://openqr.studio/create?mode=url&privacy=1",
      },
    },
    {
      label: "Plain Text",
      payload: {
        type: "text",
        text: "OpenQR Studio: 100% browser-based QR generation.",
      },
    },
    {
      label: "vCard 3.0",
      payload: {
        type: "vcard",
        firstName: "Milinda",
        lastName: "John",
        fullName: "Milinda John",
        organization: "OpenQR Studio",
        jobTitle: "Principal Engineer",
        mobile: "+94771234567",
        email: "milinda@openqr.studio",
        website: "https://openqr.studio",
      },
    },
    {
      label: "Wi-Fi",
      payload: {
        type: "wifi",
        ssid: "Studio_5G;Lab",
        password: "Ultra:Secure,Password!",
        security: "WPA",
        hidden: false,
      },
    },
    {
      label: "Email",
      payload: {
        type: "email",
        email: "hello@openqr.studio",
        subject: "Open Source Collaboration",
        message: "Let's build privacy-first tools.",
      },
    },
    {
      label: "Phone",
      payload: {
        type: "phone",
        phone: "+14155550123",
      },
    },
    {
      label: "SMS",
      payload: {
        type: "sms",
        phone: "+14155550123",
        message: "Confirming appointment at 10:30 AM",
      },
    },
    {
      label: "Location (geo URI)",
      payload: {
        type: "location",
        latitude: 6.9271,
        longitude: 79.8612,
        format: "geo",
      },
    },
    {
      label: "WhatsApp",
      payload: {
        type: "whatsapp",
        countryCode: "+94",
        phone: "0771234567",
        message: "Hello via WhatsApp QR!",
      },
    },
    {
      label: "Social Media",
      payload: {
        type: "social",
        provider: "x",
        url: "@openqrstudio",
      },
    },
    {
      label: "Calendar VEVENT",
      payload: {
        type: "calendar",
        title: "OpenQR Architecture Review",
        start: "2026-11-15T14:00:00Z",
        end: "2026-11-15T15:00:00Z",
        location: "Main Conference Room",
      },
    },
    {
      label: "Custom Payload",
      payload: {
        type: "custom",
        value: "bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.01",
      },
    },
  ];

  for (const { label, payload } of payloads) {
    it(`generates, renders, and independently decodes ${label} QR code`, () => {
      const expected = generatePayload(payload);
      const decoded = renderAndDecodeWithJsQr(expected);
      expect(decoded).toBe(expected);
    });
  }
});

describe("Independent QR Decoding for Multilingual & Unicode Content", () => {
  const unicodeCases: ReadonlyArray<{ language: string; text: string }> = [
    {
      language: "Sinhala",
      text: "ආයුබෝවන් ශ්‍රී ලංකා - නිදහස් හා විවෘත QR කේත උත්පාදකය",
    },
    {
      language: "Tamil",
      text: "வணக்கம் தமிழ் - இலவச திறந்த மூல QR குறியீடு உருவாக்கி",
    },
    {
      language: "Japanese",
      text: "こんにちは世界！プライバシー重視のオープンソースQRコードスタジオ",
    },
    {
      language: "Arabic",
      text: "مرحبا بالعالم - مولد رمز الاستجابة السريعة مفتوح المصدر",
    },
    {
      language: "Emoji & Symbols",
      text: "OpenQR Studio 🚀✨🔒🎨📱 100% Free & Private!",
    },
    {
      language: "Mixed Multilingual",
      text: "EN: Hello | SI: ආයුබෝවන් | TA: வணக்கம் | JA: こんにちは | AR: مرحبا | 🌍🚀",
    },
  ];

  for (const { language, text } of unicodeCases) {
    it(`accurately encodes and decodes ${language} UTF-8 QR payload`, () => {
      const payload = generatePayload({ type: "text", text });
      const decoded = renderAndDecodeWithJsQr(payload);
      expect(decoded).toBe(text);
    });
  }
});

describe("BrowserQRRenderer Adapter Lifecycle & Error Handling", () => {
  it("mounts, renders an SVG node, clears on empty input, and cleans up on destroy", async () => {
    const container = document.createElement("div");
    const renderer = createQRRenderer();
    const design = createDefaultDesign();

    await renderer.mount(container);
    expect(container.childNodes.length).toBe(0);

    await renderer.update("https://openqr.studio", design);
    expect(container.childNodes.length).toBe(1);
    expect(container.querySelector("svg")).not.toBeNull();

    // Empty payload clears the container
    await renderer.update("", design);
    expect(container.childNodes.length).toBe(0);

    // Re-render and then destroy
    await renderer.update("https://openqr.studio/about", design);
    expect(container.querySelector("svg")).not.toBeNull();

    renderer.destroy();
    expect(container.childNodes.length).toBe(0);
  });

  it("rejects payloads that exceed QR Version 40 capacity with an explicit error", async () => {
    const container = document.createElement("div");
    const renderer = createQRRenderer();
    const design = { ...createDefaultDesign(), errorCorrection: "H" as const };

    await renderer.mount(container);
    await expect(
      renderer.update("X".repeat(1500), design)
    ).rejects.toThrow(/exceeds maximum QR capacity/i);

    renderer.destroy();
  });
});
