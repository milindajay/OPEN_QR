export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file|blob):/i;
const HTTP_PROTOCOL = /^https?:\/\//i;

/**
 * Validates an HTTP or HTTPS URL without modifying or shortening it.
 * Rejects dangerous protocols (javascript:, data:, etc.) and malformed hosts.
 */
export function validateHttpUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "URL is required.",
    };
  }

  if (DANGEROUS_PROTOCOLS.test(trimmed)) {
    return {
      isValid: false,
      error: "Unsafe URI scheme detected. Only HTTP and HTTPS URLs are permitted.",
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: "URL must not contain unencoded spaces.",
    };
  }

  if (!HTTP_PROTOCOL.test(trimmed)) {
    return {
      isValid: false,
      error: "URL must begin with https:// or http://.",
    };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "Only HTTP and HTTPS protocols are supported.",
      };
    }

    const host = parsed.hostname;
    if (!host) {
      return {
        isValid: false,
        error: "URL must include a valid domain or hostname.",
      };
    }

    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    const isIpv6 = host.startsWith("[") && host.endsWith("]");
    const hasValidDomainDot =
      host.includes(".") &&
      !host.startsWith(".") &&
      !host.endsWith(".") &&
      host.split(".").every((part) => part.length > 0);

    if (!isLocalhost && !isIpv4 && !isIpv6 && !hasValidDomainDot) {
      return {
        isValid: false,
        error: "Please enter a complete domain name (for example, https://example.com).",
      };
    }

    if (parsed.protocol === "http:" && !isLocalhost) {
      return {
        isValid: true,
        warning:
          "This URL uses unencrypted HTTP. Some mobile browsers may show a security warning when opening it.",
      };
    }

    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format. Please enter a valid web address (e.g., https://example.com).",
    };
  }
}
