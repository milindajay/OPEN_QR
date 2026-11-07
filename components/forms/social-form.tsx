"use client";

import * as React from "react";
import type { SocialPayload, SocialProvider } from "@/types/payload";
import {
  getSocialPlatformMetadata,
  SOCIAL_PLATFORMS,
} from "@/lib/constants/social-platforms";
import { generateSocialPayload } from "@/lib/qr/payloads/social";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface SocialFormProps {
  value: SocialPayload;
  onChange: (next: SocialPayload) => void;
  errors: Record<string, string>;
}

export function SocialForm({ value, onChange, errors }: SocialFormProps) {
  const activeMeta = getSocialPlatformMetadata(value.provider);
  const isValidPreview = !errors.url && value.url.trim().length > 0;
  const resolvedUrl = isValidPreview ? generateSocialPayload(value) : "";

  const handlePlatformSelect = (provider: SocialProvider) => {
    onChange({
      ...value,
      provider,
    });
  };

  return (
    <div className="space-y-4" data-testid="form-social">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Social Platform</Label>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-5"
          role="radiogroup"
          aria-label="Social media platform"
        >
          {SOCIAL_PLATFORMS.map((platform) => {
            const isSelected = value.provider === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`social-provider-${platform.id}`}
                onClick={() => handlePlatformSelect(platform.id)}
                className={cn(
                  "flex min-h-10 items-center justify-center rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                {platform.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="social-handle-input" className="text-xs font-medium">
            {activeMeta.inputLabel} <span className="text-destructive">*</span>
          </Label>
          {resolvedUrl && (
            <span
              className="max-w-full truncate font-mono text-[11px] text-muted-foreground"
              data-testid="social-resolved-url"
            >
              {resolvedUrl}
            </span>
          )}
        </div>

        <Input
          id="social-handle-input"
          placeholder={activeMeta.placeholder}
          value={value.url}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          aria-invalid={Boolean(errors.url)}
          aria-describedby={
            errors.url ? "social-url-error social-url-help" : "social-url-help"
          }
          className="h-10"
        />

        {errors.url && (
          <p
            id="social-url-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.url}
          </p>
        )}

        <p id="social-url-help" className="text-[11px] text-muted-foreground">
          {activeMeta.helperText}
        </p>
      </div>
    </div>
  );
}
