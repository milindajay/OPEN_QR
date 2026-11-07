export type DotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

export type CornerSquareStyle = "square" | "dot" | "extra-rounded";

export type CornerDotStyle = "square" | "dot";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type GradientType = "linear" | "radial";

export interface GradientConfig {
  type: GradientType;
  rotation?: number;
  colors: Array<{
    offset: number;
    color: string;
  }>;
}

export type LogoContainerShape = "square" | "rounded" | "circle";

export interface QRLogoConfig {
  source: string;
  size: number;
  margin: number;
  shape: LogoContainerShape;
  backgroundColor?: string;
  fileName?: string;
}

export interface QRDesign {
  width: number;
  height: number;
  /** Quiet-zone border around the QR code measured in QR modules (ISO/IEC 18004 minimum is 4 modules). */
  margin: number;

  dots: {
    style: DotStyle;
    color: string;
    gradient?: GradientConfig;
  };

  background: {
    color: string;
    transparent: boolean;
    gradient?: GradientConfig;
  };

  corners: {
    outerStyle: CornerSquareStyle;
    innerStyle: CornerDotStyle;
    outerColor: string;
    innerColor: string;
  };

  logo?: QRLogoConfig;

  errorCorrection: ErrorCorrectionLevel;
}

export interface QRDesignPreset {
  id: string;
  name: string;
  description: string;
  design: Omit<QRDesign, "logo">;
}
