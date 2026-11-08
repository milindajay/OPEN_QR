import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { APP_CONFIG } from "@/lib/constants/app-config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <Link
              href="/"
              aria-label={`${APP_CONFIG.name} Home`}
              className="inline-flex items-center text-base font-semibold text-foreground"
            >
              <BrandLogo markSize={28} />
            </Link>
            <p className="max-w-md text-sm text-muted-foreground">
              {APP_CONFIG.description}
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span>Client-Side QR Generation • No Account Required • MIT Licensed</span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Product & Guides</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-foreground">
                  QR Design Studio
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Privacy & Open Source
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href={APP_CONFIG.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Released under the {APP_CONFIG.license} License. {APP_CONFIG.name} is
            an independent open-source project and is not affiliated with Adobe
            or other commercial QR generator brands.
          </p>
        </div>
      </div>
    </footer>
  );
}
