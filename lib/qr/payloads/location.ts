import type { LocationPayload } from "@/types/payload";

/**
 * Generates a location QR payload as either an RFC 5870 geo: URI
 * or a universally compatible Google Maps URL.
 */
export function generateLocationPayload(payload: LocationPayload): string {
  if (
    typeof payload.latitude !== "number" ||
    !Number.isFinite(payload.latitude) ||
    typeof payload.longitude !== "number" ||
    !Number.isFinite(payload.longitude)
  ) {
    return "";
  }

  const lat = Number(payload.latitude.toFixed(6));
  const lng = Number(payload.longitude.toFixed(6));

  if (payload.format === "google-maps") {
    if (payload.googleMapsUrl && payload.googleMapsUrl.trim().length > 0) {
      return payload.googleMapsUrl.trim();
    }

    const base = `https://www.google.com/maps?q=${lat},${lng}`;
    return base;
  }

  const label = payload.label?.trim();
  if (label) {
    return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
  }

  return `geo:${lat},${lng}`;
}
