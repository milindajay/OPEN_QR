import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import QRCodeStyling from "qr-code-styling";
import jsQR from "jsqr";
import {
  createDefaultDesign,
  DESIGN_PRESETS,
  getDesignPresetById,
} from "@/lib/qr/presets/design-presets";
import { analyzeScanability } from "@/lib/qr/validation/scanability";
import {
  buildDecoratedLogoDataUri,
  convertModuleMarginToPixels,
  mapDesignToEngineOptions,
} from "@/lib/qr/renderer/qr-adapter";
import { createQRRenderer } from "@/lib/qr/renderer/qr-engine";
import { useQrGenerator } from "@/hooks/use-qr-generator";
import type { QRDesign } from "@/types/design";

function decodeDesignWithJsQr(payload: string, design: QRDesign): string | null {
  const options = mapDesignToEngineOptions(payload, design, "svg");
  const qrInstance = new QRCodeStyling(options);
  const internalQr = qrInstance._qr;
  if (!internalQr) {
    return null;
  }

  const moduleCount = internalQr.getModuleCount();
  const scale = 4;
  const quietZonePx = design.margin * scale;
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

describe("Design Presets (All 10 Studio Presets)", () => {
  it("provides 10 complete, valid, and high-contrast presets", () => {
    expect(DESIGN_PRESETS).toHaveLength(10);
    const expectedIds = [
      "classic-black",
      "midnight",
      "ocean-blue",
      "emerald",
      "royal-purple",
      "sunset",
      "minimal-white",
      "soft-rose",
      "premium-gold",
      "modern-gradient",
    ];
    expect(DESIGN_PRESETS.map((p) => p.id)).toEqual(expectedIds);

    for (const preset of DESIGN_PRESETS) {
      expect(getDesignPresetById(preset.id)).toBeDefined();
      const report = analyzeScanability("https://openqr.studio", preset.design);
      expect(report.status).toBe("good");
      const decoded = decodeDesignWithJsQr(
        "https://openqr.studio/preset-test",
        preset.design
      );
      expect(decoded).toBe("https://openqr.studio/preset-test");
    }
  });
});

describe("Quiet-Zone Module-to-Pixel Conversion", () => {
  it("converts module-based margin into accurate pixel margin across QR versions and output dimensions", () => {
    // Version 1 (21 modules per side) + 4-module quiet zone on each side = 29 total modules
    expect(convertModuleMarginToPixels(4, 21, 290)).toBe(40);
    expect(convertModuleMarginToPixels(4, 21, 1024)).toBe(
      Math.round((1024 * 4) / 29)
    );

    // Version 2 (25 modules per side) + 4-module quiet zone on each side = 33 total modules
    expect(convertModuleMarginToPixels(4, 25, 330)).toBe(40);
    expect(convertModuleMarginToPixels(4, 25, 2048)).toBe(
      Math.round((2048 * 4) / 33)
    );

    // Version 10 (57 modules per side) + 4-module quiet zone = 65 total modules
    expect(convertModuleMarginToPixels(4, 57, 650)).toBe(40);

    // Version 40 (177 modules per side) + 4-module quiet zone = 185 total modules
    expect(convertModuleMarginToPixels(4, 177, 1850)).toBe(40);

    // Zero margin returns 0 pixels
    expect(convertModuleMarginToPixels(0, 25, 1024)).toBe(0);
  });

  it("maps design.margin (modules) dynamically based on payload version and dimensions in mapDesignToEngineOptions", () => {
    const base = createDefaultDesign();
    // Short URL -> Version 2 (25 modules) at 1024px vs 512px
    const opts1024 = mapDesignToEngineOptions("https://openqr.studio", {
      ...base,
      width: 1024,
      height: 1024,
      margin: 4,
    });
    const opts512 = mapDesignToEngineOptions("https://openqr.studio", {
      ...base,
      width: 512,
      height: 512,
      margin: 4,
    });
    expect(opts1024.margin).toBe(Math.round((1024 * 4) / 33));
    expect(opts512.margin).toBe(Math.round((512 * 4) / 33));

    // Dense payload -> higher QR version -> smaller module pixel size for the same 4-module margin
    const denseOpts1024 = mapDesignToEngineOptions("A".repeat(400), {
      ...base,
      width: 1024,
      height: 1024,
      margin: 4,
    });
    expect(denseOpts1024.margin).toBeLessThan(opts1024.margin!);
    expect(denseOpts1024.margin).toBeGreaterThan(20);
  });
});

describe("useQrGenerator & useQrDesign State Management", () => {
  it("applies presets without modifying the QR payload or downgrading user-selected error correction", () => {
    const { result } = renderHook(() => useQrGenerator());

    act(() => {
      result.current.setPayload({
        type: "url",
        url: "https://openqr.studio/custom-link",
      });
      result.current.setErrorCorrection("H");
    });
    expect(result.current.encodedPayload).toBe(
      "https://openqr.studio/custom-link"
    );
    expect(result.current.design.errorCorrection).toBe("H");

    // Apply Sunset preset — must preserve EC level H and payload
    act(() => {
      result.current.applyPreset("sunset");
    });
    expect(result.current.activePresetId).toBe("sunset");
    expect(result.current.design.dots.style).toBe("extra-rounded");
    expect(result.current.design.dots.gradient?.type).toBe("linear");
    expect(result.current.design.errorCorrection).toBe("H");
    expect(result.current.encodedPayload).toBe(
      "https://openqr.studio/custom-link"
    );

    // Customize further after applying preset (must unlock preset)
    act(() => {
      result.current.setDotStyle("classy");
      result.current.setCornerOuterStyle("dot");
      result.current.setCornerInnerStyle("square");
      result.current.setMargin(6);
      result.current.setDimensions(1536);
    });

    expect(result.current.activePresetId).toBeNull();
    expect(result.current.design.dots.style).toBe("classy");
    expect(result.current.design.corners.outerStyle).toBe("dot");
    expect(result.current.design.corners.innerStyle).toBe("square");
    expect(result.current.design.margin).toBe(6);
    expect(result.current.design.width).toBe(1536);

    // Reset design restores default design (margin: 4, EC: M) while keeping payload
    act(() => {
      result.current.resetDesign();
    });
    expect(result.current.activePresetId).toBe("classic-black");
    expect(result.current.design.dots.style).toBe("square");
    expect(result.current.design.margin).toBe(4);
    expect(result.current.design.errorCorrection).toBe("M");
    expect(result.current.encodedPayload).toBe(
      "https://openqr.studio/custom-link"
    );
  });

  it("preserves uploaded logo fileName across updates/resets and clears it on removal", () => {
    const { result } = renderHook(() => useQrGenerator());
    const sampleDataUri =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    act(() => {
      result.current.setLogo({
        source: sampleDataUri,
        fileName: "brand-mark.svg",
        size: 0.22,
        margin: 4,
        shape: "circle",
        backgroundColor: "#FFFFFF",
      });
    });

    expect(result.current.design.logo?.fileName).toBe("brand-mark.svg");
    expect(result.current.design.logo?.shape).toBe("circle");

    // Resetting logo settings preserves the uploaded logo source and fileName
    act(() => {
      result.current.resetLogoSettings();
    });
    expect(result.current.design.logo?.fileName).toBe("brand-mark.svg");
    expect(result.current.design.logo?.shape).toBe("square");

    const decorated = buildDecoratedLogoDataUri({
      ...result.current.design.logo!,
      shape: "circle",
      backgroundColor: "#FFFFFF",
    });
    expect(decorated).toMatch(/^data:image\/svg\+xml;base64,/);

    const engineOptions = mapDesignToEngineOptions(
      "https://openqr.studio",
      result.current.design
    );
    expect(engineOptions.image).toBeDefined();
    expect(engineOptions.imageOptions?.saveAsBlob).toBe(false);

    // Removing logo explicitly sets engineOptions.image to undefined
    act(() => {
      result.current.removeLogo();
    });
    expect(result.current.design.logo).toBeUndefined();
    const clearedOptions = mapDesignToEngineOptions(
      "https://openqr.studio",
      result.current.design
    );
    expect("image" in clearedOptions).toBe(true);
    expect(clearedOptions.image).toBeUndefined();
  });

  it("clears stale gradient and logo elements across live BrowserQRRenderer transitions", async () => {
    const container = document.createElement("div");
    const renderer = createQRRenderer();
    await renderer.mount(container);

    const sunsetDesign = getDesignPresetById("sunset")!.design;
    const classicDesign = getDesignPresetById("classic-black")!.design;

    // 1. Render Sunset gradient preset
    await renderer.update("https://openqr.studio", sunsetDesign);
    expect(container.innerHTML).toContain("<linearGradient");

    // 2. Transition to Classic Black solid preset -> must clear <linearGradient>
    await renderer.update("https://openqr.studio", classicDesign);
    expect(container.innerHTML).not.toContain("<linearGradient");

    // 3. Enable manual radial gradient, then disable it -> must clear <radialGradient>
    await renderer.update("https://openqr.studio", {
      ...classicDesign,
      dots: {
        style: "rounded",
        color: "#171717",
        gradient: {
          type: "radial",
          rotation: 0,
          colors: [
            { offset: 0, color: "#171717" },
            { offset: 1, color: "#2563EB" },
          ],
        },
      },
    });
    expect(container.innerHTML).toContain("<radialGradient");

    await renderer.update("https://openqr.studio", classicDesign);
    expect(container.innerHTML).not.toContain("<radialGradient");

    renderer.destroy();
  });

  it("isolates per-type payload state across all 12 QR types and preserves design settings on type switch", () => {
    const { result } = renderHook(() => useQrGenerator());

    // Apply a preset and custom dot style
    act(() => {
      result.current.applyPreset("ocean-blue");
      result.current.setDotStyle("classy-rounded");
    });

    // Switch to Wi-Fi and enter SSID + password
    act(() => {
      result.current.setQrType("wifi");
    });
    expect(result.current.payload.type).toBe("wifi");
    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.encodedPayload).toBe("");

    act(() => {
      result.current.setPayload({
        type: "wifi",
        ssid: "Studio_5G",
        password: "super-secret-password",
        security: "WPA",
        hidden: true,
      });
    });
    expect(result.current.validation.isValid).toBe(true);
    expect(result.current.encodedPayload).toBe(
      "WIFI:T:WPA;S:Studio_5G;P:super-secret-password;H:true;;"
    );

    // Switch to vCard -> Wi-Fi fields do not leak into vCard, and design stays intact
    act(() => {
      result.current.setQrType("vcard");
    });
    expect(result.current.payload.type).toBe("vcard");
    if (result.current.payload.type === "vcard") {
      expect(result.current.payload.fullName).toBe("");
    }
    expect(result.current.design.dots.style).toBe("classy-rounded");
    expect(result.current.design.dots.color).toBe("#1D4ED8");

    // Enter vCard data
    act(() => {
      result.current.setPayload({
        type: "vcard",
        firstName: "Ada",
        lastName: "Lovelace",
        fullName: "Ada Lovelace",
        email: "ada@openqr.studio",
      });
    });
    expect(result.current.validation.isValid).toBe(true);
    expect(result.current.encodedPayload).toContain("FN:Ada Lovelace");

    // Switch back to Wi-Fi -> previously entered Wi-Fi state is restored intact
    act(() => {
      result.current.setQrType("wifi");
    });
    expect(result.current.payload.type).toBe("wifi");
    if (result.current.payload.type === "wifi") {
      expect(result.current.payload.ssid).toBe("Studio_5G");
      expect(result.current.payload.password).toBe("super-secret-password");
      expect(result.current.payload.hidden).toBe(true);
    }

    // Switch back to URL -> original URL is still preserved
    act(() => {
      result.current.setQrType("url");
    });
    expect(result.current.encodedPayload).toBe("https://openqr.studio");
  });
});
