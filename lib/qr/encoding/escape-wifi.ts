/**
 * Escapes reserved characters in Wi-Fi QR code fields (SSID and password)
 * according to the ZXing / WPA Wi-Fi QR specification:
 * - Backslash (\) -> \\
 * - Semicolon (;) -> \;
 * - Comma (,) -> \,
 * - Colon (:) -> \:
 * - Double quote (") -> \"
 */
export function escapeWiFiValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:")
    .replace(/"/g, '\\"');
}
