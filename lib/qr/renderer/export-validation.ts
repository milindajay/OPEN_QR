import type {
  JpegInspectionReport,
  PngInspectionReport,
  SvgInspectionReport,
} from "@/types/export";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

const FORBIDDEN_SVG_TAGS = new Set([
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

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset]! << 24) >>> 0) +
    ((bytes[offset + 1]! << 16) >>> 0) +
    ((bytes[offset + 2]! << 8) >>> 0) +
    (bytes[offset + 3]! >>> 0)
  );
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset]! << 8) | bytes[offset + 1]!) >>> 0;
}

function readChunkType(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(
    bytes[offset] ?? 0,
    bytes[offset + 1] ?? 0,
    bytes[offset + 2] ?? 0,
    bytes[offset + 3] ?? 0
  );
}

/**
 * Inspects a binary PNG buffer (`Uint8Array`) to verify the 8-byte PNG signature,
 * IHDR chunk dimensions, bit depth, color type (alpha channel support),
 * IDAT data chunk presence, and IEND termination chunk.
 */
export function inspectPngBytes(bytes: Uint8Array): PngInspectionReport {
  if (bytes.byteLength < 33) {
    return {
      isValidPng: false,
      width: 0,
      height: 0,
      bitDepth: 0,
      colorType: 0,
      hasAlphaChannel: false,
      hasIdatChunk: false,
      hasIendChunk: false,
      byteLength: bytes.byteLength,
    };
  }

  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) {
      return {
        isValidPng: false,
        width: 0,
        height: 0,
        bitDepth: 0,
        colorType: 0,
        hasAlphaChannel: false,
        hasIdatChunk: false,
        hasIendChunk: false,
        byteLength: bytes.byteLength,
      };
    }
  }

  const ihdrLength = readUint32BE(bytes, 8);
  const ihdrType = readChunkType(bytes, 12);
  if (ihdrType !== "IHDR" || ihdrLength !== 13) {
    return {
      isValidPng: false,
      width: 0,
      height: 0,
      bitDepth: 0,
      colorType: 0,
      hasAlphaChannel: false,
      hasIdatChunk: false,
      hasIendChunk: false,
      byteLength: bytes.byteLength,
    };
  }

  const width = readUint32BE(bytes, 16);
  const height = readUint32BE(bytes, 20);
  const bitDepth = bytes[24] ?? 0;
  const colorType = bytes[25] ?? 0;
  // PNG colorType 4 = Grayscale + Alpha, colorType 6 = Truecolor + Alpha (RGBA)
  const hasAlphaChannel = colorType === 4 || colorType === 6;

  let offset = 8;
  let hasIdatChunk = false;
  let hasIendChunk = false;

  while (offset + 8 <= bytes.byteLength) {
    const chunkLen = readUint32BE(bytes, offset);
    const chunkType = readChunkType(bytes, offset + 4);
    if (chunkType === "IDAT" && chunkLen > 0) {
      hasIdatChunk = true;
    }
    if (chunkType === "IEND") {
      hasIendChunk = true;
      break;
    }
    const nextOffset = offset + 12 + chunkLen;
    if (nextOffset <= offset || nextOffset > bytes.byteLength) {
      break;
    }
    offset = nextOffset;
  }

  const isValidPng =
    width > 0 && height > 0 && hasIdatChunk && hasIendChunk;

  return {
    isValidPng,
    width,
    height,
    bitDepth,
    colorType,
    hasAlphaChannel,
    hasIdatChunk,
    hasIendChunk,
    byteLength: bytes.byteLength,
  };
}

/**
 * Inspects a binary JPEG buffer (`Uint8Array`) to verify the SOI (`FF D8 FF`)
 * signature, walk JPEG segments to extract `SOF0`/`SOF1`/`SOF2` dimensions,
 * and verify the EOI (`FF D9`) marker.
 */
export function inspectJpegBytes(bytes: Uint8Array): JpegInspectionReport {
  if (
    bytes.byteLength < 20 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes[2] !== 0xff
  ) {
    return {
      isValidJpeg: false,
      width: 0,
      height: 0,
      components: 0,
      hasSofMarker: false,
      hasEoiMarker: false,
      byteLength: bytes.byteLength,
    };
  }

  let offset = 2;
  let width = 0;
  let height = 0;
  let components = 0;
  let hasSofMarker = false;

  while (offset + 4 <= bytes.byteLength) {
    if (bytes[offset] !== 0xff) {
      offset++;
      continue;
    }

    while (offset < bytes.byteLength && bytes[offset] === 0xff) {
      offset++;
    }
    if (offset >= bytes.byteLength) {
      break;
    }

    const marker = bytes[offset]!;
    offset++;

    // Standalone markers without length
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) {
      // EOI or SOS (Start of Scan)
      break;
    }

    if (offset + 2 > bytes.byteLength) {
      break;
    }
    const segmentLength = readUint16BE(bytes, offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.byteLength) {
      break;
    }

    // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      if (offset + 7 <= bytes.byteLength) {
        height = readUint16BE(bytes, offset + 3);
        width = readUint16BE(bytes, offset + 5);
        components = bytes[offset + 7] ?? 0;
        hasSofMarker = true;
      }
    }

    offset += segmentLength;
  }

  const hasEoiMarker =
    bytes[bytes.byteLength - 2] === 0xff &&
    bytes[bytes.byteLength - 1] === 0xd9;

  const isValidJpeg =
    hasSofMarker && width > 0 && height > 0 && hasEoiMarker;

  return {
    isValidJpeg,
    width,
    height,
    components,
    hasSofMarker,
    hasEoiMarker,
    byteLength: bytes.byteLength,
  };
}

/**
 * Parses and validates an exported SVG string for XML well-formedness,
 * vector QR module geometry, unique and resolvable gradient/clipPath IDs,
 * embedded logo safety, and absence of scripts or external dependencies.
 */
export function inspectSvgContent(svgText: string): SvgInspectionReport {
  const errors: string[] = [];
  const trimmed = svgText.trim();

  if (!trimmed) {
    return {
      isValidXml: false,
      isVectorQr: false,
      width: 0,
      height: 0,
      viewBox: "",
      vectorElementCount: 0,
      hasLinearGradient: false,
      hasRadialGradient: false,
      hasEmbeddedLogo: false,
      embeddedLogoHref: null,
      hasLogoBackingPlate: false,
      logoBackingPlateFill: null,
      hasOpaqueBackgroundRect: false,
      backgroundFill: null,
      allIdsUnique: false,
      allUrlReferencesResolve: false,
      hasForbiddenElements: false,
      hasEventHandlerAttributes: false,
      hasExternalReferences: false,
      errors: ["SVG content is empty."],
    };
  }

  if (/<!(?:ENTITY|DOCTYPE)\b/i.test(trimmed)) {
    errors.push("SVG contains forbidden DOCTYPE or ENTITY declarations.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "image/svg+xml");
  const parserError =
    doc.querySelector("parsererror") ??
    doc.getElementsByTagName("parsererror")[0];

  if (parserError) {
    errors.push("Malformed XML detected by DOMParser.");
  }

  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "svg") {
    errors.push("Root element is not <svg>.");
    return {
      isValidXml: false,
      isVectorQr: false,
      width: 0,
      height: 0,
      viewBox: "",
      vectorElementCount: 0,
      hasLinearGradient: false,
      hasRadialGradient: false,
      hasEmbeddedLogo: false,
      embeddedLogoHref: null,
      hasLogoBackingPlate: false,
      logoBackingPlateFill: null,
      hasOpaqueBackgroundRect: false,
      backgroundFill: null,
      allIdsUnique: false,
      allUrlReferencesResolve: false,
      hasForbiddenElements: false,
      hasEventHandlerAttributes: false,
      hasExternalReferences: false,
      errors,
    };
  }

  const width = Number.parseInt(root.getAttribute("width") ?? "0", 10) || 0;
  const height = Number.parseInt(root.getAttribute("height") ?? "0", 10) || 0;
  const viewBox = root.getAttribute("viewBox") ?? "";

  if (!root.getAttribute("xmlns")) {
    errors.push("Missing xmlns attribute on root <svg>.");
  }

  const allElements = [root, ...Array.from(root.querySelectorAll("*"))];
  const seenIds = new Set<string>();
  let allIdsUnique = true;
  const referencedIds: string[] = [];

  let vectorElementCount = 0;
  let hasForbiddenElements = false;
  let hasEventHandlerAttributes = false;
  let hasExternalReferences = false;

  for (const el of allElements) {
    const tag = (el.localName || el.tagName).toLowerCase();

    if (FORBIDDEN_SVG_TAGS.has(tag)) {
      hasForbiddenElements = true;
      errors.push(`Forbidden element <${tag}> present in SVG.`);
    }

    if (tag === "path" || tag === "rect" || tag === "circle" || tag === "polygon") {
      vectorElementCount++;
    }

    const idAttr = el.getAttribute("id");
    if (idAttr) {
      if (seenIds.has(idAttr)) {
        allIdsUnique = false;
        errors.push(`Duplicate ID "${idAttr}" found in SVG.`);
      }
      seenIds.add(idAttr);
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const val = attr.value.trim();

      if (name === "xmlns" || name.startsWith("xmlns:")) {
        continue;
      }

      if (name.startsWith("on")) {
        hasEventHandlerAttributes = true;
        errors.push(`Forbidden event handler attribute "${attr.name}".`);
      }

      if (
        name === "href" ||
        name === "xlink:href" ||
        name === "src" ||
        name.endsWith(":href")
      ) {
        if (val.startsWith("#")) {
          referencedIds.push(val.slice(1));
        } else if (
          !/^data:image\/(png|jpeg|webp|svg\+xml);base64,[a-zA-Z0-9+/=\s]+$/i.test(
            val
          )
        ) {
          hasExternalReferences = true;
          errors.push(`External or unsafe resource reference in ${attr.name}: "${val.slice(0, 60)}".`);
        }
      }

      const urlRegex = /url\s*\(\s*(?:'([^']*)'|"([^"]*)"|([^)]*))\s*\)/gi;
      let match = urlRegex.exec(val);
      while (match !== null) {
        const ref = (match[1] ?? match[2] ?? match[3] ?? "").trim();
        if (ref.startsWith("#")) {
          referencedIds.push(ref.slice(1));
        } else {
          hasExternalReferences = true;
          errors.push(`External url() reference in ${attr.name}: "${ref}".`);
        }
        match = urlRegex.exec(val);
      }

      if (
        /^(?:blob:|https?:|file:|\/\/|javascript:|vbscript:|data:text\/html)/i.test(val) ||
        val.includes("/_next/")
      ) {
        hasExternalReferences = true;
        errors.push(`Forbidden external or app-dependent reference in ${attr.name}.`);
      }
    }
  }

  let allUrlReferencesResolve = true;
  for (const refId of referencedIds) {
    if (!seenIds.has(refId)) {
      allUrlReferencesResolve = false;
      errors.push(`Unresolved internal SVG reference "#${refId}".`);
    }
  }

  const hasLinearGradient = root.querySelectorAll("linearGradient").length > 0;
  const hasRadialGradient = root.querySelectorAll("radialGradient").length > 0;

  const imageEl = root.querySelector("image");
  const hasEmbeddedLogo = Boolean(imageEl);
  const embeddedLogoHref =
    imageEl?.getAttribute("href") ??
    imageEl?.getAttribute("xlink:href") ??
    null;

  const backingPlateEl = root.querySelector('[data-logo-backing-plate="true"]');
  const hasLogoBackingPlate = Boolean(backingPlateEl);
  const logoBackingPlateFill = backingPlateEl?.getAttribute("fill") ?? null;

  // Inspect background rect (if present)
  const bgRect = root.querySelector('[data-qr-background="true"]');
  const backgroundFill = bgRect?.getAttribute("fill") ?? null;
  const hasOpaqueBackgroundRect = Boolean(
    bgRect &&
      backgroundFill &&
      backgroundFill !== "none" &&
      backgroundFill !== "transparent"
  );

  // Genuine vector QR codes contain multiple module/corner vector primitives inside <defs>/<clipPath>
  const isVectorQr = vectorElementCount >= 10;

  const isValidXml =
    !parserError &&
    errors.length === 0 &&
    width > 0 &&
    height > 0 &&
    isVectorQr &&
    allIdsUnique &&
    allUrlReferencesResolve &&
    !hasForbiddenElements &&
    !hasEventHandlerAttributes &&
    !hasExternalReferences;

  return {
    isValidXml,
    isVectorQr,
    width,
    height,
    viewBox,
    vectorElementCount,
    hasLinearGradient,
    hasRadialGradient,
    hasEmbeddedLogo,
    embeddedLogoHref,
    hasLogoBackingPlate,
    logoBackingPlateFill,
    hasOpaqueBackgroundRect,
    backgroundFill,
    allIdsUnique,
    allUrlReferencesResolve,
    hasForbiddenElements,
    hasEventHandlerAttributes,
    hasExternalReferences,
    errors,
  };
}
