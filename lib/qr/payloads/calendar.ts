import type { CalendarPayload } from "@/types/payload";
import {
  addOneCalendarDay,
  escapeICalValue,
  foldICalLine,
  formatICalDateTime,
} from "@/lib/qr/encoding/escape-ical";

/**
 * Generates an RFC 5545 iCalendar VCALENDAR/VEVENT payload with CRLF line endings
 * and 75-octet UTF-8 line folding.
 *
 * For all-day events (`allDay: true`), the user-supplied `end` date is treated as
 * inclusive and converted to the following calendar day (`+1 day`) because RFC 5545
 * specifies that `DTEND;VALUE=DATE` is the non-inclusive end of the event.
 */
export function generateCalendarPayload(payload: CalendarPayload): string {
  const isAllDay = Boolean(payload.allDay);
  const startRaw = isAllDay
    ? payload.start.trim().slice(0, 10)
    : payload.start.trim();
  const endRaw = isAllDay
    ? addOneCalendarDay(payload.end.trim().slice(0, 10))
    : payload.end.trim();

  const dtStart = formatICalDateTime(startRaw);
  const dtEnd = formatICalDateTime(endRaw);
  const summary = escapeICalValue(payload.title.trim());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpenQR Studio//NONSGML v1.0//EN",
    "BEGIN:VEVENT",
    isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
  ];

  if (payload.location?.trim()) {
    lines.push(`LOCATION:${escapeICalValue(payload.location.trim())}`);
  }

  if (payload.description?.trim()) {
    lines.push(`DESCRIPTION:${escapeICalValue(payload.description.trim())}`);
  }

  if (payload.url?.trim()) {
    lines.push(`URL:${escapeICalValue(payload.url.trim())}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map((line) => foldICalLine(line, 75)).join("\r\n");
}
