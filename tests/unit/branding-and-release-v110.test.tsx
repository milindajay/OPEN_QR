import fs from "node:fs";
import path from "node:path";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QRPreview } from "@/components/generator/qr-preview";
import { BrandLogo, BrandMark } from "@/components/shared/brand-logo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { metadata } from "@/app/layout";
import manifest from "@/app/manifest";
import { createDefaultDesign } from "@/lib/qr/presets/design-presets";
import { exportQrCodeBlob } from "@/lib/qr/renderer/export";
import {
  inspectJpegBytes,
  inspectPngBytes,
  inspectSvgContent,
} from "@/lib/qr/renderer/export-validation";
import {
  EXPORT_DIMENSION_PRESETS,
  EXPORT_RESOLUTION_PRESET_DETAILS,
} from "@/types/export";

async function readBlobAsUint8Array(blob: Blob): Promise<Uint8Array> {
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

async function readBlobAsText(blob: Blob): Promise<string> {
  const bytes = await readBlobAsUint8Array(blob);
  return new TextDecoder().decode(bytes);
}

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("geist/font/sans", () => ({
  GeistSans: { variable: "--font-geist-sans" },
}));

vi.mock("geist/font/mono", () => ({
  GeistMono: { variable: "--font-geist-mono" },
}));

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

describe("Version 1.1.0 — StrictMode QR Lifecycle, Portability, Resolution & Brand Identity", () => {
  it("renders QRPreview inside React.StrictMode across mount, payload/design updates, and remount with a single SVG", async () => {
    const baseDesign = createDefaultDesign();
    const mockCapacity = {
      characterCount: 32,
      byteLength: 32,
      maxBytes: 2331,
      estimatedVersion: 2,
      utilizationPercentage: 1.4,
      isNearLimit: false,
      isExceeded: false,
    };

    const { container, rerender, unmount } = render(
      <React.StrictMode>
        <QRPreview
          encodedPayload="https://openqr.studio/strict-init"
          design={baseDesign}
          isValid={true}
          capacity={mockCapacity}
          scanability={{ status: "good", contrastRatio: 17.99, issues: [] }}
        />
      </React.StrictMode>
    );

    const mountTarget = container.querySelector('[data-testid="qr-preview-canvas"]');
    expect(mountTarget).not.toBeNull();

    await waitFor(() => {
      expect(mountTarget?.querySelectorAll("svg").length).toBe(1);
    });
    expect(mountTarget?.querySelectorAll("canvas").length).toBe(0);

    // Update payload and design inside StrictMode
    rerender(
      <React.StrictMode>
        <QRPreview
          encodedPayload="https://openqr.studio/strict-updated"
          design={{
            ...baseDesign,
            dots: { style: "rounded", color: "#2563EB" },
          }}
          isValid={true}
          capacity={mockCapacity}
          scanability={{ status: "good", contrastRatio: 8.59, issues: [] }}
        />
      </React.StrictMode>
    );

    await waitFor(() => {
      expect(mountTarget?.querySelectorAll("svg").length).toBe(1);
    });
    expect(mountTarget?.querySelectorAll("canvas").length).toBe(0);

    unmount();
    expect(mountTarget?.childElementCount).toBe(0);
  });

  it("embeds PNG, JPEG, WEBP, and SVG logos as self-contained base64 Data URIs in exported SVG and rejects blob: or external URLs", async () => {
    const baseDesign = createDefaultDesign();
    const logoSources = [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
      "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
      `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#2563EB"/></svg>').toString("base64")}`,
    ];

    for (const source of logoSources) {
      const svgBlob = await exportQrCodeBlob(
        "https://openqr.studio/portable-svg",
        {
          ...baseDesign,
          errorCorrection: "H",
          logo: {
            source,
            size: 0.22,
            margin: 4,
            shape: "rounded",
            backgroundColor: "#FFFFFF",
          },
        },
        { format: "svg", width: 512, height: 512 }
      );
      const svgText = await readBlobAsText(svgBlob);
      const report = inspectSvgContent(svgText);

      expect(report.isValidXml).toBe(true);
      expect(report.isVectorQr).toBe(true);
      expect(report.hasEmbeddedLogo).toBe(true);
      expect(report.hasExternalReferences).toBe(false);
      expect(report.embeddedLogoHref).toMatch(
        /^data:image\/(png|jpeg|webp|svg\+xml);base64,/
      );
      expect(svgText).not.toContain("blob:");
    }

    // Reject blob:, external http(s), and local filesystem paths
    for (const forbiddenSource of [
      "blob:https://openqr.studio/1234-5678",
      "https://example.com/remote-logo.png",
      "/Users/local/logo.png",
    ]) {
      await expect(
        exportQrCodeBlob(
          "https://openqr.studio",
          {
            ...baseDesign,
            logo: {
              source: forbiddenSource,
              size: 0.2,
              margin: 4,
              shape: "square",
            },
          },
          { format: "svg", width: 512, height: 512 }
        )
      ).rejects.toThrow();
    }
  });

  it("flattens transparent QR backgrounds to white or custom backgroundColor in JPEG exports while keeping PNG alpha intact", async () => {
    const transparentDesign = {
      ...createDefaultDesign(),
      background: {
        color: "#FFFFFF",
        transparent: true,
      },
    };

    // JPEG export with custom background color (#FEF3C7)
    const jpegBlob = await exportQrCodeBlob(
      "https://openqr.studio/jpeg-flatten",
      transparentDesign,
      {
        format: "jpeg",
        width: 512,
        height: 512,
        backgroundColor: "#FEF3C7",
      }
    );
    const jpegBytes = await readBlobAsUint8Array(jpegBlob);
    const jpegReport = inspectJpegBytes(jpegBytes);
    expect(jpegReport.isValidJpeg).toBe(true);
    expect(jpegReport.width).toBe(512);
    expect(jpegReport.height).toBe(512);
    expect(jpegReport.components).toBe(3);

    // PNG export preserves alpha channel
    const pngBlob = await exportQrCodeBlob(
      "https://openqr.studio/png-alpha",
      transparentDesign,
      {
        format: "png",
        width: 512,
        height: 512,
      }
    );
    const pngBytes = await readBlobAsUint8Array(pngBlob);
    const pngReport = inspectPngBytes(pngBytes);
    expect(pngReport.isValidPng).toBe(true);
    expect(pngReport.hasAlphaChannel).toBe(true);
  });

  it("includes 512, 1024, 2048, and 4096 print resolution presets with accurate 300 DPI physical dimensions", () => {
    expect(EXPORT_DIMENSION_PRESETS).toEqual([256, 512, 1024, 2048, 4096]);

    const preset2048 = EXPORT_RESOLUTION_PRESET_DETAILS.find(
      (p) => p.size === 2048
    );
    const preset4096 = EXPORT_RESOLUTION_PRESET_DETAILS.find(
      (p) => p.size === 4096
    );
    expect(preset2048?.name).toBe("Print / Standard");
    expect(preset2048?.approxInchesAt300Dpi).toBe(6.83);
    expect(preset4096?.name).toBe("Print / Large Signage");
    expect(preset4096?.approxInchesAt300Dpi).toBe(13.65);
  });

  it("verifies all 5 SVG brand logo variants and 6 favicon/app icon files exist and are valid", () => {
    const svgLogoFiles = [
      "logo/icon.svg",
      "logo/logo.svg",
      "logo/logo-light.svg",
      "logo/logo-dark.svg",
      "logo/logo-mono.svg",
    ];

    for (const relPath of svgLogoFiles) {
      const fullPath = path.join(PUBLIC_DIR, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, "utf8");
      expect(content.length).toBeGreaterThan(200);
      expect(content).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(content).toContain("viewBox=");
      const svgReport = inspectSvgContent(content);
      expect(svgReport.isValidXml).toBe(true);
      expect(svgReport.hasForbiddenElements).toBe(false);
      expect(svgReport.hasEventHandlerAttributes).toBe(false);
      expect(svgReport.hasExternalReferences).toBe(false);
    }

    const expectedPngIcons: Array<{ file: string; size: number }> = [
      { file: "favicon-16x16.png", size: 16 },
      { file: "favicon-32x32.png", size: 32 },
      { file: "apple-touch-icon.png", size: 180 },
      { file: "icon-192.png", size: 192 },
      { file: "icon-512.png", size: 512 },
    ];

    for (const { file, size } of expectedPngIcons) {
      const fullPath = path.join(PUBLIC_DIR, file);
      expect(fs.existsSync(fullPath)).toBe(true);
      const bytes = new Uint8Array(fs.readFileSync(fullPath));
      const report = inspectPngBytes(bytes);
      expect(report.isValidPng).toBe(true);
      expect(report.width).toBe(size);
      expect(report.height).toBe(size);
    }

    const icoPath = path.join(PUBLIC_DIR, "favicon.ico");
    expect(fs.existsSync(icoPath)).toBe(true);
    const icoBytes = fs.readFileSync(icoPath);
    expect(icoBytes.length).toBeGreaterThan(100);
    // ICO header: 0x0000 (reserved), 0x0001 (type = ICO), 0x0002 (2 images: 16x16 and 32x32)
    expect(icoBytes.readUInt16LE(0)).toBe(0);
    expect(icoBytes.readUInt16LE(2)).toBe(1);
    expect(icoBytes.readUInt16LE(4)).toBe(2);
  });

  it("configures favicon/icon metadata in app/layout.tsx and app/manifest.ts and renders BrandLogo in Header and Footer", () => {
    expect(metadata.icons).toBeDefined();
    const webManifest = manifest();
    expect(webManifest.icons?.length).toBeGreaterThanOrEqual(6);
    expect(
      webManifest.icons?.some((i) => i.src === "/logo/icon.svg")
    ).toBe(true);
    expect(
      webManifest.icons?.some((i) => i.src === "/icon-192.png")
    ).toBe(true);
    expect(
      webManifest.icons?.some((i) => i.src === "/icon-512.png")
    ).toBe(true);

    render(
      <div>
        <Header />
        <Footer />
        <BrandMark size={24} />
        <BrandLogo markSize={32} />
      </div>
    );

    const brandMarks = screen.getAllByTestId("brand-mark-svg");
    expect(brandMarks.length).toBeGreaterThanOrEqual(4);
    for (const svg of brandMarks) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      expect(svg.getAttribute("viewBox")).toBe("0 0 64 64");
    }
  });
});
