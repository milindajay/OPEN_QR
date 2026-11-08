import type { GradientConfig, QRDesign } from "@/types/design";
import type { ScanabilityIssue, ScanabilityLevel, ScanabilityReport } from "@/types/qr";
import {
  estimateQrCapacity,
  getModulesPerSide,
} from "@/lib/qr/validation/qr-capacity";
import {
  getContrastRatio,
  getRelativeLuminance,
  parseColorToRgb,
} from "@/lib/utils/color-utils";

/**
 * Advisory thresholds for evaluating center-logo scanability risk.
 */
export const LOGO_SCANABILITY_THRESHOLDS = {
  /** Linear logo scale above which a high-risk warning is emitted (> 30% linear / > 9.0% area). */
  CRITICAL_LINEAR_SCALE: 0.3,
  /** Linear logo scale above which a size warning is emitted (> 24% linear / > 5.76% area). */
  WARNING_LINEAR_SCALE: 0.24,
  /** Linear logo scale above which low EC (L) becomes high-risk (> 22% linear / > 4.84% area). */
  LOW_EC_HIGH_RISK_SCALE: 0.22,
  /** Linear logo scale above which compact (Version <= 2) or dense (Version >= 20) grids warrant caution when EC !== H. */
  DENSE_OR_COMPACT_VERSION_SCALE: 0.2,
  /** Minimum recommended clearance padding (px) when no logo backing plate is enabled. */
  MIN_RECOMMENDED_CLEARANCE_PX: 2,
} as const;

interface ContrastEvaluation {
  minRatio: number;
  isInverted: boolean;
}

function extractColorStops(
  fallbackColor: string,
  gradient?: GradientConfig
): string[] {
  if (gradient && Array.isArray(gradient.colors) && gradient.colors.length > 0) {
    const validStops = gradient.colors
      .map((stop) => (typeof stop?.color === "string" ? stop.color.trim() : ""))
      .filter((color) => color.length > 0);
    if (validStops.length > 0) {
      return validStops;
    }
  }
  return [fallbackColor];
}

function evaluateForegroundAgainstBackground(
  foregroundColors: readonly string[],
  backgroundColors: readonly string[]
): ContrastEvaluation {
  if (foregroundColors.length === 0 || backgroundColors.length === 0) {
    return { minRatio: 1, isInverted: false };
  }

  let minRatio = 21;
  let isInverted = false;

  for (const fg of foregroundColors) {
    const fgRgb = parseColorToRgb(fg);
    for (const bg of backgroundColors) {
      const bgRgb = parseColorToRgb(bg);
      const ratio = getContrastRatio(fg, bg);
      if (ratio < minRatio) {
        minRatio = ratio;
      }
      if (fgRgb && bgRgb) {
        const fgLum = getRelativeLuminance(fgRgb);
        const bgLum = getRelativeLuminance(bgRgb);
        if (fgLum > bgLum) {
          isInverted = true;
        }
      }
    }
  }

  return { minRatio, isInverted };
}

/**
 * Performs an advisory scanability assessment on a QR code payload and design configuration.
 *
 * Evaluates:
 * 1. Data capacity and module density (QR version & byte utilization)
 * 2. Error correction level relative to payload complexity and logo presence
 * 3. Minimum quiet zone of 4 modules (ISO/IEC 18004 standard)
 * 4. Foreground module contrast, outer finder-pattern contrast, inner finder-pattern contrast, and color inversion
 * 5. Logo size coverage ratio
 *
 * Note: This is an advisory heuristic assessment and does not guarantee physical scanability
 * across all cameras, lighting conditions, or print surfaces.
 */
export function analyzeScanability(
  encodedPayload: string,
  design: QRDesign
): ScanabilityReport {
  const issues: ScanabilityIssue[] = [];
  const capacity = estimateQrCapacity(encodedPayload, design.errorCorrection);

  // 1. Data Capacity & Density Assessment
  if (capacity.isExceeded) {
    issues.push({
      id: "capacity-exceeded",
      level: "high-risk",
      title: "Payload exceeds QR capacity",
      description: `Encoded data (${capacity.byteLength} bytes) exceeds the maximum ${capacity.maxBytes}-byte limit for error correction level ${design.errorCorrection}.`,
    });
  } else if (
    capacity.estimatedVersion >= 25 ||
    capacity.utilizationPercentage >= 80
  ) {
    issues.push({
      id: "high-data-density",
      level: "warning",
      title: "High data density",
      description: `Requires QR Version ${capacity.estimatedVersion} (${capacity.byteLength} UTF-8 bytes). Dense modules may be difficult for older smartphone cameras to focus on at small print sizes.`,
    });
  }

  // 2. Minimum Quiet Zone of Four Modules (ISO/IEC 18004)
  const minDimension = Math.min(design.width, design.height);

  if (design.margin < 4) {
    issues.push({
      id: "quiet-zone-critical",
      level: "high-risk",
      title: `Insufficient quiet zone (${design.margin} ${design.margin === 1 ? "module" : "modules"})`,
      description:
        "QR standards (ISO/IEC 18004) require a minimum quiet zone of 4 modules around the perimeter so scanners can isolate the symbol from surrounding graphics.",
    });
  }

  // 3. Foreground Module & Finder Pattern Contrast + Color Inversion
  const moduleColors = extractColorStops(
    design.dots.color,
    design.dots.gradient
  );

  const bgColors = design.background.transparent
    ? ["#FFFFFF"]
    : extractColorStops(
        design.background.color,
        design.background.gradient
      );

  const moduleEval = evaluateForegroundAgainstBackground(moduleColors, bgColors);
  const outerFinderEval = evaluateForegroundAgainstBackground(
    [design.corners.outerColor || design.dots.color],
    bgColors
  );
  const innerFinderEval = evaluateForegroundAgainstBackground(
    [design.corners.innerColor || design.dots.color],
    bgColors
  );

  const minFinderContrast = Math.min(
    outerFinderEval.minRatio,
    innerFinderEval.minRatio
  );
  const overallMinContrast = Number(
    Math.min(moduleEval.minRatio, minFinderContrast).toFixed(2)
  );
  const isColorInverted =
    moduleEval.isInverted ||
    outerFinderEval.isInverted ||
    innerFinderEval.isInverted;

  if (design.background.transparent) {
    issues.push({
      id: "transparent-background",
      level: "warning",
      title: "Transparent background enabled",
      description:
        "Ensure the surface where this QR code is placed is light and high-contrast against both the data modules and finder patterns.",
    });
  }

  if (isColorInverted) {
    issues.push({
      id: "inverted-colors",
      level: "high-risk",
      title: "Inverted color scheme (light modules or corners on dark background)",
      description:
        "Many hardware and mobile QR scanners expect dark modules and finder patterns on a lighter background and may fail to decode inverted designs.",
    });
  }

  // Evaluate data module contrast
  if (moduleEval.minRatio < 3.0) {
    issues.push({
      id: "low-contrast-critical",
      level: "high-risk",
      title: `Very low module contrast (${moduleEval.minRatio}:1)`,
      description:
        "Data modules and background colors have insufficient contrast (< 3.0:1). Increase contrast for reliable scanning.",
    });
  } else if (moduleEval.minRatio < 4.5) {
    issues.push({
      id: "low-contrast-warning",
      level: "warning",
      title: `Moderate module contrast (${moduleEval.minRatio}:1)`,
      description:
        "A contrast ratio of at least 4.5:1 between data modules and background is recommended for low-light scanning.",
    });
  }

  // Evaluate outer & inner finder-pattern contrast independently
  if (minFinderContrast < 3.0) {
    const affectedParts =
      outerFinderEval.minRatio < 3.0 && innerFinderEval.minRatio < 3.0
        ? "outer frame and inner eye"
        : outerFinderEval.minRatio < 3.0
          ? "outer finder frame"
          : "inner finder eye";
    issues.push({
      id: "finder-low-contrast-critical",
      level: "high-risk",
      title: `Very low finder-pattern contrast (${minFinderContrast}:1)`,
      description: `The corner finder pattern (${affectedParts}) has insufficient contrast against the background (< 3.0:1). Scanners rely on the three corner finder patterns to locate and orient the QR code.`,
    });
  } else if (minFinderContrast < 4.5) {
    issues.push({
      id: "finder-low-contrast-warning",
      level: "warning",
      title: `Moderate finder-pattern contrast (${minFinderContrast}:1)`,
      description:
        "A contrast ratio of at least 4.5:1 between the corner finder patterns and background is recommended for reliable detection.",
    });
  }

  // 4. Error Correction & Logo Considerations
  if (design.logo?.source) {
    const logoScale = design.logo.size;
    const estimatedAreaPct = Number((logoScale * logoScale * 100).toFixed(1));
    const modulesPerSide = getModulesPerSide(capacity.estimatedVersion);
    const occludedModulesPerSide = Math.max(
      1,
      Math.round(modulesPerSide * logoScale)
    );
    const hasBackingPlate = Boolean(
      design.logo.backgroundColor &&
        design.logo.backgroundColor !== "transparent"
    );

    if (
      logoScale > LOGO_SCANABILITY_THRESHOLDS.CRITICAL_LINEAR_SCALE ||
      (logoScale > LOGO_SCANABILITY_THRESHOLDS.LOW_EC_HIGH_RISK_SCALE &&
        design.errorCorrection === "L")
    ) {
      issues.push({
        id: "logo-too-large",
        level: "high-risk",
        title: "Logo obscures too many data modules",
        description: `Logo linear scale (${Math.round(logoScale * 100)}%, ~${estimatedAreaPct}% area coverage, ~${occludedModulesPerSide}×${occludedModulesPerSide} modules on Version ${capacity.estimatedVersion}) with error correction ${design.errorCorrection} can exceed Reed-Solomon recovery limits.`,
      });
    } else if (logoScale > LOGO_SCANABILITY_THRESHOLDS.WARNING_LINEAR_SCALE) {
      issues.push({
        id: "logo-size-warning",
        level: "warning",
        title: "Large center logo",
        description: `Logo scale is ${Math.round(logoScale * 100)}% (~${estimatedAreaPct}% area coverage on Version ${capacity.estimatedVersion}). Keep logo size at or below 24% and test with multiple scanning apps.`,
      });
    }

    if (design.errorCorrection === "L" || design.errorCorrection === "M") {
      issues.push({
        id: "logo-low-ec",
        level: "warning",
        title: "Higher error correction recommended with logo",
        description: `Error correction is set to ${design.errorCorrection}. Level H (~30% theoretical codeword recovery) or Q (~25% codeword recovery) is strongly recommended when a center logo obscures data modules.`,
      });
    } else if (
      design.errorCorrection === "Q" &&
      (capacity.estimatedVersion <= 2 || capacity.estimatedVersion >= 20) &&
      logoScale > LOGO_SCANABILITY_THRESHOLDS.DENSE_OR_COMPACT_VERSION_SCALE
    ) {
      issues.push({
        id: "logo-version-density-warning",
        level: "warning",
        title: "Logo on compact or high-density QR grid",
        description: `QR Version ${capacity.estimatedVersion} (${modulesPerSide}×${modulesPerSide} modules) with a ${Math.round(logoScale * 100)}% logo and error correction Q reduces recovery margin. Consider level H or a smaller logo scale.`,
      });
    }

    if (
      design.logo.margin <
        LOGO_SCANABILITY_THRESHOLDS.MIN_RECOMMENDED_CLEARANCE_PX &&
      !hasBackingPlate
    ) {
      issues.push({
        id: "logo-clearance-warning",
        level: "warning",
        title: "Low logo clearance without backing plate",
        description: `Logo clearance padding is ${design.logo.margin} px with no backing plate. Add at least 2 px clearance padding or enable a backing plate so adjacent QR modules do not visually blend into the logo.`,
      });
    }
  } else if (design.errorCorrection === "L" && capacity.estimatedVersion <= 15) {
    issues.push({
      id: "low-error-correction",
      level: "warning",
      title: "Low error correction level (L)",
      description:
        "Level L recovers only ~7% of damaged modules. Level M (~15%) is recommended as the standard default.",
    });
  }

  // 5. Export / Render Dimensions Check
  if (minDimension < 128) {
    issues.push({
      id: "small-dimensions",
      level: "warning",
      title: "Small output dimensions",
      description:
        "Dimensions below 128×128 px may cause blurring or aliasing when printed.",
    });
  }

  let status: ScanabilityLevel = "good";
  if (issues.some((i) => i.level === "high-risk")) {
    status = "high-risk";
  } else if (issues.some((i) => i.level === "warning")) {
    status = "warning";
  }

  return {
    status,
    contrastRatio: overallMinContrast,
    issues,
  };
}
