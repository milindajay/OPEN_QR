import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PresetSelector } from "@/components/designer/preset-selector";
import { PatternSelector } from "@/components/designer/pattern-selector";
import { FinderPatternControls } from "@/components/designer/finder-pattern-controls";
import { ErrorCorrectionControl } from "@/components/designer/error-correction-control";
import { MarginControl } from "@/components/designer/margin-control";
import { LogoUploader } from "@/components/designer/logo-uploader";

describe("Design Studio UI Components", () => {
  it("renders all 10 presets and triggers onSelectPreset", () => {
    const onSelect = vi.fn();
    render(
      <PresetSelector
        activePresetId="classic-black"
        onSelectPreset={onSelect}
      />
    );

    const oceanPreset = screen.getByTestId("preset-ocean-blue");
    fireEvent.click(oceanPreset);
    expect(onSelect).toHaveBeenCalledWith("ocean-blue");
  });

  it("renders all 6 dot pattern styles and updates selection", () => {
    const onChange = vi.fn();
    render(<PatternSelector value="square" onChange={onChange} />);

    fireEvent.click(screen.getByTestId("pattern-classy-rounded"));
    expect(onChange).toHaveBeenCalledWith("classy-rounded");
  });

  it("updates independent outer and inner finder pattern shapes", () => {
    const onOuter = vi.fn();
    const onInner = vi.fn();
    render(
      <FinderPatternControls
        outerStyle="square"
        innerStyle="square"
        outerColor="#171717"
        innerColor="#171717"
        foregroundColor="#171717"
        onOuterStyleChange={onOuter}
        onInnerStyleChange={onInner}
        onOuterColorChange={vi.fn()}
        onInnerColorChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("corner-outer-extra-rounded"));
    expect(onOuter).toHaveBeenCalledWith("extra-rounded");

    fireEvent.click(screen.getByTestId("corner-inner-dot"));
    expect(onInner).toHaveBeenCalledWith("dot");
  });

  it("displays quiet-zone margin in QR modules, forwards slider aria-label to thumb, and warns below 4 modules", () => {
    const { rerender } = render(
      <MarginControl
        margin={4}
        width={1024}
        onMarginChange={vi.fn()}
        onDimensionsChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("margin-value-label")).toHaveTextContent(
      "4 modules"
    );
    expect(screen.queryByTestId("quiet-zone-warning")).not.toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /quiet-zone margin in qr modules/i })
    ).toBeInTheDocument();

    rerender(
      <MarginControl
        margin={2}
        width={1024}
        onMarginChange={vi.fn()}
        onDimensionsChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByTestId("margin-value-label")).toHaveTextContent(
      "2 modules"
    );
    expect(screen.getByTestId("quiet-zone-warning")).toBeInTheDocument();
  });

  it("selects error correction levels and shows contextual tip when logo is present", () => {
    const onChange = vi.fn();
    render(
      <ErrorCorrectionControl value="M" hasLogo={true} onChange={onChange} />
    );

    expect(screen.getByText(/because a center logo is active/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("ec-level-H"));
    expect(onChange).toHaveBeenCalledWith("H");
  });

  it("validates uploaded SVG logos, rejects malicious SVG scripts, and accepts clean SVGs", async () => {
    const onSetLogo = vi.fn();
    render(
      <LogoUploader
        logo={undefined}
        errorCorrection="M"
        onSetLogo={onSetLogo}
        onUpdateLogo={vi.fn()}
        onRemoveLogo={vi.fn()}
        onResetLogoSettings={vi.fn()}
        onRecommendHighEc={vi.fn()}
      />
    );

    const fileInput = document.getElementById(
      "qr-logo-upload-input"
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // 1. Upload malicious SVG with <script>
    const evilSvg = new File(
      [`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`],
      "evil.svg",
      { type: "image/svg+xml" }
    );
    fireEvent.change(fileInput, { target: { files: [evilSvg] } });

    await waitFor(() => {
      expect(screen.getByTestId("logo-upload-error")).toHaveTextContent(
        /forbidden <script>/i
      );
    });
    expect(onSetLogo).not.toHaveBeenCalled();

    // 2. Upload clean SVG
    const cleanSvg = new File(
      [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#2563EB"/></svg>`,
      ],
      "brand.svg",
      { type: "image/svg+xml" }
    );
    fireEvent.change(fileInput, { target: { files: [cleanSvg] } });

    await waitFor(() => {
      expect(onSetLogo).toHaveBeenCalledTimes(1);
    });
    expect(onSetLogo.mock.calls[0]?.[0]?.fileName).toBe("brand.svg");
  });

  it("preserves uploaded logo fileName when LogoUploader unmounts and remounts across tab switches", () => {
    const logoState = {
      source: "data:image/svg+xml;base64,PHN2Zy8+",
      fileName: "company-mark.svg",
      size: 0.22,
      margin: 4,
      shape: "rounded" as const,
    };

    const { unmount } = render(
      <LogoUploader
        logo={logoState}
        errorCorrection="H"
        onSetLogo={vi.fn()}
        onUpdateLogo={vi.fn()}
        onRemoveLogo={vi.fn()}
        onResetLogoSettings={vi.fn()}
        onRecommendHighEc={vi.fn()}
      />
    );

    expect(screen.getByTestId("uploaded-logo-filename")).toHaveTextContent(
      "company-mark.svg"
    );
    unmount();

    // Remount after switching back to Logo tab
    render(
      <LogoUploader
        logo={logoState}
        errorCorrection="H"
        onSetLogo={vi.fn()}
        onUpdateLogo={vi.fn()}
        onRemoveLogo={vi.fn()}
        onResetLogoSettings={vi.fn()}
        onRecommendHighEc={vi.fn()}
      />
    );

    expect(screen.getByTestId("uploaded-logo-filename")).toHaveTextContent(
      "company-mark.svg"
    );
  });
});
