import type { UrlPayload } from "@/types/payload";

/**
 * Generates a URL QR payload without modifying query parameters or shortening links.
 */
export function generateUrlPayload(payload: UrlPayload): string {
  return payload.url.trim();
}
