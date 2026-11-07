import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/lib/constants/app-config";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!APP_CONFIG.siteUrl) {
    return [];
  }

  const routes = ["", "/create", "/about", "/privacy", "/documentation"];
  const lastModified = new Date("2026-11-07T00:00:00.000Z");

  return routes.map((route) => ({
    url: `${APP_CONFIG.siteUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
