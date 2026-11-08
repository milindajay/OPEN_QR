"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/primitives";
import { SectionHeading } from "@/components/shared/section-heading";
import { TooltipInfo } from "@/components/shared/tooltip-info";
import { EXPORT_RESOLUTION_PRESET_DETAILS } from "@/types/export";
import { cn } from "@/lib/utils/cn";

export interface MarginControlProps {
  margin: number;
  width: number;
  onMarginChange: (margin: number) => void;
  onDimensionsChange: (size: number) => void;
  onReset: () => void;
}

export function MarginControl({
  margin,
  width,
  onMarginChange,
  onDimensionsChange,
  onReset,
}: MarginControlProps) {
  return (
    <div className="space-y-4" data-testid="margin-control">
      <SectionHeading
        title="Quiet Zone & Export Resolution"
        description="Configure the outer border clearance and output pixel dimensions."
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Reset margin and dimensions"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        }
      />

      <div className="space-y-5 rounded-lg border border-border bg-secondary/20 p-3.5">
        {/* Quiet Zone Margin */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="quiet-zone-slider">Quiet-Zone Margin</Label>
              <TooltipInfo
                label="What is the quiet zone?"
                content="ISO/IEC 18004 requires a clear border of at least 4 QR modules around the perimeter so optical scanners can distinguish the symbol from surrounding content."
              />
            </div>
            <span
              className="font-mono text-muted-foreground"
              data-testid="margin-value-label"
            >
              {margin} {margin === 1 ? "module" : "modules"}
            </span>
          </div>

          <Slider
            id="quiet-zone-slider"
            aria-label="Quiet-zone margin in QR modules"
            min={0}
            max={12}
            step={1}
            value={[margin]}
            onValueChange={(vals) => onMarginChange(vals[0] ?? 4)}
          />

          {margin < 4 && (
            <div
              role="alert"
              data-testid="quiet-zone-warning"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-[11px] text-destructive"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Margin is below the 4-module minimum. Scanners may fail to isolate the QR code when placed near text or borders.
              </span>
            </div>
          )}
        </div>

        {/* Output Dimensions */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <Label htmlFor="export-dimension-slider">Export Dimensions</Label>
            <span
              className="font-mono text-muted-foreground"
              data-testid="dimensions-value-label"
            >
              {width} × {width} px
            </span>
          </div>

          <Slider
            id="export-dimension-slider"
            aria-label="Export resolution in pixels"
            min={256}
            max={4096}
            step={64}
            value={[width]}
            onValueChange={(vals) => onDimensionsChange(vals[0] ?? 1024)}
          />

          <div
            className="grid grid-cols-5 gap-1.5 pt-1"
            role="group"
            aria-label="Export resolution presets"
          >
            {EXPORT_RESOLUTION_PRESET_DETAILS.map((preset) => {
              const isSelected = width === preset.size;
              return (
                <button
                  key={preset.size}
                  type="button"
                  onClick={() => onDimensionsChange(preset.size)}
                  title={`${preset.name} (${preset.size}×${preset.size} px) — ${preset.intendedUse}`}
                  data-testid={`dimension-preset-${preset.size}`}
                  className={cn(
                    "min-h-9 rounded-md border py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {preset.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
