export interface UrlPayload {
  type: "url";
  url: string;
}

export interface TextPayload {
  type: "text";
  text: string;
}

export interface VCardPayload {
  type: "vcard";
  firstName?: string;
  lastName?: string;
  fullName: string;
  organization?: string;
  jobTitle?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  note?: string;
}

export interface WiFiPayload {
  type: "wifi";
  ssid: string;
  password?: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface EmailPayload {
  type: "email";
  email: string;
  subject?: string;
  message?: string;
}

export interface PhonePayload {
  type: "phone";
  phone: string;
}

export interface SMSPayload {
  type: "sms";
  phone: string;
  message?: string;
}

export interface LocationPayload {
  type: "location";
  latitude: number;
  longitude: number;
  label?: string;
  address?: string;
  googleMapsUrl?: string;
  format: "geo" | "google-maps";
}

export interface WhatsAppPayload {
  type: "whatsapp";
  countryCode?: string;
  phone: string;
  message?: string;
}

export type SocialProvider =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "x"
  | "pinterest"
  | "snapchat"
  | "telegram"
  | "custom";

export interface SocialPayload {
  type: "social";
  provider: SocialProvider;
  url: string;
}

export interface CalendarPayload {
  type: "calendar";
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  description?: string;
  url?: string;
}

export interface CustomPayload {
  type: "custom";
  value: string;
}

export type QRPayload =
  | UrlPayload
  | TextPayload
  | VCardPayload
  | WiFiPayload
  | EmailPayload
  | PhonePayload
  | SMSPayload
  | LocationPayload
  | WhatsAppPayload
  | SocialPayload
  | CalendarPayload
  | CustomPayload;

export type QRPayloadByType = {
  [K in QRPayload["type"]]: Extract<QRPayload, { type: K }>;
};
