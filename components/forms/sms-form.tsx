"use client";

import * as React from "react";
import type { SMSPayload } from "@/types/payload";
import { getCharacterCount, getUtf8ByteLength } from "@/lib/qr/encoding/utf8";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface SmsFormProps {
  value: SMSPayload;
  onChange: (next: SMSPayload) => void;
  errors: Record<string, string>;
}

export function SmsForm({ value, onChange, errors }: SmsFormProps) {
  const messageText = value.message ?? "";
  const charCount = getCharacterCount(messageText);
  const byteCount = getUtf8ByteLength(messageText);

  return (
    <div className="space-y-4" data-testid="form-sms">
      <div className="space-y-1.5">
        <Label htmlFor="sms-phone-input" className="text-xs font-medium">
          Phone Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sms-phone-input"
          type="tel"
          placeholder="+1 (415) 555-0199"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "sms-phone-error" : undefined}
          className="h-10"
        />
        {errors.phone && (
          <p
            id="sms-phone-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="sms-message-input" className="text-xs font-medium">
            Pre-filled Message{" "}
            <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <span className="font-mono text-[11px] text-muted-foreground">
            {charCount} chars • {byteCount} bytes
          </span>
        </div>
        <Textarea
          id="sms-message-input"
          rows={3}
          placeholder="Hello! I scanned your QR code..."
          value={messageText}
          onChange={(e) => onChange({ ...value, message: e.target.value })}
        />
        <p className="text-[11px] text-muted-foreground">
          Supports multilingual Unicode and emoji via percent-encoded{" "}
          <code className="font-mono">sms:</code> URI body.
        </p>
      </div>
    </div>
  );
}
