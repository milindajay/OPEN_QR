import type QRCodeStylingType from "qr-code-styling";
import type { QRDesign } from "@/types/design";
import type { ExportOptions } from "@/types/export";
import {
  mapDesignToEngineOptions,
  type QRRendererAdapter,
} from "@/lib/qr/renderer/qr-adapter";
import { estimateQrCapacity } from "@/lib/qr/validation/qr-capacity";

interface InternalQRCodeStylingInstance {
  _svgDrawingPromise?: Promise<void>;
}

async function loadQrCodeStylingConstructor(): Promise<
  typeof QRCodeStylingType
> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error(
      "QR rendering engine can only be initialized in a browser environment."
    );
  }
  const mod = await import("qr-code-styling");
  return mod.default;
}

/**
 * Browser-only QR rendering engine implementing QRRendererAdapter.
 * Dynamically imports qr-code-styling on the client and guarantees deterministic
 * DOM cleanup and complete SVG/logo drawing across updates.
 */
export class BrowserQRRenderer implements QRRendererAdapter {
  private instance: QRCodeStylingType | null = null;
  private container: HTMLElement | null = null;
  private isDestroyed = false;
  private renderSequence = 0;

  async mount(container: HTMLElement): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    this.isDestroyed = false;
    this.container = container;
    this.container.replaceChildren();
  }

  async update(encodedPayload: string, design: QRDesign): Promise<void> {
    if (typeof window === "undefined" || this.isDestroyed) {
      return;
    }

    const currentSequence = ++this.renderSequence;

    if (!encodedPayload || encodedPayload.length === 0) {
      if (this.container) {
        this.container.replaceChildren();
      }
      this.instance = null;
      return;
    }

    const capacity = estimateQrCapacity(encodedPayload, design.errorCorrection);
    if (capacity.isExceeded) {
      throw new Error(
        `Payload length (${capacity.byteLength} UTF-8 bytes) exceeds maximum QR capacity (${capacity.maxBytes} bytes) at error correction level ${design.errorCorrection}.`
      );
    }

    const QRCodeStyling = await loadQrCodeStylingConstructor();
    if (this.isDestroyed || currentSequence !== this.renderSequence) {
      return;
    }

    const options = mapDesignToEngineOptions(encodedPayload, design, "svg");

    if (!this.instance) {
      this.instance = new QRCodeStyling(options);
      if (this.container) {
        this.container.replaceChildren();
        this.instance.append(this.container);
      }
    } else {
      this.instance.update(options);
      if (this.container && this.container.childNodes.length === 0) {
        this.instance.append(this.container);
      }
    }

    const internalInstance =
      this.instance as unknown as InternalQRCodeStylingInstance;
    if (internalInstance._svgDrawingPromise) {
      await internalInstance._svgDrawingPromise;
    }
  }

  async exportBlob(
    encodedPayload: string,
    design: QRDesign,
    options: ExportOptions
  ): Promise<Blob> {
    const { exportQrCodeBlob } = await import("@/lib/qr/renderer/export");
    return exportQrCodeBlob(encodedPayload, design, options);
  }

  destroy(): void {
    this.isDestroyed = true;
    this.renderSequence++;
    if (this.container) {
      this.container.replaceChildren();
    }
    this.instance = null;
    this.container = null;
  }
}

export function createQRRenderer(): QRRendererAdapter {
  return new BrowserQRRenderer();
}
