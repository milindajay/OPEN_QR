import type { SMSPayload } from "@/types/payload";
import { normalizePhoneNumber } from "@/lib/qr/payloads/phone";
import { normalizeNewlines } from "@/lib/qr/encoding/utf8";

/**
 * Generates an SMS URI (sms:+1234567890?body=Hello).
 */
export function generateSmsPayload(payload: SMSPayload): string {
  const phone = normalizePhoneNumber(payload.phone);
  const message = payload.message ? normalizeNewlines(payload.message.trim()) : "";

  if (!message) {
    return `sms:${phone}`;
  }

  return `sms:${phone}?body=${encodeURIComponent(message)}`;
}
