import type { SocialProvider } from "@/types/payload";

export interface SocialPlatformMetadata {
  id: SocialProvider;
  label: string;
  baseUrl: string;
  inputLabel: string;
  placeholder: string;
  helperText: string;
}

export const SOCIAL_PLATFORMS: readonly SocialPlatformMetadata[] = [
  {
    id: "facebook",
    label: "Facebook",
    baseUrl: "https://www.facebook.com/",
    inputLabel: "Facebook Username or Profile URL",
    placeholder: "openqrstudio or https://www.facebook.com/openqrstudio",
    helperText: "Enter a Facebook page/profile username or full https:// URL.",
  },
  {
    id: "instagram",
    label: "Instagram",
    baseUrl: "https://www.instagram.com/",
    inputLabel: "Instagram Handle or Profile URL",
    placeholder: "@openqrstudio or https://www.instagram.com/openqrstudio",
    helperText: "Enter an Instagram @handle or full https:// profile URL.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    baseUrl: "https://www.tiktok.com/@",
    inputLabel: "TikTok Handle or Profile URL",
    placeholder: "@openqrstudio or https://www.tiktok.com/@openqrstudio",
    helperText: "Enter a TikTok @username or full https:// profile URL.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    baseUrl: "https://www.linkedin.com/in/",
    inputLabel: "LinkedIn Profile Slug or Full URL",
    placeholder: "jane-doe or https://www.linkedin.com/company/openqr",
    helperText:
      "Enter a personal /in/ handle or paste a full LinkedIn company/profile URL.",
  },
  {
    id: "youtube",
    label: "YouTube",
    baseUrl: "https://www.youtube.com/@",
    inputLabel: "YouTube Channel Handle or URL",
    placeholder: "@openqrstudio or https://www.youtube.com/@openqrstudio",
    helperText: "Enter a YouTube @channel handle or full https:// channel URL.",
  },
  {
    id: "x",
    label: "X (Twitter)",
    baseUrl: "https://x.com/",
    inputLabel: "X Handle or Profile URL",
    placeholder: "@openqrstudio or https://x.com/openqrstudio",
    helperText: "Enter an X @username or full https://x.com/ profile link.",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    baseUrl: "https://www.pinterest.com/",
    inputLabel: "Pinterest Username or Profile URL",
    placeholder: "openqrstudio or https://www.pinterest.com/openqrstudio",
    helperText: "Enter a Pinterest username or full https:// profile URL.",
  },
  {
    id: "snapchat",
    label: "Snapchat",
    baseUrl: "https://www.snapchat.com/add/",
    inputLabel: "Snapchat Username or Add URL",
    placeholder: "openqrstudio or https://www.snapchat.com/add/openqrstudio",
    helperText: "Enter a Snapchat username or full https:// profile URL.",
  },
  {
    id: "telegram",
    label: "Telegram",
    baseUrl: "https://t.me/",
    inputLabel: "Telegram Username or Channel URL",
    placeholder: "@openqrstudio or https://t.me/openqrstudio",
    helperText: "Enter a Telegram @username, channel handle, or https://t.me/ link.",
  },
  {
    id: "custom",
    label: "Custom URL",
    baseUrl: "",
    inputLabel: "Full Social Profile URL",
    placeholder: "https://mastodon.social/@openqrstudio",
    helperText: "Enter a complete https:// or http:// profile link for any platform.",
  },
] as const;

export function getSocialPlatformMetadata(
  provider: SocialProvider
): SocialPlatformMetadata {
  const match = SOCIAL_PLATFORMS.find((item) => item.id === provider);
  return match ?? SOCIAL_PLATFORMS[0]!;
}
