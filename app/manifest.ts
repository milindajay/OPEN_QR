import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/lib/constants/app-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.name,
    short_name: "OpenQR",
    description: APP_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    icons: [
      {
        src: "/logo/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
