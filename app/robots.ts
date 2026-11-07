import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/lib/constants/app-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(APP_CONFIG.siteUrl
      ? { sitemap: `${APP_CONFIG.siteUrl}/sitemap.xml` }
      : {}),
  };
}
