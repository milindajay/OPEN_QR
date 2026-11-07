import { describe, expect, it } from "vitest";
import {
  estimateQrCapacity,
  getMaxByteCapacity,
  getModulesPerSide,
} from "@/lib/qr/validation/qr-capacity";
import { analyzeScanability } from "@/lib/qr/validation/scanability";
import { createDefaultDesign } from "@/lib/qr/presets/design-presets";
import { getExportFilename } from "@/lib/utils/naming-utils";

describe("QR Capacity Estimation", () => {
  it("defaults to Error Correction Level M (max 2331 bytes at Version 40)", () => {
    expect(getMaxByteCapacity()).toBe(2331);
    expect(getMaxByteCapacity("L")).toBe(2953);
    expect(getMaxByteCapacity("Q")).toBe(1663);
    expect(getMaxByteCapacity("H")).toBe(1273);
  });

  it("computes accurate Version 1..40 progression and module counts", () => {
    const v1 = estimateQrCapacity("https://a.co", "M");
    expect(v1.estimatedVersion).toBe(1);
    expect(getModulesPerSide(v1.estimatedVersion)).toBe(21);

    const v40MaxM = estimateQrCapacity("A".repeat(2331), "M");
    expect(v40MaxM.estimatedVersion).toBe(40);
    expect(v40MaxM.isExceeded).toBe(false);
    expect(v40MaxM.isNearLimit).toBe(true);
    expect(getModulesPerSide(40)).toBe(177);

    const overflowM = estimateQrCapacity("A".repeat(2332), "M");
    expect(overflowM.isExceeded).toBe(true);
  });

  it("uses UTF-8 byte length rather than character count for capacity", () => {
    // 500 Sinhala characters = 1500 UTF-8 bytes, which exceeds Level H (1273 bytes)
    const sinhalaText = "ආ".repeat(500);
    const reportH = estimateQrCapacity(sinhalaText, "H");
    expect(reportH.characterCount).toBe(500);
    expect(reportH.byteLength).toBe(1500);
    expect(reportH.isExceeded).toBe(true);
  });
});

describe("Advisory Scanability Analyzer", () => {
  it("reports 'good' status for high-contrast default design with 4-module quiet zone", () => {
    const design = createDefaultDesign();
    expect(design.margin).toBe(4);
    const report = analyzeScanability("https://openqr.studio", design);
    expect(report.status).toBe("good");
    expect(report.contrastRatio).toBeGreaterThan(15);
    expect(report.issues).toHaveLength(0);
  });

  it("flags high-risk when quiet zone margin is below 4 modules", () => {
    const design = {
      ...createDefaultDesign(),
      margin: 2,
    };
    const report = analyzeScanability("https://openqr.studio", design);
    expect(report.status).toBe("high-risk");
    expect(report.issues.some((i) => i.id === "quiet-zone-critical")).toBe(true);
  });

  it("flags high-risk for low module contrast (< 3.0) even when finder patterns are high contrast", () => {
    const base = createDefaultDesign();
    const lowContrastModulesDesign = {
      ...base,
      dots: { style: "square" as const, color: "#CCCCCC" },
      corners: {
        ...base.corners,
        outerColor: "#171717",
        innerColor: "#171717",
      },
      background: { color: "#FFFFFF", transparent: false },
    };
    const lowReport = analyzeScanability(
      "https://openqr.studio",
      lowContrastModulesDesign
    );
    expect(lowReport.status).toBe("high-risk");
    expect(
      lowReport.issues.some((i) => i.id === "low-contrast-critical")
    ).toBe(true);
  });

  it("flags high-risk when outer finder pattern has insufficient contrast against background", () => {
    const base = createDefaultDesign();
    const lowOuterFinderDesign = {
      ...base,
      dots: { style: "square" as const, color: "#171717" },
      corners: {
        ...base.corners,
        outerColor: "#F1F5F9",
        innerColor: "#171717",
      },
      background: { color: "#FFFFFF", transparent: false },
    };
    const report = analyzeScanability(
      "https://openqr.studio",
      lowOuterFinderDesign
    );
    expect(report.status).toBe("high-risk");
    expect(report.contrastRatio).toBeLessThan(1.5);
    expect(
      report.issues.some((i) => i.id === "finder-low-contrast-critical")
    ).toBe(true);
  });

  it("flags high-risk when inner finder eye has insufficient contrast against background", () => {
    const base = createDefaultDesign();
    const lowInnerFinderDesign = {
      ...base,
      dots: { style: "square" as const, color: "#171717" },
      corners: {
        ...base.corners,
        outerColor: "#171717",
        innerColor: "#E2E8F0",
      },
      background: { color: "#FFFFFF", transparent: false },
    };
    const report = analyzeScanability(
      "https://openqr.studio",
      lowInnerFinderDesign
    );
    expect(report.status).toBe("high-risk");
    expect(
      report.issues.some((i) => i.id === "finder-low-contrast-critical")
    ).toBe(true);
  });

  it("flags high-risk when both finder patterns have insufficient contrast", () => {
    const base = createDefaultDesign();
    const lowBothFindersDesign = {
      ...base,
      dots: { style: "square" as const, color: "#171717" },
      corners: {
        ...base.corners,
        outerColor: "#F1F5F9",
        innerColor: "#F1F5F9",
      },
      background: { color: "#FFFFFF", transparent: false },
    };
    const report = analyzeScanability(
      "https://openqr.studio",
      lowBothFindersDesign
    );
    expect(report.status).toBe("high-risk");
    expect(
      report.issues.some(
        (i) =>
          i.id === "finder-low-contrast-critical" &&
          i.description.includes("outer frame and inner eye")
      )
    ).toBe(true);
  });

  it("flags high-risk for inverted colors on modules or finder corners", () => {
    const base = createDefaultDesign();
    const invertedDesign = {
      ...base,
      dots: { style: "square" as const, color: "#FFFFFF" },
      corners: {
        ...base.corners,
        outerColor: "#FFFFFF",
        innerColor: "#FFFFFF",
      },
      background: { color: "#000000", transparent: false },
    };
    const invertedReport = analyzeScanability(
      "https://openqr.studio",
      invertedDesign
    );
    expect(invertedReport.status).toBe("high-risk");
    expect(invertedReport.issues.some((i) => i.id === "inverted-colors")).toBe(
      true
    );
  });

  it("evaluates gradient color stops and flags low-contrast gradient stops", () => {
    const base = createDefaultDesign();
    const weakGradientDesign = {
      ...base,
      dots: {
        style: "rounded" as const,
        color: "#171717",
        gradient: {
          type: "linear" as const,
          rotation: 45,
          colors: [
            { offset: 0, color: "#171717" },
            { offset: 1, color: "#E2E8F0" },
          ],
        },
      },
    };
    const report = analyzeScanability(
      "https://openqr.studio",
      weakGradientDesign
    );
    expect(report.status).toBe("high-risk");
    expect(report.issues.some((i) => i.id === "low-contrast-critical")).toBe(
      true
    );
  });

  it("warns when a logo is used with low error correction or excessive logo size", () => {
    const logoDesign = {
      ...createDefaultDesign(),
      errorCorrection: "M" as const,
      logo: {
        source: "data:image/png;base64,iVBORw0KGgo=",
        size: 0.35,
        margin: 4,
        shape: "square" as const,
      },
    };
    const report = analyzeScanability("https://openqr.studio", logoDesign);
    expect(report.status).toBe("high-risk");
    expect(report.issues.some((i) => i.id === "logo-too-large")).toBe(true);
    expect(report.issues.some((i) => i.id === "logo-low-ec")).toBe(true);
  });
});

describe("Privacy-Preserving Export Filenames", () => {
  it("generates meaningful filenames without sensitive user payload data", () => {
    expect(getExportFilename("url", "png")).toBe("openqr-website.png");
    expect(getExportFilename("vcard", "svg")).toBe("openqr-contact.svg");
    expect(getExportFilename("wifi", "jpeg")).toBe("openqr-wifi.jpg");
  });
});
