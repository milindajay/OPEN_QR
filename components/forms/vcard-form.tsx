"use client";

import * as React from "react";
import type { VCardPayload } from "@/types/payload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface VCardFormProps {
  value: VCardPayload;
  onChange: (next: VCardPayload) => void;
  errors: Record<string, string>;
}

export function VCardForm({ value, onChange, errors }: VCardFormProps) {
  const updateField = <K extends keyof VCardPayload>(
    key: K,
    fieldValue: VCardPayload[K]
  ) => {
    const next: VCardPayload = {
      ...value,
      [key]: fieldValue,
    };

    if (key === "firstName" || key === "lastName") {
      const first = (key === "firstName" ? String(fieldValue ?? "") : value.firstName ?? "").trim();
      const last = (key === "lastName" ? String(fieldValue ?? "") : value.lastName ?? "").trim();
      next.fullName = [first, last].filter(Boolean).join(" ");
    }

    onChange(next);
  };

  return (
    <div className="space-y-5" data-testid="form-vcard">
      {/* Section 1: Name & Identity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact Identity
          </h3>
          <span className="text-[11px] text-muted-foreground">
            First or last name required
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vcard-first-name" className="text-xs">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="vcard-first-name"
              placeholder="Ada"
              value={value.firstName ?? ""}
              onChange={(e) => updateField("firstName", e.target.value)}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "vcard-name-error" : undefined}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vcard-last-name" className="text-xs">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="vcard-last-name"
              placeholder="Lovelace"
              value={value.lastName ?? ""}
              onChange={(e) => updateField("lastName", e.target.value)}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "vcard-name-error" : undefined}
              className="h-10"
            />
          </div>
        </div>

        {errors.fullName && (
          <p
            id="vcard-name-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Section 2: Organization & Role */}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Organization & Role
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vcard-organization" className="text-xs">
              Organization <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="vcard-organization"
              placeholder="OpenQR Studio"
              value={value.organization ?? ""}
              onChange={(e) => updateField("organization", e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vcard-job-title" className="text-xs">
              Job Title <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="vcard-job-title"
              placeholder="Principal Systems Architect"
              value={value.jobTitle ?? ""}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Contact Details */}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Direct Contact
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vcard-phone" className="text-xs">
              Phone Number <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="vcard-phone"
              type="tel"
              placeholder="+1 (415) 555-0199"
              value={value.phone ?? ""}
              onChange={(e) => updateField("phone", e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "vcard-phone-error" : undefined}
              className="h-10"
            />
            {errors.phone && (
              <p
                id="vcard-phone-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vcard-email" className="text-xs">
              Email Address <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="vcard-email"
              type="email"
              placeholder="ada@openqr.studio"
              value={value.email ?? ""}
              onChange={(e) => updateField("email", e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "vcard-email-error" : undefined}
              className="h-10"
            />
            {errors.email && (
              <p
                id="vcard-email-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vcard-website" className="text-xs">
            Website <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="vcard-website"
            type="url"
            placeholder="https://openqr.studio"
            value={value.website ?? ""}
            onChange={(e) => updateField("website", e.target.value)}
            aria-invalid={Boolean(errors.website)}
            aria-describedby={errors.website ? "vcard-website-error" : undefined}
            className="h-10"
          />
          {errors.website && (
            <p
              id="vcard-website-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.website}
            </p>
          )}
        </div>
      </div>

      {/* Section 4: Physical Address */}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Address <span className="font-normal normal-case">(Optional)</span>
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="vcard-street" className="text-xs">
            Street Address
          </Label>
          <Input
            id="vcard-street"
            placeholder="100 Innovation Way, Suite 400"
            value={value.street ?? ""}
            onChange={(e) => updateField("street", e.target.value)}
            className="h-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vcard-city" className="text-xs">
              City
            </Label>
            <Input
              id="vcard-city"
              placeholder="San Francisco"
              value={value.city ?? ""}
              onChange={(e) => updateField("city", e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vcard-region" className="text-xs">
              State / Province
            </Label>
            <Input
              id="vcard-region"
              placeholder="CA"
              value={value.region ?? ""}
              onChange={(e) => updateField("region", e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vcard-postal-code" className="text-xs">
              Postal Code
            </Label>
            <Input
              id="vcard-postal-code"
              placeholder="94107"
              value={value.postalCode ?? ""}
              onChange={(e) => updateField("postalCode", e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vcard-country" className="text-xs">
              Country
            </Label>
            <Input
              id="vcard-country"
              placeholder="United States"
              value={value.country ?? ""}
              onChange={(e) => updateField("country", e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
