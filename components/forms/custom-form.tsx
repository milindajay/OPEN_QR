"use client";

import * as React from "react";
import { Terminal } from "lucide-react";
import type { CustomPayload } from "@/types/payload";
import type { CapacityReport } from "@/types/qr";
import type { ErrorCorrectionLevel } from "@/types/design";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface CustomFormProps {
  value: CustomPayload;
  onChange: (next: CustomPayload) => void;
  errors: Record<string, string>;
  capacity: CapacityReport;
  errorCorrection: ErrorCorrectionLevel;
}

export function CustomForm({
  value,
  onChange,
  errors,
  capacity,
  errorCorrection,
}: CustomFormProps) {
  return (
    <div className="space-y-3" data-testid="form-custom">
      <div className="rounded-lg border border-border bg-secondary/40 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Terminal className="h-3.5 w-3.5 text-accent" />
          <span>Raw Unmodified Payload Mode</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Unlike the structured generators above, Custom Data encodes your exact
          character sequence verbatim—ideal for custom URI schemes (e.g.,{" "}
          <code className="font-mono">upi://</code>,{" "}
          <code className="font-mono">bitcoin:</code>,{" "}
          <code className="font-mono">nostr:</code>), JSON, or GS1 strings.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="custom-payload-input" className="text-xs font-medium">
            Custom Payload String <span className="text-destructive">*</span>
          </Label>
          <span
            className="font-mono text-[11px] text-muted-foreground"
            data-testid="custom-capacity-counter"
          >
            {capacity.characterCount} chars • {capacity.byteLength} /{" "}
            {capacity.maxBytes} bytes (Ver {capacity.estimatedVersion}, EC{" "}
            {errorCorrection})
          </span>
        </div>

        <Textarea
          id="custom-payload-input"
          rows={4}
          placeholder="upi://pay?pa=merchant@upi&pn=OpenQR or any raw data..."
          value={value.value}
          onChange={(e) => onChange({ type: "custom", value: e.target.value })}
          aria-invalid={Boolean(errors.value)}
          aria-describedby={errors.value ? "custom-payload-error" : undefined}
          className="font-mono text-xs"
        />

        {errors.value && (
          <p
            id="custom-payload-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.value}
          </p>
        )}
      </div>
    </div>
  );
}
