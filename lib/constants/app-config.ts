const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(
  /\/+$/,
  ""
);

export const APP_CONFIG = {
  name: "OpenQR Studio",
  tagline: "Create Beautiful QR Codes. Completely Free.",
  description:
    "Generate, customize, and export static QR codes for links, contacts, Wi-Fi, calendar events, and more directly in your browser. Free and open source.",
  license: "MIT",
  siteUrl: configuredSiteUrl || undefined,
  githubUrl: "https://github.com/milindajay/OPEN_QR",
  lastUpdated: "November 7, 2026",
  defaultDimensions: {
    width: 1024,
    height: 1024,
    previewSize: 320,
    minMargin: 4,
    defaultMargin: 4,
  },
  limits: {
    maxLogoFileSizeBytes: 2 * 1024 * 1024, // 2 MB
    maxLogoSizeRatio: 0.3,
    defaultLogoSizeRatio: 0.22,
  },
} as const;
