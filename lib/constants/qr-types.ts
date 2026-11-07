import type { QRType } from "@/types/qr";

export interface QRTypeMetadata {
  id: QRType;
  label: string;
  shortLabel: string;
  description: string;
  exportSlug: string;
}

export const QR_TYPES: readonly QRTypeMetadata[] = [
  {
    id: "url",
    label: "Website URL",
    shortLabel: "URL",
    description: "Link to any website, landing page or web resource.",
    exportSlug: "website",
  },
  {
    id: "text",
    label: "Plain Text",
    shortLabel: "Text",
    description: "Encode plain multiline text in any language (UTF-8).",
    exportSlug: "text",
  },
  {
    id: "vcard",
    label: "vCard Contact",
    shortLabel: "vCard",
    description: "Share digital business card and contact details (vCard 3.0).",
    exportSlug: "contact",
  },
  {
    id: "wifi",
    label: "Wi-Fi Network",
    shortLabel: "Wi-Fi",
    description: "Connect instantly to a Wi-Fi network without typing passwords.",
    exportSlug: "wifi",
  },
  {
    id: "email",
    label: "Email",
    shortLabel: "Email",
    description: "Compose an email with a pre-filled recipient, subject and body.",
    exportSlug: "email",
  },
  {
    id: "phone",
    label: "Phone Call",
    shortLabel: "Phone",
    description: "Dial a telephone number directly on mobile devices.",
    exportSlug: "phone",
  },
  {
    id: "sms",
    label: "SMS Message",
    shortLabel: "SMS",
    description: "Open a text message with a recipient and pre-filled body.",
    exportSlug: "sms",
  },
  {
    id: "location",
    label: "Location",
    shortLabel: "Location",
    description: "Share geographic coordinates or a Google Maps pin.",
    exportSlug: "location",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    shortLabel: "WhatsApp",
    description: "Start a WhatsApp chat with an optional pre-filled message.",
    exportSlug: "whatsapp",
  },
  {
    id: "social",
    label: "Social Media",
    shortLabel: "Social",
    description: "Link directly to social media profiles and channels.",
    exportSlug: "social",
  },
  {
    id: "calendar",
    label: "Calendar Event",
    shortLabel: "Calendar",
    description: "Share an iCalendar (VEVENT) appointment with date and location.",
    exportSlug: "event",
  },
  {
    id: "custom",
    label: "Custom Payload",
    shortLabel: "Custom",
    description: "Encode raw URI schemes or arbitrary unformatted data.",
    exportSlug: "custom",
  },
] as const;

export function getQRTypeMetadata(type: QRType): QRTypeMetadata {
  const match = QR_TYPES.find((item) => item.id === type);
  if (!match) {
    return QR_TYPES[0]!;
  }
  return match;
}
