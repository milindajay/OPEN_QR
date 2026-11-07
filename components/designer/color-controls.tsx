"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/shared/color-picker";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  BACKGROUND_COLOR_SWATCHES,
  FOREGROUND_COLOR_SWATCHES,
} from "@/lib/utils/color-utils";

export interface ColorControlsProps {
  foregroundColor: string;
  backgroundColor: string;
  isBackgroundTransparent: boolean;
  hasForegroundGradient: boolean;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
  onResetColors: () => void;
}

export function ColorControls({
  foregroundColor,
  backgroundColor,
  isBackgroundTransparent,
  hasForegroundGradient,
  onForegroundChange,
  onBackgroundChange,
  onResetColors,
}: ColorControlsProps) {
  return (
    <div className="space-y-4" data-testid="color-controls">
      <SectionHeading
        title="Solid Colours"
        description="Set high-contrast foreground and background colours."
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetColors}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Reset colours to defaults"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        }
      />

      <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-3.5">
        <ColorPicker
          id="foreground-color-input"
          label={
            hasForegroundGradient
              ? "Base Foreground Colour (Gradient Active)"
              : "Foreground Module Colour"
          }
          value={foregroundColor}
          onChange={onForegroundChange}
          swatches={FOREGROUND_COLOR_SWATCHES}
        />

        <ColorPicker
          id="background-color-input"
          label={
            isBackgroundTransparent
              ? "Background Colour (Transparency Active)"
              : "Background Surface Colour"
          }
          value={backgroundColor}
          onChange={onBackgroundChange}
          swatches={BACKGROUND_COLOR_SWATCHES}
          disabled={isBackgroundTransparent}
        />
      </div>
    </div>
  );
}
