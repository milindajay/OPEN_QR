export type QRType =
  | "url"
  | "text"
  | "vcard"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "location"
  | "whatsapp"
  | "social"
  | "calendar"
  | "custom";

export type ScanabilityLevel = "good" | "warning" | "high-risk";

export interface ScanabilityIssue {
  id: string;
  level: ScanabilityLevel;
  title: string;
  description: string;
}

export interface ScanabilityReport {
  status: ScanabilityLevel;
  contrastRatio: number;
  issues: ScanabilityIssue[];
}

export interface CapacityReport {
  byteLength: number;
  characterCount: number;
  maxBytes: number;
  estimatedVersion: number;
  utilizationPercentage: number;
  isExceeded: boolean;
  isNearLimit: boolean;
}
