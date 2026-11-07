"use client";

import * as React from "react";
import type { WhatsAppPayload } from "@/types/payload";
import { formatWhatsAppNumber } from "@/lib/qr/payloads/whatsapp";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface WhatsAppFormProps {
  value: WhatsAppPayload;
  onChange: (next: WhatsAppPayload) => void;
  errors: Record<string, string>;
}

export function WhatsAppForm({ value, onChange, errors }: WhatsAppFormProps) {
  const normalizedPreview = formatWhatsAppNumber(
    value.phone,
    value.countryCode
  );

  return (
    <div className="space-y-4" data-testid="form-whatsapp">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="space-y-1.5 sm:col-span-4">
          <Label htmlFor="whatsapp-country-code" className="text-xs font-medium">
            Country Code{" "}
            <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="whatsapp-country-code"
            placeholder="+1 or +94"
            value={value.countryCode ?? ""}
            onChange={(e) =>
              onChange({ ...value, countryCode: e.target.value })
            }
            aria-invalid={Boolean(errors.countryCode)}
            aria-describedby={
              errors.countryCode ? "whatsapp-country-error" : undefined
            }
            className="h-10 font-mono"
          />
          {errors.countryCode && (
            <p
              id="whatsapp-country-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.countryCode}
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-8">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="whatsapp-phone" className="text-xs font-medium">
              International Phone Number{" "}
              <span className="text-destructive">*</span>
            </Label>
            {normalizedPreview.length >= 7 && !errors.phone && (
              <span
                className="font-mono text-[11px] text-muted-foreground"
                data-testid="whatsapp-normalized-preview"
              >
                wa.me/{normalizedPreview}
              </span>
            )}
          </div>
          <Input
            id="whatsapp-phone"
            type="tel"
            placeholder="+1 415 555 0199 or 077 123 4567"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone
                ? "whatsapp-phone-error whatsapp-phone-help"
                : "whatsapp-phone-help"
            }
            className="h-10"
          />
          {errors.phone && (
            <p
              id="whatsapp-phone-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <p id="whatsapp-phone-help" className="text-[11px] text-muted-foreground">
        Include the international country code either in the Country Code field
        or directly in the phone number. Leading zeros, spaces, and punctuation
        are normalized automatically for <code className="font-mono">https://wa.me/</code>.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp-message" className="text-xs font-medium">
          Pre-filled Message{" "}
          <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="whatsapp-message"
          rows={3}
          placeholder="Hi! I would like to learn more..."
          value={value.message ?? ""}
          onChange={(e) => onChange({ ...value, message: e.target.value })}
        />
      </div>
    </div>
  );
}
