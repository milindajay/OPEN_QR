import { foldUtf8Line, normalizeNewlines } from "@/lib/qr/encoding/utf8";

/**
 * Escapes a single iCalendar (RFC 5545) TEXT property value:
 * - Backslashes (\) -> \\
 * - Semicolons (;) -> \;
 * - Commas (,) -> \,
 * - Line breaks (\r\n, \r, \n) -> \n
 */
export function escapeICalValue(value: string): string {
  const normalized = normalizeNewlines(value);
  return normalized
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Strictly validates that a YYYY-MM-DD string represents a real Gregorian calendar date
 * (rejecting overflow dates such as 2026-02-29 on a non-leap year or 2026-04-31).
 */
export function isValidIsoCalendarDate(dateStr: string): boolean {
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = trimmed.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
}

/**
 * Advances a validated YYYY-MM-DD date string by exactly 1 calendar day in UTC,
 * converting an inclusive all-day end date into an RFC 5545 exclusive DTEND date.
 */
export function addOneCalendarDay(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (!isValidIsoCalendarDate(trimmed)) {
    throw new Error(`Invalid calendar date: "${dateStr}"`);
  }

  const [yearStr, monthStr, dayStr] = trimmed.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const nextUtc = new Date(Date.UTC(year, month - 1, day + 1));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${nextUtc.getUTCFullYear()}-${pad(nextUtc.getUTCMonth() + 1)}-${pad(
    nextUtc.getUTCDate()
  )}`;
}

/**
 * Formats an ISO 8601 date/time string or pre-formatted iCal date string
 * into an RFC 5545 UTC timestamp (YYYYMMDDTHHMMSSZ) or date value (YYYYMMDD).
 */
export function formatICalDateTime(input: string): string {
  const trimmed = input.trim();

  // Already in valid iCal UTC or local format (e.g., 20261106T180000Z or 20261106T180000)
  if (/^\d{8}T\d{6}Z?$/.test(trimmed)) {
    const formattedDate = `${trimmed.slice(0, 4)}-${trimmed.slice(
      4,
      6
    )}-${trimmed.slice(6, 8)}`;
    if (!isValidIsoCalendarDate(formattedDate)) {
      throw new Error(`Invalid calendar date/time: "${input}"`);
    }
    return trimmed;
  }

  // Date-only YYYY-MM-DD -> YYYYMMDD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    if (!isValidIsoCalendarDate(trimmed)) {
      throw new Error(`Invalid calendar date/time: "${input}"`);
    }
    return trimmed.replace(/-/g, "");
  }

  // If ISO string starts with YYYY-MM-DD, verify that the calendar date itself does not overflow
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    if (!isValidIsoCalendarDate(trimmed.slice(0, 10))) {
      throw new Error(`Invalid calendar date/time: "${input}"`);
    }
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid calendar date/time: "${input}"`);
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = parsed.getUTCFullYear();
  const month = pad(parsed.getUTCMonth() + 1);
  const day = pad(parsed.getUTCDate());
  const hours = pad(parsed.getUTCHours());
  const minutes = pad(parsed.getUTCMinutes());
  const seconds = pad(parsed.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Folds an iCalendar line at 75 UTF-8 octets per RFC 5545.
 */
export function foldICalLine(line: string, maxOctets = 75): string {
  return foldUtf8Line(line, maxOctets);
}
