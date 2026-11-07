"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import type { QRPayload } from "@/types/payload";
import type { CapacityReport } from "@/types/qr";
import type { ErrorCorrectionLevel } from "@/types/design";
import type { PayloadValidationResult } from "@/lib/qr/validation/payload-validation";
import { getQRTypeMetadata } from "@/lib/constants/qr-types";
import { UrlForm } from "@/components/forms/url-form";
import { TextForm } from "@/components/forms/text-form";
import { VCardForm } from "@/components/forms/vcard-form";
import { WiFiForm } from "@/components/forms/wifi-form";
import { EmailForm } from "@/components/forms/email-form";
import { PhoneForm } from "@/components/forms/phone-form";
import { SmsForm } from "@/components/forms/sms-form";
import { LocationForm } from "@/components/forms/location-form";
import { WhatsAppForm } from "@/components/forms/whatsapp-form";
import { SocialForm } from "@/components/forms/social-form";
import { CalendarForm } from "@/components/forms/calendar-form";
import { CustomForm } from "@/components/forms/custom-form";

export interface QRFormContainerProps {
  payload: QRPayload;
  onChange: (next: QRPayload) => void;
  validation: PayloadValidationResult;
  capacity: CapacityReport;
  errorCorrection: ErrorCorrectionLevel;
}

export function QRFormContainer({
  payload,
  onChange,
  validation,
  capacity,
  errorCorrection,
}: QRFormContainerProps) {
  const typeMeta = getQRTypeMetadata(payload.type);

  return (
    <div className="space-y-4" data-testid="qr-form-container">
      {/* Active Type Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3
            className="text-xs font-semibold text-foreground"
            data-testid="active-qr-type-title"
          >
            {typeMeta.label}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {typeMeta.description}
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          <span className="text-destructive">*</span> Required field
        </span>
      </div>

      {/* Type-Specific Form Dispatcher */}
      {payload.type === "url" && (
        <UrlForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "text" && (
        <TextForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
          capacity={capacity}
          errorCorrection={errorCorrection}
        />
      )}

      {payload.type === "vcard" && (
        <VCardForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "wifi" && (
        <WiFiForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "email" && (
        <EmailForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "phone" && (
        <PhoneForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "sms" && (
        <SmsForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "location" && (
        <LocationForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "whatsapp" && (
        <WhatsAppForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "social" && (
        <SocialForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "calendar" && (
        <CalendarForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
        />
      )}

      {payload.type === "custom" && (
        <CustomForm
          value={payload}
          onChange={onChange}
          errors={validation.errors}
          capacity={capacity}
          errorCorrection={errorCorrection}
        />
      )}

      {/* Overall Capacity Overflow Error (for structured types) */}
      {validation.errors._capacity && (
        <p
          role="alert"
          data-testid="payload-capacity-error"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {validation.errors._capacity}
        </p>
      )}

      {/* Advisory Payload Warnings */}
      {validation.warnings.length > 0 && (
        <div
          className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning"
          data-testid="payload-validation-warnings"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <p key={index}>{warning}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
