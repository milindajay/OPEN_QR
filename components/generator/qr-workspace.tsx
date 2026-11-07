"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { useQrGenerator } from "@/hooks/use-qr-generator";
import { QR_TYPES } from "@/lib/constants/qr-types";
import { DesignPanel } from "@/components/designer/design-panel";
import { QRPreview } from "@/components/generator/qr-preview";
import { QRDownloadPanel } from "@/components/generator/qr-download-panel";
import { MobilePreviewBar } from "@/components/generator/mobile-preview-bar";
import { QRTypeSelector } from "@/components/generator/qr-type-selector";
import { QRFormContainer } from "@/components/generator/qr-form-container";
import { Button } from "@/components/ui/button";

export function QRWorkspace() {
  const {
    payload,
    activeType,
    setPayload,
    setQrType,
    design,
    activePresetId,
    setDotStyle,
    setDotsColor,
    setDotsGradient,
    setCornerOuterStyle,
    setCornerInnerStyle,
    setCornerOuterColor,
    setCornerInnerColor,
    setBackgroundColor,
    setBackgroundTransparent,
    resetColors,
    resetBackground,
    setLogo,
    updateLogo,
    removeLogo,
    resetLogoSettings,
    setMargin,
    setDimensions,
    resetMarginAndDimensions,
    setErrorCorrection,
    applyPreset,
    resetDesign,
    validation,
    encodedPayload,
    capacity,
    scanability,
    resetAll,
  } = useQrGenerator();

  const exportSectionRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("type")?.trim().toLowerCase();
    if (!requestedType) {
      return;
    }
    const matched = QR_TYPES.find((item) => item.id === requestedType);
    if (matched) {
      setQrType(matched.id);
    }
  }, [setQrType]);

  const handleJumpToExport = () => {
    exportSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="space-y-5">
      <MobilePreviewBar
        encodedPayload={encodedPayload}
        design={design}
        isValid={validation.isValid}
        scanability={scanability}
        onJumpToExport={handleJumpToExport}
      />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Content Input & Customization Studio (7 cols on desktop) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Payload Content Panel */}
          <section
            className="rounded-xl border border-border bg-card shadow-2xs"
            aria-label="QR payload content"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  QR Content
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select a QR category and enter your details. Content is
                  processed directly in your browser.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetAll}
                aria-label="Reset QR content and design"
                data-testid="reset-all-btn"
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All</span>
              </Button>
            </div>

            <div className="space-y-5 p-5">
              <QRTypeSelector
                activeType={activeType}
                onSelectType={setQrType}
              />

              <QRFormContainer
                payload={payload}
                onChange={setPayload}
                validation={validation}
                capacity={capacity}
                errorCorrection={design.errorCorrection}
              />
            </div>
          </section>

          {/* Design Studio Customization Panel */}
          <DesignPanel
            design={design}
            activePresetId={activePresetId}
            onSelectPreset={applyPreset}
            onDotStyleChange={setDotStyle}
            onDotsColorChange={setDotsColor}
            onDotsGradientChange={setDotsGradient}
            onCornerOuterStyleChange={setCornerOuterStyle}
            onCornerInnerStyleChange={setCornerInnerStyle}
            onCornerOuterColorChange={setCornerOuterColor}
            onCornerInnerColorChange={setCornerInnerColor}
            onBackgroundColorChange={setBackgroundColor}
            onBackgroundTransparentChange={setBackgroundTransparent}
            onResetColors={resetColors}
            onResetBackground={resetBackground}
            onSetLogo={setLogo}
            onUpdateLogo={updateLogo}
            onRemoveLogo={removeLogo}
            onResetLogoSettings={resetLogoSettings}
            onMarginChange={setMargin}
            onDimensionsChange={setDimensions}
            onResetMarginAndDimensions={resetMarginAndDimensions}
            onErrorCorrectionChange={setErrorCorrection}
            onResetDesign={resetDesign}
          />
        </div>

        {/* Right Column: Sticky Live Preview Canvas & Export Bar (5 cols on desktop) */}
        <div className="lg:sticky lg:top-22 lg:col-span-5">
          <section
            ref={exportSectionRef}
            className="rounded-xl border border-border bg-card p-5 shadow-2xs"
            aria-label="Live QR preview and download controls"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  Live Preview
                </h2>
                <p className="text-xs text-muted-foreground">
                  Real-time browser rendering
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <QRPreview
                encodedPayload={encodedPayload}
                design={design}
                isValid={validation.isValid}
                capacity={capacity}
                scanability={scanability}
              />

              <QRDownloadPanel
                qrType={payload.type}
                encodedPayload={encodedPayload}
                design={design}
                disabled={!validation.isValid || !encodedPayload}
                onDimensionsChange={setDimensions}
                onBackgroundTransparentChange={setBackgroundTransparent}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
