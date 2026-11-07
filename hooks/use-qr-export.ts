"use client";

import * as React from "react";
import { toast } from "sonner";
import type { QRType } from "@/types/qr";
import type { QRDesign } from "@/types/design";
import {
  DEFAULT_JPEG_QUALITY,
  type ClipboardActionResult,
  type ExportFormat,
  type ExportOptions,
} from "@/types/export";
import { exportQrCodeBlob } from "@/lib/qr/renderer/export";
import { getExportFilename } from "@/lib/utils/naming-utils";
import { triggerBlobDownload } from "@/lib/utils/download-utils";
import {
  copyQrImageToClipboard,
  copyQrPayloadToClipboard,
} from "@/lib/utils/clipboard-utils";

export interface ExportStatusFeedback {
  type: "success" | "error";
  message: string;
}

export function useQrExport() {
  const [exportingFormat, setExportingFormat] =
    React.useState<ExportFormat | null>(null);
  const [copyingAction, setCopyingAction] = React.useState<
    "image" | "payload" | null
  >(null);
  const [statusFeedback, setStatusFeedback] =
    React.useState<ExportStatusFeedback | null>(null);

  const busyLockRef = React.useRef(false);

  const clearStatusFeedback = React.useCallback(() => {
    setStatusFeedback(null);
  }, []);

  const exportQr = React.useCallback(
    async (
      qrType: QRType,
      encodedPayload: string,
      design: QRDesign,
      format: ExportFormat,
      overrides?: Partial<Omit<ExportOptions, "format">>
    ): Promise<Blob | null> => {
      if (!encodedPayload || busyLockRef.current) {
        return null;
      }

      busyLockRef.current = true;
      const designSnapshot = structuredClone(design);
      const width = overrides?.width ?? designSnapshot.width;
      const height = overrides?.height ?? designSnapshot.height;
      const quality = overrides?.quality ?? DEFAULT_JPEG_QUALITY;
      const backgroundColor = overrides?.backgroundColor ?? "#FFFFFF";

      try {
        setExportingFormat(format);
        setStatusFeedback(null);

        const blob = await exportQrCodeBlob(encodedPayload, designSnapshot, {
          format,
          width,
          height,
          quality,
          backgroundColor,
        });

        const filename = getExportFilename(qrType, format);
        triggerBlobDownload(blob, filename);

        const detail =
          format === "svg"
            ? `Downloaded ${filename} (Vector SVG)`
            : `Downloaded ${filename} (${width}×${height}px)`;

        setStatusFeedback({
          type: "success",
          message: detail,
        });
        toast.success(detail);
        return blob;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to export QR code.";
        setStatusFeedback({
          type: "error",
          message,
        });
        toast.error(message);
        return null;
      } finally {
        busyLockRef.current = false;
        setExportingFormat(null);
      }
    },
    []
  );

  const copyImage = React.useCallback(
    async (
      qrType: QRType,
      encodedPayload: string,
      design: QRDesign,
      dimensionOverride?: number
    ): Promise<ClipboardActionResult | null> => {
      if (!encodedPayload || busyLockRef.current) {
        return null;
      }

      busyLockRef.current = true;
      const designSnapshot = structuredClone(design);

      try {
        setCopyingAction("image");
        setStatusFeedback(null);

        const result = await copyQrImageToClipboard(
          qrType,
          encodedPayload,
          designSnapshot,
          dimensionOverride
        );

        setStatusFeedback({
          type: result.success ? "success" : "error",
          message: result.message,
        });

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }

        return result;
      } finally {
        busyLockRef.current = false;
        setCopyingAction(null);
      }
    },
    []
  );

  const copyPayload = React.useCallback(
    async (encodedPayload: string): Promise<ClipboardActionResult | null> => {
      if (!encodedPayload || busyLockRef.current) {
        return null;
      }

      busyLockRef.current = true;

      try {
        setCopyingAction("payload");
        setStatusFeedback(null);

        const result = await copyQrPayloadToClipboard(encodedPayload);

        setStatusFeedback({
          type: result.success ? "success" : "error",
          message: result.message,
        });

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }

        return result;
      } finally {
        busyLockRef.current = false;
        setCopyingAction(null);
      }
    },
    []
  );

  const isBusy = exportingFormat !== null || copyingAction !== null;

  return {
    exportingFormat,
    copyingAction,
    isBusy,
    statusFeedback,
    clearStatusFeedback,
    exportQr,
    copyImage,
    copyPayload,
  };
}
