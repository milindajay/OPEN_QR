# OpenQR Studio

**Create Beautiful QR Codes. Completely Free.**

OpenQR Studio is a free, open-source, browser-based static QR code generator and design studio built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

- **Official Repository:** [https://github.com/milindajay/OPEN_QR](https://github.com/milindajay/OPEN_QR)
- **Version:** `1.1.0`
- **License:** [MIT License](./LICENSE)

---

## Features

- **12 Static QR Content Types:**
  1. Website URL (`http://`, `https://`)
  2. Plain Text (UTF-8 multilingual & emoji support)
  3. vCard Contact (`vCard 3.0`)
  4. Wi-Fi Network (`WIFI:` WPA/WPA2/WPA3, WEP, Open)
  5. Email (`mailto:`)
  6. Phone Call (`tel:`)
  7. SMS Message (`sms:`)
  8. Geographic Location (RFC 5870 `geo:` URI or Google Maps Pin URL)
  9. WhatsApp (`https://wa.me/`)
  10. Social Media Profiles (Facebook, Instagram, TikTok, LinkedIn, YouTube, X/Twitter, Pinterest, Snapchat, Telegram, and Custom URL)
  11. Calendar Event (RFC 5545 `VCALENDAR` / `VEVENT` with UTC timed events and exclusive `DTEND;VALUE=DATE` all-day semantics)
  12. Custom Payload (unmodified raw string / URI scheme)

- **QR Design Studio:**
  - 10 curated design presets
  - 6 module patterns (`square`, `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`)
  - Solid foreground/background colours, transparent background mode, and 2-stop linear/radial gradients
  - Independent corner finder frame (`square`, `extra-rounded`, `dot`) and inner dot (`square`, `dot`) styles and colours
  - Center logo upload (`PNG`, `JPEG`, `WebP`, `SVG` up to `2 MB`) with multi-layer client-side SVG sanitization, scale (`10%–30%`), padding (`0–16 px`), shape (`square`, `rounded`, `circle`), and backing plate controls
  - Quiet-zone margin (`0–12` modules in UI slider, default `4` modules, `0–24` modules programmatic clamp) and error correction levels (`L`, `M`, `Q`, `H`)
  - Real-time advisory scanability analysis (WCAG relative luminance contrast ratio, quiet-zone check, logo coverage, and UTF-8 byte capacity)

- **Production Export Engine:**
  - **PNG:** 32-bit RGBA raster export with transparent or solid background (`256px` Compact, `512px` Web/Screen, `1024px` Web/High Resolution, `2048px` Print/Standard `~6.83 in @ 300 DPI`, `4096px` Print/Large Signage `~13.65 in @ 300 DPI`, or custom `128px`–`4096px`)
  - **JPEG:** Raster export with selectable quality (`80%`, `92%`, `100%`) and automatic `#FFFFFF` (or custom colour) background compositing for transparent designs
  - **SVG:** Standalone XML 1.0 vector export with explicit `xmlns`, `width`, `height`, `viewBox`, unique gradient/clipPath IDs, and self-contained base64 data-URI logos (`PNG`, `JPEG`, `WebP`, `SVG`)
  - **Clipboard:** One-click `Copy QR Image` (with automatic PNG download fallback) and `Copy Payload`

- **Brand Identity & Icon Suite (`v1.1.0`):**
  - Custom geometric QR brand mark and wordmark in `public/logo/` (`logo.svg`, `icon.svg`, `logo-light.svg`, `logo-dark.svg`, `logo-mono.svg`) and multi-resolution favicons/app icons in `public/` (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`).

- **Client-Side Architecture:**
  - QR payload generation, input validation, SVG sanitization, and PNG/JPEG/SVG exports run client-side in your browser without requiring user accounts or a backend database.

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20`
- **pnpm** `>= 9`

### Installation & Local Development

```bash
# Install dependencies
pnpm install

# Start the development server at http://localhost:3000
pnpm dev
```

### Optional Environment Variable

Canonical URLs, OpenGraph `url` metadata, and `/sitemap.xml` entries are emitted only when `NEXT_PUBLIC_SITE_URL` is configured:

```bash
# Optional: set your production deployment origin (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://your-domain.example.com
```

When `NEXT_PUBLIC_SITE_URL` is unset, the application builds and runs without fabricating a production domain.

---

## Verification & Testing

```bash
# TypeScript strict typecheck
pnpm typecheck

# ESLint check
pnpm lint

# Vitest unit & integration test suite
pnpm test

# Production Next.js build
pnpm build

# Playwright end-to-end browser tests
pnpm exec playwright test
```

---

## License

Released under the [MIT License](./LICENSE).
