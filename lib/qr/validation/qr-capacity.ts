import type { ErrorCorrectionLevel } from "@/types/design";
import type { CapacityReport } from "@/types/qr";
import { getCharacterCount, getUtf8ByteLength } from "@/lib/qr/encoding/utf8";

/**
 * ISO/IEC 18004 QR Code binary (8-bit byte mode) maximum payload capacities
 * in bytes for QR Versions 1 through 40 across Error Correction Levels L, M, Q, H.
 */
const BYTE_CAPACITY_BY_VERSION: Record<ErrorCorrectionLevel, readonly number[]> = {
  L: [
    17, 32, 53, 78, 106, 134, 154, 192, 230, 271,
    321, 367, 425, 458, 520, 586, 644, 718, 792, 858,
    929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732,
    1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953,
  ],
  M: [
    14, 26, 42, 62, 84, 106, 122, 152, 180, 213,
    251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
    711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370,
    1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331,
  ],
  Q: [
    11, 20, 32, 46, 60, 74, 86, 108, 130, 151,
    177, 203, 241, 258, 292, 322, 364, 394, 442, 482,
    509, 565, 611, 661, 715, 751, 805, 868, 908, 982,
    1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663,
  ],
  H: [
    7, 14, 24, 34, 44, 58, 64, 84, 98, 119,
    137, 155, 177, 194, 220, 250, 280, 310, 338, 382,
    403, 439, 461, 511, 535, 593, 625, 658, 698, 742,
    790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273,
  ],
};

/**
 * Returns the maximum UTF-8 byte capacity for a given Error Correction Level (Version 40).
 */
export function getMaxByteCapacity(
  errorCorrection: ErrorCorrectionLevel = "M"
): number {
  const table = BYTE_CAPACITY_BY_VERSION[errorCorrection];
  return table[table.length - 1] ?? 2331;
}

/**
 * Returns the number of modules per side for a given QR version (1..40).
 * Formula per ISO/IEC 18004: 21 + (version - 1) * 4.
 */
export function getModulesPerSide(version: number): number {
  const clampedVersion = Math.min(40, Math.max(1, Math.floor(version)));
  return 21 + (clampedVersion - 1) * 4;
}

/**
 * Estimates the QR version, byte utilization, and capacity limits for an encoded
 * payload string in 8-bit UTF-8 byte mode.
 */
export function estimateQrCapacity(
  encodedPayload: string,
  errorCorrection: ErrorCorrectionLevel = "M"
): CapacityReport {
  const byteLength = getUtf8ByteLength(encodedPayload);
  const characterCount = getCharacterCount(encodedPayload);
  const versionTable = BYTE_CAPACITY_BY_VERSION[errorCorrection];
  const maxBytes = versionTable[versionTable.length - 1] ?? 2331;

  let estimatedVersion = 40;
  let foundFit = false;

  for (let i = 0; i < versionTable.length; i++) {
    const cap = versionTable[i];
    if (cap !== undefined && byteLength <= cap) {
      estimatedVersion = i + 1;
      foundFit = true;
      break;
    }
  }

  const isExceeded = !foundFit || byteLength > maxBytes;
  const rawRatio = maxBytes > 0 ? (byteLength / maxBytes) * 100 : 0;
  const utilizationPercentage = Math.min(100, Number(rawRatio.toFixed(1)));
  const isNearLimit =
    !isExceeded && (utilizationPercentage >= 80 || estimatedVersion >= 25);

  return {
    byteLength,
    characterCount,
    maxBytes,
    estimatedVersion,
    utilizationPercentage,
    isExceeded,
    isNearLimit,
  };
}
