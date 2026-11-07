export type ExportFormat = "png" | "jpeg" | "svg";

export const EXPORT_DIMENSION_PRESETS = [256, 512, 1024, 2048] as const;

export type ExportDimensionPreset =
  | (typeof EXPORT_DIMENSION_PRESETS)[number]
  | "custom";

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
