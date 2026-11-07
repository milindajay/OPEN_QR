import { foldUtf8Line, normalizeNewlines } from "@/lib/qr/encoding/utf8";

/**
 * Escapes a single vCard 3.0 property value according to RFC 2426:
 * - Backslashes (\) -> \\
 * - Semicolons (;) -> \;
 * - Commas (,) -> \,
 * - Line breaks (\r\n, \r, \n) -> \n
 */
export function escapeVCardValue(value: string): string {
  const normalized = normalizeNewlines(value);
  return normalized
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Joins structured vCard components (such as N or ADR) by escaping each
 * component individually and joining with unescaped semicolons.
 */
export function joinVCardComponents(
  components: ReadonlyArray<string | undefined>
): string {
  return components.map((part) => escapeVCardValue((part ?? "").trim())).join(";");
}

/**
 * Folds a vCard 3.0 line to a maximum of 75 UTF-8 octets per RFC 2426.
 */
export function foldVCardLine(line: string, maxOctets = 75): string {
  return foldUtf8Line(line, maxOctets);
}
