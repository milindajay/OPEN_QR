export type ExportFormat = "png" | "jpeg" | "svg";

export const EXPORT_DIMENSION_PRESETS = [256, 512, 1024, 2048, 4096] as const;

export type ExportDimensionPreset =
  | (typeof EXPORT_DIMENSION_PRESETS)[number]
  | "custom";

export interface ResolutionPresetDetail {
  size: (typeof EXPORT_DIMENSION_PRESETS)[number];
  name: string;
  shortLabel: string;
  intendedUse: string;
  approxInchesAt300Dpi: number;
}

export const EXPORT_RESOLUTION_PRESET_DETAILS: readonly ResolutionPresetDetail[] =
  [
    {
      size: 256,
      name: "Web / Compact",
      shortLabel: "256px",
      intendedUse: "Compact digital badges",
      approxInchesAt300Dpi: 0.85,
    },
    {
      size: 512,
      name: "Web / Screen",
      shortLabel: "512px",
      intendedUse: "Digital use",
      approxInchesAt300Dpi: 1.71,
    },
    {
      size: 1024,
      name: "Web / High Resolution",
      shortLabel: "1024px",
      intendedUse: "High-quality digital use",
      approxInchesAt300Dpi: 3.41,
    },
    {
      size: 2048,
      name: "Print / Standard",
      shortLabel: "2048px",
      intendedUse: "Standard print (~6.83 in at 300 DPI)",
      approxInchesAt300Dpi: 6.83,
    },
    {
      size: 4096,
      name: "Print / Large Signage",
      shortLabel: "4096px",
      intendedUse: "Larger print and signage (~13.65 in at 300 DPI)",
      approxInchesAt300Dpi: 13.65,
    },
  ] as const;

export const DEFAULT_JPEG_QUALITY = 0.92;
export const MIN_EXPORT_DIMENSION = 128;
export const MAX_EXPORT_DIMENSION = 4096;

export interface ExportOptions {
  format: ExportFormat;
  width: number;
  height: number;
  quality?: number;
  backgroundColor?: string;
}

export interface ClipboardActionResult {
  success: boolean;
  mode: "clipboard-image" | "clipboard-text" | "fallback-download" | "error";
  message: string;
  fallbackFilename?: string;
}

export interface PngInspectionReport {
  isValidPng: boolean;
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  hasAlphaChannel: boolean;
  hasIdatChunk: boolean;
  hasIendChunk: boolean;
  byteLength: number;
}

export interface JpegInspectionReport {
  isValidJpeg: boolean;
  width: number;
  height: number;
  components: number;
  hasSofMarker: boolean;
  hasEoiMarker: boolean;
  byteLength: number;
}

export interface SvgInspectionReport {
  isValidXml: boolean;
  isVectorQr: boolean;
  width: number;
  height: number;
  viewBox: string;
  vectorElementCount: number;
  hasLinearGradient: boolean;
  hasRadialGradient: boolean;
  hasEmbeddedLogo: boolean;
  embeddedLogoHref: string | null;
  hasLogoBackingPlate: boolean;
  logoBackingPlateFill: string | null;
  hasOpaqueBackgroundRect: boolean;
  backgroundFill: string | null;
  allIdsUnique: boolean;
  allUrlReferencesResolve: boolean;
  hasForbiddenElements: boolean;
  hasEventHandlerAttributes: boolean;
  hasExternalReferences: boolean;
  errors: string[];
}
