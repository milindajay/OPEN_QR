import type { WiFiPayload } from "@/types/payload";
import { escapeWiFiValue } from "@/lib/qr/encoding/escape-wifi";

/**
 * Generates a standard Wi-Fi network configuration QR payload:
 * WIFI:T:WPA;S:NetworkName;P:Password;H:false;;
 */
export function generateWiFiPayload(payload: WiFiPayload): string {
  const ssid = escapeWiFiValue(payload.ssid.trim());
  const security = payload.security;
  const hidden = payload.hidden ? "true" : "false";

  const parts: string[] = [`T:${security}`, `S:${ssid}`];

  if (security !== "nopass" && payload.password && payload.password.length > 0) {
    parts.push(`P:${escapeWiFiValue(payload.password)}`);
  }

  parts.push(`H:${hidden}`);

  return `WIFI:${parts.join(";")};;`;
}
