import type { Options, Gradient } from "qr-code-styling";
import type { GradientConfig, QRDesign, QRLogoConfig } from "@/types/design";
import type { ExportOptions } from "@/types/export";
import { encodeUtf8ToBinaryString } from "@/lib/qr/encoding/utf8";
import { normalizeDesignForEngine } from "@/lib/qr/renderer/capabilities";
import {
  estimateQrCapacity,
  getModulesPerSide,
} from "@/lib/qr/validation/qr-capacity";
import { isValidHexColor, normalizeHexColor } from "@/lib/utils/color-utils";

export interface QRRendererAdapter {
  mount(container: HTMLElement): Promise<void>;
  update(encodedPayload: string, design: QRDesign): Promise<void>;
  exportBlob(
    encodedPayload: string,
    design: QRDesign,
    options: ExportOptions
  ): Promise<Blob>;
  destroy(): void;
}

const SAFE_LOGO_DATA_URI_PATTERN =
  /^data:image\/(png|jpeg|webp|svg\+xml);base64,[a-zA-Z0-9+/=\s]+$/i;

function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mapGradient(gradient?: GradientConfig): Gradient | undefined {
  if (!gradient || gradient.colors.length < 2) {
    return undefined;
  }

  return {
    type: gradient.type,
    rotation: ((gradient.rotation ?? 0) * Math.PI) / 180,
    colorStops: gradient.colors.map((stop) => ({
      offset: Math.min(1, Math.max(0, stop.offset)),
      color: stop.color,
    })),
  };
}

/**
 * Converts a user-facing quiet-zone margin in QR modules into the exact pixel margin
 * expected by qr-code-styling for a given QR grid size (modulesPerSide) and canvas dimension.
 *
 * Because total grid width = modulesPerSide + 2 * marginModules,
 * each module occupies dimensionPx / (modulesPerSide + 2 * marginModules) pixels.
 */
export function convertModuleMarginToPixels(
  marginModules: number,
  modulesPerSide: number,
  dimensionPx: number
): number {
  if (marginModules <= 0 || modulesPerSide <= 0 || dimensionPx <= 0) {
    return 0;
  }
  const totalModules = modulesPerSide + 2 * marginModules;
  return Math.round((dimensionPx * marginModules) / totalModules);
}

/**
 * Wraps a sanitized logo Data URI inside an SVG container badge when a rounded/circle
 * container shape or custom logo background color is configured.
 * Enforces defense-in-depth validation on both logo.source and logo.backgroundColor.
 */
export function buildDecoratedLogoDataUri(logo: QRLogoConfig): string {
  const trimmedSource = logo.source.trim();
  if (!SAFE_LOGO_DATA_URI_PATTERN.test(trimmedSource)) {
    throw new Error("Unsafe or invalid logo Data URI rejected by renderer.");
  }

  const hasCustomShape = logo.shape === "rounded" || logo.shape === "circle";
  const rawBg = logo.backgroundColor?.trim();
  const hasValidBg = Boolean(
    rawBg && rawBg !== "transparent" && isValidHexColor(rawBg)
  );

  if (!hasCustomShape && !hasValidBg) {
    return trimmedSource;
  }

  const rx = logo.shape === "circle" ? 128 : logo.shape === "rounded" ? 48 : 0;
  const bgFill = hasValidBg ? normalizeHexColor(rawBg!, "#FFFFFF") : "none";
  const inset = hasValidBg ? 24 : 0;
  const innerSize = 256 - inset * 2;
  const safeHref = escapeXmlAttribute(trimmedSource);

  const badgeSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">`,
    `<defs><clipPath id="openqr-logo-clip"><rect x="0" y="0" width="256" height="256" rx="${rx}" ry="${rx}"/></clipPath></defs>`,
    `<g clip-path="url(#openqr-logo-clip)">`,
    hasValidBg
      ? `<rect x="0" y="0" width="256" height="256" rx="${rx}" ry="${rx}" fill="${escapeXmlAttribute(bgFill)}"/>`
      : "",
    `<image href="${safeHref}" x="${inset}" y="${inset}" width="${innerSize}" height="${innerSize}" preserveAspectRatio="xMidYMid meet"/>`,
    `</g>`,
    `</svg>`,
  ].join("");

  const bytes = new TextEncoder().encode(badgeSvg);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

/**
 * Pure adapter mapper that translates OpenQR Studio's QRDesign contract
 * into qr-code-styling Options without accessing any browser APIs.
 *
 * Explicitly defines optional keys (gradient: undefined, image: undefined) so
 * qr-code-styling's shallow key iteration during instance.update() reliably clears
 * removed gradients and removed logos.
 */
export function mapDesignToEngineOptions(
  encodedPayload: string,
  design: QRDesign,
  drawType: "svg" | "canvas" = "svg"
): Options {
  const normalized = normalizeDesignForEngine(design);
  const utf8BinaryData = encodeUtf8ToBinaryString(encodedPayload);

  const capacity = estimateQrCapacity(
    encodedPayload,
    normalized.errorCorrection
  );
  const modulesPerSide = getModulesPerSide(capacity.estimatedVersion);
  const minDimension = Math.min(normalized.width, normalized.height);
  const pixelMargin = convertModuleMarginToPixels(
    normalized.margin,
    modulesPerSide,
    minDimension
  );

  const dotsGradient = mapGradient(normalized.dots.gradient);
  const bgGradient = normalized.background.transparent
    ? undefined
    : mapGradient(normalized.background.gradient);

  const decoratedImage = normalized.logo?.source
    ? buildDecoratedLogoDataUri(normalized.logo)
    : undefined;

  const options: Options = {
    type: drawType,
    shape: "square",
    width: normalized.width,
    height: normalized.height,
    margin: pixelMargin,
    data: utf8BinaryData,
    image: decoratedImage,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: normalized.errorCorrection,
    },
    dotsOptions: {
      type: normalized.dots.style,
      color: normalized.dots.color,
      gradient: dotsGradient,
    },
    cornersSquareOptions: {
      type: normalized.corners.outerStyle,
      color: normalized.corners.outerColor,
      gradient: undefined,
    },
    cornersDotOptions: {
      type: normalized.corners.innerStyle,
      color: normalized.corners.innerColor,
      gradient: undefined,
    },
    backgroundOptions: normalized.background.transparent
      ? {
          color: "transparent",
          gradient: undefined,
        }
      : {
          color: normalized.background.color,
          gradient: bgGradient,
        },
    imageOptions: {
      saveAsBlob: false,
      hideBackgroundDots: true,
      imageSize: normalized.logo?.size ?? 0.22,
      margin: normalized.logo?.margin ?? 4,
      crossOrigin: "anonymous",
    },
  };

  return options;
}
