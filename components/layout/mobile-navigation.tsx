"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create QR" },
  { href: "/documentation", label: "Documentation" },
  { href: "/about", label: "About Us" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function MobileNavigation() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-background p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-3">
            <BrandLogo markSize={24} className="text-sm" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              v{APP_CONFIG.version}
            </span>
          </div>
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href={APP_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>
            <div className="pt-2">
              <Button asChild variant="accent" className="w-full">
                <Link href="/create" onClick={() => setOpen(false)}>
                  Create QR Code
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
