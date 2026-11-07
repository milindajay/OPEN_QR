"use client";

import * as React from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import type { WiFiPayload } from "@/types/payload";
import { getUtf8ByteLength } from "@/lib/qr/encoding/utf8";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";

export interface WiFiFormProps {
  value: WiFiPayload;
  onChange: (next: WiFiPayload) => void;
  errors: Record<string, string>;
}

const SECURITY_OPTIONS: ReadonlyArray<{
  id: WiFiPayload["security"];
  label: string;
  description: string;
}> = [
  {
    id: "WPA",
    label: "WPA / WPA2 / WPA3",
    description:
      "Recommended for modern home and enterprise routers (8–63 character passphrase).",
  },
  {
    id: "WEP",
    label: "WEP (Legacy)",
    description:
      "Legacy encryption requiring 5 or 13 ASCII characters, or 10 or 26 hex digits.",
  },
  {
    id: "nopass",
    label: "No Password (Open)",
    description:
      "Unencrypted guest or public Wi-Fi network without a password.",
  },
];

export function WiFiForm({ value, onChange, errors }: WiFiFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const ssidBytes = getUtf8ByteLength(value.ssid.trim());
  const activeSecurityMeta =
    SECURITY_OPTIONS.find((opt) => opt.id === value.security) ??
    SECURITY_OPTIONS[0]!;

  const handleSecurityChange = (security: WiFiPayload["security"]) => {
    onChange({
      ...value,
      security,
      password: security === "nopass" ? "" : value.password ?? "",
    });
  };

  return (
    <div className="space-y-4" data-testid="form-wifi">
      {/* SSID Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="wifi-ssid" className="text-xs font-medium">
            Network Name (SSID) <span className="text-destructive">*</span>
          </Label>
          <span className="font-mono text-[11px] text-muted-foreground">
            {ssidBytes} / 32 UTF-8 bytes
          </span>
        </div>
        <Input
          id="wifi-ssid"
          placeholder="Office_5G_Guest"
          value={value.ssid}
          onChange={(e) => onChange({ ...value, ssid: e.target.value })}
          aria-invalid={Boolean(errors.ssid)}
          aria-describedby={errors.ssid ? "wifi-ssid-error" : undefined}
          className="h-10"
        />
        {errors.ssid && (
          <p
            id="wifi-ssid-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.ssid}
          </p>
        )}
      </div>

      {/* Security Type Selector */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Security Type</Label>
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Wi-Fi security type"
        >
          {SECURITY_OPTIONS.map((option) => {
            const isSelected = value.security === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                data-testid={`wifi-security-${option.id}`}
                onClick={() => handleSecurityChange(option.id)}
                className={cn(
                  "flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span>{activeSecurityMeta.description}</span>
        </p>
      </div>

      {/* Password Input (Hidden/Disabled when security === nopass) */}
      {value.security !== "nopass" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="wifi-password" className="text-xs font-medium">
              Network Password <span className="text-destructive">*</span>
            </Label>
            <span className="text-[11px] text-muted-foreground">
              Special characters escaped automatically
            </span>
          </div>
          <div className="relative">
            <Input
              id="wifi-password"
              type={showPassword ? "text" : "password"}
              placeholder={
                value.security === "WPA"
                  ? "Minimum 8 characters"
                  : "5/13 ASCII chars or 10/26 hex digits"
              }
              value={value.password ?? ""}
              onChange={(e) => onChange({ ...value, password: e.target.value })}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "wifi-password-error" : undefined
              }
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              data-testid="wifi-toggle-password"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              id="wifi-password-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.password}
            </p>
          )}
        </div>
      )}

      {/* Hidden Network Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3.5 py-2.5">
        <div className="space-y-0.5">
          <Label htmlFor="wifi-hidden-switch" className="text-xs font-medium">
            Hidden Network
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Enable if this router does not broadcast its SSID publicly.
          </p>
        </div>
        <Switch
          id="wifi-hidden-switch"
          aria-label="Hidden Network"
          checked={value.hidden}
          onCheckedChange={(checked) =>
            onChange({ ...value, hidden: Boolean(checked) })
          }
        />
      </div>
    </div>
  );
}
