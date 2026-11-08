import * as React from "react";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { cn } from "@/lib/utils/cn";

export interface BrandMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * Geometric QR-inspired OpenQR Studio symbol mark.
 * Aligned to a 64x64 grid (4-unit module steps) for crisp rendering from 16px up to 512px.
 */
export function BrandMark({
  size = 32,
  className,
  ...props
}: BrandMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-testid="brand-mark-svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#0F172A" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="12"
        stroke="#1E293B"
        strokeWidth="2"
      />
      <path
        d="M12 8H24C26.2091 8 28 9.79086 28 12V24C28 26.2091 26.2091 28 24 28H12C9.79086 28 8 26.2091 8 24V12C8 9.79086 9.79086 8 12 8ZM12 12V24H24V12H12Z"
        fill="#FAFAFA"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <rect x="14" y="14" width="8" height="8" rx="2" fill="#3B82F6" />
      <path
        d="M40 8H52C54.2091 8 56 9.79086 56 12V24C56 26.2091 54.2091 28 52 28H40C37.7909 28 36 26.2091 36 24V12C36 9.79086 37.7909 8 40 8ZM40 12V24H52V12H40Z"
        fill="#FAFAFA"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <rect x="42" y="14" width="8" height="8" rx="2" fill="#FAFAFA" />
      <path
        d="M12 36H24C26.2091 36 28 37.7909 28 40V52C28 54.2091 26.2091 56 24 56H12C9.79086 56 8 54.2091 8 52V40C8 37.7909 9.79086 36 12 36ZM12 40V52H24V40H12Z"
        fill="#FAFAFA"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <rect x="14" y="42" width="8" height="8" rx="2" fill="#FAFAFA" />
      <rect x="36" y="36" width="8" height="8" rx="2" fill="#2563EB" />
      <rect x="48" y="36" width="8" height="8" rx="2" fill="#3B82F6" />
      <rect x="36" y="48" width="8" height="8" rx="2" fill="#3B82F6" />
      <rect x="48" y="48" width="8" height="8" rx="2" fill="#60A5FA" />
      <rect x="42" y="42" width="8" height="8" rx="2" fill="#FAFAFA" />
    </svg>
  );
}

export interface BrandLogoProps {
  markSize?: number;
  className?: string;
  wordmarkClassName?: string;
}

/**
 * Primary horizontal brand lockup: geometric QR symbol + OpenQR Studio wordmark.
 */
export function BrandLogo({
  markSize = 32,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap",
        className
      )}
      data-testid="brand-logo"
    >
      <BrandMark
        size={markSize}
        className="rounded-lg shadow-2xs ring-1 ring-border/50"
      />
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground",
          wordmarkClassName
        )}
      >
        {APP_CONFIG.name}
      </span>
    </span>
  );
}
