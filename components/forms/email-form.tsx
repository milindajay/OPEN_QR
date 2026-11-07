"use client";

import * as React from "react";
import type { EmailPayload } from "@/types/payload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface EmailFormProps {
  value: EmailPayload;
  onChange: (next: EmailPayload) => void;
  errors: Record<string, string>;
}

export function EmailForm({ value, onChange, errors }: EmailFormProps) {
  return (
    <div className="space-y-4" data-testid="form-email">
      <div className="space-y-1.5">
        <Label htmlFor="email-recipient" className="text-xs font-medium">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email-recipient"
          type="email"
          placeholder="hello@openqr.studio"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-recipient-error" : undefined}
          className="h-10"
        />
        {errors.email && (
          <p
            id="email-recipient-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-subject" className="text-xs font-medium">
          Subject <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="email-subject"
          placeholder="Inquiry about OpenQR Studio"
          value={value.subject ?? ""}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email-message" className="text-xs font-medium">
          Message <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="email-message"
          rows={3}
          placeholder="Write a pre-filled email body..."
          value={value.message ?? ""}
          onChange={(e) => onChange({ ...value, message: e.target.value })}
        />
        <p className="text-[11px] text-muted-foreground">
          Generates a standard RFC 6068 <code className="font-mono">mailto:</code>{" "}
          URI with percent-encoded subject and body parameters.
        </p>
      </div>
    </div>
  );
}
