import { describe, expect, it } from "vitest";
import {
  encodeUtf8ToBinaryString,
  foldUtf8Line,
  getCharacterCount,
  getUtf8ByteLength,
  normalizeNewlines,
} from "@/lib/qr/encoding/utf8";
import {
  escapeVCardValue,
  foldVCardLine,
  joinVCardComponents,
} from "@/lib/qr/encoding/escape-vcard";
import { escapeWiFiValue } from "@/lib/qr/encoding/escape-wifi";
import {
  addOneCalendarDay,
  escapeICalValue,
  foldICalLine,
  formatICalDateTime,
  isValidIsoCalendarDate,
} from "@/lib/qr/encoding/escape-ical";

describe("UTF-8 and Multilingual Encoding Utilities", () => {
  it("computes accurate UTF-8 byte lengths across multilingual scripts and emoji", () => {
    expect(getUtf8ByteLength("Hello")).toBe(5);
    // Sinhala: ආයුබෝවන් (8 code points, 3 bytes each = 24 bytes)
    expect(getUtf8ByteLength("ආයුබෝවන්")).toBe(24);
    // Tamil: வணக்கம் (7 code points, 3 bytes each = 21 bytes)
    expect(getUtf8ByteLength("வணக்கம்")).toBe(21);
    // Japanese: こんにちは (5 code points, 3 bytes each = 15 bytes)
    expect(getUtf8ByteLength("こんにちは")).toBe(15);
    // Arabic: مرحبا (5 code points, 2 bytes each = 10 bytes)
    expect(getUtf8ByteLength("مرحبا")).toBe(10);
    // Emoji: 🚀 (1 code point, 2 UTF-16 code units, 4 UTF-8 bytes)
    expect(getUtf8ByteLength("🚀")).toBe(4);
    expect(getCharacterCount("🚀")).toBe(1);
  });

  it("round-trips UTF-8 binary strings back to exact original Unicode strings", () => {
    const multilingual =
      "English | ආයුබෝවන් | வணக்கம் | こんにちは | مرحبا | 🚀✨🔒";
    const binaryStr = encodeUtf8ToBinaryString(multilingual);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    expect(decoded).toBe(multilingual);
  });

  it("normalizes CRLF and CR line endings to LF", () => {
    expect(normalizeNewlines("line1\r\nline2\rline3\nline4")).toBe(
      "line1\nline2\nline3\nline4"
    );
  });

  it("folds long UTF-8 lines at 75 octets without corrupting multi-byte characters", () => {
    const longMultilingual = "NOTE:" + "ආයුබෝවන්".repeat(6); // > 75 UTF-8 bytes
    const folded = foldUtf8Line(longMultilingual, 75);
    const physicalLines = folded.split("\r\n");

    expect(physicalLines.length).toBeGreaterThan(1);
    for (const line of physicalLines) {
      expect(getUtf8ByteLength(line)).toBeLessThanOrEqual(75);
    }

    // Unfolding per RFC 2426 / RFC 5545 must restore the exact string
    const unfolded = folded.replace(/\r\n /g, "");
    expect(unfolded).toBe(longMultilingual);
  });
});

describe("vCard 3.0 Escaping Utilities", () => {
  it("escapes backslashes, semicolons, commas, and newlines", () => {
    const raw = "Acorn, Inc.; R&D\\Lab\r\nFloor 2\nSuite 4";
    expect(escapeVCardValue(raw)).toBe(
      "Acorn\\, Inc.\\; R&D\\\\Lab\\nFloor 2\\nSuite 4"
    );
  });

  it("joins structured vCard components while escaping internal delimiters", () => {
    const joined = joinVCardComponents(["Doe, Jr.", "John;Paul", undefined, ""]);
    expect(joined).toBe("Doe\\, Jr.;John\\;Paul;;");
  });

  it("leaves short vCard lines unfolded", () => {
    expect(foldVCardLine("FN:John Doe")).toBe("FN:John Doe");
  });
});

describe("Wi-Fi Escaping Utilities", () => {
  it("escapes semicolons, commas, colons, backslashes, and double quotes", () => {
    const raw = 'My;Net,Name:With\\Special"Chars';
    expect(escapeWiFiValue(raw)).toBe(
      'My\\;Net\\,Name\\:With\\\\Special\\"Chars'
    );
  });
});

describe("iCalendar (RFC 5545) Escaping & Date Utilities", () => {
  it("escapes backslashes, semicolons, commas, and newlines", () => {
    const raw = "Board Meeting; Room A, Building 1\\2\nBring notes";
    expect(escapeICalValue(raw)).toBe(
      "Board Meeting\\; Room A\\, Building 1\\\\2\\nBring notes"
    );
  });

  it("formats ISO 8601 dates to UTC iCalendar timestamps", () => {
    expect(formatICalDateTime("2026-11-06T18:30:00.000Z")).toBe(
      "20261106T183000Z"
    );
    expect(formatICalDateTime("20261106T183000Z")).toBe("20261106T183000Z");
    expect(formatICalDateTime("2026-11-06")).toBe("20261106");
  });

  it("throws an explicit error for invalid calendar dates including non-leap Feb 29 and April 31", () => {
    expect(() => formatICalDateTime("not-a-date")).toThrow(
      /Invalid calendar date\/time/
    );
    expect(() => formatICalDateTime("2026-02-29")).toThrow(
      /Invalid calendar date\/time/
    );
    expect(() => formatICalDateTime("2026-04-31T10:00:00Z")).toThrow(
      /Invalid calendar date\/time/
    );
    expect(isValidIsoCalendarDate("2026-02-29")).toBe(false);
    expect(isValidIsoCalendarDate("2028-02-29")).toBe(true);
    expect(isValidIsoCalendarDate("2026-04-31")).toBe(false);
  });

  it("advances inclusive calendar dates by 1 day across month, year, and leap-year boundaries", () => {
    expect(addOneCalendarDay("2026-11-20")).toBe("2026-11-21");
    expect(addOneCalendarDay("2026-01-31")).toBe("2026-02-01");
    expect(addOneCalendarDay("2026-02-28")).toBe("2026-03-01");
    expect(addOneCalendarDay("2028-02-28")).toBe("2028-02-29");
    expect(addOneCalendarDay("2028-02-29")).toBe("2028-03-01");
    expect(addOneCalendarDay("2026-12-31")).toBe("2027-01-01");
  });

  it("folds long iCalendar lines safely", () => {
    const line = "DESCRIPTION:" + "A".repeat(100);
    const folded = foldICalLine(line, 75);
    expect(folded).toContain("\r\n ");
    expect(folded.replace(/\r\n /g, "")).toBe(line);
  });
});
