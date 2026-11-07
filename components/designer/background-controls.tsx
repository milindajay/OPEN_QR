"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/primitives";
import { ColorPicker } from "@/components/shared/color-picker";
import { SectionHeading } from "@/components/shared/section-heading";
import { BACKGROUND_COLOR_SWATCHES } from "@/lib/utils/color-utils";

export interface BackgroundControlsProps {
  color: string;
  transparent: boolean;
  onColorChange: (color: string) => void;
  onTransparentChange: (transparent: boolean) => void;
  onResetBackground: () => void;
}

export function BackgroundControls({
  color,
  transparent,
  onColorChange,
  onTransparentChange,
  onResetBackground,
}: BackgroundControlsProps) {
  return (
    <div className="space-y-3.5" data-testid="background-controls">
      <SectionHeading
        title="Background Surface"
        description="Configure a solid backdrop or transparent alpha channel."
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetBackground}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Reset background settings"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        }
      />

      <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="transparent-bg-switch"
              className="text-xs font-medium text-foreground"
            >
              Transparent Background
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Supported in PNG &amp; SVG exports. JPG exports automatically flatten to solid white.
            </p>
          </div>
          <Switch
            id="transparent-bg-switch"
            checked={transparent}
            onCheckedChange={onTransparentChange}
            aria-label="Transparent background"
          />
        </div>

        {!transparent && (
          <ColorPicker
            id="bg-surface-color-picker"
            label="Surface Colour"
            value={color}
            onChange={onColorChange}
            swatches={BACKGROUND_COLOR_SWATCHES}
          />
        )}
      </div>
    </div>
  );
}
