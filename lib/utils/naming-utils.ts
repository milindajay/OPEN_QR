import type { QRType } from "@/types/qr";
import type { ExportFormat } from "@/types/export";
import { getQRTypeMetadata } from "@/lib/constants/qr-types";

/**
 * Generates a meaningful, privacy-preserving filename for exported QR codes
 * (e.g. "openqr-website.png", "openqr-contact.svg", "openqr-wifi.jpg").
 * Never includes sensitive user payload content in the filename.
 */
export function getExportFilename(type: QRType, format: ExportFormat): string {
  const meta = getQRTypeMetadata(type);
  const extension = format === "jpeg" ? "jpg" : format;
  return `openqr-${meta.exportSlug}.${extension}`;
}
