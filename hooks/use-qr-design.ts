"use client";

import * as React from "react";
import type {
  CornerDotStyle,
  CornerSquareStyle,
  DotStyle,
  ErrorCorrectionLevel,
  GradientConfig,
  QRDesign,
  QRLogoConfig,
} from "@/types/design";
import {
  createDefaultDesign,
  DEFAULT_QR_DESIGN,
  getDesignPresetById,
} from "@/lib/qr/presets/design-presets";
import { APP_CONFIG } from "@/lib/constants/app-config";

export function useQrDesign(initialDesign: QRDesign = createDefaultDesign()) {
  const [design, setDesignState] = React.useState<QRDesign>(initialDesign);
  const [activePresetId, setActivePresetId] = React.useState<string | null>(
    "classic-black"
  );
  const [hasUserSelectedEc, setHasUserSelectedEc] = React.useState(false);
  const hasUserSelectedEcRef = React.useRef(false);

  const setDesign = React.useCallback(
    (updater: QRDesign | ((prev: QRDesign) => QRDesign)) => {
      setActivePresetId(null);
      setDesignState(updater);
    },
    []
  );

  const setDotStyle = React.useCallback((style: DotStyle) => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      dots: {
        ...prev.dots,
        style,
      },
    }));
  }, []);

  const setDotsColor = React.useCallback((color: string) => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      dots: {
        ...prev.dots,
        color,
      },
    }));
  }, []);

  const setDotsGradient = React.useCallback((gradient?: GradientConfig) => {
    setActivePresetId(null);
    setDesignState((prev) => {
      const nextDots = { ...prev.dots };
      if (gradient) {
        nextDots.gradient = gradient;
      } else {
        delete nextDots.gradient;
      }
      return {
        ...prev,
        dots: nextDots,
      };
    });
  }, []);

  const setCornerOuterStyle = React.useCallback(
    (outerStyle: CornerSquareStyle) => {
      setActivePresetId(null);
      setDesignState((prev) => ({
        ...prev,
        corners: {
          ...prev.corners,
          outerStyle,
        },
      }));
    },
    []
  );

  const setCornerInnerStyle = React.useCallback(
    (innerStyle: CornerDotStyle) => {
      setActivePresetId(null);
      setDesignState((prev) => ({
        ...prev,
        corners: {
          ...prev.corners,
          innerStyle,
        },
      }));
    },
    []
  );

  const setCornerOuterColor = React.useCallback((outerColor: string) => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      corners: {
        ...prev.corners,
        outerColor,
      },
    }));
  }, []);

  const setCornerInnerColor = React.useCallback((innerColor: string) => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      corners: {
        ...prev.corners,
        innerColor,
      },
    }));
  }, []);

  const setBackgroundColor = React.useCallback((color: string) => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        color,
        transparent: false,
      },
    }));
  }, []);

  const setBackgroundTransparent = React.useCallback((transparent: boolean) => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        transparent,
      },
    }));
  }, []);

  const setBackgroundGradient = React.useCallback(
    (gradient?: GradientConfig) => {
      setActivePresetId(null);
      setDesignState((prev) => {
        const nextBg = { ...prev.background, transparent: false };
        if (gradient) {
          nextBg.gradient = gradient;
        } else {
          delete nextBg.gradient;
        }
        return {
          ...prev,
          background: nextBg,
        };
      });
    },
    []
  );

  const resetColors = React.useCallback(() => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      dots: {
        style: prev.dots.style,
        color: DEFAULT_QR_DESIGN.dots.color,
      },
      corners: {
        ...prev.corners,
        outerColor: DEFAULT_QR_DESIGN.corners.outerColor,
        innerColor: DEFAULT_QR_DESIGN.corners.innerColor,
      },
    }));
  }, []);

  const resetBackground = React.useCallback(() => {
    setActivePresetId(null);
    setDesignState((prev) => ({
      ...prev,
      background: {
        color: DEFAULT_QR_DESIGN.background.color,
        transparent: false,
      },
    }));
  }, []);

  const setLogo = React.useCallback((logo: QRLogoConfig) => {
    setDesignState((prev) => {
      const shouldAutoSelectEcH =
        !hasUserSelectedEcRef.current && !prev.logo;
      return {
        ...prev,
        ...(shouldAutoSelectEcH ? { errorCorrection: "H" as const } : {}),
        logo,
      };
    });
  }, []);

  const updateLogo = React.useCallback((partial: Partial<QRLogoConfig>) => {
    setDesignState((prev) => {
      if (!prev.logo) {
        return prev;
      }
      return {
        ...prev,
        logo: {
          ...prev.logo,
          ...partial,
        },
      };
    });
  }, []);

  const removeLogo = React.useCallback(() => {
    setDesignState((prev) => {
      const next = { ...prev };
      delete next.logo;
      return next;
    });
  }, []);

  const resetLogoSettings = React.useCallback(() => {
    setDesignState((prev) => {
      if (!prev.logo) {
        return prev;
      }
      return {
        ...prev,
        logo: {
          source: prev.logo.source,
          size: APP_CONFIG.limits.defaultLogoSizeRatio,
          margin: 4,
          shape: "square",
          ...(prev.logo.fileName ? { fileName: prev.logo.fileName } : {}),
        },
      };
    });
  }, []);

  const setMargin = React.useCallback((margin: number) => {
    setDesignState((prev) => ({
      ...prev,
      margin: Math.min(24, Math.max(0, Math.round(margin))),
    }));
  }, []);

  const setDimensions = React.useCallback((size: number) => {
    const clamped = Math.min(4096, Math.max(128, Math.round(size)));
    setDesignState((prev) => ({
      ...prev,
      width: clamped,
      height: clamped,
    }));
  }, []);

  const resetMarginAndDimensions = React.useCallback(() => {
    setDesignState((prev) => ({
      ...prev,
      width: APP_CONFIG.defaultDimensions.width,
      height: APP_CONFIG.defaultDimensions.height,
      margin: APP_CONFIG.defaultDimensions.defaultMargin,
    }));
  }, []);

  const setErrorCorrection = React.useCallback(
    (errorCorrection: ErrorCorrectionLevel) => {
      hasUserSelectedEcRef.current = true;
      setHasUserSelectedEc(true);
      setDesignState((prev) => ({
        ...prev,
        errorCorrection,
      }));
    },
    []
  );

  const applyPreset = React.useCallback((presetId: string) => {
    const preset = getDesignPresetById(presetId);
    if (!preset) {
      return;
    }
    setActivePresetId(preset.id);
    setDesignState((prev) => {
      const nextDesign: QRDesign = structuredClone(preset.design);
      // Preserve user's dimensions, error correction, and uploaded logo if present
      nextDesign.width = prev.width;
      nextDesign.height = prev.height;
      nextDesign.errorCorrection = prev.errorCorrection;
      if (prev.logo) {
        nextDesign.logo = { ...prev.logo };
      }
      return nextDesign;
    });
  }, []);

  const resetDesign = React.useCallback(() => {
    hasUserSelectedEcRef.current = false;
    setHasUserSelectedEc(false);
    setActivePresetId("classic-black");
    setDesignState(createDefaultDesign());
  }, []);

  return {
    design,
    activePresetId,
    hasUserSelectedEc,
    setDesign,
    setDotStyle,
    setDotsColor,
    setDotsGradient,
    setCornerOuterStyle,
    setCornerInnerStyle,
    setCornerOuterColor,
    setCornerInnerColor,
    setBackgroundColor,
    setBackgroundTransparent,
    setBackgroundGradient,
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
  };
}
