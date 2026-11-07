"use client";

import * as React from "react";
import type { PhonePayload } from "@/types/payload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PhoneFormProps {
  value: PhonePayload;
  onChange: (next: PhonePayload) => void;
  errors: Record<string, string>;
}

export function PhoneForm({ value, onChange, errors }: PhoneFormProps) {
  return (
    <div className="space-y-3" data-testid="form-phone">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="phone-number-input" className="text-xs font-medium">
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground">
            International E.164 supported
          </span>
        </div>

        <Input
          id="phone-number-input"
          type="tel"
          placeholder="+1 (415) 555-0199"
          value={value.phone}
          onChange={(e) => onChange({ type: "phone", phone: e.target.value })}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={
            errors.phone ? "phone-number-error phone-number-help" : "phone-number-help"
          }
          className="h-10"
        />

        {errors.phone && (
          <p
            id="phone-number-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.phone}
          </p>
        )}

        <p id="phone-number-help" className="text-[11px] text-muted-foreground">
          Include your country code (for example, <code className="font-mono">+1</code>{" "}
          or <code className="font-mono">+94</code>) so the <code className="font-mono">tel:</code>{" "}
          QR code dials reliably from any country.
        </p>
      </div>
    </div>
  );
}
