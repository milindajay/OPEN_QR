import type { SocialPayload, SocialProvider } from "@/types/payload";

const SOCIAL_BASE_URLS: Record<Exclude<SocialProvider, "custom">, string> = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  linkedin: "https://www.linkedin.com/in/",
  youtube: "https://www.youtube.com/@",
  x: "https://x.com/",
  pinterest: "https://www.pinterest.com/",
  snapchat: "https://www.snapchat.com/add/",
  telegram: "https://t.me/",
};

/**
 * Generates a social profile URL payload. Accepts either a full HTTP(S) profile URL
 * or a handle/username for the selected provider.
 */
export function generateSocialPayload(payload: SocialPayload): string {
  const raw = payload.url.trim();

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (payload.provider === "custom") {
    return raw;
  }

  const handle = raw.replace(/^@+/, "").replace(/^\/+/, "");
  const baseUrl = SOCIAL_BASE_URLS[payload.provider];
  return `${baseUrl}${encodeURIComponent(handle)}`;
}
