import type { QRPayload } from "@/types/payload";
import { generateUrlPayload } from "@/lib/qr/payloads/url";
import { generateTextPayload } from "@/lib/qr/payloads/text";
import { generateVCardPayload } from "@/lib/qr/payloads/vcard";
import { generateWiFiPayload } from "@/lib/qr/payloads/wifi";
import { generateEmailPayload } from "@/lib/qr/payloads/email";
import { generatePhonePayload } from "@/lib/qr/payloads/phone";
import { generateSmsPayload } from "@/lib/qr/payloads/sms";
import { generateLocationPayload } from "@/lib/qr/payloads/location";
import { generateWhatsAppPayload } from "@/lib/qr/payloads/whatsapp";
import { generateSocialPayload } from "@/lib/qr/payloads/social";
import { generateCalendarPayload } from "@/lib/qr/payloads/calendar";
import { generateCustomPayload } from "@/lib/qr/payloads/custom";

/**
 * Pure dispatcher that converts any discriminated QRPayload union member
 * into its standards-compliant encoded QR string.
 */
export function generatePayload(payload: QRPayload): string {
  switch (payload.type) {
    case "url":
      return generateUrlPayload(payload);
    case "text":
      return generateTextPayload(payload);
    case "vcard":
      return generateVCardPayload(payload);
    case "wifi":
      return generateWiFiPayload(payload);
    case "email":
      return generateEmailPayload(payload);
    case "phone":
      return generatePhonePayload(payload);
    case "sms":
      return generateSmsPayload(payload);
    case "location":
      return generateLocationPayload(payload);
    case "whatsapp":
      return generateWhatsAppPayload(payload);
    case "social":
      return generateSocialPayload(payload);
    case "calendar":
      return generateCalendarPayload(payload);
    case "custom":
      return generateCustomPayload(payload);
  }
}

export {
  generateUrlPayload,
  generateTextPayload,
  generateVCardPayload,
  generateWiFiPayload,
  generateEmailPayload,
  generatePhonePayload,
  generateSmsPayload,
  generateLocationPayload,
  generateWhatsAppPayload,
  generateSocialPayload,
  generateCalendarPayload,
  generateCustomPayload,
};
