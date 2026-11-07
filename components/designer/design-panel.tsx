"use client";

import * as React from "react";
import {
  Focus,
  Grid3x3,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
} from "lucide-react";
import type {
  CornerDotStyle,
  CornerSquareStyle,
  DotStyle,
  ErrorCorrectionLevel,
  GradientConfig,
  QRDesign,
  QRLogoConfig,
} from "@/types/design";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { PresetSelector } from "@/components/designer/preset-selector";
import { PatternSelector } from "@/components/designer/pattern-selector";
import { ColorControls } from "@/components/designer/color-controls";
import { GradientControls } from "@/components/designer/gradient-controls";
import { FinderPatternControls } from "@/components/designer/finder-pattern-controls";
import { BackgroundControls } from "@/components/designer/background-controls";
import { LogoUploader } from "@/components/designer/logo-uploader";
import { MarginControl } from "@/components/designer/margin-control";
import { ErrorCorrectionControl } from "@/components/designer/error-correction-control";

export interface DesignPanelProps {
  design: QRDesign;
  activePresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onDotStyleChange: (style: DotStyle) => void;
  onDotsColorChange: (color: string) => void;
  onDotsGradientChange: (gradient?: GradientConfig) => void;
  onCornerOuterStyleChange: (style: CornerSquareStyle) => void;
  onCornerInnerStyleChange: (style: CornerDotStyle) => void;
  onCornerOuterColorChange: (color: string) => void;
  onCornerInnerColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTransparentChange: (transparent: boolean) => void;
  onResetColors: () => void;
  onResetBackground: () => void;
  onSetLogo: (logo: QRLogoConfig) => void;
  onUpdateLogo: (partial: Partial<QRLogoConfig>) => void;
  onRemoveLogo: () => void;
  onResetLogoSettings: () => void;
  onMarginChange: (margin: number) => void;
  onDimensionsChange: (size: number) => void;
  onResetMarginAndDimensions: () => void;
  onErrorCorrectionChange: (level: ErrorCorrectionLevel) => void;
  onResetDesign: () => void;
}

export function DesignPanel({
  design,
  activePresetId,
  onSelectPreset,
  onDotStyleChange,
  onDotsColorChange,
  onDotsGradientChange,
  onCornerOuterStyleChange,
  onCornerInnerStyleChange,
  onCornerOuterColorChange,
  onCornerInnerColorChange,
  onBackgroundColorChange,
  onBackgroundTransparentChange,
  onResetColors,
  onResetBackground,
  onSetLogo,
  onUpdateLogo,
  onRemoveLogo,
  onResetLogoSettings,
  onMarginChange,
  onDimensionsChange,
  onResetMarginAndDimensions,
  onErrorCorrectionChange,
  onResetDesign,
}: DesignPanelProps) {
  return (
    <section
      className="rounded-xl border border-border bg-card shadow-2xs"
      aria-label="QR Design Studio customization controls"
      data-testid="design-studio-panel"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Design Studio
          </h2>
          <p className="text-xs text-muted-foreground">
            Customize appearance, colours, corners, logo, and layout.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetDesign}
          data-testid="reset-design-btn"
          aria-label="Reset all design customizations"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Design</span>
        </Button>
      </div>

      <div className="p-5">
        <Tabs defaultValue="presets" className="w-full">
          <TabsList
            className="grid h-auto w-full grid-cols-3 gap-1.5 bg-secondary/70 p-1.5 sm:grid-cols-6"
            aria-label="Design customization categories"
          >
            <TabsTrigger value="presets" className="min-h-10 gap-1.5 py-2 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Presets</span>
            </TabsTrigger>

            <TabsTrigger value="pattern" className="min-h-10 gap-1.5 py-2 text-xs">
              <Grid3x3 className="h-3.5 w-3.5" />
              <span>Pattern</span>
            </TabsTrigger>

            <TabsTrigger value="colors" className="min-h-10 gap-1.5 py-2 text-xs">
              <Palette className="h-3.5 w-3.5" />
              <span>Colours</span>
            </TabsTrigger>

            <TabsTrigger value="corners" className="min-h-10 gap-1.5 py-2 text-xs">
              <Focus className="h-3.5 w-3.5" />
              <span>Corners</span>
            </TabsTrigger>

            <TabsTrigger value="logo" className="min-h-10 gap-1.5 py-2 text-xs">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Logo</span>
            </TabsTrigger>

            <TabsTrigger value="layout" className="min-h-10 gap-1.5 py-2 text-xs">
              <Sliders className="h-3.5 w-3.5" />
              <span>Layout</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="pt-4">
            <PresetSelector
              activePresetId={activePresetId}
              onSelectPreset={onSelectPreset}
            />
          </TabsContent>

          <TabsContent value="pattern" className="pt-4">
            <PatternSelector
              value={design.dots.style}
              onChange={onDotStyleChange}
            />
          </TabsContent>

          <TabsContent value="colors" className="space-y-6 pt-4">
            <ColorControls
              foregroundColor={design.dots.color}
              backgroundColor={design.background.color}
              isBackgroundTransparent={design.background.transparent}
              hasForegroundGradient={Boolean(design.dots.gradient)}
              onForegroundChange={onDotsColorChange}
              onBackgroundChange={onBackgroundColorChange}
              onResetColors={onResetColors}
            />

            <GradientControls
              gradient={design.dots.gradient}
              baseColor={design.dots.color}
              onChange={onDotsGradientChange}
            />

            <BackgroundControls
              color={design.background.color}
              transparent={design.background.transparent}
              onColorChange={onBackgroundColorChange}
              onTransparentChange={onBackgroundTransparentChange}
              onResetBackground={onResetBackground}
            />
          </TabsContent>

          <TabsContent value="corners" className="pt-4">
            <FinderPatternControls
              outerStyle={design.corners.outerStyle}
              innerStyle={design.corners.innerStyle}
              outerColor={design.corners.outerColor}
              innerColor={design.corners.innerColor}
              foregroundColor={design.dots.color}
              onOuterStyleChange={onCornerOuterStyleChange}
              onInnerStyleChange={onCornerInnerStyleChange}
              onOuterColorChange={onCornerOuterColorChange}
              onInnerColorChange={onCornerInnerColorChange}
            />
          </TabsContent>

          <TabsContent value="logo" className="pt-4">
            <LogoUploader
              logo={design.logo}
              errorCorrection={design.errorCorrection}
              onSetLogo={onSetLogo}
              onUpdateLogo={onUpdateLogo}
              onRemoveLogo={onRemoveLogo}
              onResetLogoSettings={onResetLogoSettings}
              onRecommendHighEc={() => onErrorCorrectionChange("H")}
            />
          </TabsContent>

          <TabsContent value="layout" className="space-y-6 pt-4">
            <MarginControl
              margin={design.margin}
              width={design.width}
              onMarginChange={onMarginChange}
              onDimensionsChange={onDimensionsChange}
              onReset={onResetMarginAndDimensions}
            />

            <ErrorCorrectionControl
              value={design.errorCorrection}
              hasLogo={Boolean(design.logo?.source)}
              onChange={onErrorCorrectionChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
