"use client";

import * as React from "react";
import type { CornerDotStyle, CornerSquareStyle } from "@/types/design";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/shared/color-picker";
import { SectionHeading } from "@/components/shared/section-heading";
import { FOREGROUND_COLOR_SWATCHES } from "@/lib/utils/color-utils";
import { cn } from "@/lib/utils/cn";

export interface FinderPatternControlsProps {
  outerStyle: CornerSquareStyle;
  innerStyle: CornerDotStyle;
  outerColor: string;
  innerColor: string;
  foregroundColor: string;
  onOuterStyleChange: (style: CornerSquareStyle) => void;
  onInnerStyleChange: (style: CornerDotStyle) => void;
  onOuterColorChange: (color: string) => void;
  onInnerColorChange: (color: string) => void;
}

const OUTER_STYLES: ReadonlyArray<{
  id: CornerSquareStyle;
  label: string;
  renderIcon: () => React.ReactNode;
}> = [
  {
    id: "square",
    label: "Square",
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    ),
  },
  {
    id: "extra-rounded",
    label: "Rounded",
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    ),
  },
  {
    id: "dot",
    label: "Circle",
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    ),
  },
];

const INNER_STYLES: ReadonlyArray<{
  id: CornerDotStyle;
  label: string;
  renderIcon: () => React.ReactNode;
}> = [
  {
    id: "square",
    label: "Square Center",
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <rect x="7" y="7" width="10" height="10" />
      </svg>
    ),
  },
  {
    id: "dot",
    label: "Circle Center",
    renderIcon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <circle cx="12" cy="12" r="5.5" />
      </svg>
    ),
  },
];

export function FinderPatternControls({
  outerStyle,
  innerStyle,
  outerColor,
  innerColor,
  foregroundColor,
  onOuterStyleChange,
  onInnerStyleChange,
  onOuterColorChange,
  onInnerColorChange,
}: FinderPatternControlsProps) {
  const handleSyncWithForeground = () => {
    onOuterColorChange(foregroundColor);
    onInnerColorChange(foregroundColor);
  };

  return (
    <div className="space-y-5" data-testid="finder-pattern-controls">
      <div className="space-y-2.5">
        <SectionHeading
          title="Outer Finder Frame"
          description="Shape of the three positioning frames at the QR corners."
        />
        <div
          className="grid grid-cols-3 gap-2"
          role="radiogroup"
          aria-label="Outer finder frame shape"
        >
          {OUTER_STYLES.map((item) => {
            const isSelected = outerStyle === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`corner-outer-${item.id}`}
                onClick={() => onOuterStyleChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-lg border py-2.5 px-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-accent bg-accent/8 text-accent ring-1 ring-accent/30"
                    : "border-border bg-background text-foreground hover:bg-secondary/50"
                )}
              >
                {item.renderIcon()}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <SectionHeading
          title="Inner Finder Eye"
          description="Shape of the inner center dot inside each corner frame."
        />
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="Inner finder eye shape"
        >
          {INNER_STYLES.map((item) => {
            const isSelected = innerStyle === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`corner-inner-${item.id}`}
                onClick={() => onInnerStyleChange(item.id)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border py-2.5 px-3 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-accent bg-accent/8 text-accent ring-1 ring-accent/30"
                    : "border-border bg-background text-foreground hover:bg-secondary/50"
                )}
              >
                {item.renderIcon()}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-3.5">
        <SectionHeading
          title="Finder Pattern Colours"
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSyncWithForeground}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Match Foreground
            </Button>
          }
        />

        <ColorPicker
          id="corner-outer-color"
          label="Outer Frame Colour"
          value={outerColor}
          onChange={onOuterColorChange}
          swatches={FOREGROUND_COLOR_SWATCHES.slice(0, 6)}
        />

        <ColorPicker
          id="corner-inner-color"
          label="Inner Eye Colour"
          value={innerColor}
          onChange={onInnerColorChange}
          swatches={FOREGROUND_COLOR_SWATCHES.slice(0, 6)}
        />
      </div>
    </div>
  );
}
