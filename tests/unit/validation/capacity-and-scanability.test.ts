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

  it("evaluates boundary values around 4.5:1, multi-stop gradients, and foreground+background gradients without averaging", () => {
    const base = createDefaultDesign();

    // Just above 4.5:1 (#767676 on #FFFFFF = 4.54:1) -> good
    const passBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      dots: { style: "square", color: "#767676" },
      corners: {
        outerStyle: "square",
        innerStyle: "square",
        outerColor: "#171717",
        innerColor: "#171717",
      },
    });
    expect(passBoundary.contrastRatio).toBeGreaterThanOrEqual(4.5);
    expect(passBoundary.status).toBe("good");

    // Just below 4.5:1 (#777777 on #FFFFFF = 4.48:1) -> warning (never unconditional good)
    const failBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      dots: { style: "square", color: "#777777" },
    });
    expect(failBoundary.contrastRatio).toBeLessThan(4.5);
    expect(failBoundary.status).toBe("warning");
    expect(
      failBoundary.issues.some((i) => i.id === "low-contrast-warning")
    ).toBe(true);

    // Gradient with one strong stop (#000000, 21:1) and one weak stop (#888888, 3.54:1).
    // Averaging stops (#444444) would falsely yield 9.74:1 ("good"), whereas worst-stop evaluation yields 3.54:1 ("warning").
    const oneStrongOneWeak = analyzeScanability("https://openqr.studio", {
      ...base,
      dots: {
        style: "rounded",
        color: "#000000",
        gradient: {
          type: "linear",
          rotation: 0,
          colors: [
            { offset: 0, color: "#000000" },
            { offset: 1, color: "#888888" },
          ],
        },
      },
    });
    expect(oneStrongOneWeak.contrastRatio).toBe(3.54);
    expect(oneStrongOneWeak.status).toBe("warning");

    // Multi-stop gradient (3 stops) + background gradient -> worst foreground/background stop pair
    const multiStopFgAndBg = analyzeScanability("https://openqr.studio", {
      ...base,
      dots: {
        style: "dots",
        color: "#0F172A",
        gradient: {
          type: "linear",
          rotation: 45,
          colors: [
            { offset: 0, color: "#0F172A" },
            { offset: 0.5, color: "#334155" },
            { offset: 1, color: "#64748B" },
          ],
        },
      },
      background: {
        color: "#FFFFFF",
        transparent: false,
        gradient: {
          type: "linear",
          rotation: 90,
          colors: [
            { offset: 0, color: "#FFFFFF" },
            { offset: 1, color: "#E2E8F0" },
          ],
        },
      },
    });
    // Worst stop pair is #64748B against #E2E8F0 (< 4.5:1)
    expect(multiStopFgAndBg.contrastRatio).toBeLessThan(4.5);
    expect(multiStopFgAndBg.status).not.toBe("good");
  });

  it("accounts for logo scale, EC level, QR version density, clearance padding, and backing plate", () => {
    const base = createDefaultDesign();
    const logoSrc = "data:image/png;base64,iVBORw0KGgo=";

    // 1. Small logo (18%) with EC H and 4px margin -> good
    const safeLogoReport = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: {
        source: logoSrc,
        size: 0.18,
        margin: 4,
        shape: "square",
      },
    });
    expect(safeLogoReport.status).toBe("good");

    // 2. Logo with 0px clearance and no backing plate -> logo-clearance-warning
    const zeroClearanceNoPlate = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: {
        source: logoSrc,
        size: 0.2,
        margin: 0,
        shape: "square",
      },
    });
    expect(zeroClearanceNoPlate.status).toBe("warning");
    expect(
      zeroClearanceNoPlate.issues.some((i) => i.id === "logo-clearance-warning")
    ).toBe(true);

    // 3. Adding a solid backing plate resolves the 0px clearance warning
    const zeroClearanceWithPlate = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: {
        source: logoSrc,
        size: 0.2,
        margin: 0,
        shape: "rounded",
        backgroundColor: "#FFFFFF",
      },
    });
    expect(
      zeroClearanceWithPlate.issues.some(
        (i) => i.id === "logo-clearance-warning"
      )
    ).toBe(false);
    expect(zeroClearanceWithPlate.status).toBe("good");

    // 4. Compact grid (Version <= 2) with 22% logo and EC = Q -> logo-version-density-warning
    const compactQReport = analyzeScanability("https://a.co", {
      ...base,
      errorCorrection: "Q",
      logo: {
        source: logoSrc,
        size: 0.22,
        margin: 4,
        shape: "square",
      },
    });
    expect(compactQReport.status).toBe("warning");
    expect(
      compactQReport.issues.some((i) => i.id === "logo-version-density-warning")
    ).toBe(true);

    // 5. Exact boundary checks for all LOGO_SCANABILITY_THRESHOLDS
    // 5a. WARNING_LINEAR_SCALE (0.24 vs 0.25 at EC H)
    const atWarningBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: { source: logoSrc, size: 0.24, margin: 4, shape: "square" },
    });
    expect(atWarningBoundary.status).toBe("good");
    expect(
      atWarningBoundary.issues.some((i) => i.id === "logo-size-warning")
    ).toBe(false);

    const aboveWarningBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: { source: logoSrc, size: 0.25, margin: 4, shape: "square" },
    });
    expect(aboveWarningBoundary.status).toBe("warning");
    expect(
      aboveWarningBoundary.issues.some((i) => i.id === "logo-size-warning")
    ).toBe(true);

    // 5b. CRITICAL_LINEAR_SCALE (0.30 vs 0.31 at EC H)
    const atCriticalBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: { source: logoSrc, size: 0.3, margin: 4, shape: "square" },
    });
    expect(atCriticalBoundary.status).toBe("warning");
    expect(
      atCriticalBoundary.issues.some((i) => i.id === "logo-too-large")
    ).toBe(false);

    const aboveCriticalBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: { source: logoSrc, size: 0.31, margin: 4, shape: "square" },
    });
    expect(aboveCriticalBoundary.status).toBe("high-risk");
    expect(
      aboveCriticalBoundary.issues.some((i) => i.id === "logo-too-large")
    ).toBe(true);

    // 5c. LOW_EC_HIGH_RISK_SCALE (0.22 vs 0.23 at EC L)
    const atLowEcBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "L",
      logo: { source: logoSrc, size: 0.22, margin: 4, shape: "square" },
    });
    expect(atLowEcBoundary.status).toBe("warning");
    expect(
      atLowEcBoundary.issues.some((i) => i.id === "logo-too-large")
    ).toBe(false);
    expect(atLowEcBoundary.issues.some((i) => i.id === "logo-low-ec")).toBe(
      true
    );

    const aboveLowEcBoundary = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "L",
      logo: { source: logoSrc, size: 0.23, margin: 4, shape: "square" },
    });
    expect(aboveLowEcBoundary.status).toBe("high-risk");
    expect(
      aboveLowEcBoundary.issues.some((i) => i.id === "logo-too-large")
    ).toBe(true);

    // 5d. DENSE_OR_COMPACT_VERSION_SCALE (0.20 vs 0.21 on compact Version <= 2 and dense Version >= 20 with EC Q)
    const atCompactVersionBoundary = analyzeScanability("https://a.co", {
      ...base,
      errorCorrection: "Q",
      logo: { source: logoSrc, size: 0.2, margin: 4, shape: "square" },
    });
    expect(
      atCompactVersionBoundary.issues.some(
        (i) => i.id === "logo-version-density-warning"
      )
    ).toBe(false);

    const densePayload = "https://openqr.studio/".padEnd(550, "x");
    const denseVersionAboveBoundary = analyzeScanability(densePayload, {
      ...base,
      errorCorrection: "Q",
      logo: { source: logoSrc, size: 0.21, margin: 4, shape: "square" },
    });
    expect(
      denseVersionAboveBoundary.issues.some(
        (i) => i.id === "logo-version-density-warning"
      )
    ).toBe(true);

    // 5e. MIN_RECOMMENDED_CLEARANCE_PX (margin 1 vs margin 2 without backing plate)
    const marginOneNoPlate = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: { source: logoSrc, size: 0.2, margin: 1, shape: "square" },
    });
    expect(
      marginOneNoPlate.issues.some((i) => i.id === "logo-clearance-warning")
    ).toBe(true);

    const marginTwoNoPlate = analyzeScanability("https://openqr.studio", {
      ...base,
      errorCorrection: "H",
      logo: { source: logoSrc, size: 0.2, margin: 2, shape: "square" },
    });
    expect(
      marginTwoNoPlate.issues.some((i) => i.id === "logo-clearance-warning")
    ).toBe(false);
  });
});

describe("Privacy-Preserving Export Filenames", () => {
  it("generates meaningful filenames without sensitive user payload data", () => {
    expect(getExportFilename("url", "png")).toBe("openqr-website.png");
    expect(getExportFilename("vcard", "svg")).toBe("openqr-contact.svg");
    expect(getExportFilename("wifi", "jpeg")).toBe("openqr-wifi.jpg");
  });
});
