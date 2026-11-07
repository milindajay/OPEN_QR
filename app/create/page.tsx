import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { QRWorkspace } from "@/components/generator/qr-workspace";
import { APP_CONFIG } from "@/lib/constants/app-config";

export const metadata: Metadata = {
  title: "QR Design Studio",
  description:
    "Create, customize, and export studio-grade static QR codes directly in your browser.",
  ...(APP_CONFIG.siteUrl
    ? {
        alternates: {
          canonical: `${APP_CONFIG.siteUrl}/create`,
        },
      }
    : {}),
  openGraph: {
    title: `QR Design Studio | ${APP_CONFIG.name}`,
    description:
      "Create, customize, and export studio-grade static QR codes directly in your browser.",
    ...(APP_CONFIG.siteUrl ? { url: `${APP_CONFIG.siteUrl}/create` } : {}),
    siteName: APP_CONFIG.name,
    type: "website",
  },
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-3 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            QR Design Studio
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Customize patterns, gradients, finder corners, and brand logos in real time.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>Client-Side Processing • No Account Required</span>
        </div>
      </div>

      <QRWorkspace />
    </div>
  );
}
