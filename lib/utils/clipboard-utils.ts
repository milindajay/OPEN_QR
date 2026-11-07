import type { QRDesign } from "@/types/design";
import type { ClipboardActionResult } from "@/types/export";
import type { QRType } from "@/types/qr";
import { exportQrCodeBlob } from "@/lib/qr/renderer/export";
import { triggerBlobDownload } from "@/lib/utils/download-utils";
import { getExportFilename } from "@/lib/utils/naming-utils";

/**
 * Checks whether the current browser environment supports writing binary
 * `image/png` Blobs to the system clipboard via `ClipboardItem`.
 */
export function isImageClipboardSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard) &&
    typeof navigator.clipboard.write === "function" &&
    typeof ClipboardItem !== "undefined"
  );
}

/**
 * Checks whether the current browser environment supports writing plain text
 * to the system clipboard via `navigator.clipboard.writeText`.
 */
export function isTextClipboardSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard) &&
    typeof navigator.clipboard.writeText === "function"
  );
}

/**
 * Exports the current QR code design as a high-resolution PNG Blob and writes it
 * to the system clipboard.
 *
 * - Waits for the browser to confirm `navigator.clipboard.write` before reporting success.
 * - If `ClipboardItem` or image clipboard writing is unsupported by the browser,
 *   automatically falls back to downloading the PNG file locally.
 * - If clipboard permission is denied (`NotAllowedError` / `SecurityError`),
 *   returns an explicit error state without falsely claiming success.
 */
export async function copyQrImageToClipboard(
  qrType: QRType,
  encodedPayload: string,
  design: QRDesign,
  dimensionOverride?: number
): Promise<ClipboardActionResult> {
  if (!encodedPayload || encodedPayload.length === 0) {
    return {
      success: false,
      mode: "error",
      message: "Cannot copy an empty QR code.",
    };
  }

  const targetDimension = dimensionOverride ?? design.width;
  let pngBlob: Blob;

  try {
    pngBlob = await exportQrCodeBlob(encodedPayload, design, {
      format: "png",
      width: targetDimension,
      height: targetDimension,
    });
  } catch (err: unknown) {
    return {
      success: false,
      mode: "error",
      message:
        err instanceof Error
          ? err.message
          : "Failed to render QR PNG for clipboard.",
    };
  }

  const fallbackFilename = getExportFilename(qrType, "png");

  if (!isImageClipboardSupported()) {
    triggerBlobDownload(pngBlob, fallbackFilename);
    return {
      success: true,
      mode: "fallback-download",
      fallbackFilename,
      message: `Image clipboard is unsupported in this browser — downloaded ${fallbackFilename} instead.`,
    };
  }

  try {
    const item = new ClipboardItem({ "image/png": pngBlob });
    await navigator.clipboard.write([item]);
    return {
      success: true,
      mode: "clipboard-image",
      message: `Copied ${targetDimension}×${targetDimension} PNG QR image to clipboard.`,
    };
  } catch (err: unknown) {
    const errorName =
      err instanceof Error ? err.name : "";

    // If the browser throws TypeError or NotSupportedError for ClipboardItem("image/png"),
    // provide the documented PNG download fallback.
    if (errorName === "TypeError" || errorName === "NotSupportedError") {
      triggerBlobDownload(pngBlob, fallbackFilename);
      return {
        success: true,
        mode: "fallback-download",
        fallbackFilename,
        message: `Image clipboard is unsupported in this browser — downloaded ${fallbackFilename} instead.`,
      };
    }

    return {
      success: false,
      mode: "error",
      message:
        "Clipboard permission was denied by the browser. Please allow clipboard access or use Download PNG.",
    };
  }
}

/**
 * Copies the exact, unmodified QR payload string (`encodedPayload`) to the clipboard,
 * preserving all UTF-8 characters and line breaks (`\r\n` / `\n`).
 * Never writes payload content to console logs or persistent storage.
 */
export async function copyQrPayloadToClipboard(
  encodedPayload: string
): Promise<ClipboardActionResult> {
  if (!encodedPayload || encodedPayload.length === 0) {
    return {
      success: false,
      mode: "error",
      message: "Cannot copy an empty QR payload.",
    };
  }

  if (!isTextClipboardSupported()) {
    return {
      success: false,
      mode: "error",
      message: "Clipboard text writing is unavailable in this browser.",
    };
  }

  try {
    await navigator.clipboard.writeText(encodedPayload);
    return {
      success: true,
      mode: "clipboard-text",
      message: "Copied exact QR payload to clipboard.",
    };
  } catch {
    return {
      success: false,
      mode: "error",
      message:
        "Clipboard permission was denied by the browser. Unable to copy QR payload.",
    };
  }
}
