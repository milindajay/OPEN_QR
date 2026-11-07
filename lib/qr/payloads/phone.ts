import type { PhonePayload } from "@/types/payload";

/**
 * Sanitizes a telephone string while preserving a leading '+' for international numbers
 * and valid dial digits.
 */
export function normalizePhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Generates an RFC 3966 tel: URI.
 */
export function generatePhonePayload(payload: PhonePayload): string {
  const normalized = normalizePhoneNumber(payload.phone);
  return `tel:${normalized}`;
}
