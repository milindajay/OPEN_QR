import type { WhatsAppPayload } from "@/types/payload";
import { normalizeNewlines } from "@/lib/qr/encoding/utf8";

/**
 * Formats country code and phone number into digits-only international format
 * required by https://wa.me/<number> (no '+', '00', spaces, or punctuation).
 *
 * Preserves the user's intended country code:
 * - When `countryCode` is supplied and `phone` is a local/national number (no leading '+'),
 *   strips any domestic leading '0' trunk prefix and unconditionally prepends `countryCode`
 *   (even if the subscriber number itself begins with the same digits as `countryCode`,
 *   such as an Indian mobile starting with '91' under '+91' or a Kazakh mobile starting
 *   with '7' under '+7').
 * - When `phone` explicitly starts with '+' and already begins with `countryCode`, avoids
 *   double-prepending `countryCode`.
 */
export function formatWhatsAppNumber(
  phone: string,
  countryCode?: string
): string {
  const cleanCountry = (countryCode ?? "").replace(/[^\d]/g, "");
  const trimmedPhone = phone.trim();
  let cleanPhone = trimmedPhone.replace(/[^\d]/g, "");

  if (cleanCountry) {
    if (trimmedPhone.startsWith("+")) {
      if (cleanPhone.startsWith(cleanCountry)) {
        return cleanPhone;
      }
      return `${cleanCountry}${cleanPhone}`;
    }

    if (trimmedPhone.startsWith("00") && cleanPhone.startsWith(`00${cleanCountry}`)) {
      return cleanPhone.slice(2);
    }

    if (cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.replace(/^0+/, "");
    }

    return `${cleanCountry}${cleanPhone}`;
  }

  if (trimmedPhone.startsWith("00")) {
    return cleanPhone.slice(2);
  }

  return cleanPhone;
}

/**
 * Generates a WhatsApp chat deep link (https://wa.me/1234567890?text=Hello).
 */
export function generateWhatsAppPayload(payload: WhatsAppPayload): string {
  const number = formatWhatsAppNumber(payload.phone, payload.countryCode);
  const message = payload.message ? normalizeNewlines(payload.message.trim()) : "";

  if (!message) {
    return `https://wa.me/${number}`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
