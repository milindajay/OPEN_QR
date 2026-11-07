import type { ErrorCorrectionLevel } from "@/types/design";
import type {
  CalendarPayload,
  CustomPayload,
  EmailPayload,
  LocationPayload,
  PhonePayload,
  QRPayload,
  SMSPayload,
  SocialPayload,
  TextPayload,
  UrlPayload,
  VCardPayload,
  WhatsAppPayload,
  WiFiPayload,
} from "@/types/payload";
import { generatePayload } from "@/lib/qr/payloads";
import { formatWhatsAppNumber } from "@/lib/qr/payloads/whatsapp";
import { validateHttpUrl } from "@/lib/qr/validation/url-validation";
import { estimateQrCapacity } from "@/lib/qr/validation/qr-capacity";
import { getUtf8ByteLength } from "@/lib/qr/encoding/utf8";
import { isValidIsoCalendarDate } from "@/lib/qr/encoding/escape-ical";

export interface PayloadValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PHONE_CHARACTERS_REGEX = /^[+\d\s().-]+$/;

export const PHONE_APP_MIN_DIGITS = 5;
export const WHATSAPP_MIN_DIGITS = 7;
export const E164_MAX_DIGITS = 15;

function hasBalancedParentheses(input: string): boolean {
  let depth = 0;
  for (const ch of input) {
    if (ch === "(") {
      depth += 1;
      if (depth > 1) return false;
    } else if (ch === ")") {
      if (depth === 0) return false;
      depth -= 1;
    }
  }
  return depth === 0 && !/\(\s*\)/.test(input);
}

export function isValidEmailAddress(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
}

export function isValidPhoneNumber(phone: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required." };
  }

  if (!PHONE_CHARACTERS_REGEX.test(trimmed) || !hasBalancedParentheses(trimmed)) {
    return {
      isValid: false,
      error: "Phone number contains invalid characters or unbalanced parentheses. Use digits, '+', spaces, or hyphens.",
    };
  }

  if (trimmed.indexOf("+") > 0) {
    return {
      isValid: false,
      error: "The '+' country prefix may only appear at the beginning of the phone number.",
    };
  }

  if (/^\+[\s().-]*0/.test(trimmed)) {
    return {
      isValid: false,
      error: "International country codes after '+' cannot start with 0 (ITU-T E.164 country codes begin with 1–9).",
    };
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length < PHONE_APP_MIN_DIGITS) {
    return {
      isValid: false,
      error: `Phone number is too short (minimum ${PHONE_APP_MIN_DIGITS} digits required).`,
    };
  }

  if (digits.length > E164_MAX_DIGITS) {
    return {
      isValid: false,
      error: `Phone number exceeds the international E.164 maximum of ${E164_MAX_DIGITS} digits.`,
    };
  }

  return { isValid: true };
}

export function validateUrlPayload(payload: UrlPayload): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const result = validateHttpUrl(payload.url);
  if (!result.isValid && result.error) {
    errors.url = result.error;
  }
  if (result.warning) {
    warnings.push(result.warning);
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateTextPayload(
  payload: TextPayload,
  errorCorrection: ErrorCorrectionLevel = "M"
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (payload.text.trim().length === 0) {
    errors.text = "Text content is required.";
  } else {
    const capacity = estimateQrCapacity(payload.text, errorCorrection);
    if (capacity.isExceeded) {
      errors.text = `Text exceeds maximum QR capacity (${capacity.byteLength} / ${capacity.maxBytes} UTF-8 bytes at level ${errorCorrection}).`;
    } else if (capacity.isNearLimit) {
      warnings.push(
        `Large payload (${capacity.byteLength} bytes, QR Version ${capacity.estimatedVersion}). Dense QR codes require larger print dimensions to scan reliably.`
      );
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateVCardPayload(
  payload: VCardPayload
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const hasName =
    Boolean(payload.fullName?.trim()) ||
    Boolean(payload.firstName?.trim()) ||
    Boolean(payload.lastName?.trim());

  if (!hasName) {
    errors.fullName = "At least a full name, first name, or last name is required.";
  }

  if (payload.email && payload.email.trim().length > 0) {
    if (!isValidEmailAddress(payload.email)) {
      errors.email = "Please enter a valid contact email address.";
    }
  }

  if (payload.mobile && payload.mobile.trim().length > 0) {
    const mobileCheck = isValidPhoneNumber(payload.mobile);
    if (!mobileCheck.isValid && mobileCheck.error) {
      errors.mobile = mobileCheck.error;
    }
  }

  if (payload.phone && payload.phone.trim().length > 0) {
    const phoneCheck = isValidPhoneNumber(payload.phone);
    if (!phoneCheck.isValid && phoneCheck.error) {
      errors.phone = phoneCheck.error;
    }
  }

  if (payload.website && payload.website.trim().length > 0) {
    const urlCheck = validateHttpUrl(payload.website);
    if (!urlCheck.isValid && urlCheck.error) {
      errors.website = urlCheck.error;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateWiFiPayload(payload: WiFiPayload): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const ssid = payload.ssid.trim();
  if (!ssid) {
    errors.ssid = "Network name (SSID) is required.";
  } else if (getUtf8ByteLength(ssid) > 32) {
    errors.ssid = "Wi-Fi SSID cannot exceed 32 UTF-8 bytes per IEEE 802.11 standard.";
  }

  if (!["WPA", "WEP", "nopass"].includes(payload.security)) {
    errors.security = "Security type must be WPA, WEP, or nopass.";
  }

  const password = payload.password ?? "";

  if (payload.security === "WPA") {
    if (!password) {
      errors.password = "Password is required for WPA/WPA2/WPA3 networks.";
    } else if (password.length < 8) {
      errors.password = "WPA password must be at least 8 characters long.";
    } else if (password.length > 63 && !/^[0-9a-fA-F]{64}$/.test(password)) {
      errors.password = "WPA passphrase must be between 8 and 63 characters (or 64 hex digits).";
    }
  } else if (payload.security === "WEP") {
    if (!password) {
      errors.password = "Password/key is required for WEP networks.";
    } else {
      const isAsciiWep = password.length === 5 || password.length === 13;
      const isHexWep =
        (password.length === 10 || password.length === 26) &&
        /^[0-9a-fA-F]+$/.test(password);
      if (!isAsciiWep && !isHexWep) {
        errors.password =
          "WEP key must be 5 or 13 ASCII characters, or 10 or 26 hexadecimal digits.";
      }
    }
    warnings.push("WEP encryption is legacy and insecure. Consider using WPA2/WPA3.");
  } else if (payload.security === "nopass") {
    if (password.length > 0) {
      errors.password =
        "Open networks ('nopass') cannot have a password. Clear the password or select WPA.";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateEmailPayload(
  payload: EmailPayload
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!payload.email.trim()) {
    errors.email = "Recipient email address is required.";
  } else if (!isValidEmailAddress(payload.email)) {
    errors.email = "Please enter a valid email address (for example, name@example.com).";
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validatePhonePayload(
  payload: PhonePayload
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const check = isValidPhoneNumber(payload.phone);
  if (!check.isValid && check.error) {
    errors.phone = check.error;
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateSmsPayload(payload: SMSPayload): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const check = isValidPhoneNumber(payload.phone);
  if (!check.isValid && check.error) {
    errors.phone = check.error;
  }

  if (payload.message && getUtf8ByteLength(payload.message) > 1000) {
    warnings.push(
      "Long SMS messages may be split into multiple segments or truncated by some mobile messaging apps."
    );
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateLocationPayload(
  payload: LocationPayload
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (
    typeof payload.latitude !== "number" ||
    Number.isNaN(payload.latitude) ||
    !Number.isFinite(payload.latitude)
  ) {
    errors.latitude = "Latitude must be a valid number.";
  } else if (payload.latitude < -90 || payload.latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90 degrees.";
  }

  if (
    typeof payload.longitude !== "number" ||
    Number.isNaN(payload.longitude) ||
    !Number.isFinite(payload.longitude)
  ) {
    errors.longitude = "Longitude must be a valid number.";
  } else if (payload.longitude < -180 || payload.longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180 degrees.";
  }

  if (
    payload.format === "google-maps" &&
    payload.googleMapsUrl &&
    payload.googleMapsUrl.trim().length > 0
  ) {
    const urlCheck = validateHttpUrl(payload.googleMapsUrl);
    if (!urlCheck.isValid && urlCheck.error) {
      errors.googleMapsUrl = urlCheck.error;
    }
  }

  if (payload.format === "geo") {
    warnings.push(
      "Not all camera apps handle raw geo: URIs identically. Use Google Maps format for maximum cross-device compatibility."
    );
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateWhatsAppPayload(
  payload: WhatsAppPayload
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const trimmedCountry = (payload.countryCode ?? "").trim();
  if (trimmedCountry.length > 0) {
    if (!/^\+?[1-9]\d{0,2}$/.test(trimmedCountry)) {
      errors.countryCode =
        "Country code must contain 1 to 3 digits and cannot start with 0 (e.g., +1, +44, +94).";
    }
  }

  const rawPhone = payload.phone.trim();
  if (!rawPhone) {
    errors.phone = "WhatsApp phone number is required.";
  } else if (
    !PHONE_CHARACTERS_REGEX.test(rawPhone) ||
    !hasBalancedParentheses(rawPhone)
  ) {
    errors.phone = "Phone number contains invalid characters.";
  } else if (rawPhone.indexOf("+") > 0) {
    errors.phone =
      "The '+' country prefix may only appear at the beginning of the phone number.";
  } else if (/^\+[\s().-]*0/.test(rawPhone)) {
    errors.phone =
      "International country codes after '+' cannot start with 0.";
  } else {
    const countryDigits = trimmedCountry.replace(/[^\d]/g, "");
    const rawPhoneDigits = rawPhone.replace(/[^\d]/g, "");

    if (
      countryDigits &&
      rawPhone.startsWith("+") &&
      !rawPhoneDigits.startsWith(countryDigits)
    ) {
      errors.phone =
        "Phone number includes a '+' prefix that conflicts with the Country Code field. Remove '+' from the phone number or clear Country Code.";
    } else if (
      !countryDigits &&
      rawPhone.startsWith("0") &&
      !rawPhone.startsWith("00")
    ) {
      errors.phone =
        "WhatsApp requires an international country code (cannot start with a domestic '0'). Enter a Country Code or include your '+' country prefix.";
    } else {
      const totalDigits = formatWhatsAppNumber(rawPhone, payload.countryCode);

      if (totalDigits.length < WHATSAPP_MIN_DIGITS) {
        errors.phone =
          "WhatsApp number must include the international country code and be at least 7 digits.";
      } else if (totalDigits.length > E164_MAX_DIGITS) {
        errors.phone =
          "WhatsApp number exceeds the maximum international length of 15 digits.";
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateSocialPayload(
  payload: SocialPayload
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  const raw = payload.url.trim();
  if (!raw) {
    errors.url = "Social profile URL or handle is required.";
    return { isValid: false, errors, warnings };
  }

  const looksLikeUrlOrScheme =
    payload.provider === "custom" ||
    /^https?:\/\//i.test(raw) ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) ||
    raw.includes("/");

  if (looksLikeUrlOrScheme) {
    const urlCheck = validateHttpUrl(raw);
    if (!urlCheck.isValid && urlCheck.error) {
      errors.url = urlCheck.error;
    }
    if (urlCheck.warning) {
      warnings.push(urlCheck.warning);
    }
  } else {
    if (/\s/.test(raw)) {
      errors.url = "Social handle must not contain spaces.";
    } else {
      const handle = raw.replace(/^@+/, "");
      if (handle.length < 2) {
        errors.url =
          "Please enter a complete username (at least 2 characters) or a full https:// profile URL.";
      } else if (
        !/^[a-zA-Z0-9._-]+$/.test(handle) ||
        /^[._-]|[._-]$/.test(handle)
      ) {
        errors.url =
          "Username contains invalid characters. Enter a valid username or a full https:// profile URL.";
      }
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateCalendarPayload(
  payload: CalendarPayload
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!payload.title.trim()) {
    errors.title = "Event title is required.";
  }

  const isAllDay = Boolean(payload.allDay);
  let startTimestamp: number | null = null;
  let endTimestamp: number | null = null;

  const rawStart = payload.start.trim();
  if (!rawStart) {
    errors.start = isAllDay
      ? "Start date is required."
      : "Start date and time are required.";
  } else if (isAllDay) {
    const datePart = rawStart.slice(0, 10);
    if (!isValidIsoCalendarDate(datePart)) {
      errors.start = "Invalid start date format or non-existent calendar date.";
    } else {
      startTimestamp = new Date(`${datePart}T00:00:00Z`).getTime();
    }
  } else {
    if (
      /^\d{4}-\d{2}-\d{2}/.test(rawStart) &&
      !isValidIsoCalendarDate(rawStart.slice(0, 10))
    ) {
      errors.start = "Invalid start date/time: date does not exist on the calendar.";
    } else {
      const parsedStart = new Date(rawStart);
      if (Number.isNaN(parsedStart.getTime())) {
        errors.start = "Invalid start date/time format.";
      } else {
        startTimestamp = parsedStart.getTime();
      }
    }
  }

  const rawEnd = payload.end.trim();
  if (!rawEnd) {
    errors.end = isAllDay
      ? "End date is required."
      : "End date and time are required.";
  } else if (isAllDay) {
    const datePart = rawEnd.slice(0, 10);
    if (!isValidIsoCalendarDate(datePart)) {
      errors.end = "Invalid end date format or non-existent calendar date.";
    } else {
      endTimestamp = new Date(`${datePart}T00:00:00Z`).getTime();
    }
  } else {
    if (
      /^\d{4}-\d{2}-\d{2}/.test(rawEnd) &&
      !isValidIsoCalendarDate(rawEnd.slice(0, 10))
    ) {
      errors.end = "Invalid end date/time: date does not exist on the calendar.";
    } else {
      const parsedEnd = new Date(rawEnd);
      if (Number.isNaN(parsedEnd.getTime())) {
        errors.end = "Invalid end date/time format.";
      } else {
        endTimestamp = parsedEnd.getTime();
      }
    }
  }

  if (
    startTimestamp !== null &&
    endTimestamp !== null &&
    endTimestamp < startTimestamp
  ) {
    errors.end = isAllDay
      ? "Event end date must not be earlier than the start date."
      : "Event end date/time must not be earlier than the start date/time.";
  }

  if (payload.url && payload.url.trim().length > 0) {
    const urlCheck = validateHttpUrl(payload.url);
    if (!urlCheck.isValid && urlCheck.error) {
      errors.url = urlCheck.error;
    }
  }

  warnings.push(
    "Calendar QR import behavior varies across mobile camera apps and operating systems."
  );

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

export function validateCustomPayload(
  payload: CustomPayload,
  errorCorrection: ErrorCorrectionLevel = "M"
): PayloadValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (payload.value.length === 0) {
    errors.value = "Custom payload cannot be empty.";
  } else {
    const capacity = estimateQrCapacity(payload.value, errorCorrection);
    if (capacity.isExceeded) {
      errors.value = `Custom payload exceeds QR Version 40 capacity (${capacity.byteLength} / ${capacity.maxBytes} bytes at level ${errorCorrection}).`;
    } else if (capacity.isNearLimit) {
      warnings.push(
        `Custom payload uses ${capacity.utilizationPercentage}% of capacity (Version ${capacity.estimatedVersion}).`
      );
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors, warnings };
}

/**
 * Validates any discriminated QRPayload union member and also checks overall
 * encoded QR byte capacity against the selected Error Correction Level.
 */
export function validatePayload(
  payload: QRPayload,
  errorCorrection: ErrorCorrectionLevel = "M"
): PayloadValidationResult {
  let result: PayloadValidationResult;

  switch (payload.type) {
    case "url":
      result = validateUrlPayload(payload);
      break;
    case "text":
      result = validateTextPayload(payload, errorCorrection);
      break;
    case "vcard":
      result = validateVCardPayload(payload);
      break;
    case "wifi":
      result = validateWiFiPayload(payload);
      break;
    case "email":
      result = validateEmailPayload(payload);
      break;
    case "phone":
      result = validatePhonePayload(payload);
      break;
    case "sms":
      result = validateSmsPayload(payload);
      break;
    case "location":
      result = validateLocationPayload(payload);
      break;
    case "whatsapp":
      result = validateWhatsAppPayload(payload);
      break;
    case "social":
      result = validateSocialPayload(payload);
      break;
    case "calendar":
      result = validateCalendarPayload(payload);
      break;
    case "custom":
      result = validateCustomPayload(payload, errorCorrection);
      break;
  }

  // If field-level validation succeeded, verify overall encoded QR byte capacity
  if (result.isValid && payload.type !== "text" && payload.type !== "custom") {
    const encoded = generatePayload(payload);
    const capacity = estimateQrCapacity(encoded, errorCorrection);

    if (capacity.isExceeded) {
      result.errors._capacity = `Generated QR payload (${capacity.byteLength} UTF-8 bytes) exceeds the maximum capacity (${capacity.maxBytes} bytes) for error correction level ${errorCorrection}.`;
      result.isValid = false;
    } else if (capacity.isNearLimit) {
      result.warnings.push(
        `Payload requires QR Version ${capacity.estimatedVersion} (${capacity.byteLength} bytes). Test scanability carefully.`
      );
    }
  }

  return result;
}
