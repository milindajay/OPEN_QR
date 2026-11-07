"use client";

import * as React from "react";
import { Compass } from "lucide-react";
import type { LocationPayload } from "@/types/payload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface LocationFormProps {
  value: LocationPayload;
  onChange: (next: LocationPayload) => void;
  errors: Record<string, string>;
}

export function LocationForm({ value, onChange, errors }: LocationFormProps) {
  const [latText, setLatText] = React.useState<string>(() =>
    Number.isFinite(value.latitude) ? String(value.latitude) : ""
  );
  const [lngText, setLngText] = React.useState<string>(() =>
    Number.isFinite(value.longitude) ? String(value.longitude) : ""
  );

  React.useEffect(() => {
    const parsedCurrentLat = latText.trim() === "" ? Number.NaN : Number(latText);
    if (
      Number.isFinite(value.latitude) &&
      value.latitude !== parsedCurrentLat
    ) {
      setLatText(String(value.latitude));
    } else if (!Number.isFinite(value.latitude) && latText.trim() !== "" && !Number.isNaN(parsedCurrentLat)) {
      setLatText("");
    }
  }, [value.latitude, latText]);

  React.useEffect(() => {
    const parsedCurrentLng = lngText.trim() === "" ? Number.NaN : Number(lngText);
    if (
      Number.isFinite(value.longitude) &&
      value.longitude !== parsedCurrentLng
    ) {
      setLngText(String(value.longitude));
    } else if (!Number.isFinite(value.longitude) && lngText.trim() !== "" && !Number.isNaN(parsedCurrentLng)) {
      setLngText("");
    }
  }, [value.longitude, lngText]);

  const handleLatChange = (raw: string) => {
    setLatText(raw);
    const trimmed = raw.trim();
    const numeric =
      trimmed === "" || trimmed === "-" ? Number.NaN : Number(trimmed);
    onChange({
      ...value,
      latitude: numeric,
    });
  };

  const handleLngChange = (raw: string) => {
    setLngText(raw);
    const trimmed = raw.trim();
    const numeric =
      trimmed === "" || trimmed === "-" ? Number.NaN : Number(trimmed);
    onChange({
      ...value,
      longitude: numeric,
    });
  };

  return (
    <div className="space-y-4" data-testid="form-location">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="location-latitude" className="text-xs font-medium">
              Latitude <span className="text-destructive">*</span>
            </Label>
            <span className="font-mono text-[11px] text-muted-foreground">
              -90 to 90
            </span>
          </div>
          <Input
            id="location-latitude"
            type="text"
            inputMode="decimal"
            placeholder="6.927079"
            value={latText}
            onChange={(e) => handleLatChange(e.target.value)}
            aria-invalid={Boolean(errors.latitude)}
            aria-describedby={
              errors.latitude ? "location-latitude-error" : undefined
            }
            className="h-10 font-mono"
          />
          {errors.latitude && (
            <p
              id="location-latitude-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.latitude}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="location-longitude" className="text-xs font-medium">
              Longitude <span className="text-destructive">*</span>
            </Label>
            <span className="font-mono text-[11px] text-muted-foreground">
              -180 to 180
            </span>
          </div>
          <Input
            id="location-longitude"
            type="text"
            inputMode="decimal"
            placeholder="79.861244"
            value={lngText}
            onChange={(e) => handleLngChange(e.target.value)}
            aria-invalid={Boolean(errors.longitude)}
            aria-describedby={
              errors.longitude ? "location-longitude-error" : undefined
            }
            className="h-10 font-mono"
          />
          {errors.longitude && (
            <p
              id="location-longitude-error"
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {errors.longitude}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location-label" className="text-xs font-medium">
          Location Label{" "}
          <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="location-label"
          placeholder="Colombo World Trade Center"
          value={value.label ?? ""}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Payload Format</Label>
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Location QR format"
        >
          <button
            type="button"
            role="radio"
            aria-checked={value.format === "geo"}
            data-testid="location-format-geo"
            onClick={() => onChange({ ...value, format: "geo" })}
            className={cn(
              "flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              value.format === "geo"
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            Standard RFC 5870 (geo:)
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={value.format === "google-maps"}
            data-testid="location-format-google-maps"
            onClick={() => onChange({ ...value, format: "google-maps" })}
            className={cn(
              "flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              value.format === "google-maps"
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            Google Maps Pin URL
          </button>
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <span>
          Enter decimal WGS84 coordinates (positive for North/East, negative for
          South/West). Processed locally in your browser without external map or
          geocoding APIs.
        </span>
      </p>
    </div>
  );
}
