"use client";

import * as React from "react";
import { HexColorPicker } from "react-colorful";
import { Check, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidHexColor, normalizeHexColor } from "@/lib/utils/color-utils";
import { cn } from "@/lib/utils/cn";

export interface ColorSwatchOption {
  label: string;
  value: string;
}

export interface ColorPickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (hexColor: string) => void;
  swatches?: readonly ColorSwatchOption[];
  disabled?: boolean;
}

export function ColorPicker({
  id,
  label,
  value,
  onChange,
  swatches = [],
  disabled = false,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value.toUpperCase());
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setInputValue(value.toUpperCase());
    setHasError(false);
  }, [value]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    setInputValue(withHash.toUpperCase());

    if (isValidHexColor(withHash)) {
      setHasError(false);
      onChange(normalizeHexColor(withHash, value));
    } else {
      setHasError(true);
    }
  };

  const handleHexInputBlur = () => {
    if (!isValidHexColor(inputValue)) {
      setInputValue(value.toUpperCase());
      setHasError(false);
    } else {
      const normalized = normalizeHexColor(inputValue, value);
      setInputValue(normalized);
      setHasError(false);
    }
  };

  const handlePickerChange = (nextHex: string) => {
    const upper = nextHex.toUpperCase();
    setInputValue(upper);
    setHasError(false);
    onChange(upper);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium text-foreground">
          {label}
        </Label>
        {hasError && (
          <span
            id={`${id}-error`}
            role="alert"
            className="text-[11px] font-medium text-destructive"
          >
            Enter 3 or 6 hex digits
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          aria-label={`Toggle color spectrum for ${label}`}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <span
            className="h-4 w-4 rounded-xs border border-border/80 shadow-2xs"
            style={{ backgroundColor: value }}
          />
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        <Input
          id={id}
          type="text"
          value={inputValue}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className="h-10 font-mono text-xs uppercase"
        />
      </div>

      {isOpen && !disabled && (
        <div
          className="rounded-lg border border-border bg-secondary/40 p-3"
          data-testid={`${id}-popover`}
        >
          <HexColorPicker
            color={value}
            onChange={handlePickerChange}
            style={{ width: "100%", height: "148px" }}
          />
        </div>
      )}

      {swatches.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 pt-0.5"
          role="group"
          aria-label={`${label} preset swatches`}
        >
          {swatches.map((swatch) => {
            const isSelected =
              swatch.value.toUpperCase() === value.toUpperCase();
            return (
              <button
                key={swatch.value}
                type="button"
                disabled={disabled}
                onClick={() => handlePickerChange(swatch.value)}
                aria-label={`${label}: ${swatch.label} (${swatch.value})`}
                aria-pressed={isSelected}
                title={`${swatch.label} (${swatch.value})`}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-md border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                  isSelected
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-border"
                )}
                style={{ backgroundColor: swatch.value }}
              >
                {isSelected && (
                  <Check
                    className={cn(
                      "h-3 w-3",
                      swatch.value.toUpperCase() === "#FFFFFF" ||
                        swatch.value.toUpperCase().startsWith("#F") ||
                        swatch.value.toUpperCase().startsWith("#E")
                        ? "text-neutral-900"
                        : "text-white"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
