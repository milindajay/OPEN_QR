"use client";

import * as React from "react";
import type { TextPayload } from "@/types/payload";
import type { CapacityReport } from "@/types/qr";
import type { ErrorCorrectionLevel } from "@/types/design";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface TextFormProps {
  value: TextPayload;
  onChange: (next: TextPayload) => void;
  errors: Record<string, string>;
  capacity: CapacityReport;
  errorCorrection: ErrorCorrectionLevel;
}

export function TextForm({
  value,
  onChange,
  errors,
  capacity,
  errorCorrection,
}: TextFormProps) {
  return (
    <div className="space-y-3" data-testid="form-text">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="qr-text-input" className="text-xs font-medium">
            Plain Text (UTF-8) <span className="text-destructive">*</span>
          </Label>
          <span
            className="font-mono text-[11px] text-muted-foreground"
            data-testid="text-capacity-counter"
          >
            {capacity.characterCount} chars • {capacity.byteLength} /{" "}
            {capacity.maxBytes} UTF-8 bytes (EC {errorCorrection})
          </span>
        </div>

        <Textarea
          id="qr-text-input"
          rows={4}
          placeholder="Enter multiline text in any language (English, Sinhala, Tamil, Japanese, Arabic, Emoji)..."
          value={value.text}
          onChange={(e) => onChange({ type: "text", text: e.target.value })}
          aria-invalid={Boolean(errors.text)}
          aria-describedby={
            errors.text ? "qr-text-error qr-text-help" : "qr-text-help"
          }
        />

        {errors.text && (
          <p
            id="qr-text-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.text}
          </p>
        )}

        <p id="qr-text-help" className="text-[11px] text-muted-foreground">
          Full UTF-8 Unicode encoding. Line breaks are normalized to standard LF
          for universal scanner compatibility.
        </p>
      </div>
    </div>
  );
}
