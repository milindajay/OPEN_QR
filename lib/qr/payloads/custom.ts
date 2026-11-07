import type { CustomPayload } from "@/types/payload";

/**
 * Returns the user's raw custom payload string without automatic modification,
 * preserving line breaks, whitespace, and arbitrary URI schemes.
 */
export function generateCustomPayload(payload: CustomPayload): string {
  return payload.value;
}
