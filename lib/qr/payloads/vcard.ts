import type { VCardPayload } from "@/types/payload";
import {
  escapeVCardValue,
  foldVCardLine,
  joinVCardComponents,
} from "@/lib/qr/encoding/escape-vcard";

/**
 * Generates a standards-compliant vCard 3.0 payload using CRLF line endings,
 * RFC 2426 special-character escaping, and 75-octet UTF-8 line folding.
 */
export function generateVCardPayload(payload: VCardPayload): string {
  const firstName = payload.firstName?.trim() ?? "";
  const lastName = payload.lastName?.trim() ?? "";
  const computedFullName =
    payload.fullName.trim() || [firstName, lastName].filter(Boolean).join(" ");

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${joinVCardComponents([lastName, firstName, "", "", ""])}`,
    `FN:${escapeVCardValue(computedFullName)}`,
  ];

  if (payload.organization?.trim()) {
    lines.push(`ORG:${escapeVCardValue(payload.organization.trim())}`);
  }

  if (payload.jobTitle?.trim()) {
    lines.push(`TITLE:${escapeVCardValue(payload.jobTitle.trim())}`);
  }

  if (payload.mobile?.trim()) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(payload.mobile.trim())}`);
  }

  if (payload.phone?.trim()) {
    lines.push(
      `TEL;TYPE=${payload.mobile?.trim() ? "WORK,VOICE" : "CELL"}:${escapeVCardValue(
        payload.phone.trim()
      )}`
    );
  }

  if (payload.email?.trim()) {
    lines.push(`EMAIL:${escapeVCardValue(payload.email.trim())}`);
  }

  if (payload.website?.trim()) {
    lines.push(`URL:${escapeVCardValue(payload.website.trim())}`);
  }

  const hasAddress = [
    payload.street,
    payload.city,
    payload.region,
    payload.postalCode,
    payload.country,
  ].some((part) => Boolean(part?.trim()));

  if (hasAddress) {
    const adrValue = joinVCardComponents([
      "",
      "",
      payload.street,
      payload.city,
      payload.region,
      payload.postalCode,
      payload.country,
    ]);
    lines.push(`ADR;TYPE=WORK:${adrValue}`);
  }

  if (payload.note?.trim()) {
    lines.push(`NOTE:${escapeVCardValue(payload.note.trim())}`);
  }

  lines.push("END:VCARD");

  return lines.map((line) => foldVCardLine(line, 75)).join("\r\n");
}
