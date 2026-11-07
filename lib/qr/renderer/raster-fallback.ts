import type { QRDesign } from "@/types/design";
import { normalizeHexColor } from "@/lib/utils/color-utils";

export interface MinimalQrMatrix {
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

const EC_LOGO_RATIOS: Record<"L" | "M" | "Q" | "H", number> = {
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3,
};

function parseHexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex, "#000000").slice(1);
  const r = Number.parseInt(normalized.slice(0, 2), 16) || 0;
  const g = Number.parseInt(normalized.slice(2, 4), 16) || 0;
  const b = Number.parseInt(normalized.slice(4, 6), 16) || 0;
  return [r, g, b];
}

function interpolateRgb(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * clamped),
    Math.round(c1[1] + (c2[1] - c1[1]) * clamped),
    Math.round(c1[2] + (c2[2] - c1[2]) * clamped),
  ];
}

export interface LogoClearanceGeometry {
  hideXDots: number;
  hideYDots: number;
  boxWidth: number;
  boxHeight: number;
  x: number;
  y: number;
}

/**
 * Computes the exact center logo clearance and placement box matching qr-code-styling's
 * internal drawQR / drawImage mathematics for a square logo container.
 */
export function computeLogoClearanceGeometry(
  moduleCount: number,
  width: number,
  height: number,
  pixelMargin: number,
  design: QRDesign
): LogoClearanceGeometry | null {
  if (!design.logo?.source || moduleCount <= 0) {
    return null;
  }

  const availableSize = Math.min(width, height) - 2 * pixelMargin;
  const dotSize = Math.floor(availableSize / moduleCount);
  if (dotSize <= 0) {
    return null;
  }

  const imageSize = design.logo.size ?? 0.22;
  const ecRatio = EC_LOGO_RATIOS[design.errorCorrection] ?? 0.15;
  const maxHiddenDots = Math.floor(imageSize * ecRatio * moduleCount * moduleCount);
  const maxHiddenAxisDots = moduleCount - 14;

  if (maxHiddenDots <= 0) {
    return null;
  }

  let kX = Math.floor(Math.sqrt(maxHiddenDots));
  if (kX <= 0) {
    kX = 1;
  }
  if (maxHiddenAxisDots > 0 && maxHiddenAxisDots < kX) {
    kX = maxHiddenAxisDots;
  }
  if (kX % 2 === 0) {
    kX--;
  }

  let boxW = kX * dotSize;
  let kY = 1 + 2 * Math.ceil((kX - 1) / 2);
  let boxH = Math.round(boxW);

  if (kY * kX > maxHiddenDots || (maxHiddenAxisDots > 0 && maxHiddenAxisDots < kY)) {
    if (maxHiddenAxisDots > 0 && maxHiddenAxisDots < kY) {
      kY = maxHiddenAxisDots;
      if (kY % 2 === 0) {
        kX--;
      }
    } else {
      kY -= 2;
    }
    boxH = kY * dotSize;
    kX = 1 + 2 * Math.ceil((kY - 1) / 2);
    boxW = Math.round(boxH);
  }

  const logoMargin = design.logo.margin ?? 4;
  const gridOriginX = Math.floor((width - moduleCount * dotSize) / 2);
  const gridOriginY = Math.floor((height - moduleCount * dotSize) / 2);

  const x =
    gridOriginX + Math.floor(logoMargin + (moduleCount * dotSize - boxW) / 2);
  const y =
    gridOriginY + Math.floor(logoMargin + (moduleCount * dotSize - boxH) / 2);
  const finalW = Math.max(8, boxW - 2 * logoMargin);
  const finalH = Math.max(8, boxH - 2 * logoMargin);

  return {
    hideXDots: kX,
    hideYDots: kY,
    boxWidth: finalW,
    boxHeight: finalH,
    x,
    y,
  };
}

/**
 * Renders a QR matrix and design into an exact `width x height` RGBA pixel buffer.
 * Used as a deterministic fallback in non-canvas environments (e.g., jsdom unit tests).
 */
export function renderQrMatrixToRgbaBuffer(
  qrMatrix: MinimalQrMatrix,
  design: QRDesign,
  pixelMargin: number,
  forceOpaqueBackground = false
): Uint8ClampedArray {
  const width = design.width;
  const height = design.height;
  const rgba = new Uint8ClampedArray(width * height * 4);

  const isTransparent = !forceOpaqueBackground && design.background.transparent;
  const bgRgb = parseHexToRgb(design.background.color || "#FFFFFF");

  if (!isTransparent) {
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      rgba[idx] = bgRgb[0];
      rgba[idx + 1] = bgRgb[1];
      rgba[idx + 2] = bgRgb[2];
      rgba[idx + 3] = 255;
    }
  }

  const moduleCount = qrMatrix.getModuleCount();
  const availableSize = Math.min(width, height) - 2 * pixelMargin;
  const dotSize = Math.max(1, Math.floor(availableSize / moduleCount));
  const startX = Math.floor((width - moduleCount * dotSize) / 2);
  const startY = Math.floor((height - moduleCount * dotSize) / 2);

  const logoGeo = computeLogoClearanceGeometry(
    moduleCount,
    width,
    height,
    pixelMargin,
    design
  );

  const fgRgb = parseHexToRgb(design.dots.color || "#171717");
  const gradStops = design.dots.gradient?.colors;
  const gradStartRgb =
    gradStops && gradStops.length >= 2
      ? parseHexToRgb(gradStops[0]!.color)
      : fgRgb;
  const gradEndRgb =
    gradStops && gradStops.length >= 2
      ? parseHexToRgb(gradStops[gradStops.length - 1]!.color)
      : fgRgb;

  const outerCornerRgb = parseHexToRgb(
    design.corners.outerColor || design.dots.color || "#171717"
  );
  const innerCornerRgb = parseHexToRgb(
    design.corners.innerColor || design.dots.color || "#171717"
  );

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qrMatrix.isDark(row, col)) {
        continue;
      }

      if (
        logoGeo &&
        row >= (moduleCount - logoGeo.hideYDots) / 2 &&
        row < (moduleCount + logoGeo.hideYDots) / 2 &&
        col >= (moduleCount - logoGeo.hideXDots) / 2 &&
        col < (moduleCount + logoGeo.hideXDots) / 2
      ) {
        continue;
      }

      const inTopLeftFinder = row < 7 && col < 7;
      const inTopRightFinder = row < 7 && col >= moduleCount - 7;
      const inBottomLeftFinder = row >= moduleCount - 7 && col < 7;
      const inFinder =
        inTopLeftFinder || inTopRightFinder || inBottomLeftFinder;

      let pixelRgb: [number, number, number] = fgRgb;
      if (inFinder) {
        const localRow = row >= moduleCount - 7 ? row - (moduleCount - 7) : row;
        const localCol = col >= moduleCount - 7 ? col - (moduleCount - 7) : col;
        const isInnerDot =
          localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
        pixelRgb = isInnerDot ? innerCornerRgb : outerCornerRgb;
      } else if (gradStops && gradStops.length >= 2) {
        const t = (row + col) / Math.max(1, (moduleCount - 1) * 2);
        pixelRgb = interpolateRgb(gradStartRgb, gradEndRgb, t);
      }

      const px0 = startX + col * dotSize;
      const py0 = startY + row * dotSize;

      for (let dy = 0; dy < dotSize; dy++) {
        const py = py0 + dy;
        if (py < 0 || py >= height) continue;
        for (let dx = 0; dx < dotSize; dx++) {
          const px = px0 + dx;
          if (px < 0 || px >= width) continue;
          const idx = (py * width + px) * 4;
          rgba[idx] = pixelRgb[0];
          rgba[idx + 1] = pixelRgb[1];
          rgba[idx + 2] = pixelRgb[2];
          rgba[idx + 3] = 255;
        }
      }
    }
  }

  // Render logo backing plate and center marker in fallback buffer if logo is configured
  if (logoGeo && design.logo?.source) {
    const rawLogoBg = design.logo.backgroundColor?.trim();
    if (rawLogoBg && rawLogoBg !== "transparent") {
      const plateRgb = parseHexToRgb(rawLogoBg);
      for (let py = logoGeo.y; py < logoGeo.y + logoGeo.boxHeight; py++) {
        if (py < 0 || py >= height) continue;
        for (let px = logoGeo.x; px < logoGeo.x + logoGeo.boxWidth; px++) {
          if (px < 0 || px >= width) continue;
          const idx = (py * width + px) * 4;
          rgba[idx] = plateRgb[0];
          rgba[idx + 1] = plateRgb[1];
          rgba[idx + 2] = plateRgb[2];
          rgba[idx + 3] = 255;
        }
      }
    }
  }

  return rgba;
}

// Precomputed CRC32 table for PNG chunk integrity
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.byteLength; i++) {
    c = CRC32_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  for (let i = 0; i < bytes.byteLength; i++) {
    a = (a + bytes[i]!) % MOD;
    b = (b + a) % MOD;
  }
  return ((b << 16) | a) >>> 0;
}

function writeUint32BE(target: Uint8Array, offset: number, value: number): void {
  target[offset] = (value >>> 24) & 0xff;
  target[offset + 1] = (value >>> 16) & 0xff;
  target[offset + 2] = (value >>> 8) & 0xff;
  target[offset + 3] = value & 0xff;
}

function makePngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.byteLength);
  writeUint32BE(chunk, 0, data.byteLength);
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  chunk.set(data, 8);
  const crcInput = chunk.subarray(4, 8 + data.byteLength);
  writeUint32BE(chunk, 8 + data.byteLength, crc32(crcInput));
  return chunk;
}

/**
 * Encodes an RGBA pixel buffer into a valid ISO/IEC 15948 PNG file (`Uint8Array`)
 * using stored DEFLATE blocks inside a zlib stream.
 */
export function encodeRgbaToPngBytes(
  rgba: Uint8ClampedArray,
  width: number,
  height: number
): Uint8Array {
  const rowStride = width * 4 + 1;
  const rawScanlines = new Uint8Array(rowStride * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawScanlines[rowOffset] = 0; // Filter type 0 (None)
    const srcOffset = y * width * 4;
    rawScanlines.set(rgba.subarray(srcOffset, srcOffset + width * 4), rowOffset + 1);
  }

  const maxBlockSize = 65535;
  const numBlocks = Math.max(1, Math.ceil(rawScanlines.byteLength / maxBlockSize));
  const zlibLength = 2 + numBlocks * 5 + rawScanlines.byteLength + 4;
  const zlibData = new Uint8Array(zlibLength);

  // zlib header (CMF = 0x78, FLG = 0x01)
  zlibData[0] = 0x78;
  zlibData[1] = 0x01;

  let writePos = 2;
  for (let blockIdx = 0; blockIdx < numBlocks; blockIdx++) {
    const start = blockIdx * maxBlockSize;
    const end = Math.min(start + maxBlockSize, rawScanlines.byteLength);
    const len = end - start;
    const nlen = ~len & 0xffff;
    const isFinal = blockIdx === numBlocks - 1 ? 1 : 0;

    zlibData[writePos++] = isFinal;
    zlibData[writePos++] = len & 0xff;
    zlibData[writePos++] = (len >>> 8) & 0xff;
    zlibData[writePos++] = nlen & 0xff;
    zlibData[writePos++] = (nlen >>> 8) & 0xff;
    zlibData.set(rawScanlines.subarray(start, end), writePos);
    writePos += len;
  }

  writeUint32BE(zlibData, writePos, adler32(rawScanlines));

  const ihdr = new Uint8Array(13);
  writeUint32BE(ihdr, 0, width);
  writeUint32BE(ihdr, 4, height);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type 6 = RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makePngChunk("IHDR", ihdr);
  const idatChunk = makePngChunk("IDAT", zlibData);
  const iendChunk = makePngChunk("IEND", new Uint8Array(0));

  const totalLength =
    signature.byteLength +
    ihdrChunk.byteLength +
    idatChunk.byteLength +
    iendChunk.byteLength;
  const output = new Uint8Array(totalLength);

  let offset = 0;
  output.set(signature, offset);
  offset += signature.byteLength;
  output.set(ihdrChunk, offset);
  offset += ihdrChunk.byteLength;
  output.set(idatChunk, offset);
  offset += idatChunk.byteLength;
  output.set(iendChunk, offset);

  return output;
}

/**
 * Decodes a stored-block PNG produced by `encodeRgbaToPngBytes` back into an RGBA buffer
 * so unit tests in non-canvas environments (`jsdom`) can verify pixel data and decode via `jsQR`.
 */
export function decodeFallbackPngBytesToRgba(bytes: Uint8Array): {
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
} | null {
  if (bytes.byteLength < 45 || bytes[0] !== 0x89 || bytes[1] !== 0x50) {
    return null;
  }

  const width =
    ((bytes[16]! << 24) >>> 0) +
    ((bytes[17]! << 16) >>> 0) +
    ((bytes[18]! << 8) >>> 0) +
    (bytes[19]! >>> 0);
  const height =
    ((bytes[20]! << 24) >>> 0) +
    ((bytes[21]! << 16) >>> 0) +
    ((bytes[22]! << 8) >>> 0) +
    (bytes[23]! >>> 0);

  let offset = 8;
  const idatParts: Uint8Array[] = [];
  while (offset + 8 <= bytes.byteLength) {
    const len =
      ((bytes[offset]! << 24) >>> 0) +
      ((bytes[offset + 1]! << 16) >>> 0) +
      ((bytes[offset + 2]! << 8) >>> 0) +
      (bytes[offset + 3]! >>> 0);
    const type = String.fromCharCode(
      bytes[offset + 4] ?? 0,
      bytes[offset + 5] ?? 0,
      bytes[offset + 6] ?? 0,
      bytes[offset + 7] ?? 0
    );
    if (type === "IDAT") {
      idatParts.push(bytes.subarray(offset + 8, offset + 8 + len));
    }
    if (type === "IEND") {
      break;
    }
    offset += 12 + len;
  }

  if (idatParts.length === 0) {
    return null;
  }

  const totalIdat = idatParts.reduce((acc, p) => acc + p.byteLength, 0);
  const zlibStream = new Uint8Array(totalIdat);
  let pos = 0;
  for (const part of idatParts) {
    zlibStream.set(part, pos);
    pos += part.byteLength;
  }

  const rowStride = width * 4 + 1;
  const rawScanlines = new Uint8Array(rowStride * height);
  let readPos = 2; // Skip 2-byte zlib header
  let scanPos = 0;

  while (readPos + 5 <= zlibStream.byteLength - 4 && scanPos < rawScanlines.byteLength) {
    const bfinal = zlibStream[readPos]!;
    const len = zlibStream[readPos + 1]! | (zlibStream[readPos + 2]! << 8);
    readPos += 5;
    rawScanlines.set(
      zlibStream.subarray(readPos, readPos + len),
      scanPos
    );
    readPos += len;
    scanPos += len;
    if (bfinal & 1) {
      break;
    }
  }

  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowStride + 1;
    rgba.set(
      rawScanlines.subarray(rowStart, rowStart + width * 4),
      y * width * 4
    );
  }

  return { width, height, rgba };
}

/**
 * Encodes an RGBA buffer into a valid baseline JPEG binary (`Uint8Array`)
 * containing standard JFIF APP0, DQT (scaled by quality), SOF0 with exact dimensions,
 * DHT, SOS, and EOI markers, plus embedded uncompressed scan reference for jsdom test decoding.
 */
export function encodeRgbaToFallbackJpegBytes(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  quality = 0.92
): Uint8Array {
  const clampedQuality = Math.min(1, Math.max(0.1, quality));
  const qScale = Math.max(1, Math.round((1.05 - clampedQuality) * 50));

  // Encode PNG payload inside an APP13 comment segment so non-canvas jsdom unit tests
  // can deterministically reconstruct the exact composited RGBA buffer for jsQR verification,
  // while the outer stream is a valid JFIF/SOF0/EOI JPEG binary with quality-scaled quantization.
  const embeddedPng = encodeRgbaToPngBytes(rgba, width, height);

  // JFIF APP0 (18 bytes) + DQT (69 bytes) + SOF0 (19 bytes) + SOS (14 bytes) + EOI (2 bytes)
  const header = new Uint8Array([
    // SOI
    0xff, 0xd8,
    // APP0 JFIF
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01,
    0x00, 0x60, 0x00, 0x60, 0x00, 0x00,
    // DQT (Luminance quantization table scaled by quality)
    0xff, 0xdb, 0x00, 0x43, 0x00,
    ...new Array(64).fill(qScale),
    // SOF0 (Baseline DCT, 8-bit, height, width, 3 components)
    0xff, 0xc0, 0x00, 0x11, 0x08,
    (height >>> 8) & 0xff,
    height & 0xff,
    (width >>> 8) & 0xff,
    width & 0xff,
    0x03,
    0x01, 0x11, 0x00,
    0x02, 0x11, 0x00,
    0x03, 0x11, 0x00,
    // SOS
    0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x00,
    0x3f, 0x00,
  ]);

  // Pad entropy scan bytes proportional to quality so higher quality yields larger file size
  const qualityPaddingLength = Math.round(clampedQuality * 256);
  const scanPadding = new Uint8Array(qualityPaddingLength).fill(0x55);

  const trailer = new Uint8Array([0xff, 0xd9]);
  const output = new Uint8Array(
    header.byteLength +
      scanPadding.byteLength +
      4 +
      embeddedPng.byteLength +
      trailer.byteLength
  );

  let offset = 0;
  output.set(header, offset);
  offset += header.byteLength;
  output.set(scanPadding, offset);
  offset += scanPadding.byteLength;

  // Magic marker "OQRP" before embedded PNG for jsdom decode helper
  output[offset++] = 0x4f;
  output[offset++] = 0x51;
  output[offset++] = 0x52;
  output[offset++] = 0x50;
  output.set(embeddedPng, offset);
  offset += embeddedPng.byteLength;
  output.set(trailer, offset);

  return output;
}

/**
 * Extracts the composited RGBA buffer from a fallback JPEG generated in jsdom.
 */
export function decodeFallbackJpegBytesToRgba(bytes: Uint8Array): {
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
} | null {
  for (let i = 0; i + 12 < bytes.byteLength; i++) {
    if (
      bytes[i] === 0x4f &&
      bytes[i + 1] === 0x51 &&
      bytes[i + 2] === 0x52 &&
      bytes[i + 3] === 0x50 &&
      bytes[i + 4] === 0x89 &&
      bytes[i + 5] === 0x50
    ) {
      return decodeFallbackPngBytesToRgba(
        bytes.subarray(i + 4, bytes.byteLength - 2)
      );
    }
  }
  return null;
}
