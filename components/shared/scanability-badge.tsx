import * as React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { CapacityReport, ScanabilityReport } from "@/types/qr";
import type { ErrorCorrectionLevel } from "@/types/design";
import { cn } from "@/lib/utils/cn";

export interface ScanabilityBadgeProps {
  scanability: ScanabilityReport;
  capacity: CapacityReport;
  errorCorrection: ErrorCorrectionLevel;
}

export function ScanabilityBadge({
  scanability,
  capacity,
  errorCorrection,
}: ScanabilityBadgeProps) {
  const statusConfig = {
    good: {
      label: "Good Scanability (Advisory)",
      icon: CheckCircle2,
      className: "border-success/30 bg-success/10 text-success",
    },
    warning: {
      label: "Scanability Warning (Advisory)",
      icon: AlertTriangle,
      className: "border-warning/30 bg-warning/10 text-warning",
    },
    "high-risk": {
      label: "High Scanability Risk (Advisory)",
      icon: ShieldAlert,
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    },
  }[scanability.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="w-full space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium",
            statusConfig.className
          )}
          data-testid="scanability-status-badge"
        >
          <StatusIcon className="h-3.5 w-3.5" />
          <span>{statusConfig.label}</span>
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5 text-muted-foreground"
          data-testid="capacity-summary"
        >
          <span>Contrast {scanability.contrastRatio}:1</span>
          <span>•</span>
          <span>Version {capacity.estimatedVersion}</span>
          <span>•</span>
          <span>EC {errorCorrection}</span>
          <span>•</span>
          <span>
            {capacity.byteLength} / {capacity.maxBytes} B (
            {capacity.utilizationPercentage}%)
          </span>
        </div>
      </div>

      {scanability.issues.length > 0 && (
        <ul
          className="space-y-1.5 rounded-lg border border-border bg-secondary/50 p-3 text-xs"
          aria-label="Scanability advisory notes"
          data-testid="scanability-issues-list"
        >
          {scanability.issues.map((issue) => (
            <li key={issue.id} className="text-muted-foreground">
              <span
                className={cn(
                  "font-semibold",
                  issue.level === "high-risk"
                    ? "text-destructive"
                    : "text-warning"
                )}
              >
                {issue.title}:{" "}
              </span>
              {issue.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
