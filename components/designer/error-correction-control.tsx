"use client";

import * as React from "react";
import type { ErrorCorrectionLevel } from "@/types/design";
import { SectionHeading } from "@/components/shared/section-heading";
import { TooltipInfo } from "@/components/shared/tooltip-info";
import { cn } from "@/lib/utils/cn";

export interface ErrorCorrectionControlProps {
  value: ErrorCorrectionLevel;
  hasLogo: boolean;
  onChange: (level: ErrorCorrectionLevel) => void;
}

const EC_LEVELS: ReadonlyArray<{
  level: ErrorCorrectionLevel;
  title: string;
  recovery: string;
  summary: string;
}> = [
  {
    level: "L",
    title: "Low (L)",
    recovery: "~7%",
    summary: "Smallest module grid for clean digital screens.",
  },
  {
    level: "M",
    title: "Medium (M)",
    recovery: "~15%",
    summary: "Recommended default balancing density and resilience.",
  },
  {
    level: "Q",
    title: "Quartile (Q)",
    recovery: "~25%",
    summary: "High resilience for print and outdoor signage.",
  },
  {
    level: "H",
    title: "High (H)",
    recovery: "~30%",
    summary: "Maximum redundancy; ideal when embedding a center logo.",
  },
];

export function ErrorCorrectionControl({
  value,
  hasLogo,
  onChange,
}: ErrorCorrectionControlProps) {
  return (
    <div className="space-y-3" data-testid="error-correction-control">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Error Correction (Reed-Solomon)"
          description="Higher levels recover more obscured modules but increase grid density."
        />
        <TooltipInfo
          label="Error correction trade-offs"
          content="Higher error correction adds redundant recovery codewords. It helps QR codes scan when partially obscured by wear or a center logo, at the cost of smaller, denser modules."
        />
      </div>

      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="radiogroup"
        aria-label="Error correction level"
      >
        {EC_LEVELS.map((item) => {
          const isSelected = value === item.level;
          return (
            <button
              key={item.level}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`ec-level-${item.level}`}
              onClick={() => onChange(item.level)}
              className={cn(
                "flex flex-col items-start rounded-lg border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-accent bg-accent/8 text-accent ring-1 ring-accent/30"
                  : "border-border bg-background text-foreground hover:bg-secondary/50"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="rounded-xs bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {item.recovery}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                {item.summary}
              </p>
            </button>
          );
        })}
      </div>

      {hasLogo && value !== "H" && (
        <p className="text-[11px] text-muted-foreground">
          Tip: Because a center logo is active, consider selecting <strong>High (H)</strong> to maximize recovery margin around the logo area.
        </p>
      )}
    </div>
  );
}
