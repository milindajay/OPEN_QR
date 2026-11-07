import type { TextPayload } from "@/types/payload";
import { normalizeNewlines } from "@/lib/qr/encoding/utf8";

/**
 * Generates a plain-text UTF-8 QR payload preserving Unicode characters and line breaks.
 */
export function generateTextPayload(payload: TextPayload): string {
  return normalizeNewlines(payload.text);
}
