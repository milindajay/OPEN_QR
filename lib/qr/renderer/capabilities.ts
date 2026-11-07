import type {
  CornerDotStyle,
  CornerSquareStyle,
  DotStyle,
  ErrorCorrectionLevel,
  GradientType,
  LogoContainerShape,
  QRDesign,
} from "@/types/design";
import { APP_CONFIG } from "@/lib/constants/app-config";

export const SUPPORTED_DOT_STYLES: readonly DotStyle[] = [
  "square",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded",
] as const;

export const SUPPORTED_CORNER_SQUARE_STYLES: readonly CornerSquareStyle[] = [
  "square",
  "dot",
  "extra-rounded",
] as const;

export const SUPPORTED_CORNER_DOT_STYLES: readonly CornerDotStyle[] = [
  "square",
  "dot",
] as const;

export const SUPPORTED_ERROR_CORRECTION_LEVELS: readonly ErrorCorrectionLevel[] = [
  "L",
  "M",
  "Q",
  "H",
] as const;

export const SUPPORTED_GRADIENT_TYPES: readonly GradientType[] = [
  "linear",
  "radial",
] as const;

export const SUPPORTED_LOGO_SHAPES: readonly LogoContainerShape[] = [
  "square",
  "rounded",
  "circle",
] as const;

/**
 * Validates and clamps a QRDesign configuration against the actual capabilities
 * of the rendering engine, ensuring safe dimensions, non-negative margin,
 * and valid style enums.
 */
export function normalizeDesignForEngine(design: QRDesign): QRDesign {
  const width = Math.min(4096, Math.max(128, Math.round(design.width || 1024)));
  const height = Math.min(4096, Math.max(128, Math.round(design.height || 1024)));
  const rawMargin =
    typeof design.margin === "number" && !Number.isNaN(design.margin)
      ? design.margin
      : APP_CONFIG.defaultDimensions.defaultMargin;
  const margin = Math.min(24, Math.max(0, Math.round(rawMargin)));

  const dotStyle: DotStyle = SUPPORTED_DOT_STYLES.includes(design.dots.style)
    ? design.dots.style
    : "square";

  const outerStyle: CornerSquareStyle = SUPPORTED_CORNER_SQUARE_STYLES.includes(
    design.corners.outerStyle
  )
    ? design.corners.outerStyle
    : "square";

  const innerStyle: CornerDotStyle = SUPPORTED_CORNER_DOT_STYLES.includes(
    design.corners.innerStyle
  )
    ? design.corners.innerStyle
    : "square";

  const errorCorrection: ErrorCorrectionLevel =
    SUPPORTED_ERROR_CORRECTION_LEVELS.includes(design.errorCorrection)
      ? design.errorCorrection
      : "M";

  const normalized: QRDesign = {
    width,
    height,
    margin,
    dots: {
      style: dotStyle,
      color: design.dots.color || "#171717",
      ...(design.dots.gradient ? { gradient: design.dots.gradient } : {}),
    },
    background: {
      color: design.background.color || "#FFFFFF",
      transparent: Boolean(design.background.transparent),
      ...(design.background.gradient
        ? { gradient: design.background.gradient }
        : {}),
    },
    corners: {
      outerStyle,
      innerStyle,
      outerColor: design.corners.outerColor || design.dots.color || "#171717",
      innerColor: design.corners.innerColor || design.dots.color || "#171717",
    },
    errorCorrection,
  };

  if (design.logo?.source) {
    const shape: LogoContainerShape = SUPPORTED_LOGO_SHAPES.includes(
      design.logo.shape
    )
      ? design.logo.shape
      : "square";

    normalized.logo = {
      source: design.logo.source,
      size: Math.min(
        APP_CONFIG.limits.maxLogoSizeRatio,
        Math.max(0.08, design.logo.size)
      ),
      margin: Math.min(32, Math.max(0, Math.round(design.logo.margin))),
      shape,
      ...(design.logo.fileName ? { fileName: design.logo.fileName } : {}),
      ...(design.logo.backgroundColor
        ? { backgroundColor: design.logo.backgroundColor }
        : {}),
    };
  }

  return normalized;
}
