"use client";

import * as React from "react";
import { Globe, Sparkles } from "lucide-react";
import type { UrlPayload } from "@/types/payload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface UrlFormProps {
  value: UrlPayload;
  onChange: (next: UrlPayload) => void;
  errors: Record<string, string>;
}

const MISSING_PROTOCOL_CANDIDATE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9-]+)+(?:\/.*)?$/;

export function UrlForm({ value, onChange, errors }: UrlFormProps) {
  const trimmed = value.url.trim();
  const canPrependHttps =
    trimmed.length > 0 &&
    !/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed) &&
    MISSING_PROTOCOL_CANDIDATE.test(trimmed);

  return (
    <div className="space-y-3" data-testid="form-url">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="qr-url-input" className="text-xs font-medium">
            Website URL <span className="text-destructive">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground">
            HTTP or HTTPS required
          </span>
        </div>

        <div className="relative">
          <Input
            id="qr-url-input"
            type="url"
            placeholder="https://example.com/landing-page"
            value={value.url}
            onChange={(e) => onChange({ type: "url", url: e.target.value })}
            aria-invalid={Boolean(errors.url)}
            aria-describedby={
              errors.url ? "qr-url-error qr-url-help" : "qr-url-help"
            }
            className="h-10"
          />
        </div>

        {canPrependHttps && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">
              Missing protocol scheme. Prepend{" "}
              <code className="font-mono text-foreground">https://</code>?
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-testid="url-prepend-https-btn"
              onClick={() =>
                onChange({ type: "url", url: `https://${trimmed}` })
              }
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              <Sparkles className="h-3 w-3" />
              <span>Use https://{trimmed}</span>
            </Button>
          </div>
        )}

        {errors.url && (
          <p
            id="qr-url-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.url}
          </p>
        )}

        <p
          id="qr-url-help"
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <Globe className="h-3 w-3 shrink-0" />
          <span>
            Direct link encoding: query strings and fragments are preserved
            verbatim with zero URL shorteners or tracking redirects.
          </span>
        </p>
      </div>
    </div>
  );
}
