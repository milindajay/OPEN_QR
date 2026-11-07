"use client";

import * as React from "react";
import {
  Calendar,
  Code2,
  Contact,
  FileText,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Share2,
  Wifi,
} from "lucide-react";
import type { QRType } from "@/types/qr";
import { QR_TYPES } from "@/lib/constants/qr-types";
import { cn } from "@/lib/utils/cn";

export interface QRTypeSelectorProps {
  activeType: QRType;
  onSelectType: (type: QRType) => void;
}

const QR_TYPE_ICONS: Record<
  QRType,
  React.ComponentType<{ className?: string }>
> = {
  url: Link2,
  text: FileText,
  vcard: Contact,
  wifi: Wifi,
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  location: MapPin,
  whatsapp: MessageCircle,
  social: Share2,
  calendar: Calendar,
  custom: Code2,
};

export function QRTypeSelector({
  activeType,
  onSelectType,
}: QRTypeSelectorProps) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5 rounded-xl bg-secondary/60 p-1.5 sm:grid-cols-4 md:grid-cols-6"
      role="tablist"
      aria-label="QR code type"
      data-testid="qr-type-selector"
    >
      {QR_TYPES.map((item) => {
        const Icon = QR_TYPE_ICONS[item.id];
        const isSelected = activeType === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            data-testid={`qr-type-${item.id}`}
            onClick={() => onSelectType(item.id)}
            className={cn(
              "relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-center text-[11px] font-medium transition-all",
              isSelected
                ? "bg-background text-foreground shadow-2xs ring-1 ring-border"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isSelected ? "text-accent" : "text-muted-foreground"
              )}
            />
            <span className="sr-only">{item.label}</span>
            <span aria-hidden="true" className="truncate">
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
