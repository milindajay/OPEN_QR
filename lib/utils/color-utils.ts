export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const FOREGROUND_COLOR_SWATCHES = [
  { label: "Carbon Black", value: "#171717" },
  { label: "Slate Navy", value: "#0F172A" },
  { label: "Cobalt Blue", value: "#1D4ED8" },
  { label: "Emerald Green", value: "#047857" },
  { label: "Royal Purple", value: "#5B21B6" },
  { label: "Crimson Rose", value: "#9F1239" },
  { label: "Amber Bronze", value: "#78350F" },
  { label: "Deep Teal", value: "#0F766E" },
] as const;

export const BACKGROUND_COLOR_SWATCHES = [
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Soft Alabaster", value: "#F8FAFC" },
  { label: "Warm Ivory", value: "#FEFCE8" },
  { label: "Mint Mist", value: "#F0FDF4" },
  { label: "Lavender Blush", value: "#FAF5FF" },
  { label: "Rose Tint", value: "#FFF1F2" },
  { label: "Ice Blue", value: "#EFF6FF" },
  { label: "Neutral Gray", value: "#F5F5F5" },
] as const;

/**
 * Validates whether a string is a valid 3-digit (#RGB) or 6-digit (#RRGGBB) hex color.
 */
export function isValidHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/**
 * Normalizes a hex string (with or without leading #, 3 or 6 hex digits)
 * to uppercase 6-digit #RRGGBB format, or returns fallback if invalid.
 */
export function normalizeHexColor(value: string, fallback = "#171717"): string {
  const cleaned = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const expanded =
      cleaned[0]! +
      cleaned[0]! +
      cleaned[1]! +
      cleaned[1]! +
      cleaned[2]! +
      cleaned[2]!;
    return `#${expanded.toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  return fallback;
}

/**
 * Parses a HEX (#RGB or #RRGGBB) or rgb(r, g, b) color string into { r, g, b } (0-255).
 * Returns null if the color string is invalid.
 */
export function parseColorToRgb(color: string): RgbColor | null {
  const trimmed = color.trim();

  const hexShort = /^#([0-9a-fA-F]{3})$/.exec(trimmed);
  if (hexShort && hexShort[1]) {
    const h = hexShort[1];
    return {
      r: parseInt(h[0]! + h[0]!, 16),
      g: parseInt(h[1]! + h[1]!, 16),
      b: parseInt(h[2]! + h[2]!, 16),
    };
  }

  const hexFull = /^#([0-9a-fA-F]{6})$/.exec(trimmed);
  if (hexFull && hexFull[1]) {
    const h = hexFull[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const rgbMatch = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(
    trimmed
  );
  if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      return { r, g, b };
    }
  }

  return null;
}

/**
 * Computes WCAG 2.1 relative luminance (0.0 darkest black to 1.0 lightest white).
 */
export function getRelativeLuminance(rgb: RgbColor): number {
  const transform = (channel: number): number => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const r = transform(rgb.r);
  const g = transform(rgb.g);
  const b = transform(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Computes WCAG contrast ratio (1.0 to 21.0) between two color strings.
 * Defaults to 1.0 if either color cannot be parsed.
 */
export function getContrastRatio(foreground: string, background: string): number {
  const fgRgb = parseColorToRgb(foreground);
  const bgRgb = parseColorToRgb(background);

  if (!fgRgb || !bgRgb) {
    return 1;
  }

  const l1 = getRelativeLuminance(fgRgb);
  const l2 = getRelativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}
