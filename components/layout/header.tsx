"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { cn } from "@/lib/utils/cn";

const MAIN_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create QR" },
  { href: "/documentation", label: "Documentation" },
  { href: "/about", label: "About Us" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            aria-label={`${APP_CONFIG.name} Home`}
            className="flex shrink-0 items-center text-lg font-semibold tracking-tight text-foreground"
          >
            <BrandLogo markSize={32} />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {MAIN_NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 whitespace-nowrap text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="GitHub repository"
          >
            <a
              href={APP_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <ThemeToggle />
          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <Link href="/create">Create QR Code</Link>
          </Button>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
