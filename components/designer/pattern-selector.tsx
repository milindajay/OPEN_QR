"use client";

import * as React from "react";
import type { DotStyle } from "@/types/design";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils/cn";

export interface PatternSelectorProps {
  value: DotStyle;
  onChange: (style: DotStyle) => void;
}

interface PatternOption {
  id: DotStyle;
  label: string;
  description: string;
  renderPreview: () => React.ReactNode;
}

const PATTERN_OPTIONS: readonly PatternOption[] = [
  {
    id: "square",
    label: "Square",
    description: "Classic crisp grid",
    renderPreview: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "rounded",
    label: "Rounded",
    description: "Softened module corners",
    renderPreview: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    id: "dots",
    label: "Dots",
    description: "Circular matrix points",
    renderPreview: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="3.5" />
        <circle cx="17.5" cy="6.5" r="3.5" />
        <circle cx="6.5" cy="17.5" r="3.5" />
        <circle cx="17.5" cy="17.5" r="3.5" />
      </svg>
    ),
  },
  {
    id: "extra-rounded",
    label: "Extra Rounded",
    description: "Organic pill geometry",
    renderPreview: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="3.2" />
        <rect x="14" y="3" width="7" height="7" rx="3.2" />
        <rect x="3" y="14" width="7" height="7" rx="3.2" />
        <rect x="14" y="14" width="7" height="7" rx="3.2" />
      </svg>
    ),
  },
  {
    id: "classy",
    label: "Classy",
    description: "Diagonal leaf accents",
    renderPreview: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M3 6.5C3 4.567 4.567 3 6.5 3H10V6.5C10 8.433 8.433 10 6.5 10H3V6.5Z" />
        <path d="M14 6.5C14 4.567 15.567 3 17.5 3H21V6.5C21 8.433 19.433 10 17.5 10H14V6.5Z" />
        <path d="M3 17.5C3 15.567 4.567 14 6.5 14H10V17.5C10 19.433 8.433 21 6.5 21H3V17.5Z" />
        <path d="M14 17.5C14 15.567 15.567 14 17.5 14H21V17.5C21 19.433 19.433 21 17.5 21H14V17.5Z" />
      </svg>
    ),
  },
  {
    id: "classy-rounded",
    label: "Classy Rounded",
    description: "Sculpted editorial curves",
    renderPreview: () => (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M3 7C3 4.79 4.79 3 7 3H9.5C9.78 3 10 3.22 10 3.5V6C10 8.21 8.21 10 6 10H3.5C3.22 10 3 9.78 3 9.5V7Z" />
        <path d="M14 7C14 4.79 15.79 3 18 3H20.5C20.78 3 21 3.22 21 3.5V6C21 8.21 19.21 10 17 10H14.5C14.22 10 14 9.78 14 9.5V7Z" />
        <path d="M3 18C3 15.79 4.79 14 7 14H9.5C9.78 14 10 14.22 10 14.5V17C10 19.21 8.21 21 6 21H3.5C3.22 21 3 20.78 3 20.5V18Z" />
        <path d="M14 18C14 15.79 15.79 14 18 14H20.5C20.78 14 21 14.22 21 14.5V17C21 19.21 19.21 21 17 21H14.5C14.22 21 14 20.78 14 20.5V18Z" />
      </svg>
    ),
  },
];

export function PatternSelector({ value, onChange }: PatternSelectorProps) {
  return (
    <div className="space-y-3" data-testid="pattern-selector">
      <SectionHeading
        title="Module Pattern"
        description="Choose the geometric shape for QR data modules."
      />

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-label="QR module pattern"
      >
        {PATTERN_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`pattern-${option.id}`}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-accent bg-accent/8 text-accent ring-1 ring-accent/30"
                  : "border-border bg-background text-foreground hover:border-foreground/25 hover:bg-secondary/50"
              )}
            >
              <div className="mb-1.5">{option.renderPreview()}</div>
              <span className="text-xs font-semibold text-foreground">
                {option.label}
              </span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
