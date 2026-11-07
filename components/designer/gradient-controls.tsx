"use client";

import * as React from "react";
import type { GradientConfig, GradientType } from "@/types/design";
import { Label } from "@/components/ui/label";
import { Slider, Switch } from "@/components/ui/primitives";
import { ColorPicker } from "@/components/shared/color-picker";
import { SectionHeading } from "@/components/shared/section-heading";
import { FOREGROUND_COLOR_SWATCHES } from "@/lib/utils/color-utils";
import { cn } from "@/lib/utils/cn";

export interface GradientControlsProps {
  gradient?: GradientConfig;
  baseColor: string;
  onChange: (gradient?: GradientConfig) => void;
}

const DEFAULT_END_COLOR = "#2563EB";

export function GradientControls({
  gradient,
  baseColor,
  onChange,
}: GradientControlsProps) {
  const isEnabled = Boolean(gradient && gradient.colors.length >= 2);
  const startColor = gradient?.colors[0]?.color ?? baseColor;
  const endColor = gradient?.colors[1]?.color ?? DEFAULT_END_COLOR;
  const gradientType: GradientType = gradient?.type ?? "linear";
  const rotation = gradient?.rotation ?? 45;

  const handleToggle = (checked: boolean) => {
    if (!checked) {
      onChange(undefined);
    } else {
      onChange({
        type: "linear",
        rotation: 45,
        colors: [
          { offset: 0, color: baseColor },
          { offset: 1, color: DEFAULT_END_COLOR },
        ],
      });
    }
  };

  const handleTypeChange = (type: GradientType) => {
    if (!gradient) {
      return;
    }
    onChange({
      ...gradient,
      type,
    });
  };

  const handleColorStopChange = (index: 0 | 1, color: string) => {
    const nextColors = [
      { offset: 0, color: index === 0 ? color : startColor },
      { offset: 1, color: index === 1 ? color : endColor },
    ];
    onChange({
      type: gradientType,
      rotation,
      colors: nextColors,
    });
  };

  const handleRotationChange = (values: number[]) => {
    const nextAngle = values[0] ?? 45;
    onChange({
      type: gradientType,
      rotation: nextAngle,
      colors: [
        { offset: 0, color: startColor },
        { offset: 1, color: endColor },
      ],
    });
  };

  return (
    <div className="space-y-3.5" data-testid="gradient-controls">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Foreground Gradient"
          description="Blend two colours across the QR modules."
        />
        <div className="flex items-center gap-2">
          <Label
            htmlFor="enable-gradient-switch"
            className="text-xs text-muted-foreground"
          >
            {isEnabled ? "Enabled" : "Off"}
          </Label>
          <Switch
            id="enable-gradient-switch"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            aria-label="Enable foreground gradient"
          />
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Gradient Style</Label>
            <div
              className="grid grid-cols-2 gap-1.5 rounded-md bg-secondary p-1"
              role="radiogroup"
              aria-label="Gradient type"
            >
              {(["linear", "radial"] as const).map((type) => {
                const active = gradientType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleTypeChange(type)}
                    className={cn(
                      "rounded-xs py-1.5 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <ColorPicker
            id="gradient-start-color"
            label="Start Colour"
            value={startColor}
            onChange={(color) => handleColorStopChange(0, color)}
            swatches={FOREGROUND_COLOR_SWATCHES.slice(0, 6)}
          />

          <ColorPicker
            id="gradient-end-color"
            label="End Colour"
            value={endColor}
            onChange={(color) => handleColorStopChange(1, color)}
            swatches={FOREGROUND_COLOR_SWATCHES.slice(2, 8)}
          />

          {gradientType === "linear" && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <Label htmlFor="gradient-angle-slider">Gradient Angle</Label>
                <span className="font-mono text-muted-foreground">
                  {rotation}°
                </span>
              </div>
              <Slider
                id="gradient-angle-slider"
                aria-label="Gradient angle in degrees"
                min={0}
                max={360}
                step={15}
                value={[rotation]}
                onValueChange={handleRotationChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
