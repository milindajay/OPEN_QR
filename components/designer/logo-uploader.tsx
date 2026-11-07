"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import type {
  ErrorCorrectionLevel,
  LogoContainerShape,
  QRLogoConfig,
} from "@/types/design";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider, Switch } from "@/components/ui/primitives";
import { ColorPicker } from "@/components/shared/color-picker";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { SectionHeading } from "@/components/shared/section-heading";
import { processUploadedLogoFile } from "@/lib/utils/file-utils";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { BACKGROUND_COLOR_SWATCHES } from "@/lib/utils/color-utils";
import { cn } from "@/lib/utils/cn";

export interface LogoUploaderProps {
  logo?: QRLogoConfig;
  errorCorrection: ErrorCorrectionLevel;
  onSetLogo: (logo: QRLogoConfig) => void;
  onUpdateLogo: (partial: Partial<QRLogoConfig>) => void;
  onRemoveLogo: () => void;
  onResetLogoSettings: () => void;
  onRecommendHighEc: () => void;
}

const CONTAINER_SHAPES: ReadonlyArray<{
  id: LogoContainerShape;
  label: string;
}> = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
];

export function LogoUploader({
  logo,
  errorCorrection,
  onSetLogo,
  onUpdateLogo,
  onRemoveLogo,
  onResetLogoSettings,
  onRecommendHighEc,
}: LogoUploaderProps) {
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      const result = await processUploadedLogoFile(file);
      if (!result.isValid || !result.dataUrl) {
        setUploadError(result.error ?? "Invalid image file.");
        return;
      }

      onSetLogo({
        source: result.dataUrl,
        fileName: result.fileName ?? file.name,
        size: logo?.size ?? APP_CONFIG.limits.defaultLogoSizeRatio,
        margin: logo?.margin ?? 4,
        shape: logo?.shape ?? "square",
        ...(logo?.backgroundColor
          ? { backgroundColor: logo.backgroundColor }
          : {}),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setUploadError(null);
    onRemoveLogo();
  };

  const sizePercentage = Math.round(
    (logo?.size ?? APP_CONFIG.limits.defaultLogoSizeRatio) * 100
  );
  const hasBadgeBg = Boolean(logo?.backgroundColor);

  return (
    <div className="space-y-4" data-testid="logo-uploader">
      <SectionHeading
        title="Center Brand Logo"
        description="Processed strictly in browser memory. SVG files are sanitized before rendering."
        action={
          logo ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetLogoSettings}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Reset logo styling"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          ) : undefined
        }
      />

      {!logo ? (
        <FileDropzone
          id="qr-logo-upload-input"
          label={isProcessing ? "Verifying image..." : "Upload Logo Image"}
          onFileSelect={(file) => void handleFileSelect(file)}
          disabled={isProcessing}
        />
      ) : (
        <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-3.5">
          {/* Active logo preview card */}
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/40 p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.source}
                  alt="Uploaded QR logo preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p
                  className="truncate text-xs font-semibold text-foreground"
                  data-testid="uploaded-logo-filename"
                >
                  {logo.fileName ?? "Embedded Logo"}
                </p>
                <p className="inline-flex items-center gap-1 text-[11px] text-success">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Local in-memory asset</span>
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              aria-label="Remove logo"
              data-testid="remove-logo-btn"
              className="h-8 px-2.5 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </Button>
          </div>

          {/* Contextual Error Correction Recommendation */}
          {errorCorrection !== "H" && (
            <div
              className="flex items-center justify-between gap-2 rounded-md border border-warning/30 bg-warning/10 p-2.5 text-xs"
              data-testid="logo-ec-recommendation"
            >
              <div className="flex items-start gap-2 text-warning">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Error correction is <strong>{errorCorrection}</strong>. Consider{" "}
                  <strong>H (High)</strong> when using a logo.
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRecommendHighEc}
                className="h-7 shrink-0 px-2 text-xs"
              >
                Use H
              </Button>
            </div>
          )}

          {/* Logo Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="logo-size-slider">Logo Size Ratio</Label>
              <span className="font-mono text-muted-foreground">
                {sizePercentage}%
              </span>
            </div>
            <Slider
              id="logo-size-slider"
              aria-label="Logo size percentage"
              min={10}
              max={30}
              step={1}
              value={[sizePercentage]}
              onValueChange={(vals) => {
                const nextPct = vals[0] ?? 22;
                onUpdateLogo({ size: Number((nextPct / 100).toFixed(2)) });
              }}
            />
            {sizePercentage > 24 && (
              <p className="text-[11px] text-warning">
                Logos above 24% cover more data modules. Test scanability on multiple devices.
              </p>
            )}
          </div>

          {/* Logo Margin / Padding Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="logo-margin-slider">Clearance Padding</Label>
              <span className="font-mono text-muted-foreground">
                {logo.margin} px
              </span>
            </div>
            <Slider
              id="logo-margin-slider"
              aria-label="Logo clearance padding in pixels"
              min={0}
              max={16}
              step={1}
              value={[logo.margin]}
              onValueChange={(vals) => {
                onUpdateLogo({ margin: vals[0] ?? 4 });
              }}
            />
          </div>

          {/* Container Shape */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Container Shape</Label>
            <div
              className="grid grid-cols-3 gap-1.5 rounded-md bg-secondary p-1"
              role="radiogroup"
              aria-label="Logo container shape"
            >
              {CONTAINER_SHAPES.map((item) => {
                const active = logo.shape === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-testid={`logo-shape-${item.id}`}
                    onClick={() => onUpdateLogo({ shape: item.id })}
                    className={cn(
                      "min-h-9 rounded-xs py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Badge Background Plate */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="logo-bg-switch" className="text-xs font-medium">
                Solid Logo Backing Plate
              </Label>
              <Switch
                id="logo-bg-switch"
                checked={hasBadgeBg}
                onCheckedChange={(checked) =>
                  onUpdateLogo({
                    backgroundColor: checked ? "#FFFFFF" : undefined,
                  })
                }
                aria-label="Enable solid logo backing plate"
              />
            </div>

            {hasBadgeBg && (
              <ColorPicker
                id="logo-badge-bg-color"
                label="Backing Plate Colour"
                value={logo.backgroundColor ?? "#FFFFFF"}
                onChange={(color) => onUpdateLogo({ backgroundColor: color })}
                swatches={BACKGROUND_COLOR_SWATCHES.slice(0, 6)}
              />
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <p
          role="alert"
          data-testid="logo-upload-error"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
        >
          {uploadError}
        </p>
      )}
    </div>
  );
}
