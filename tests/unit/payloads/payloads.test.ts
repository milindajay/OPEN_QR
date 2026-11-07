import { describe, expect, it } from "vitest";
import { generatePayload } from "@/lib/qr/payloads";

describe("QR Payload Generators (All 12 Types)", () => {
  it("1. generates URL payloads preserving query parameters without shortening", () => {
    const output = generatePayload({
      type: "url",
      url: "  https://openqr.studio/create?utm_source=github&ref=v1#studio  ",
    });
    expect(output).toBe(
      "https://openqr.studio/create?utm_source=github&ref=v1#studio"
    );
  });

  it("2. generates Plain Text payloads with multilingual Unicode and normalized newlines", () => {
    const output = generatePayload({
      type: "text",
      text: "Hello\r\nආයුබෝවන්\nவணக்கம்\nこんにちは\nمرحبا 🚀",
    });
    expect(output).toBe("Hello\nආයුබෝවන්\nவணக்கம்\nこんにちは\nمرحبا 🚀");
  });

  it("3. generates standards-compliant vCard 3.0 payloads with CRLF and escaped fields", () => {
    const output = generatePayload({
      type: "vcard",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      organization: "Example, Inc.; Labs",
      jobTitle: "Lead Architect",
      mobile: "+1234567890",
      email: "john@example.com",
      website: "https://example.com",
      street: "123 Main St, Suite 4",
      city: "Colombo",
      region: "Western",
      postalCode: "00100",
      country: "Sri Lanka",
      note: "Line 1\nLine 2",
    });

    expect(output).toContain("BEGIN:VCARD\r\nVERSION:3.0\r\n");
    expect(output).toContain("N:Doe;John;;;\r\n");
    expect(output).toContain("FN:John Doe\r\n");
    expect(output).toContain("ORG:Example\\, Inc.\\; Labs\r\n");
    expect(output).toContain("TITLE:Lead Architect\r\n");
    expect(output).toContain("TEL;TYPE=CELL:+1234567890\r\n");
    expect(output).toContain("EMAIL:john@example.com\r\n");
    expect(output).toContain("URL:https://example.com\r\n");
    expect(output).toContain(
      "ADR;TYPE=WORK:;;123 Main St\\, Suite 4;Colombo;Western;00100;Sri Lanka\r\n"
    );
    expect(output).toContain("NOTE:Line 1\\nLine 2\r\n");
    expect(output.endsWith("END:VCARD")).toBe(true);
  });

  it("4. generates Wi-Fi payloads for WPA, WEP, and open (nopass) networks with escaping", () => {
    const wpa = generatePayload({
      type: "wifi",
      ssid: "Office;Net:5G",
      password: "My:Secret;Pass,123",
      security: "WPA",
      hidden: true,
    });
    expect(wpa).toBe(
      "WIFI:T:WPA;S:Office\\;Net\\:5G;P:My\\:Secret\\;Pass\\,123;H:true;;"
    );

    const openNet = generatePayload({
      type: "wifi",
      ssid: "Guest_WiFi",
      security: "nopass",
      hidden: false,
    });
    expect(openNet).toBe("WIFI:T:nopass;S:Guest_WiFi;H:false;;");
  });

  it("5. generates Email mailto: payloads with percent-encoded subject and body", () => {
    const email = generatePayload({
      type: "email",
      email: "hello@example.com",
      subject: "Hello & Welcome",
      message: "Example message\nSecond line",
    });
    expect(email).toBe(
      "mailto:hello@example.com?subject=Hello%20%26%20Welcome&body=Example%20message%0ASecond%20line"
    );

    const simpleEmail = generatePayload({
      type: "email",
      email: "contact@openqr.studio",
    });
    expect(simpleEmail).toBe("mailto:contact@openqr.studio");
  });

  it("6. generates Phone tel: payloads preserving international '+' prefix", () => {
    const phone = generatePayload({
      type: "phone",
      phone: "+94 (77) 123-4567",
    });
    expect(phone).toBe("tel:+94771234567");
  });

  it("7. generates SMS payloads with optional encoded message body", () => {
    const sms = generatePayload({
      type: "sms",
      phone: "+1 415-555-0199",
      message: "Hello there! 100% free?",
    });
    expect(sms).toBe("sms:+14155550199?body=Hello%20there!%20100%25%20free%3F");

    const smsNoBody = generatePayload({
      type: "sms",
      phone: "+14155550199",
    });
    expect(smsNoBody).toBe("sms:+14155550199");
  });

  it("8. generates Location payloads in both geo: URI and Google Maps URL formats", () => {
    const geo = generatePayload({
      type: "location",
      latitude: 6.927079,
      longitude: 79.861244,
      format: "geo",
    });
    expect(geo).toBe("geo:6.927079,79.861244");

    const geoLabeled = generatePayload({
      type: "location",
      latitude: 6.9271,
      longitude: 79.8612,
      label: "Colombo Fort",
      format: "geo",
    });
    expect(geoLabeled).toBe(
      "geo:6.9271,79.8612?q=6.9271,79.8612(Colombo%20Fort)"
    );

    const gmaps = generatePayload({
      type: "location",
      latitude: 6.9271,
      longitude: 79.8612,
      format: "google-maps",
    });
    expect(gmaps).toBe("https://www.google.com/maps?q=6.9271,79.8612");
  });

  it("9. generates WhatsApp wa.me links stripping punctuation/leading zeros while preserving country code when subscriber number starts with same digits", () => {
    const wa = generatePayload({
      type: "whatsapp",
      countryCode: "+94",
      phone: "077 123 4567",
      message: "Hi from OpenQR Studio!",
    });
    expect(wa).toBe(
      "https://wa.me/94771234567?text=Hi%20from%20OpenQR%20Studio!"
    );

    // India (+91) with subscriber number starting with '91' -> must NOT drop country code '91'
    const waIndia = generatePayload({
      type: "whatsapp",
      countryCode: "+91",
      phone: "91234 56789",
    });
    expect(waIndia).toBe("https://wa.me/919123456789");

    // Kazakhstan/Russia (+7) with subscriber number starting with '7' -> must NOT drop country code '7'
    const waKazakh = generatePayload({
      type: "whatsapp",
      countryCode: "+7",
      phone: "701 234 5678",
    });
    expect(waKazakh).toBe("https://wa.me/77012345678");

    // Duplicate explicit '+94' in both countryCode and phone -> does not double-prepend '94'
    const waExplicit = generatePayload({
      type: "whatsapp",
      countryCode: "+94",
      phone: "+94 77 123 4567",
    });
    expect(waExplicit).toBe("https://wa.me/94771234567");
  });

  it("10. generates Social Media URLs from handles or full URLs across all 9 platforms", () => {
    expect(
      generatePayload({
        type: "social",
        provider: "x",
        url: "@openqrstudio",
      })
    ).toBe("https://x.com/openqrstudio");

    expect(
      generatePayload({
        type: "social",
        provider: "youtube",
        url: "openqrstudio",
      })
    ).toBe("https://www.youtube.com/@openqrstudio");

    expect(
      generatePayload({
        type: "social",
        provider: "tiktok",
        url: "@openqrstudio",
      })
    ).toBe("https://www.tiktok.com/@openqrstudio");

    expect(
      generatePayload({
        type: "social",
        provider: "snapchat",
        url: "openqrstudio",
      })
    ).toBe("https://www.snapchat.com/add/openqrstudio");

    expect(
      generatePayload({
        type: "social",
        provider: "telegram",
        url: "@openqrstudio",
      })
    ).toBe("https://t.me/openqrstudio");

    expect(
      generatePayload({
        type: "social",
        provider: "linkedin",
        url: "https://www.linkedin.com/company/openqr",
      })
    ).toBe("https://www.linkedin.com/company/openqr");
  });

  it("11. generates Calendar VCALENDAR/VEVENT payloads with UTC timestamps, all-day VALUE=DATE, and escaping", () => {
    const ical = generatePayload({
      type: "calendar",
      title: "Product Launch; OpenQR v1.0",
      start: "2026-11-10T09:00:00.000Z",
      end: "2026-11-10T10:30:00.000Z",
      location: "Hall A, Colombo",
      description: "Live demo\nQ&A session",
      url: "https://openqr.studio",
    });

    expect(ical).toContain("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n");
    expect(ical).toContain("BEGIN:VEVENT\r\n");
    expect(ical).toContain("DTSTART:20261110T090000Z\r\n");
    expect(ical).toContain("DTEND:20261110T103000Z\r\n");
    expect(ical).toContain("SUMMARY:Product Launch\\; OpenQR v1.0\r\n");
    expect(ical).toContain("LOCATION:Hall A\\, Colombo\r\n");
    expect(ical).toContain("DESCRIPTION:Live demo\\nQ&A session\r\n");
    expect(ical).toContain("URL:https://openqr.studio\r\n");
    expect(ical.endsWith("END:VEVENT\r\nEND:VCALENDAR")).toBe(true);

    // 1-day all-day event (2026-11-20 inclusive -> DTEND:20261121 exclusive)
    const oneDayIcal = generatePayload({
      type: "calendar",
      title: "One Day Workshop",
      start: "2026-11-20",
      end: "2026-11-20",
      allDay: true,
    });
    expect(oneDayIcal).toContain("DTSTART;VALUE=DATE:20261120\r\n");
    expect(oneDayIcal).toContain("DTEND;VALUE=DATE:20261121\r\n");

    // 2-day all-day event (2026-11-15 to 2026-11-16 inclusive -> DTEND:20261117 exclusive)
    const twoDayIcal = generatePayload({
      type: "calendar",
      title: "Company Offsite",
      start: "2026-11-15",
      end: "2026-11-16",
      allDay: true,
    });
    expect(twoDayIcal).toContain("DTSTART;VALUE=DATE:20261115\r\n");
    expect(twoDayIcal).toContain("DTEND;VALUE=DATE:20261117\r\n");

    // Month-end all-day event (2026-01-31 inclusive -> DTEND:20260201 exclusive)
    const monthEndIcal = generatePayload({
      type: "calendar",
      title: "Month End Review",
      start: "2026-01-31",
      end: "2026-01-31",
      allDay: true,
    });
    expect(monthEndIcal).toContain("DTSTART;VALUE=DATE:20260131\r\n");
    expect(monthEndIcal).toContain("DTEND;VALUE=DATE:20260201\r\n");

    // Year-end all-day event (2026-12-31 inclusive -> DTEND:20270101 exclusive)
    const yearEndIcal = generatePayload({
      type: "calendar",
      title: "New Year Eve Celebration",
      start: "2026-12-31",
      end: "2026-12-31",
      allDay: true,
    });
    expect(yearEndIcal).toContain("DTSTART;VALUE=DATE:20261231\r\n");
    expect(yearEndIcal).toContain("DTEND;VALUE=DATE:20270101\r\n");

    // Leap-day all-day event (2028-02-29 inclusive -> DTEND:20280301 exclusive)
    const leapDayIcal = generatePayload({
      type: "calendar",
      title: "Leap Year Summit",
      start: "2028-02-29",
      end: "2028-02-29",
      allDay: true,
    });
    expect(leapDayIcal).toContain("DTSTART;VALUE=DATE:20280229\r\n");
    expect(leapDayIcal).toContain("DTEND;VALUE=DATE:20280301\r\n");
  });

  it("12. preserves Custom payloads verbatim without modification", () => {
    const raw = "nostr:npub1example0123456789\n  preserve-leading-spaces  ";
    expect(
      generatePayload({
        type: "custom",
        value: raw,
      })
    ).toBe(raw);
  });
});
