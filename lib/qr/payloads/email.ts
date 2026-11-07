import type { EmailPayload } from "@/types/payload";
import { normalizeNewlines } from "@/lib/qr/encoding/utf8";

/**
 * Generates an RFC 6068 mailto: URI with percent-encoded subject and body parameters.
 */
export function generateEmailPayload(payload: EmailPayload): string {
  const recipient = payload.email.trim();
  const queryParts: string[] = [];

  if (payload.subject && payload.subject.trim().length > 0) {
    queryParts.push(`subject=${encodeURIComponent(payload.subject.trim())}`);
  }

  if (payload.message && payload.message.trim().length > 0) {
    const normalizedMessage = normalizeNewlines(payload.message.trim());
    queryParts.push(`body=${encodeURIComponent(normalizedMessage)}`);
  }

  if (queryParts.length === 0) {
    return `mailto:${recipient}`;
  }

  return `mailto:${recipient}?${queryParts.join("&")}`;
}
