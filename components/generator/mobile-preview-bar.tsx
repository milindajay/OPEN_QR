"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import type { QRDesign } from "@/types/design";
import type { ScanabilityReport } from "@/types/qr";
import { createQRRenderer } from "@/lib/qr/renderer/qr-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface MobilePreviewBarProps {
  encodedPayload: string;
  design: QRDesign;
  isValid: boolean;
  scanability: ScanabilityReport;
  onJumpToExport: () => void;
}

const MINI_PREVIEW_SIZE = 128;

export function MobilePreviewBar({
  encodedPayload,
  design,
  isValid,
  scanability,
  onJumpToExport,
}: MobilePreviewBarProps) {
  const miniContainerRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<ReturnType<typeof createQRRenderer> | null>(
    null
  );

  React.useEffect(() => {
    const container = miniContainerRef.current;
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
      void renderer.update("", design);
      return;
    }

    const miniDesign: QRDesign = {
      ...design,
      width: MINI_PREVIEW_SIZE,
      height: MINI_PREVIEW_SIZE,
    };

    void renderer.update(encodedPayload, miniDesign).catch(() => {
      // Handled by main preview panel
    });
  }, [encodedPayload, design, isValid]);

  const badgeMeta = {
    good: {
      label: "Good Scanability",
      icon: CheckCircle2,
      className: "border-success/30 bg-success/10 text-success",
    },
    warning: {
      label: "Scanability Warning",
      icon: AlertTriangle,
      className: "border-warning/30 bg-warning/10 text-warning",
    },
    "high-risk": {
      label: "High Scan Risk",
      icon: ShieldAlert,
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    },
  }[scanability.status];

  const StatusIcon = badgeMeta.icon;

  return (
    <div
      className="sticky top-17 z-30 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur-md lg:hidden"
      data-testid="mobile-sticky-preview-bar"
      aria-label="Sticky live QR preview bar"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border p-1",
            design.background.transparent
              ? "bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:8px_8px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)]"
              : "bg-secondary/40"
          )}
        >
          <div
            ref={miniContainerRef}
            data-testid="mobile-mini-qr-canvas"
            className={cn(
              "flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-full",
              (!isValid || !encodedPayload) && "hidden"
            )}
          />
          {(!isValid || !encodedPayload) && (
            <QrCode className="h-6 w-6 text-muted-foreground opacity-40" />
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              Live Preview
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                badgeMeta.className
              )}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{badgeMeta.label}</span>
            </span>
          </div>

          <p className="truncate text-[11px] text-muted-foreground">
            <span className="capitalize">
              {design.dots.style.replace("-", " ")}
            </span>
            {" • "}
            <span>EC {design.errorCorrection}</span>
            {" • "}
            <span>{design.margin} mod margin</span>
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="accent"
        size="sm"
        onClick={onJumpToExport}
        data-testid="mobile-jump-export-btn"
        className="min-h-10 shrink-0 px-3 text-xs"
      >
        <ArrowDownToLine className="h-3.5 w-3.5" />
        <span>Export</span>
      </Button>
    </div>
  );
}
