import DOMPurify from "dompurify";
import { APP_CONFIG } from "@/lib/constants/app-config";

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface SvgSanitizationResult {
  isValid: boolean;
  sanitizedSvg?: string;
  dataUrl?: string;
  error?: string;
}

export interface LogoUploadResult {
  isValid: boolean;
  dataUrl?: string;
  fileName?: string;
  mimeType?: string;
  error?: string;
}

const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = /\.(png|jpe?g|webp|svg)$/i;

const FORBIDDEN_SVG_ELEMENTS = new Set([
  "script",
  "foreignobject",
  "iframe",
  "object",
  "embed",
  "applet",
  "audio",
  "video",
  "canvas",
  "link",
  "meta",
  "base",
  "handler",
  "listener",
  "set",
  "animate",
  "animatetransform",
  "animatemotion",
  "animatecolor",
  "html",
  "body",
  "head",
  "form",
  "input",
  "button",
  "textarea",
]);

const URL_BEARING_ATTRIBUTES = new Set([
  "href",
  "xlink:href",
  "src",
  "data",
  "action",
  "formaction",
  "poster",
  " codebase",
]);

const UNSAFE_CSS_PATTERNS = [
  /@import\b/i,
  /expression\s*\(/i,
  /-moz-binding\s*:/i,
  /behavior\s*:/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /data\s*:\s*application\/javascript/i,
];

function isSafeFragmentIdentifier(value: string): boolean {
  return /^#[a-zA-Z0-9_.:-]+$/.test(value.trim());
}

function hasUnsafeUrlFunctionReference(text: string): boolean {
  const urlRegex = /url\s*\(\s*(?:'([^']*)'|"([^"]*)"|([^)]*))\s*\)/gi;
  let match = urlRegex.exec(text);
  while (match !== null) {
    const rawTarget = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!isSafeFragmentIdentifier(rawTarget)) {
      return true;
    }
    match = urlRegex.exec(text);
  }
  return false;
}

function isSafeInternalOrDataReference(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  // Allow internal SVG fragment IDs (#gradient-1)
  if (trimmed.startsWith("#")) {
    return isSafeFragmentIdentifier(trimmed);
  }
  // Allow only safe raster data URLs inside SVG <image> elements
  if (/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=\s]+$/i.test(trimmed)) {
    return true;
  }
  return false;
}

function hasUnsafeCssConstruct(cssText: string): boolean {
  if (UNSAFE_CSS_PATTERNS.some((pattern) => pattern.test(cssText))) {
    return true;
  }
  return hasUnsafeUrlFunctionReference(cssText);
}

function encodeUtf8StringToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Validates file type, extension, and size before reading a logo file into memory.
 */
export function validateLogoFile(
  file: Pick<File, "name" | "type" | "size">,
  maxSizeBytes: number = APP_CONFIG.limits.maxLogoFileSizeBytes
): FileValidationResult {
  if (!file || file.size === 0) {
    return { isValid: false, error: "Selected file is empty." };
  }

  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Logo file exceeds the ${maxMb} MB size limit.`,
    };
  }

  const hasValidMime = ALLOWED_LOGO_MIME_TYPES.has(file.type.toLowerCase());
  const hasValidExt = ALLOWED_EXTENSIONS.test(file.name);

  if (!hasValidMime || !hasValidExt) {
    return {
      isValid: false,
      error:
        "Unsupported file format. Please upload a PNG, JPG, WebP, or SVG image.",
    };
  }

  return { isValid: true };
}

/**
 * Multi-layer XML parser + AST security verifier + DOMPurify sanitizer for SVG uploads.
 *
 * Security guarantees:
 * 1. Rejects XML entity declarations (<!ENTITY / <!DOCTYPE) to prevent XXE/Billion Laughs.
 * 2. Parses using DOMParser("image/svg+xml") and rejects malformed XML or non-<svg> root nodes.
 * 3. Walks the parsed XML DOM tree and explicitly rejects:
 *    - <script>, <foreignObject>, <iframe>, <object>, <embed>, SMIL animation/set tags, HTML tags.
 *    - Any event-handler attribute starting with "on" (onload, onerror, onclick, etc.).
 *    - Any external resource URL (http://, https://, //) or unsafe scheme (javascript:, data:text/html, nested svg data URI).
 *    - Any unsafe CSS construct (@import, expression(), external url(), javascript:) in <style> or style="...".
 * 4. Sanitizes the verified SVG via DOMPurify (svg profile) and encodes to a safe base64 Data URI
 *    so raw SVG markup is never injected into the application DOM.
 */
export function sanitizeSvgContent(rawSvg: string): SvgSanitizationResult {
  const trimmed = rawSvg.trim();

  if (!trimmed) {
    return { isValid: false, error: "SVG file content is empty." };
  }

  // 1. Reject XML entity / DTD declarations (XXE / entity expansion protection)
  if (/<!(?:ENTITY|DOCTYPE)\b/i.test(trimmed)) {
    return {
      isValid: false,
      error: "Rejected SVG containing unsafe XML DOCTYPE or ENTITY declarations.",
    };
  }

  if (typeof DOMParser === "undefined") {
    return {
      isValid: false,
      error: "XML parser is unavailable in the current environment.",
    };
  }

  // 2. Parse with standard XML parser ("image/svg+xml")
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(trimmed, "image/svg+xml");

  const parserError =
    xmlDoc.querySelector("parsererror") ??
    xmlDoc.getElementsByTagName("parsererror")[0];

  if (parserError) {
    return {
      isValid: false,
      error: "Invalid or malformed SVG XML structure.",
    };
  }

  const root = xmlDoc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "svg") {
    return {
      isValid: false,
      error: "File does not have a valid root <svg> element.",
    };
  }

  // 3. Walk all elements in the parsed XML AST to reject malicious constructs fail-closed
  const allElements = [root, ...Array.from(root.querySelectorAll("*"))];

  for (const el of allElements) {
    const tagName = el.tagName.toLowerCase();
    const localName = (el.localName || tagName).toLowerCase();

    if (
      FORBIDDEN_SVG_ELEMENTS.has(tagName) ||
      FORBIDDEN_SVG_ELEMENTS.has(localName)
    ) {
      return {
        isValid: false,
        error: `Rejected SVG containing forbidden <${localName}> element.`,
      };
    }

    if (localName === "style") {
      const cssContent = el.textContent ?? "";
      if (hasUnsafeCssConstruct(cssContent)) {
        return {
          isValid: false,
          error:
            "Rejected SVG containing unsafe CSS rules or external @import/url() references.",
        };
      }
    }

    const attributes = Array.from(el.attributes);
    for (const attr of attributes) {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.trim();

      // Reject all inline event handlers (onload, onerror, onclick, onmouseover, etc.)
      if (attrName.startsWith("on")) {
        return {
          isValid: false,
          error: `Rejected SVG containing forbidden event handler attribute "${attr.name}".`,
        };
      }

      // Inspect URL-bearing attributes (href, xlink:href, src, data, etc.)
      if (
        URL_BEARING_ATTRIBUTES.has(attrName) ||
        attrName.endsWith(":href")
      ) {
        if (!isSafeInternalOrDataReference(attrValue)) {
          return {
            isValid: false,
            error: `Rejected SVG containing external or unsafe URL reference in "${attr.name}".`,
          };
        }
      }

      // Inspect style attribute
      if (attrName === "style" && hasUnsafeCssConstruct(attrValue)) {
        return {
          isValid: false,
          error: "Rejected SVG containing unsafe inline CSS style declarations.",
        };
      }

      // Inspect presentation attributes that can contain url(...) or schemes
      if (
        /^(javascript|vbscript|data\s*:\s*text\/html|data\s*:\s*image\/svg)/i.test(
          attrValue
        ) ||
        hasUnsafeUrlFunctionReference(attrValue)
      ) {
        return {
          isValid: false,
          error: `Rejected SVG containing unsafe reference in attribute "${attr.name}".`,
        };
      }
    }
  }

  // 4. Sanitize with DOMPurify SVG profile
  const cleanSvgMarkup = DOMPurify.sanitize(trimmed, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: Array.from(FORBIDDEN_SVG_ELEMENTS),
  });

  if (!cleanSvgMarkup || !cleanSvgMarkup.trim().toLowerCase().startsWith("<svg")) {
    return {
      isValid: false,
      error: "SVG failed sanitization verification.",
    };
  }

  // Ensure root <svg> has explicit xmlns and dimensions so browser Image loader renders reliably
  const cleanDoc = parser.parseFromString(cleanSvgMarkup, "image/svg+xml");
  const cleanRoot = cleanDoc.documentElement;
  if (!cleanRoot || cleanRoot.tagName.toLowerCase() !== "svg") {
    return {
      isValid: false,
      error: "Sanitized SVG output is invalid.",
    };
  }

  if (!cleanRoot.getAttribute("xmlns")) {
    cleanRoot.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  if (!cleanRoot.getAttribute("width")) {
    cleanRoot.setAttribute("width", "256");
  }
  if (!cleanRoot.getAttribute("height")) {
    cleanRoot.setAttribute("height", "256");
  }

  const serialized = new XMLSerializer().serializeToString(cleanRoot);
  const base64 = encodeUtf8StringToBase64(serialized);
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  return {
    isValid: true,
    sanitizedSvg: serialized,
    dataUrl,
  };
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read SVG file."));
    reader.readAsText(file);
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Processes an uploaded logo File locally in the browser:
 * - Validates MIME type, extension, and size limit.
 * - For SVG files: parses, verifies, and sanitizes via sanitizeSvgContent.
 * - For raster files (PNG/JPEG/WebP): converts to an in-memory Data URL.
 */
export async function processUploadedLogoFile(
  file: File
): Promise<LogoUploadResult> {
  const fileCheck = validateLogoFile(file);
  if (!fileCheck.isValid) {
    return { isValid: false, error: fileCheck.error };
  }

  const isSvg =
    file.type.toLowerCase() === "image/svg+xml" ||
    file.name.toLowerCase().endsWith(".svg");

  if (isSvg) {
    try {
      const rawText = await readFileAsText(file);
      const sanitized = sanitizeSvgContent(rawText);
      if (!sanitized.isValid || !sanitized.dataUrl) {
        return {
          isValid: false,
          error: sanitized.error ?? "SVG file failed security sanitization.",
        };
      }
      return {
        isValid: true,
        dataUrl: sanitized.dataUrl,
        fileName: file.name,
        mimeType: "image/svg+xml",
      };
    } catch {
      return {
        isValid: false,
        error: "Unable to parse or sanitize SVG file.",
      };
    }
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    if (!/^data:image\/(png|jpeg|webp);base64,/i.test(dataUrl)) {
      return {
        isValid: false,
        error: "Invalid raster image data.",
      };
    }
    return {
      isValid: true,
      dataUrl,
      fileName: file.name,
      mimeType: file.type,
    };
  } catch {
    return {
      isValid: false,
      error: "Failed to read image file in browser memory.",
    };
  }
}
