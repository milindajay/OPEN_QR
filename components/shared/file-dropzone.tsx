"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FileDropzoneProps {
  id: string;
  label: string;
  accept?: string;
  helperText?: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({
  id,
  label,
  accept = "image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg",
  helperText = "PNG, JPG, WebP, or sanitized SVG (max 2 MB)",
  onFileSelect,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) {
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-label={label}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-border bg-secondary/30 hover:border-foreground/30 hover:bg-secondary/60",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-muted-foreground">
          <Upload className="h-4 w-4" />
        </div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{helperText}</p>
      </div>
    </div>
  );
}
