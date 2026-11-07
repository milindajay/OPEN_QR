"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { DESIGN_PRESETS } from "@/lib/qr/presets/design-presets";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils/cn";

export interface PresetSelectorProps {
  activePresetId: string | null;
  onSelectPreset: (presetId: string) => void;
}

export function PresetSelector({
  activePresetId,
  onSelectPreset,
}: PresetSelectorProps) {
  return (
    <div className="space-y-3.5" data-testid="preset-selector">
      <SectionHeading
        title="Curated Studio Presets"
        description="Apply a complete visual theme, then fine-tune any detail below."
      />

      <div
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Design presets"
      >
        {DESIGN_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const { dots, background, corners } = preset.design;
          const gradient = dots.gradient;
          const swatchBackground = gradient
            ? `linear-gradient(${gradient.rotation ?? 45}deg, ${gradient.colors[0]?.color ?? dots.color}, ${gradient.colors[1]?.color ?? dots.color})`
            : dots.color;

          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`preset-${preset.id}`}
              onClick={() => onSelectPreset(preset.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-accent bg-accent/5 ring-1 ring-accent/40"
                  : "border-border bg-background hover:border-foreground/25 hover:bg-secondary/50"
              )}
            >
              {/* Visual miniature QR sample */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/80 p-1.5 shadow-2xs"
                style={{ backgroundColor: background.color }}
                aria-hidden="true"
              >
                <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-0.5">
                  <span
                    className={cn(
                      "col-span-1 row-span-1 border-2",
                      corners.outerStyle === "dot"
                        ? "rounded-full"
                        : corners.outerStyle === "extra-rounded"
                          ? "rounded-[3px]"
                          : "rounded-none"
                    )}
                    style={{ borderColor: corners.outerColor }}
                  />
                  <span
                    className={cn(
                      dots.style === "dots"
                        ? "rounded-full"
                        : dots.style !== "square"
                          ? "rounded-[2px]"
                          : "rounded-none"
                    )}
                    style={{ background: swatchBackground }}
                  />
                  <span
                    className={cn(
                      "col-span-1 row-span-1 border-2",
                      corners.outerStyle === "dot"
                        ? "rounded-full"
                        : corners.outerStyle === "extra-rounded"
                          ? "rounded-[3px]"
                          : "rounded-none"
                    )}
                    style={{ borderColor: corners.outerColor }}
                  />
                  <span
                    className={cn(
                      dots.style === "dots"
                        ? "rounded-full"
                        : dots.style !== "square"
                          ? "rounded-[2px]"
                          : "rounded-none"
                    )}
                    style={{ background: swatchBackground }}
                  />
                  <span
                    className={cn(
                      dots.style === "dots"
                        ? "rounded-full"
                        : dots.style !== "square"
                          ? "rounded-[2px]"
                          : "rounded-none"
                    )}
                    style={{ background: swatchBackground }}
                  />
                  <span
                    className={cn(
                      dots.style === "dots"
                        ? "rounded-full"
                        : dots.style !== "square"
                          ? "rounded-[2px]"
                          : "rounded-none"
                    )}
                    style={{ background: swatchBackground }}
                  />
                  <span
                    className={cn(
                      "col-span-1 row-span-1 border-2",
                      corners.outerStyle === "dot"
                        ? "rounded-full"
                        : corners.outerStyle === "extra-rounded"
                          ? "rounded-[3px]"
                          : "rounded-none"
                    )}
                    style={{ borderColor: corners.outerColor }}
                  />
                  <span
                    className={cn(
                      dots.style === "dots"
                        ? "rounded-full"
                        : dots.style !== "square"
                          ? "rounded-[2px]"
                          : "rounded-none"
                    )}
                    style={{ background: swatchBackground }}
                  />
                  <span
                    className={cn(
                      dots.style === "dots"
                        ? "rounded-full"
                        : dots.style !== "square"
                          ? "rounded-[2px]"
                          : "rounded-none"
                    )}
                    style={{ background: swatchBackground }}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {preset.name}
                  </p>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
