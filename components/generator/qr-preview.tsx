"use client";

import * as React from "react";
import { QrCode } from "lucide-react";
import type { QRDesign } from "@/types/design";
import type { CapacityReport, ScanabilityReport } from "@/types/qr";
import { createQRRenderer } from "@/lib/qr/renderer/qr-engine";
import { ScanabilityBadge } from "@/components/shared/scanability-badge";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { cn } from "@/lib/utils/cn";

export interface QRPreviewProps {
  encodedPayload: string;
  design: QRDesign;
  isValid: boolean;
  capacity: CapacityReport;
  scanability: ScanabilityReport;
}

export function QRPreview({
  encodedPayload,
  design,
  isValid,
  capacity,
  scanability,
}: QRPreviewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<ReturnType<typeof createQRRenderer> | null>(
    null
  );
  const [renderError, setRenderError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const renderer = createQRRenderer();
    rendererRef.current = renderer;
    void renderer.mount(container);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }

    if (!isValid || !encodedPayload) {
      setRenderError(null);
      void renderer.update("", design);
      return;
    }

    let cancelled = false;
    const previewDesign: QRDesign = {
      ...design,
      width: APP_CONFIG.defaultDimensions.previewSize,
      height: APP_CONFIG.defaultDimensions.previewSize,
    };

    renderer
      .update(encodedPayload, previewDesign)
      .then(() => {
        if (!cancelled) {
          setRenderError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRenderError(
            err instanceof Error
              ? err.message
              : "Unable to render QR code for the current payload."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [encodedPayload, design, isValid]);

  return (
    <div className="flex flex-col items-center space-y-5">
      {/* Studio Canvas Stage */}
      <div
        className={cn(
          "relative flex min-h-[348px] w-full items-center justify-center rounded-xl border border-border p-6 transition-colors",
          design.background.transparent
            ? "bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:12px_12px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"
            : "bg-secondary/40"
        )}
        data-testid="qr-preview-frame"
      >
        <div
          ref={containerRef}
          data-testid="qr-preview-canvas"
          aria-label="Live QR code preview"
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-lg shadow-xs transition-all",
            (!isValid || !encodedPayload || Boolean(renderError)) && "hidden"
          )}
        />

        {(!isValid || !encodedPayload || Boolean(renderError)) && (
          <div
            className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground"
            data-testid="qr-preview-empty"
          >
            <QrCode className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm font-medium text-foreground">
              {renderError
                ? "Rendering Error"
                : "Enter valid content to preview"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {renderError ??
                "Fix the validation messages to generate your live QR preview."}
            </p>
          </div>
        )}
      </div>

      {/* Active Design Summary Pills */}
      <div
        className="flex w-full flex-wrap items-center justify-between gap-2 border-y border-border py-2.5 text-[11px] text-muted-foreground"
        data-testid="design-summary-bar"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-secondary px-2 py-0.5 font-medium capitalize text-foreground">
            {design.dots.style.replace("-", " ")}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5">
            {design.dots.gradient
              ? `${design.dots.gradient.type} gradient`
              : design.dots.color}
          </span>
          {design.background.transparent && (
            <span className="rounded-md bg-secondary px-2 py-0.5">
              Transparent
            </span>
          )}
          {design.logo?.source && (
            <span className="rounded-md bg-accent/10 px-2 py-0.5 font-medium text-accent">
              Logo ({Math.round(design.logo.size * 100)}%)
            </span>
          )}
        </div>

        <span className="font-mono">
          {design.width}×{design.height}px
        </span>
      </div>

      {/* Advisory Scanability & Capacity Report */}
      <ScanabilityBadge
        scanability={scanability}
        capacity={capacity}
        errorCorrection={design.errorCorrection}
      />
    </div>
  );
}
