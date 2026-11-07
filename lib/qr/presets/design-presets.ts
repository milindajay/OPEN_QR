import type { QRDesign, QRDesignPreset } from "@/types/design";
import { APP_CONFIG } from "@/lib/constants/app-config";

export const DEFAULT_QR_DESIGN: QRDesign = {
  width: APP_CONFIG.defaultDimensions.width,
  height: APP_CONFIG.defaultDimensions.height,
  margin: APP_CONFIG.defaultDimensions.defaultMargin,
  dots: {
    style: "square",
    color: "#171717",
  },
  background: {
    color: "#FFFFFF",
    transparent: false,
  },
  corners: {
    outerStyle: "square",
    innerStyle: "square",
    outerColor: "#171717",
    innerColor: "#171717",
  },
  errorCorrection: "M",
};

export const DESIGN_PRESETS: readonly QRDesignPreset[] = [
  {
    id: "classic-black",
    name: "Classic Black",
    description: "Crisp high-contrast square modules on pure white.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "square",
        color: "#171717",
      },
      background: {
        color: "#FFFFFF",
        transparent: false,
      },
      corners: {
        outerStyle: "square",
        innerStyle: "square",
        outerColor: "#171717",
        innerColor: "#171717",
      },
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep slate navy with refined extra-rounded corners.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "rounded",
        color: "#0F172A",
      },
      background: {
        color: "#F8FAFC",
        transparent: false,
      },
      corners: {
        outerStyle: "extra-rounded",
        innerStyle: "dot",
        outerColor: "#0F172A",
        innerColor: "#1E293B",
      },
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Vibrant cobalt blue modules with smooth rounded edges.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "rounded",
        color: "#1D4ED8",
      },
      background: {
        color: "#FFFFFF",
        transparent: false,
      },
      corners: {
        outerStyle: "extra-rounded",
        innerStyle: "dot",
        outerColor: "#1E3A8A",
        innerColor: "#2563EB",
      },
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Organic circular dots in rich botanical emerald.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "dots",
        color: "#047857",
      },
      background: {
        color: "#F0FDF4",
        transparent: false,
      },
      corners: {
        outerStyle: "dot",
        innerStyle: "dot",
        outerColor: "#064E3B",
        innerColor: "#047857",
      },
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Classy-rounded modules in regal amethyst tones.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "classy-rounded",
        color: "#5B21B6",
      },
      background: {
        color: "#FAF5FF",
        transparent: false,
      },
      corners: {
        outerStyle: "extra-rounded",
        innerStyle: "dot",
        outerColor: "#4C1D95",
        innerColor: "#5B21B6",
      },
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm crimson-to-amber linear gradient with extra-rounded dots.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "extra-rounded",
        color: "#BE123C",
        gradient: {
          type: "linear",
          rotation: 45,
          colors: [
            { offset: 0, color: "#9F1239" },
            { offset: 1, color: "#C2410C" },
          ],
        },
      },
      background: {
        color: "#FFFBEB",
        transparent: false,
      },
      corners: {
        outerStyle: "extra-rounded",
        innerStyle: "dot",
        outerColor: "#881337",
        innerColor: "#C2410C",
      },
    },
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    description: "Soft charcoal modules on a warm alabaster surface.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "extra-rounded",
        color: "#262626",
      },
      background: {
        color: "#FAFAFA",
        transparent: false,
      },
      corners: {
        outerStyle: "extra-rounded",
        innerStyle: "square",
        outerColor: "#171717",
        innerColor: "#404040",
      },
    },
  },
  {
    id: "soft-rose",
    name: "Soft Rose",
    description: "Editorial berry-rose palette with classy module geometry.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "classy",
        color: "#9D174D",
      },
      background: {
        color: "#FFF1F2",
        transparent: false,
      },
      corners: {
        outerStyle: "extra-rounded",
        innerStyle: "dot",
        outerColor: "#831843",
        innerColor: "#BE185D",
      },
    },
  },
  {
    id: "premium-gold",
    name: "Premium Gold",
    description: "Deep bronze and antique gold gradient on ivory.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "classy-rounded",
        color: "#78350F",
        gradient: {
          type: "linear",
          rotation: 135,
          colors: [
            { offset: 0, color: "#451A03" },
            { offset: 1, color: "#92400E" },
          ],
        },
      },
      background: {
        color: "#FEFCE8",
        transparent: false,
      },
      corners: {
        outerStyle: "square",
        innerStyle: "dot",
        outerColor: "#451A03",
        innerColor: "#78350F",
      },
    },
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "Indigo-to-cyan tech gradient with crisp rounded modules.",
    design: {
      ...DEFAULT_QR_DESIGN,
      dots: {
        style: "rounded",
        color: "#1E1B4B",
        gradient: {
          type: "linear",
          rotation: 60,
          colors: [
            { offset: 0, color: "#312E81" },
            { offset: 1, color: "#0369A1" },
          ],
        },
      },
      background: {
        color: "#FFFFFF",
        transparent: false,
      },
      corners: {
        outerStyle: "extra-rounded",
        innerStyle: "dot",
        outerColor: "#1E1B4B",
        innerColor: "#0369A1",
      },
    },
  },
] as const;

export function getDesignPresetById(id: string): QRDesignPreset | undefined {
  return DESIGN_PRESETS.find((preset) => preset.id === id);
}

export function createDefaultDesign(): QRDesign {
  return structuredClone(DEFAULT_QR_DESIGN);
}
