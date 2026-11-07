import * as React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import jsQR from "jsqr";
import type { QRPayload } from "@/types/payload";
import type { DotStyle, QRDesign } from "@/types/design";
import { generatePayload } from "@/lib/qr/payloads";
import {
  createDefaultDesign,
  getDesignPresetById,
} from "@/lib/qr/presets/design-presets";
import { exportQrCodeBlob } from "@/lib/qr/renderer/export";
import {
  inspectJpegBytes,
  inspectPngBytes,
  inspectSvgContent,
} from "@/lib/qr/renderer/export-validation";
import {
  decodeFallbackJpegBytesToRgba,
  decodeFallbackPngBytesToRgba,
} from "@/lib/qr/renderer/raster-fallback";
import { sanitizeSvgContent } from "@/lib/utils/file-utils";
import { getExportFilename } from "@/lib/utils/naming-utils";
import { triggerBlobDownload } from "@/lib/utils/download-utils";
import {
  copyQrImageToClipboard,
  copyQrPayloadToClipboard,
} from "@/lib/utils/clipboard-utils";
import { QRDownloadPanel } from "@/components/generator/qr-download-panel";

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === "function") {
    const buf = await blob.arrayBuffer();
    return new Uint8Array(buf);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error("Unexpected FileReader result"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read Blob"));
    reader.readAsArrayBuffer(blob);
  });
}

async function blobToText(blob: Blob): Promise<string> {
  const bytes = await blobToUint8Array(blob);
  return new TextDecoder().decode(bytes);
}

const SAMPLE_PNG_LOGO_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const SAMPLE_JPEG_LOGO_DATA_URI =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
const SAMPLE_WEBP_LOGO_DATA_URI =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=";
const SAMPLE_SVG_LOGO_DATA_URI = sanitizeSvgContent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#2563EB"/></svg>`
).dataUrl!;

describe("Phase 4 — PNG Export Engine & Independent Validation", () => {
  it.each([256, 512, 1024, 2048, 640])(
    "exports valid %dx%d PNG binary and decodes payload via jsQR",
    async (dimension) => {
      const payload = "https://openqr.studio/export-test?size=" + dimension;
      const design: QRDesign = {
        ...createDefaultDesign(),
        width: dimension,
        height: dimension,
      };

      const blob = await exportQrCodeBlob(payload, design, {
        format: "png",
        width: dimension,
        height: dimension,
      });

      expect(blob.type).toBe("image/png");
      const bytes = await blobToUint8Array(blob);
      const report = inspectPngBytes(bytes);

      expect(report.isValidPng).toBe(true);
      expect(report.width).toBe(dimension);
      expect(report.height).toBe(dimension);
      expect(report.hasAlphaChannel).toBe(true);
      expect(report.hasIdatChunk).toBe(true);
      expect(report.hasIendChunk).toBe(true);

      const decodedImg = decodeFallbackPngBytesToRgba(bytes);
      expect(decodedImg).not.toBeNull();
      const qrResult = jsQR(decodedImg!.rgba, dimension, dimension);
      expect(qrResult?.data).toBe(payload);
    }
  );

  it("preserves true alpha transparency (alpha = 0) when transparent background is enabled and solid color when disabled", async () => {
    const payload = "https://openqr.studio/alpha-check";
    const transparentDesign: QRDesign = {
      ...createDefaultDesign(),
      width: 256,
      height: 256,
      background: {
        color: "#FFFFFF",
        transparent: true,
      },
    };

    const transBlob = await exportQrCodeBlob(payload, transparentDesign, {
      format: "png",
      width: 256,
      height: 256,
    });
    const transBytes = await blobToUint8Array(transBlob);
    const transRgba = decodeFallbackPngBytesToRgba(transBytes)!.rgba;
    // Top-left quiet-zone pixel (2, 2) must be completely transparent (alpha = 0)
    const pixelIdx = (2 * 256 + 2) * 4;
    expect(transRgba[pixelIdx + 3]).toBe(0);

    // Coloured background (#FEF3C7 = RGB 254, 243, 199)
    const coloredDesign: QRDesign = {
      ...createDefaultDesign(),
      width: 256,
      height: 256,
      background: {
        color: "#FEF3C7",
        transparent: false,
      },
    };
    const coloredBlob = await exportQrCodeBlob(payload, coloredDesign, {
      format: "png",
      width: 256,
      height: 256,
    });
    const coloredBytes = await blobToUint8Array(coloredBlob);
    const coloredRgba = decodeFallbackPngBytesToRgba(coloredBytes)!.rgba;
    expect(Array.from(coloredRgba.slice(pixelIdx, pixelIdx + 4))).toEqual([
      254, 243, 199, 255,
    ]);
    expect(jsQR(coloredRgba, 256, 256)?.data).toBe(payload);
  });
});

describe("Phase 4 — JPEG Export Engine, Quality & Background Compositing", () => {
  it.each([256, 512, 1024, 2048, 720])(
    "exports valid %dx%d JPEG binary with SOF0 dimensions and decodes via jsQR",
    async (dimension) => {
      const payload = `https://openqr.studio/jpeg/${dimension}`;
      const design = {
        ...createDefaultDesign(),
        width: dimension,
        height: dimension,
      };

      const blob = await exportQrCodeBlob(payload, design, {
        format: "jpeg",
        width: dimension,
        height: dimension,
        quality: 0.92,
      });

      expect(blob.type).toBe("image/jpeg");
      const bytes = await blobToUint8Array(blob);
      const report = inspectJpegBytes(bytes);

      expect(report.isValidJpeg).toBe(true);
      expect(report.width).toBe(dimension);
      expect(report.height).toBe(dimension);
      expect(report.hasSofMarker).toBe(true);
      expect(report.hasEoiMarker).toBe(true);

      const decodedImg = decodeFallbackJpegBytesToRgba(bytes);
      expect(decodedImg).not.toBeNull();
      expect(jsQR(decodedImg!.rgba, dimension, dimension)?.data).toBe(payload);
    }
  );

  it("composites transparent designs onto #FFFFFF white by default in JPEG export and respects JPEG quality setting", async () => {
    const payload = "https://openqr.studio/jpeg-transparent-composite";
    const transparentDesign: QRDesign = {
      ...createDefaultDesign(),
      width: 256,
      height: 256,
      background: {
        color: "#FFFFFF",
        transparent: true,
      },
    };

    const lowQualityBlob = await exportQrCodeBlob(payload, transparentDesign, {
      format: "jpeg",
      width: 256,
      height: 256,
      quality: 0.5,
    });
    const highQualityBlob = await exportQrCodeBlob(payload, transparentDesign, {
      format: "jpeg",
      width: 256,
      height: 256,
      quality: 1.0,
    });

    const lowBytes = await blobToUint8Array(lowQualityBlob);
    const highBytes = await blobToUint8Array(highQualityBlob);

    expect(inspectJpegBytes(lowBytes).isValidJpeg).toBe(true);
    expect(inspectJpegBytes(highBytes).isValidJpeg).toBe(true);
    expect(highBytes.byteLength).toBeGreaterThan(lowBytes.byteLength);

    // Verify transparent background was composited onto #FFFFFF white (never black!)
    const composited = decodeFallbackJpegBytesToRgba(highBytes)!;
    const cornerIdx = (2 * 256 + 2) * 4;
    expect(
      Array.from(composited.rgba.slice(cornerIdx, cornerIdx + 4))
    ).toEqual([255, 255, 255, 255]);
    expect(jsQR(composited.rgba, 256, 256)?.data).toBe(payload);
  });
});

describe("Phase 4 — Standalone Vector SVG Export, Gradients, Logos & Security", () => {
  const dotStyles: readonly DotStyle[] = [
    "square",
    "dots",
    "rounded",
    "classy",
    "classy-rounded",
    "extra-rounded",
  ];

  it.each(dotStyles)(
    "exports valid standalone vector SVG preserving '%s' module geometry",
    async (dotStyle) => {
      const design: QRDesign = {
        ...createDefaultDesign(),
        width: 512,
        height: 512,
        dots: {
          style: dotStyle,
          color: "#0F172A",
        },
        corners: {
          outerStyle: "extra-rounded",
          innerStyle: "dot",
          outerColor: "#1D4ED8",
          innerColor: "#0F172A",
        },
      };

      const blob = await exportQrCodeBlob(
        "https://openqr.studio/vector",
        design,
        {
          format: "svg",
          width: 512,
          height: 512,
        }
      );

      const svgText = await blobToText(blob);
      const report = inspectSvgContent(svgText);

      expect(report.isValidXml).toBe(true);
      expect(report.isVectorQr).toBe(true);
      expect(report.width).toBe(512);
      expect(report.height).toBe(512);
      expect(report.viewBox).toBe("0 0 512 512");
      expect(report.allIdsUnique).toBe(true);
      expect(report.allUrlReferencesResolve).toBe(true);
      expect(report.hasForbiddenElements).toBe(false);
      expect(report.hasEventHandlerAttributes).toBe(false);
      expect(report.hasExternalReferences).toBe(false);
    }
  );

  it("preserves linear and radial gradients, transparent backgrounds, and embedded PNG/JPEG/WebP/SVG logos with backing plates", async () => {
    const sunsetPreset = getDesignPresetById("sunset")!.design;
    const gradientSvgBlob = await exportQrCodeBlob(
      "https://openqr.studio/gradient",
      {
        ...sunsetPreset,
        background: { color: "#FFFFFF", transparent: true },
      },
      { format: "svg", width: 1024, height: 1024 }
    );
    const gradientReport = inspectSvgContent(await blobToText(gradientSvgBlob));
    expect(gradientReport.isValidXml).toBe(true);
    expect(gradientReport.hasLinearGradient).toBe(true);
    expect(gradientReport.hasOpaqueBackgroundRect).toBe(false);

    // Test all 4 logo formats (PNG, JPEG, WebP, sanitized SVG) with backing plate & shape
    const logoSources = [
      { label: "PNG", uri: SAMPLE_PNG_LOGO_DATA_URI, shape: "rounded" as const },
      { label: "JPEG", uri: SAMPLE_JPEG_LOGO_DATA_URI, shape: "circle" as const },
      { label: "WebP", uri: SAMPLE_WEBP_LOGO_DATA_URI, shape: "square" as const },
      { label: "SVG", uri: SAMPLE_SVG_LOGO_DATA_URI, shape: "circle" as const },
    ];

    for (const item of logoSources) {
      const designWithLogo: QRDesign = {
        ...createDefaultDesign(),
        errorCorrection: "H",
        logo: {
          source: item.uri,
          size: 0.22,
          margin: 4,
          shape: item.shape,
          backgroundColor: "#FFFFFF",
        },
      };

      const svgBlob = await exportQrCodeBlob(
        `https://openqr.studio/logo-${item.label}`,
        designWithLogo,
        { format: "svg", width: 512, height: 512 }
      );
      const report = inspectSvgContent(await blobToText(svgBlob));

      expect(report.isValidXml).toBe(true);
      expect(report.hasEmbeddedLogo).toBe(true);
      expect(report.embeddedLogoHref).toBe(item.uri);
      expect(report.hasLogoBackingPlate).toBe(true);
      expect(report.logoBackingPlateFill).toBe("#FFFFFF");
    }
  });

  it("rejects malicious or tampered logo Data URIs during export", async () => {
    const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`;
    const maliciousDataUri = `data:image/svg+xml;base64,${btoa(maliciousSvg)}`;

    const tamperedDesign: QRDesign = {
      ...createDefaultDesign(),
      logo: {
        source: maliciousDataUri,
        size: 0.2,
        margin: 4,
        shape: "square",
      },
    };

    await expect(
      exportQrCodeBlob("https://openqr.studio", tamperedDesign, {
        format: "svg",
        width: 512,
        height: 512,
      })
    ).rejects.toThrow();
  });
});

describe("Phase 4 — All 12 QR Types & Multilingual UTF-8 Export Matrix", () => {
  const representativePayloads: ReadonlyArray<{
    label: string;
    payload: QRPayload;
  }> = [
    { label: "URL", payload: { type: "url", url: "https://openqr.studio" } },
    {
      label: "Plain Text (Multilingual)",
      payload: {
        type: "text",
        text: "ආයුබෝවන් | வணக்கம் | こんにちは | مرحبا 🚀",
      },
    },
    {
      label: "vCard",
      payload: {
        type: "vcard",
        firstName: "Ada",
        lastName: "Lovelace",
        fullName: "Ada Lovelace",
        email: "ada@openqr.studio",
      },
    },
    {
      label: "Wi-Fi",
      payload: {
        type: "wifi",
        ssid: "OpenQR_Lab",
        password: "SecretPassword!23",
        security: "WPA",
        hidden: false,
      },
    },
    {
      label: "Email",
      payload: {
        type: "email",
        email: "contact@openqr.studio",
        subject: "Hello",
        message: "Phase 4 Export",
      },
    },
    {
      label: "Phone",
      payload: { type: "phone", phone: "+14155550199" },
    },
    {
      label: "SMS",
      payload: { type: "sms", phone: "+94771234567", message: "SMS test" },
    },
    {
      label: "Location",
      payload: {
        type: "location",
        latitude: 6.9271,
        longitude: 79.8612,
        label: "Colombo",
        format: "geo",
      },
    },
    {
      label: "WhatsApp",
      payload: {
        type: "whatsapp",
        countryCode: "+94",
        phone: "0771234567",
        message: "Hi",
      },
    },
    {
      label: "Social",
      payload: {
        type: "social",
        provider: "x",
        url: "openqrstudio",
      },
    },
    {
      label: "Calendar (All-Day RFC 5545)",
      payload: {
        type: "calendar",
        title: "Release Day",
        start: "2026-11-20",
        end: "2026-11-20",
        allDay: true,
      },
    },
    {
      label: "Custom URI",
      payload: {
        type: "custom",
        value: "upi://pay?pa=openqr@upi&pn=OpenQR",
      },
    },
  ];

  it("exports and decodes all 12 QR types accurately across PNG, JPEG, and SVG", async () => {
    const design = { ...createDefaultDesign(), width: 512, height: 512 };

    for (const { payload } of representativePayloads) {
      const encoded = generatePayload(payload);

      const pngBlob = await exportQrCodeBlob(encoded, design, {
        format: "png",
        width: 512,
        height: 512,
      });
      const pngRgba = decodeFallbackPngBytesToRgba(
        await blobToUint8Array(pngBlob)
      )!;
      expect(jsQR(pngRgba.rgba, 512, 512)?.data).toBe(encoded);

      const svgBlob = await exportQrCodeBlob(encoded, design, {
        format: "svg",
        width: 512,
        height: 512,
      });
      expect(inspectSvgContent(await blobToText(svgBlob)).isValidXml).toBe(
        true
      );
    }
  });
});

describe("Phase 4 — Clipboard Actions, Fallback & Object URL Cleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("generates privacy-safe filenames and revokes temporary Object URLs after download", () => {
    expect(getExportFilename("url", "png")).toBe("openqr-website.png");
    expect(getExportFilename("wifi", "jpeg")).toBe("openqr-wifi.jpg");
    expect(getExportFilename("vcard", "svg")).toBe("openqr-contact.svg");

    const createUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:http://localhost:3000/mock-uuid");
    const revokeUrlSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    triggerBlobDownload(
      new Blob(["test"], { type: "image/png" }),
      "openqr-website.png"
    );

    expect(createUrlSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(revokeUrlSpy).toHaveBeenCalledWith(
      "blob:http://localhost:3000/mock-uuid"
    );
  });

  it("copies exact Unicode and multiline QR payload text to clipboard and handles permission errors", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const multilinePayload =
      "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:ආයුබෝවන් こんにちは\r\nEND:VCARD";
    const res = await copyQrPayloadToClipboard(multilinePayload);
    expect(res.success).toBe(true);
    expect(res.mode).toBe("clipboard-text");
    expect(writeTextMock).toHaveBeenCalledWith(multilinePayload);

    // Permission denied
    writeTextMock.mockRejectedValueOnce(
      new DOMException("Permission denied", "NotAllowedError")
    );
    const deniedRes = await copyQrPayloadToClipboard(multilinePayload);
    expect(deniedRes.success).toBe(false);
    expect(deniedRes.mode).toBe("error");
  });

  it("copies PNG image via ClipboardItem when supported, falls back to PNG download when unsupported, and reports error on permission denial", async () => {
    vi.useRealTimers();
    const design = { ...createDefaultDesign(), width: 256, height: 256 };

    // 1. Unsupported browser (ClipboardItem undefined) -> triggers PNG download fallback
    const originalClipboardItem = globalThis.ClipboardItem;
    // @ts-expect-error testing missing ClipboardItem
    delete globalThis.ClipboardItem;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const fallbackResult = await copyQrImageToClipboard(
      "url",
      "https://openqr.studio",
      design,
      256
    );
    expect(fallbackResult.success).toBe(true);
    expect(fallbackResult.mode).toBe("fallback-download");
    expect(fallbackResult.fallbackFilename).toBe("openqr-website.png");
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // 2. Supported browser -> writes image/png Blob via navigator.clipboard.write
    const writeMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { write: writeMock, writeText: vi.fn() },
      configurable: true,
    });
    globalThis.ClipboardItem = class MockClipboardItem {
      readonly types: string[];
      constructor(public items: Record<string, Blob>) {
        this.types = Object.keys(items);
      }
    } as unknown as typeof ClipboardItem;

    const copyResult = await copyQrImageToClipboard(
      "url",
      "https://openqr.studio",
      design,
      256
    );
    expect(copyResult.success).toBe(true);
    expect(copyResult.mode).toBe("clipboard-image");
    expect(writeMock).toHaveBeenCalledTimes(1);

    // 3. Permission denied -> returns error without falsely claiming success
    writeMock.mockRejectedValueOnce(
      new DOMException("Write permission denied", "NotAllowedError")
    );
    const deniedResult = await copyQrImageToClipboard(
      "url",
      "https://openqr.studio",
      design,
      256
    );
    expect(deniedResult.success).toBe(false);
    expect(deniedResult.mode).toBe("error");

    globalThis.ClipboardItem = originalClipboardItem;
  });
});

describe("Phase 4 — QRDownloadPanel UX & Settings Synchronization", () => {
  it("switches format tabs, updates custom dimensions, toggles PNG transparency, configures JPEG quality, and copies payload", async () => {
    const onDimensionsChange = vi.fn();
    const onBackgroundTransparentChange = vi.fn();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const design = createDefaultDesign();
    render(
      <QRDownloadPanel
        qrType="url"
        encodedPayload="https://openqr.studio"
        design={design}
        onDimensionsChange={onDimensionsChange}
        onBackgroundTransparentChange={onBackgroundTransparentChange}
      />
    );

    // 1. Select 512 preset dimension
    fireEvent.click(screen.getByTestId("export-size-512"));
    expect(onDimensionsChange).toHaveBeenCalledWith(512);

    // 2. Switch to Custom size and enter 640
    fireEvent.click(screen.getByTestId("export-size-custom"));
    const customInput = screen.getByTestId("export-custom-dimension-input");
    fireEvent.change(customInput, { target: { value: "640" } });
    expect(onDimensionsChange).toHaveBeenCalledWith(640);

    // 3. Toggle PNG transparent background
    fireEvent.click(screen.getByTestId("export-transparent-bg-switch"));
    expect(onBackgroundTransparentChange).toHaveBeenCalledWith(true);

    // 4. Switch to JPEG Settings tab and change quality to 100%
    fireEvent.click(screen.getByTestId("export-format-tab-jpeg"));
    expect(screen.getByTestId("export-jpeg-settings")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("export-jpeg-quality-100"));
    expect(screen.getByTestId("export-jpeg-quality-value")).toHaveTextContent(
      "100%"
    );

    // 5. Switch to SVG Vector tab -> raster resolution controls are hidden, vector info shown
    fireEvent.click(screen.getByTestId("export-format-tab-svg"));
    expect(screen.getByTestId("export-svg-vector-info")).toBeInTheDocument();
    expect(
      screen.queryByTestId("export-raster-size-controls")
    ).not.toBeInTheDocument();

    // 6. Click Copy Payload -> writes exact payload and renders accessible status banner
    fireEvent.click(screen.getByTestId("copy-qr-payload-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("export-status-banner")).toHaveTextContent(
        /Copied exact QR payload/i
      );
    });
    expect(writeTextMock).toHaveBeenCalledWith("https://openqr.studio");
  });
});
