import { describe, expect, it } from "vitest";
import { validatePayload } from "@/lib/qr/validation/payload-validation";
import { validateHttpUrl } from "@/lib/qr/validation/url-validation";

describe("URL Validation", () => {
  it("accepts valid HTTPS and HTTP URLs", () => {
    expect(validateHttpUrl("https://openqr.studio/docs?tab=api").isValid).toBe(
      true
    );
    const httpRes = validateHttpUrl("http://example.com");
    expect(httpRes.isValid).toBe(true);
    expect(httpRes.warning).toMatch(/unencrypted HTTP/i);
  });

  it("rejects empty, dangerous, spaceladen, or hostless URLs", () => {
    expect(validateHttpUrl("").isValid).toBe(false);
    expect(validateHttpUrl("javascript:alert(1)").isValid).toBe(false);
    expect(validateHttpUrl("data:text/html,<script>").isValid).toBe(false);
    expect(validateHttpUrl("https://example.com/with space").isValid).toBe(
      false
    );
    expect(validateHttpUrl("example.com").isValid).toBe(false);
    expect(validateHttpUrl("https://invalidhost").isValid).toBe(false);
  });
});

describe("Comprehensive Payload Validation (All 12 Types)", () => {
  it("validates URL payloads", () => {
    expect(
      validatePayload({ type: "url", url: "https://openqr.studio" }).isValid
    ).toBe(true);
    expect(validatePayload({ type: "url", url: "ftp://files.org" }).isValid).toBe(
      false
    );
  });

  it("validates Plain Text payloads and catches capacity overflow", () => {
    expect(validatePayload({ type: "text", text: "Valid text" }).isValid).toBe(
      true
    );
    expect(validatePayload({ type: "text", text: "   " }).isValid).toBe(false);

    const hugeText = "A".repeat(3100);
    const overflow = validatePayload({ type: "text", text: hugeText }, "M");
    expect(overflow.isValid).toBe(false);
    expect(overflow.errors.text).toMatch(/exceeds maximum QR capacity/i);
  });

  it("validates vCard payloads (name requirement, email, phone, website)", () => {
    expect(
      validatePayload({
        type: "vcard",
        fullName: "",
        firstName: "",
        lastName: "",
      }).isValid
    ).toBe(false);

    const invalidFields = validatePayload({
      type: "vcard",
      fullName: "Jane Doe",
      email: "not-an-email",
      phone: "12",
      website: "javascript:void(0)",
    });
    expect(invalidFields.isValid).toBe(false);
    expect(invalidFields.errors.email).toBeDefined();
    expect(invalidFields.errors.phone).toBeDefined();
    expect(invalidFields.errors.website).toBeDefined();
  });

  it("validates Wi-Fi payloads (SSID byte limit, WPA, WEP, and nopass rules)", () => {
    // Missing SSID
    expect(
      validatePayload({
        type: "wifi",
        ssid: "",
        security: "nopass",
        hidden: false,
      }).isValid
    ).toBe(false);

    // SSID > 32 UTF-8 bytes
    expect(
      validatePayload({
        type: "wifi",
        ssid: "A".repeat(33),
        security: "nopass",
        hidden: false,
      }).isValid
    ).toBe(false);

    // WPA password too short (< 8 chars)
    expect(
      validatePayload({
        type: "wifi",
        ssid: "HomeWiFi",
        password: "short",
        security: "WPA",
        hidden: false,
      }).isValid
    ).toBe(false);

    // Valid WPA
    expect(
      validatePayload({
        type: "wifi",
        ssid: "HomeWiFi",
        password: "correct-horse-battery",
        security: "WPA",
        hidden: false,
      }).isValid
    ).toBe(true);

    // Valid WEP (10 hex digits) with legacy warning
    const wepRes = validatePayload({
      type: "wifi",
      ssid: "LegacyNet",
      password: "1A2B3C4D5E",
      security: "WEP",
      hidden: false,
    });
    expect(wepRes.isValid).toBe(true);
    expect(wepRes.warnings.length).toBeGreaterThan(0);

    // Invalid WEP length
    expect(
      validatePayload({
        type: "wifi",
        ssid: "LegacyNet",
        password: "1234567",
        security: "WEP",
        hidden: false,
      }).isValid
    ).toBe(false);

    // nopass with password supplied must fail
    expect(
      validatePayload({
        type: "wifi",
        ssid: "CafeFree",
        password: "secret",
        security: "nopass",
        hidden: false,
      }).isValid
    ).toBe(false);
  });

  it("validates Email payloads", () => {
    expect(
      validatePayload({
        type: "email",
        email: "team@openqr.studio",
        subject: "Hi",
      }).isValid
    ).toBe(true);

    expect(
      validatePayload({
        type: "email",
        email: "invalid@@domain",
      }).isValid
    ).toBe(false);
  });

  it("validates Phone and SMS payloads (E.164 bounds, '+0' rejection, balanced parentheses, and misplaced '+')", () => {
    expect(
      validatePayload({ type: "phone", phone: "+1 (415) 555-0199" }).isValid
    ).toBe(true);
    expect(validatePayload({ type: "phone", phone: "123" }).isValid).toBe(false);
    expect(validatePayload({ type: "phone", phone: "12+345678" }).isValid).toBe(
      false
    );
    expect(
      validatePayload({ type: "phone", phone: "+0771234567" }).isValid
    ).toBe(false);
    expect(
      validatePayload({ type: "phone", phone: "+1 (415 555-0199" }).isValid
    ).toBe(false);
    expect(
      validatePayload({ type: "phone", phone: "+1234567890123456" }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "sms",
        phone: "+94771234567",
        message: "Test SMS",
      }).isValid
    ).toBe(true);
  });

  it("validates Location payloads (latitude and longitude bounds)", () => {
    expect(
      validatePayload({
        type: "location",
        latitude: 6.9271,
        longitude: 79.8612,
        format: "google-maps",
      }).isValid
    ).toBe(true);

    expect(
      validatePayload({
        type: "location",
        latitude: 95,
        longitude: 79.8612,
        format: "geo",
      }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "location",
        latitude: 6.9271,
        longitude: -190,
        format: "geo",
      }).isValid
    ).toBe(false);
  });

  it("validates WhatsApp payloads (country code, conflicting '+', domestic '0' without country code, and international digits)", () => {
    expect(
      validatePayload({
        type: "whatsapp",
        countryCode: "+94",
        phone: "771234567",
      }).isValid
    ).toBe(true);

    // Subscriber number starting with same digits as countryCode (+91 and 9123456789 = 12 digits total)
    expect(
      validatePayload({
        type: "whatsapp",
        countryCode: "+91",
        phone: "91234 56789",
      }).isValid
    ).toBe(true);

    // Conflicting '+' prefix in phone vs countryCode
    const conflict = validatePayload({
      type: "whatsapp",
      countryCode: "+94",
      phone: "+1 415 555 0199",
    });
    expect(conflict.isValid).toBe(false);
    expect(conflict.errors.phone).toMatch(/conflicts with the Country Code/i);

    // Domestic leading '0' without countryCode
    expect(
      validatePayload({
        type: "whatsapp",
        phone: "0771234567",
      }).isValid
    ).toBe(false);

    // Country code starting with 0 (+0)
    expect(
      validatePayload({
        type: "whatsapp",
        countryCode: "+0",
        phone: "771234567",
      }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "whatsapp",
        countryCode: "+invalid",
        phone: "771234567",
      }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "whatsapp",
        phone: "1234",
      }).isValid
    ).toBe(false);
  });

  it("validates Social Media payloads and rejects incomplete or malformed usernames", () => {
    expect(
      validatePayload({
        type: "social",
        provider: "instagram",
        url: "@openqrstudio",
      }).isValid
    ).toBe(true);

    expect(
      validatePayload({
        type: "social",
        provider: "telegram",
        url: "openqr_studio",
      }).isValid
    ).toBe(true);

    expect(
      validatePayload({
        type: "social",
        provider: "snapchat",
        url: "@",
      }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "social",
        provider: "x",
        url: "a",
      }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "social",
        provider: "facebook",
        url: "not-a-valid/slash-handle",
      }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "social",
        provider: "custom",
        url: "not-a-url",
      }).isValid
    ).toBe(false);
  });

  it("validates Calendar payloads (chronological start/end dates and all-day events)", () => {
    expect(
      validatePayload({
        type: "calendar",
        title: "Team Sync",
        start: "2026-11-10T10:00:00Z",
        end: "2026-11-10T11:00:00Z",
      }).isValid
    ).toBe(true);

    expect(
      validatePayload({
        type: "calendar",
        title: "Annual Summit",
        start: "2026-11-10",
        end: "2026-11-12",
        allDay: true,
      }).isValid
    ).toBe(true);

    // End before start (timed)
    const reversed = validatePayload({
      type: "calendar",
      title: "Team Sync",
      start: "2026-11-10T12:00:00Z",
      end: "2026-11-10T11:00:00Z",
    });
    expect(reversed.isValid).toBe(false);
    expect(reversed.errors.end).toMatch(/earlier than the start/i);

    // End before start (all-day)
    const reversedAllDay = validatePayload({
      type: "calendar",
      title: "Annual Summit",
      start: "2026-11-12",
      end: "2026-11-10",
      allDay: true,
    });
    expect(reversedAllDay.isValid).toBe(false);
    expect(reversedAllDay.errors.end).toMatch(/earlier than the start/i);

    // Non-existent calendar dates (non-leap Feb 29 and April 31)
    expect(
      validatePayload({
        type: "calendar",
        title: "Invalid Feb 29",
        start: "2026-02-29",
        end: "2026-02-29",
        allDay: true,
      }).isValid
    ).toBe(false);

    expect(
      validatePayload({
        type: "calendar",
        title: "Valid Leap Day 2028",
        start: "2028-02-29",
        end: "2028-02-29",
        allDay: true,
      }).isValid
    ).toBe(true);
  });

  it("validates Custom payloads and enforces QR byte capacity limits", () => {
    expect(
      validatePayload({ type: "custom", value: "upi://pay?pa=merchant@upi" })
        .isValid
    ).toBe(true);
    expect(validatePayload({ type: "custom", value: "" }).isValid).toBe(false);
    expect(
      validatePayload({ type: "custom", value: "X".repeat(1300) }, "H").isValid
    ).toBe(false);
  });
});
