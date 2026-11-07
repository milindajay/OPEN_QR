"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileCode2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import type { QRType } from "@/types/qr";
import type { QRDesign } from "@/types/design";
import {
  DEFAULT_JPEG_QUALITY,
  EXPORT_DIMENSION_PRESETS,
  MAX_EXPORT_DIMENSION,
  MIN_EXPORT_DIMENSION,
  type ExportFormat,
} from "@/types/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/primitives";
import { useQrExport } from "@/hooks/use-qr-export";
import { cn } from "@/lib/utils/cn";

export interface QRDownloadPanelProps {
  qrType: QRType;
  encodedPayload: string;
  design: QRDesign;
  disabled?: boolean;
  onDimensionsChange?: (size: number) => void;
  onBackgroundTransparentChange?: (transparent: boolean) => void;
}

const JPEG_QUALITY_PRESETS = [
  { label: "Standard (80%)", value: 0.8, testId: "export-jpeg-quality-80" },
  {
    label: "High (92%)",
    value: DEFAULT_JPEG_QUALITY,
    testId: "export-jpeg-quality-92",
  },
  { label: "Max (100%)", value: 1.0, testId: "export-jpeg-quality-100" },
] as const;

export function QRDownloadPanel({
  qrType,
  encodedPayload,
  design,
  disabled = false,
  onDimensionsChange,
  onBackgroundTransparentChange,
}: QRDownloadPanelProps) {
  const {
    exportingFormat,
    copyingAction,
    isBusy,
    statusFeedback,
    exportQr,
    copyImage,
    copyPayload,
  } = useQrExport();

  const [selectedFormat, setSelectedFormat] =
    React.useState<ExportFormat>("png");
  const [jpegQuality, setJpegQuality] =
    React.useState<number>(DEFAULT_JPEG_QUALITY);

  const isPresetDimension = (
    EXPORT_DIMENSION_PRESETS as readonly number[]
  ).includes(design.width);
  const [isCustomSizeMode, setIsCustomSizeMode] = React.useState<boolean>(
    !isPresetDimension
  );
  const [customDimensionDraft, setCustomDimensionDraft] =
    React.useState<string>(String(design.width));
  const [localDimension, setLocalDimension] = React.useState<number>(
    design.width
  );
  const [localTransparent, setLocalTransparent] = React.useState<boolean>(
    design.background.transparent
  );

  // Keep local state synchronized when parent design updates (e.g., Layout/Colours tabs or Reset)
  React.useEffect(() => {
    setLocalDimension(design.width);
    setCustomDimensionDraft(String(design.width));
    if (
      !(EXPORT_DIMENSION_PRESETS as readonly number[]).includes(design.width)
    ) {
      setIsCustomSizeMode(true);
    }
  }, [design.width]);

  React.useEffect(() => {
    setLocalTransparent(design.background.transparent);
  }, [design.background.transparent]);

  const activeDimension = onDimensionsChange ? design.width : localDimension;
  const activeTransparent = onBackgroundTransparentChange
    ? design.background.transparent
    : localTransparent;

  const effectiveDesign = React.useMemo<QRDesign>(
    () => ({
      ...design,
      width: activeDimension,
      height: activeDimension,
      background: {
        ...design.background,
        transparent: activeTransparent,
      },
    }),
    [design, activeDimension, activeTransparent]
  );

  const applyDimension = (nextSize: number) => {
    const clamped = Math.min(
      MAX_EXPORT_DIMENSION,
      Math.max(MIN_EXPORT_DIMENSION, Math.round(nextSize))
    );
    setLocalDimension(clamped);
    setCustomDimensionDraft(String(clamped));
    onDimensionsChange?.(clamped);
  };

  const handlePresetDimensionSelect = (size: number) => {
    setIsCustomSizeMode(false);
    applyDimension(size);
  };

  const handleCustomDimensionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;
    setCustomDimensionDraft(raw);
    const parsed = Number.parseInt(raw, 10);
    if (
      !Number.isNaN(parsed) &&
      parsed >= MIN_EXPORT_DIMENSION &&
      parsed <= MAX_EXPORT_DIMENSION
    ) {
      setLocalDimension(parsed);
      onDimensionsChange?.(parsed);
    }
  };

  const handleCustomDimensionBlur = () => {
    const parsed = Number.parseInt(customDimensionDraft, 10);
    if (Number.isNaN(parsed)) {
      setCustomDimensionDraft(String(activeDimension));
      return;
    }
    applyDimension(parsed);
  };

  const handleTransparentToggle = (checked: boolean) => {
    setLocalTransparent(checked);
    onBackgroundTransparentChange?.(checked);
  };

  const mimeTypeLabel =
    selectedFormat === "svg"
      ? "image/svg+xml"
      : selectedFormat === "jpeg"
        ? "image/jpeg"
        : "image/png";

  const backgroundSummaryLabel = React.useMemo(() => {
    if (selectedFormat === "jpeg") {
      if (effectiveDesign.background.transparent) {
        return "White composite (#FFFFFF)";
      }
      if (effectiveDesign.background.gradient) {
        return `${effectiveDesign.background.gradient.type} gradient`;
      }
      return `Solid ${effectiveDesign.background.color}`;
    }

    if (effectiveDesign.background.transparent) {
      return "Transparent alpha";
    }
    if (effectiveDesign.background.gradient) {
      return `${effectiveDesign.background.gradient.type} gradient`;
    }
    return `Solid ${effectiveDesign.background.color}`;
  }, [selectedFormat, effectiveDesign.background]);

  const controlsDisabled = disabled || isBusy;

  return (
    <div
      className="space-y-3.5 pt-1"
      data-testid="qr-download-panel"
      aria-label="Export Studio controls"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Export Studio</span>
        <span>No watermarks • Client-side browser export</span>
      </div>

      {/* Format Configuration Selector (PNG / JPEG / SVG) */}
      <div className="rounded-lg border border-border bg-secondary/25 p-3 space-y-3">
        <div
          role="tablist"
          aria-label="Export format settings"
          className="grid grid-cols-3 gap-1 rounded-md bg-secondary/70 p-1"
        >
          {(
            [
              { id: "png", label: "PNG Settings" },
              { id: "jpeg", label: "JPEG Settings" },
              { id: "svg", label: "SVG Vector" },
            ] as const
          ).map((tab) => {
            const isActive = selectedFormat === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`export-format-tab-${tab.id}`}
                onClick={() => setSelectedFormat(tab.id)}
                className={cn(
                  "min-h-8 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Raster Resolution Controls (Shown for PNG & JPEG, omitted for Vector SVG) */}
        {selectedFormat !== "svg" && (
          <div className="space-y-2" data-testid="export-raster-size-controls">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-foreground">
                Output Resolution
              </span>
              <span
                className="font-mono text-muted-foreground"
                data-testid="export-active-dimensions"
              >
                {activeDimension} × {activeDimension} px
              </span>
            </div>

            <div
              className="grid grid-cols-5 gap-1.5"
              role="group"
              aria-label="Export resolution options"
            >
              {EXPORT_DIMENSION_PRESETS.map((size) => {
                const isSelected =
                  !isCustomSizeMode && activeDimension === size;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={controlsDisabled}
                    onClick={() => handlePresetDimensionSelect(size)}
                    data-testid={`export-size-${size}`}
                    className={cn(
                      "min-h-8 rounded-md border px-1.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                      isSelected
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {size}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={controlsDisabled}
                onClick={() => setIsCustomSizeMode(true)}
                data-testid="export-size-custom"
                className={cn(
                  "min-h-8 rounded-md border px-1.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  isCustomSizeMode
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                Custom
              </button>
            </div>

            {isCustomSizeMode && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <Label
                  htmlFor="export-custom-dimension-input"
                  className="text-[11px] text-muted-foreground"
                >
                  Custom Square Size ({MIN_EXPORT_DIMENSION}–{MAX_EXPORT_DIMENSION} px)
                </Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="export-custom-dimension-input"
                    data-testid="export-custom-dimension-input"
                    aria-label="Custom square dimension in pixels"
                    type="number"
                    min={MIN_EXPORT_DIMENSION}
                    max={MAX_EXPORT_DIMENSION}
                    step={1}
                    disabled={controlsDisabled}
                    value={customDimensionDraft}
                    onChange={handleCustomDimensionInputChange}
                    onBlur={handleCustomDimensionBlur}
                    className="h-8 w-24 font-mono text-xs"
                  />
                  <span className="text-[11px] font-mono text-muted-foreground">
                    px
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PNG-Specific Settings */}
        {selectedFormat === "png" && (
          <div
            className="flex items-center justify-between border-t border-border/70 pt-2.5 text-xs"
            data-testid="export-png-settings"
          >
            <div className="space-y-0.5">
              <Label
                htmlFor="export-transparent-bg-switch"
                className="text-xs font-medium text-foreground cursor-pointer"
              >
                PNG Alpha Channel (No Background)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Exports true 32-bit RGBA alpha without a background fill.
              </p>
            </div>
            <Switch
              id="export-transparent-bg-switch"
              data-testid="export-transparent-bg-switch"
              aria-label="Enable PNG alpha channel"
              checked={activeTransparent}
              disabled={controlsDisabled}
              onCheckedChange={handleTransparentToggle}
            />
          </div>
        )}

        {/* JPEG-Specific Settings */}
        {selectedFormat === "jpeg" && (
          <div
            className="space-y-2.5 border-t border-border/70 pt-2.5"
            data-testid="export-jpeg-settings"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-foreground">
                  JPEG Compression Quality
                </span>
                <span
                  className="font-mono text-muted-foreground"
                  data-testid="export-jpeg-quality-value"
                >
                  {Math.round(jpegQuality * 100)}%
                </span>
              </div>

              <div
                className="grid grid-cols-3 gap-1.5"
                role="group"
                aria-label="JPEG quality presets"
              >
                {JPEG_QUALITY_PRESETS.map((preset) => {
                  const isSelected =
                    Math.abs(jpegQuality - preset.value) < 0.01;
                  return (
                    <button
                      key={preset.testId}
                      type="button"
                      disabled={controlsDisabled}
                      data-testid={preset.testId}
                      onClick={() => setJpegQuality(preset.value)}
                      className={cn(
                        "min-h-8 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                        isSelected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-md border border-border/80 bg-background/70 px-2.5 py-2 text-[11px] text-muted-foreground"
              data-testid="export-jpeg-bg-notice"
            >
              {activeTransparent ? (
                <span>
                  JPEG does not support transparency. Transparent areas are
                  automatically composited onto{" "}
                  <strong className="font-mono text-foreground">#FFFFFF</strong>{" "}
                  (white).
                </span>
              ) : (
                <span>
                  Preserves selected{" "}
                  <strong className="font-mono text-foreground">
                    {effectiveDesign.background.gradient
                      ? `${effectiveDesign.background.gradient.type} gradient`
                      : effectiveDesign.background.color}
                  </strong>{" "}
                  background.
                </span>
              )}
            </div>
          </div>
        )}

        {/* SVG-Specific Settings */}
        {selectedFormat === "svg" && (
          <div
            className="flex items-start gap-2.5 border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground"
            data-testid="export-svg-vector-info"
          >
            <FileCode2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">
                Standalone Vector SVG (XML 1.0)
              </p>
              <p>
                Genuine resolution-independent vector geometry for print, Figma,
                and Illustrator. Preserves module shapes, gradients, quiet
                zones, and self-contained embedded logos with zero external
                dependencies.
              </p>
            </div>
          </div>
        )}

        {/* Concise Export Information Summary Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-1.5 border-t border-border/70 pt-2 text-[11px] text-muted-foreground"
          data-testid="export-summary-bar"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-background px-1.5 py-0.5 font-mono font-medium uppercase text-foreground">
              {selectedFormat}
            </span>
            <span className="font-mono">{mimeTypeLabel}</span>
            <span>•</span>
            <span>{backgroundSummaryLabel}</span>
          </div>
          <span className="font-mono text-foreground">
            {selectedFormat === "svg"
              ? `Vector (${activeDimension}×${activeDimension} viewBox)`
              : `${activeDimension}×${activeDimension} px`}
          </span>
        </div>
      </div>

      {/* Direct Format Download Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <Button
          type="button"
          variant={selectedFormat === "png" ? "accent" : "outline"}
          disabled={controlsDisabled}
          onClick={() => {
            setSelectedFormat("png");
            void exportQr(qrType, encodedPayload, effectiveDesign, "png", {
              width: activeDimension,
              height: activeDimension,
            });
          }}
          data-testid="download-png-btn"
          className="min-h-11"
        >
          <Download className="h-4 w-4" />
          <span>{exportingFormat === "png" ? "Exporting..." : "PNG"}</span>
        </Button>

        <Button
          type="button"
          variant={selectedFormat === "jpeg" ? "accent" : "outline"}
          disabled={controlsDisabled}
          onClick={() => {
            setSelectedFormat("jpeg");
            void exportQr(qrType, encodedPayload, effectiveDesign, "jpeg", {
              width: activeDimension,
              height: activeDimension,
              quality: jpegQuality,
              backgroundColor: "#FFFFFF",
            });
          }}
          data-testid="download-jpg-btn"
          className="min-h-11"
        >
          <Download className="h-4 w-4" />
          <span>{exportingFormat === "jpeg" ? "Exporting..." : "JPG"}</span>
        </Button>

        <Button
          type="button"
          variant={selectedFormat === "svg" ? "accent" : "outline"}
          disabled={controlsDisabled}
          onClick={() => {
            setSelectedFormat("svg");
            void exportQr(qrType, encodedPayload, effectiveDesign, "svg", {
              width: activeDimension,
              height: activeDimension,
            });
          }}
          data-testid="download-svg-btn"
          className="min-h-11"
        >
          <Download className="h-4 w-4" />
          <span>{exportingFormat === "svg" ? "Exporting..." : "SVG"}</span>
        </Button>
      </div>

      {/* Clipboard Actions Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="secondary"
          disabled={controlsDisabled}
          onClick={() =>
            void copyImage(
              qrType,
              encodedPayload,
              effectiveDesign,
              activeDimension
            )
          }
          data-testid="copy-qr-image-btn"
          className="min-h-10 text-xs"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>
            {copyingAction === "image" ? "Copying Image..." : "Copy QR Image"}
          </span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          disabled={controlsDisabled}
          onClick={() => void copyPayload(encodedPayload)}
          data-testid="copy-qr-payload-btn"
          className="min-h-10 text-xs"
        >
          <ClipboardCopy className="h-3.5 w-3.5" />
          <span>
            {copyingAction === "payload" ? "Copying..." : "Copy Payload"}
          </span>
        </Button>
      </div>

      {/* Accessible Inline Export / Clipboard Feedback Banner */}
      {statusFeedback && (
        <div
          role={statusFeedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
          data-testid="export-status-banner"
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
            statusFeedback.type === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          )}
        >
          {statusFeedback.type === "error" ? (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{statusFeedback.message}</span>
        </div>
      )}

      {/* Subtle Vector / Privacy Assurance Footer */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/80">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-accent" />
          <span>Exact studio state snapshot</span>
        </span>
        <span className="font-mono">UTF-8 • ISO/IEC 18004</span>
      </div>
    </div>
  );
}
