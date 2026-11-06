# OpenQR Studio
## Product Requirements Document & Technical Development Blueprint

**Document Version:** 1.0  
**Product:** OpenQR Studio  
**Product Category:** Open-source QR Code Generator & Design Studio  
**License:** MIT  
**Platform:** Web Application / Progressive Web App  
**Framework:** Next.js App Router  
**Language:** TypeScript  
**Deployment:** Vercel  
**Architecture:** Client-side processing  
**Primary Objective:** A completely free, privacy-first, customizable QR code generation platform.

---

# 1. PRODUCT OVERVIEW

## 1.1 Product Vision

OpenQR Studio is a free, open-source QR code generator and design studio that allows users to create, customize, preview and download static QR codes without creating an account or submitting personal information to a backend.

The application should support a broad range of QR code payloads, including URLs, vCards, Wi-Fi credentials, contact information, locations, email, telephone, SMS, calendar events, social media links and custom text.

Users should have full control over the appearance of generated QR codes, including patterns, colors, gradients, finder patterns, logos, backgrounds, margins and export dimensions.

The application must operate entirely within the user's browser for all QR generation and customization operations.

## 1.2 Core Value Proposition

**Create beautiful QR codes. Completely free. No account. No tracking. No data collection.**

Product principles:

1. Free forever for core QR functionality.
2. Open-source code under the MIT License.
3. No user accounts or registration.
4. No server-side QR generation.
5. No database or user-content storage.
6. No subscriptions or export restrictions.
7. No watermarks.
8. No artificial restrictions on downloads.
9. Mobile-friendly and accessible.
10. Self-hostable by anyone.

## 1.3 Target Audience

- Individuals creating personal QR codes.
- Small businesses.
- Marketing professionals.
- Graphic designers.
- Restaurants and hospitality businesses.
- Event organizers.
- Retail stores.
- Developers.
- Educational institutions.
- Print and signage companies.

## 1.4 Competitive Positioning

OpenQR Studio should provide a combination of:

- Adobe Express-style simplicity.
- QRCode Monkey-style customization.
- A privacy-first, offline-capable architecture.
- The transparency of open-source software.

The objective is not to replicate another application's interface. It is to build an independent product with a simpler workflow and fewer restrictions.

---

# 2. PRODUCT SCOPE

## 2.1 MVP Scope

The first production-ready version must include:

- Website URL QR codes.
- Plain text QR codes.
- vCard QR codes.
- Wi-Fi QR codes.
- Email QR codes.
- Phone QR codes.
- SMS QR codes.
- Location QR codes.
- WhatsApp QR codes.
- Social media profile links.
- Custom QR payloads.
- Live QR preview.
- Pattern customization.
- Foreground and background colors.
- Gradient customization.
- Finder pattern customization.
- Logo upload.
- PNG export.
- JPG export.
- SVG export.
- Responsive design.
- Privacy documentation.
- Open-source repository.

## 2.2 Features Explicitly Excluded from MVP

The following should not be included in the initial release:

- User accounts.
- Login and registration.
- Cloud storage.
- QR code management dashboard.
- Dynamic QR codes.
- QR scan analytics.
- QR scan tracking.
- URL shortening.
- Subscription functionality.
- Payment gateways.
- Server-side QR generation.
- User data collection.

These features would compromise the simplicity and privacy objectives.

---

# 3. QR CODE GENERATOR MODULE

The generator should use a modular architecture where every QR code type has its own input component, validation rules and payload-generation utility.

## 3.1 Supported QR Types

### A. URL

Fields:
- Website URL.
- Optional URL validation and normalization.

Requirements:
- Accept HTTP and HTTPS URLs.
- Warn about invalid or suspicious URL formats.
- Do not automatically shorten URLs.
- Preserve valid URL parameters.
- Allow custom URI payloads through the advanced custom mode.

### B. Plain Text

Fields:
- Multiline text input.

Requirements:
- Support Unicode characters.
- Support Sinhala, Tamil and other languages.
- Display payload character count.
- Display an estimated QR complexity indicator.
- Warn when the payload is too large.

### C. vCard Contact

Fields:
- First name.
- Last name.
- Full name.
- Organization.
- Job title.
- Mobile number.
- Telephone.
- Email.
- Website.
- Street address.
- City.
- State/Province.
- Postal code.
- Country.
- Notes.

Requirements:
- Generate a standards-compatible vCard payload.
- Use vCard 3.0 as the initial compatibility target.
- Escape special characters.
- Handle Unicode correctly.
- Support multiline fields.
- Exclude empty fields.
- Provide an optional contact preview.

### D. Wi-Fi

Fields:
- Network name (SSID).
- Password.
- Security type: WPA, WEP or None.
- Hidden network toggle.

Requirements:
- Generate the standard Wi-Fi QR payload.
- Escape reserved characters.
- Do not display passwords in logs.
- Provide a show/hide password option.
- Provide an appropriate empty-password option for open networks.

### E. Email

Fields:
- Email address.
- Subject.
- Message.

Generate a mailto URI with correctly encoded query parameters.

### F. Phone

Fields:
- Telephone number.

Generate a tel URI.

### G. SMS

Fields:
- Telephone number.
- Optional pre-filled message.

Generate an SMS-compatible URI and test on supported mobile devices.

### H. Location

Fields:
- Latitude.
- Longitude.
- Optional location label.
- Optional physical address.
- Optional Google Maps URL.

Support:
- geo URI.
- Google Maps URL.
- Coordinates.

Do not assume that every QR scanner handles geographic URIs identically. Provide a Google Maps URL option for broader compatibility.

### I. WhatsApp

Fields:
- Country code.
- Phone number.
- Optional pre-filled message.

Generate a wa.me link.

Validate phone number formatting and encode the message correctly.

### J. Social Media

Supported providers:
- Instagram.
- Facebook.
- LinkedIn.
- YouTube.
- TikTok.
- X.
- Pinterest.
- Other custom profile URLs.

The social media module should be URL-based rather than depending on third-party APIs.

### K. Calendar Events

Fields:
- Event title.
- Start date/time.
- End date/time.
- Location.
- Description.
- Optional URL.

Generate a standards-compatible iCalendar VEVENT payload with proper escaping and date formatting.

The application must clearly explain that calendar QR import support depends on the scanning device and application.

### L. Custom Payload

Allow advanced users to enter arbitrary text or URI data.

Requirements:
- No automatic modification of the supplied payload.
- Payload length display.
- QR capacity warnings.
- Optional advanced encoding settings.
- Preserve line breaks.

---

# 4. QR DESIGN STUDIO

The design studio is a core differentiating feature.

Users must be able to customize the QR code while viewing the result in real time.

## 4.1 Pattern Customization

Support available patterns from the selected QR rendering library.

Initial pattern options:

- Square.
- Rounded.
- Dots.
- Extra rounded.
- Classy.
- Classy rounded.
- Additional patterns where supported.

Do not advertise a pattern that the rendering engine does not actually support.

## 4.2 Foreground Customization

Options:
- Solid color.
- Gradient.
- Linear gradient.
- Radial gradient, where supported.
- Custom HEX input.
- RGB color input.
- Color picker.
- Preset color palettes.

## 4.3 Background Customization

Options:
- White.
- Black.
- Custom solid color.
- Transparent.
- Gradient.
- Optional background image.

The background image feature should be treated as an advanced option and tested carefully to avoid reducing QR readability.

## 4.4 Finder Pattern Customization

Allow independent configuration of:

- Outer eye shape.
- Inner eye shape.
- Outer eye color.
- Inner eye color.

Finder patterns must remain visually distinguishable.

## 4.5 Logo Upload

Supported formats:
- PNG.
- JPEG.
- WebP.
- SVG, subject to safe handling.

Controls:
- Logo upload.
- Logo size.
- Logo margin.
- Logo background.
- Rounded container.
- Circular container.
- Square container.
- Optional white background.
- Remove logo.

All uploaded assets must remain in browser memory.

Do not upload logos to a server.

For SVG uploads:
- Sanitize or rasterize untrusted SVG input locally.
- Do not insert raw uploaded SVG markup into the DOM.
- Reject unsafe SVG content.
- Apply file-size limits.

## 4.6 Size and Layout

Options:
- QR output dimensions.
- Quiet-zone margin.
- Padding.
- Logo dimensions.
- Preview scale.

The quiet zone must not be removable below the minimum safe configuration.

## 4.7 Error Correction

Support:
- Low (L).
- Medium (M).
- Quartile (Q).
- High (H).

Provide short explanations.

Recommended default: H when a logo is present, M otherwise, subject to the rendering library's actual capabilities.

The application must not claim that a particular error correction level guarantees logo readability.

## 4.8 Design Presets

Provide initial presets:

1. Classic Black.
2. Minimal White.
3. Midnight.
4. Ocean Blue.
5. Forest Green.
6. Royal Purple.
7. Sunset Gradient.
8. Corporate Blue.
9. Luxury Gold.
10. Transparent.

Presets must be local static configuration objects, not database records.

Users should be able to reset to the default design.

---

# 5. EXPORT MODULE

## 5.1 PNG

Requirements:
- High-resolution PNG.
- Transparent background option.
- Custom dimensions.
- Correct antialiasing.
- Download without watermark.

## 5.2 JPG/JPEG

Requirements:
- Configurable quality.
- Custom dimensions.
- Background must be flattened.
- Transparent backgrounds must be converted to a chosen solid color.

## 5.3 SVG

Requirements:
- Genuine vector output.
- Preserve QR geometry.
- Support customization.
- Support logo embedding where compatible.
- Avoid unnecessary external asset references.
- Produce self-contained SVG files where possible.

Uploaded SVG logos must be sanitized or converted before embedding.

## 5.4 Additional Export Options

Future enhancements:
- Copy QR as image.
- Copy QR as SVG.
- Print-ready dimensions.
- Custom pixel dimensions.
- Batch export.
- ZIP archive for batch generation.

## 5.5 Export UX

Provide:
- Download PNG.
- Download JPG.
- Download SVG.

Export actions should use meaningful filenames, such as:

openqr-website.png  
openqr-contact.svg  
openqr-wifi.jpg

Never include sensitive payload data in filenames.

---

# 6. TECHNICAL ARCHITECTURE

## 6.1 Technology Stack

Framework:
- Next.js App Router.
- React.
- TypeScript.

UI:
- Tailwind CSS.
- shadcn/ui.
- Lucide React.

Forms:
- React Hook Form.
- Zod.

QR:
- qr-code-styling.
- A separate payload-generation layer.

Color:
- react-colorful.

Utilities:
- date-fns, if needed.
- Browser File APIs.
- Native Blob and Canvas APIs where appropriate.

Testing:
- Vitest.
- React Testing Library.
- Playwright.

Package manager:
- pnpm.

Hosting:
- Vercel.

Repository:
- GitHub.

## 6.2 Architecture Principles

1. Keep QR generation in the browser.
2. Avoid API routes.
3. Avoid database integrations.
4. Avoid authentication libraries.
5. Avoid cloud file storage.
6. Keep payload generation separate from QR rendering.
7. Keep UI components reusable.
8. Use TypeScript strict mode.
9. Lazy-load heavy browser-only dependencies.
10. Keep the application compatible with static hosting.

## 6.3 QR Rendering Strategy

Use qr-code-styling as the initial rendering engine.

The library should be dynamically imported in a client-only module.

Important:
- Verify package compatibility with the selected Next.js and React versions.
- Verify SVG export behavior.
- Verify logo support for every export format.
- Verify gradient and finder pattern behavior.
- Verify output in actual QR scanning applications.

Do not access window, document, Canvas or other browser APIs during server rendering.

Keep the QR renderer behind an internal adapter interface so that the underlying library can be replaced later.

## 6.4 Static Deployment

Configure the application for Vercel deployment.

Preferred approach:
- Next.js App Router.
- Static rendering for public pages.
- Client-only QR editor.
- No dynamic server functions.
- No server-side user-data processing.

Consider Next.js static export only after verifying that all selected libraries and routes work correctly with export mode.

Do not force static export if it introduces unnecessary limitations. Standard Vercel deployment with statically rendered pages and browser-only editing is acceptable.

---

# 7. RECOMMENDED FOLDER STRUCTURE

Use the following structure as the project foundation.

```text
openqr-studio/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── manifest.ts
│   ├── robots.ts
│   ├── sitemap.ts
│   │
│   ├── create/
│   │   └── page.tsx
│   │
│   ├── privacy/
│   │   └── page.tsx
│   │
│   ├── about/
│   │   └── page.tsx
│   │
│   ├── documentation/
│   │   └── page.tsx
│   │
│   └── not-found.tsx
│
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── mobile-navigation.tsx
│   │
│   ├── generator/
│   │   ├── qr-workspace.tsx
│   │   ├── qr-type-selector.tsx
│   │   ├── qr-content-panel.tsx
│   │   ├── qr-preview.tsx
│   │   └── qr-download-panel.tsx
│   │
│   ├── forms/
│   │   ├── url-form.tsx
│   │   ├── text-form.tsx
│   │   ├── vcard-form.tsx
│   │   ├── wifi-form.tsx
│   │   ├── email-form.tsx
│   │   ├── phone-form.tsx
│   │   ├── sms-form.tsx
│   │   ├── location-form.tsx
│   │   ├── whatsapp-form.tsx
│   │   ├── social-form.tsx
│   │   ├── calendar-form.tsx
│   │   └── custom-form.tsx
│   │
│   ├── designer/
│   │   ├── design-panel.tsx
│   │   ├── pattern-selector.tsx
│   │   ├── color-controls.tsx
│   │   ├── gradient-controls.tsx
│   │   ├── finder-pattern-controls.tsx
│   │   ├── logo-uploader.tsx
│   │   ├── background-controls.tsx
│   │   ├── margin-control.tsx
│   │   ├── error-correction-control.tsx
│   │   └── preset-selector.tsx
│   │
│   ├── ui/
│   │   └── shadcn-components/
│   │
│   └── shared/
│       ├── color-picker.tsx
│       ├── section-heading.tsx
│       ├── file-dropzone.tsx
│       └── tooltip-info.tsx
│
├── lib/
│   ├── qr/
│   │   ├── payloads/
│   │   │   ├── url.ts
│   │   │   ├── text.ts
│   │   │   ├── vcard.ts
│   │   │   ├── wifi.ts
│   │   │   ├── email.ts
│   │   │   ├── phone.ts
│   │   │   ├── sms.ts
│   │   │   ├── location.ts
│   │   │   ├── whatsapp.ts
│   │   │   ├── social.ts
│   │   │   ├── calendar.ts
│   │   │   └── custom.ts
│   │   │
│   │   ├── renderer/
│   │   │   ├── qr-adapter.ts
│   │   │   ├── qr-engine.ts
│   │   │   ├── export.ts
│   │   │   └── capabilities.ts
│   │   │
│   │   ├── validation/
│   │   │   ├── payload-validation.ts
│   │   │   ├── url-validation.ts
│   │   │   └── qr-capacity.ts
│   │   │
│   │   ├── encoding/
│   │   │   ├── escape-vcard.ts
│   │   │   ├── escape-wifi.ts
│   │   │   └── escape-ical.ts
│   │   │
│   │   └── presets/
│   │       └── design-presets.ts
│   │
│   ├── utils/
│   │   ├── file-utils.ts
│   │   ├── color-utils.ts
│   │   ├── download-utils.ts
│   │   └── naming-utils.ts
│   │
│   └── constants/
│       ├── qr-types.ts
│       └── app-config.ts
│
├── hooks/
│   ├── use-qr-generator.ts
│   ├── use-qr-design.ts
│   ├── use-qr-export.ts
│   └── use-object-url.ts
│
├── types/
│   ├── qr.ts
│   ├── payload.ts
│   ├── design.ts
│   └── export.ts
│
├── public/
│   ├── icons/
│   ├── images/
│   └── logo/
│
├── tests/
│   ├── unit/
│   │   ├── payloads/
│   │   ├── validation/
│   │   └── encoding/
│   │
│   ├── integration/
│   └── fixtures/
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
│
├── .gitignore
├── .npmrc
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── CHANGELOG.md
```

The structure can evolve, but keep payload generation, rendering, validation and presentation separated.

---

# 8. TYPESCRIPT DATA CONTRACTS

Use discriminated unions for payloads and explicit types for design configuration.

## 8.1 QR Types

```typescript
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
```

## 8.2 Payload Contracts

```typescript
export interface UrlPayload {
  type: "url";
  url: string;
}

export interface TextPayload {
  type: "text";
  text: string;
}

export interface VCardPayload {
  type: "vcard";
  firstName?: string;
  lastName?: string;
  fullName: string;
  organization?: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  note?: string;
}

export interface WiFiPayload {
  type: "wifi";
  ssid: string;
  password?: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface EmailPayload {
  type: "email";
  email: string;
  subject?: string;
  message?: string;
}

export interface PhonePayload {
  type: "phone";
  phone: string;
}

export interface SMSPayload {
  type: "sms";
  phone: string;
  message?: string;
}

export interface LocationPayload {
  type: "location";
  latitude: number;
  longitude: number;
  label?: string;
  format: "geo" | "google-maps";
}

export interface WhatsAppPayload {
  type: "whatsapp";
  phone: string;
  message?: string;
}

export interface SocialPayload {
  type: "social";
  provider: string;
  url: string;
}

export interface CalendarPayload {
  type: "calendar";
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  url?: string;
}

export interface CustomPayload {
  type: "custom";
  value: string;
}

export type QRPayload =
  | UrlPayload
  | TextPayload
  | VCardPayload
  | WiFiPayload
  | EmailPayload
  | PhonePayload
  | SMSPayload
  | LocationPayload
  | WhatsAppPayload
  | SocialPayload
  | CalendarPayload
  | CustomPayload;
```

## 8.3 Design Contracts

```typescript
export type DotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

export type ExportFormat = "png" | "jpeg" | "svg";

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

export interface QRDesign {
  width: number;
  height: number;
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
    outerStyle: string;
    innerStyle: string;
    outerColor: string;
    innerColor: string;
  };

  logo?: {
    source: string;
    size: number;
    margin: number;
    shape: "square" | "rounded" | "circle";
    backgroundColor?: string;
  };

  errorCorrection: ErrorCorrectionLevel;
}

export interface ExportOptions {
  format: ExportFormat;
  width: number;
  height: number;
  quality?: number;
  backgroundColor?: string;
}
```

The adapter must validate design values against actual rendering-engine capabilities. Do not assume every configuration can be passed directly to the underlying library.

---

# 9. QR PAYLOAD STANDARDS

Implement payload generation in independent pure TypeScript functions.

Suggested interface:

```typescript
export function generatePayload(
  payload: QRPayload
): string;
```

Each payload module must have:
- A generator.
- Input validation.
- Escaping utilities.
- Unit tests.
- Example output.
- Documentation.

## 9.1 vCard

Use vCard 3.0 initially.

Expected format:

BEGIN:VCARD
VERSION:3.0
N:Doe;John;;;
FN:John Doe
ORG:Example Company
TITLE:Manager
TEL;TYPE=CELL:+1234567890
EMAIL:john@example.com
URL:https://example.com
END:VCARD

Requirements:
- Escape backslashes.
- Escape commas and semicolons.
- Encode line breaks correctly.
- Use CRLF line endings.
- Handle UTF-8.
- Fold long lines according to vCard requirements.

## 9.2 Wi-Fi

Expected structure:

WIFI:T:WPA;S:NetworkName;P:Password;H:false;;

Requirements:
- Escape semicolons.
- Escape commas.
- Escape colons.
- Escape backslashes.
- Handle empty passwords.
- Handle hidden networks.
- Support WPA, WEP and nopass.

## 9.3 Email

Example:

mailto:hello@example.com?subject=Hello&body=Example%20message

Use proper URI encoding for query parameters.

## 9.4 Phone

Example:

tel:+1234567890

Preserve valid international formatting.

## 9.5 SMS

Example:

sms:+1234567890?body=Hello

Test mobile compatibility and avoid assuming all platforms interpret SMS URI parameters identically.

## 9.6 WhatsApp

Example:

https://wa.me/1234567890?text=Hello

Phone number should contain the international country code without spaces or punctuation.

## 9.7 Location

Example:

geo:6.9271,79.8612

Alternative:

https://www.google.com/maps?q=6.9271,79.8612

## 9.8 Calendar

Generate a valid VCALENDAR/VEVENT structure.

Requirements:
- BEGIN:VCALENDAR.
- VERSION:2.0.
- PRODID.
- BEGIN:VEVENT.
- DTSTART.
- DTEND.
- SUMMARY.
- DESCRIPTION.
- LOCATION.
- END:VEVENT.
- END:VCALENDAR.

Use correct escaping and date/time handling. Include a UTC or timezone-aware representation to avoid ambiguous event times.

## 9.9 Capacity Handling

QR capacity depends on:
- QR version.
- Error correction level.
- Encoding mode.
- Character encoding.

Do not calculate capacity using character count alone.

Use the QR engine's actual encoding capabilities or a tested QR capacity implementation.

Show warnings before the payload exceeds available capacity.

Support UTF-8 and test multilingual content.

---

# 10. UI/UX DESIGN SYSTEM

## 10.1 Design Direction

The application should feel like a polished creative tool, not an administrative dashboard.

Design references:
- Adobe Express.
- Linear.
- Raycast.
- Modern minimalist SaaS tools.

Design principles:
- Clean typography.
- Generous whitespace.
- Simple navigation.
- Clear hierarchy.
- Minimal visual noise.
- Fast interaction.
- Strong preview visibility.

## 10.2 Brand Direction

Product name: OpenQR Studio.

Brand personality:
- Modern.
- Trustworthy.
- Minimal.
- Creative.
- Open.
- Accessible.

Suggested palette:

| Purpose | Color |
|---|---|
| Primary | #171717 |
| Background | #FFFFFF |
| Secondary background | #F5F5F5 |
| Primary accent | #2563EB |
| Success | #16A34A |
| Warning | #D97706 |
| Border | #E5E5E5 |
| Muted text | #737373 |

Use semantic CSS variables instead of hardcoding colors throughout components.

## 10.3 Typography

Use Geist or Inter.

Typography hierarchy:
- Hero heading: 48–64px desktop.
- Section heading: 24–32px.
- Card heading: 16–20px.
- Body: 14–16px.
- Supporting text: 12–14px.

## 10.4 Main Navigation

Header:

- Logo.
- Create QR.
- Features.
- About.
- Documentation.
- GitHub.
- Theme toggle.

Primary action: Create QR Code.

## 10.5 Homepage

Sections:

1. Hero.
2. QR generator entry point.
3. QR type showcase.
4. Customization showcase.
5. Privacy explanation.
6. Features.
7. How it works.
8. Open-source invitation.
9. FAQ.
10. Footer.

Suggested hero copy:

"Create QR Codes. Your Way."

"Generate beautiful, fully customizable QR codes for links, contacts, Wi-Fi, locations and more. Free, private and open source."

Primary CTA: Create QR Code.

Secondary CTA: Explore Features.

## 10.6 QR Editor Layout

Desktop:

Left panel:
- QR type selection.
- Content fields.
- Design controls.
- Export settings.

Right panel:
- Large live preview.
- Current design summary.
- Scanability warnings.
- Download controls.

Suggested width distribution:
- Editor: 42%.
- Preview: 58%.

The layout must adapt to smaller screens.

Mobile:
- Compact header.
- Accessible QR type selector.
- Collapsible design sections.
- Large preview.
- Sticky download action where appropriate.

## 10.7 Interaction Requirements

- Update preview when valid input changes.
- Debounce expensive rendering operations.
- Avoid regenerating the QR code unnecessarily.
- Keep editing responsive.
- Show clear validation messages.
- Show loading states during large exports.
- Provide toast notifications for successful downloads.
- Provide an obvious reset action.
- Do not erase user input unexpectedly.

---

# 11. PRIVACY AND SECURITY REQUIREMENTS

Privacy is a core product requirement, not an optional marketing feature.

## 11.1 Data Processing

All user-generated QR payloads must be processed in the browser.

No payload should be transmitted to:
- Application servers.
- Analytics services.
- Logging platforms.
- Third-party APIs.
- Cloud storage.

## 11.2 Storage

Do not implement:
- Database storage.
- Local storage persistence of payloads.
- Session storage persistence of payloads.
- IndexedDB persistence of payloads.
- Cloud-based image uploads.

Generated content should remain in component state and browser memory.

Uploaded logos and background images should use local object URLs or in-memory data only.

## 11.3 Analytics

No third-party analytics in the initial release.

Do not install:
- Google Analytics.
- Meta Pixel.
- Advertising trackers.
- Session recording tools.
- Behavioral tracking.

## 11.4 Network Requests

The editor must not send user content over the network.

Do not use:
- Remote image processing.
- External URL preview services.
- URL shortening services.
- External QR APIs.
- Third-party font services at runtime where avoidable.

Use local fonts and bundled dependencies.

## 11.5 File Upload Security

- Validate MIME type and file extension.
- Check file size.
- Decode images safely.
- Reject unsupported files.
- Avoid executing uploaded SVG content.
- Release object URLs when no longer needed.
- Avoid retaining large image data unnecessarily.

## 11.6 Privacy Verification

Before production release:
- Inspect network requests.
- Confirm that QR payloads are not transmitted.
- Confirm that image files are not uploaded.
- Inspect browser storage.
- Verify no analytics scripts.
- Verify no accidental console logging of passwords or payloads.

## 11.7 Privacy Policy

Explain:
- No account required.
- QR generation happens locally.
- Uploaded assets are processed locally.
- QR content is not submitted to application servers.
- No QR content database exists.
- Hosting infrastructure may process standard technical request metadata.
- External QR destinations remain subject to their own privacy policies.

---

# 12. SCANABILITY AND QUALITY CONTROL

A QR code must remain functional after customization.

Implement:

1. Quiet-zone validation.
2. Foreground/background contrast checks.
3. Logo size warnings.
4. QR capacity validation.
5. Error correction warnings.
6. Export dimensions validation.
7. Independent QR decoding tests.

The UI should display a scanability status:

- Good: no obvious design concerns.
- Warning: one or more potential readability issues.
- High risk: major readability concerns.

This is an advisory assessment, not a guarantee.

Whenever possible, generate the exported image and decode it with an independent QR decoder in tests.

Test plain and heavily customized QR codes separately.

---

# 13. TESTING STRATEGY

## 13.1 Unit Testing

Use Vitest.

Test:
- URL validation.
- vCard generation.
- Wi-Fi generation.
- Email encoding.
- SMS encoding.
- Phone encoding.
- WhatsApp links.
- Location generation.
- Calendar generation.
- Unicode support.
- Special-character escaping.
- Filename generation.
- Design preset validation.

## 13.2 Component Testing

Use React Testing Library.

Test:
- QR type selection.
- Form validation.
- Input updates.
- Design control changes.
- Logo upload.
- Preset selection.
- Export interactions.
- Reset functionality.

## 13.3 End-to-End Testing

Use Playwright.

Test complete user journeys:

Journey 1:
- Open application.
- Select URL.
- Enter URL.
- Preview QR.
- Download PNG.

Journey 2:
- Select vCard.
- Enter contact details.
- Generate QR.
- Download SVG.

Journey 3:
- Select Wi-Fi.
- Enter network information.
- Customize QR.
- Download JPG.

Journey 4:
- Upload logo.
- Change colors.
- Change QR pattern.
- Export customized PNG.

Journey 5:
- Generate Unicode text QR.
- Verify successful rendering and decoding.

Journey 6:
- Test responsive layouts on mobile.

## 13.4 Browser Testing

Test:
- Chrome.
- Safari.
- Firefox.
- Edge.
- iOS Safari.
- Android Chrome.

Pay particular attention to SVG downloads and mobile file downloads.

## 13.5 Accessibility

Target WCAG 2.2 AA.

Requirements:
- Keyboard navigation.
- Visible focus states.
- Accessible form labels.
- Proper contrast.
- Screen-reader support.
- Accessible dialogs.
- Reduced-motion support.
- Meaningful button labels.

---

# 14. PERFORMANCE REQUIREMENTS

Targets:

- Fast initial page load.
- Minimal client-side JavaScript on public pages.
- Lazy-load QR editor dependencies.
- Avoid unnecessary React re-renders.
- Avoid rendering large QR images on every keystroke.
- Use responsive image handling.
- Optimize fonts.
- Avoid unnecessary external network calls.

Use Lighthouse and browser performance profiling.

Suggested performance targets:
- Lighthouse Performance: 90+.
- Accessibility: 95+.
- Best Practices: 95+.
- SEO: 95+.

These are targets, not guarantees.

---

# 15. SEO AND PUBLIC DOCUMENTATION

Although the product is a tool, public landing pages should be search-engine friendly.

Core pages:
- Home.
- QR Code Generator.
- vCard QR Generator.
- Wi-Fi QR Generator.
- URL QR Generator.
- Location QR Generator.
- About.
- Privacy.
- Documentation.

Implement:
- Unique metadata.
- Open Graph images.
- Canonical URLs.
- Sitemap.
- Robots.
- Semantic HTML.
- Descriptive headings.
- FAQ content.
- Structured data only where appropriate.

The actual QR editor should not be the only content available to search engines.

---

# 16. PWA AND OFFLINE SUPPORT

Treat offline capability as a planned enhancement.

Requirements:
- Web app manifest.
- Installable application.
- Locally bundled dependencies.
- Local fonts.
- Offline editor support.
- No network dependency for generation.

A service worker should cache application assets only.

Never cache generated QR payloads, uploaded images or sensitive user data.

Test the complete application after disconnecting the network.

---

# 17. OPEN-SOURCE RELEASE

License: MIT.

Repository requirements:
- README.md.
- LICENSE.
- CONTRIBUTING.md.
- CODE_OF_CONDUCT.md.
- CHANGELOG.md.
- Security reporting instructions.
- GitHub issue templates.
- GitHub pull request template.

README sections:
1. What is OpenQR Studio?
2. Features.
3. Screenshots.
4. Live demo.
5. Installation.
6. Local development.
7. Build instructions.
8. Architecture.
9. Privacy principles.
10. Contributing.
11. License.

Include a clear statement that the project is not affiliated with Adobe or other commercial QR generator brands.

---

# 18. DEVELOPMENT ROADMAP

## Phase 0 – Project Foundation

- Initialize Next.js.
- Configure TypeScript strict mode.
- Configure Tailwind.
- Install shadcn/ui.
- Establish design tokens.
- Set up ESLint.
- Set up Vitest.
- Set up Playwright.
- Create folder structure.
- Create GitHub repository.

Acceptance criteria:
- Application builds.
- No TypeScript errors.
- Lint passes.
- Tests run.
- Vercel deployment works.

## Phase 1 – Core QR Engine

- Implement QR payload types.
- Implement payload generators.
- Implement validation.
- Integrate QR renderer.
- Build live preview.
- Implement basic PNG, JPG and SVG exports.

Acceptance criteria:
- Every initial QR type generates valid content.
- QR codes can be decoded.
- No backend generation.
- Exports work.

## Phase 2 – Design Studio

- Patterns.
- Colors.
- Gradients.
- Finder patterns.
- Logo upload.
- Background customization.
- Margin controls.
- Error correction.
- Design presets.

Acceptance criteria:
- Changes update preview.
- Logo uploads remain local.
- Export reflects the preview.
- Scanability warnings work.

## Phase 3 – Complete Generator

- All remaining QR types.
- Advanced validation.
- Better payload capacity feedback.
- Unicode handling.
- Calendar and location support.
- Custom payload mode.

Acceptance criteria:
- Payloads are tested.
- Invalid inputs are handled.
- Special characters are escaped.
- International text is supported.

## Phase 4 – Quality and Privacy

- Independent decoding tests.
- Privacy audit.
- Security checks.
- Accessibility checks.
- Mobile testing.
- Performance improvements.

Acceptance criteria:
- No QR content is transmitted.
- No tracking scripts.
- No persistent user-content storage.
- Core functionality works on supported browsers.

## Phase 5 – Release

- Documentation.
- GitHub release.
- MIT license.
- Production deployment.
- SEO.
- PWA enhancements.
- Contribution guidelines.

---

# 19. GOOGLE ANTIGRAVITY DEVELOPMENT RULES

These instructions must be followed throughout implementation.

## General Rules

1. Use TypeScript.
2. Prefer TSX for React components.
3. Use pnpm.
4. Use Next.js App Router.
5. Follow the defined folder structure.
6. Keep components modular.
7. Do not use `any` unless absolutely unavoidable and documented.
8. Do not introduce unnecessary dependencies.
9. Do not add a database.
10. Do not add authentication.
11. Do not create API routes for QR generation.
12. Do not upload user assets to external services.
13. Do not add analytics.
14. Do not implement dynamic QR functionality.
15. Do not store user-generated QR payloads.
16. Use accessible shadcn/ui components.
17. Keep code maintainable and documented.
18. Use reusable hooks.
19. Validate all external and user-provided inputs.
20. Do not claim a feature is complete until it is implemented and tested.

## Implementation Discipline

Before each phase:
- Inspect the existing repository.
- Review current architecture.
- Identify dependencies.
- Explain the implementation plan.

During each phase:
- Implement complete features.
- Run lint.
- Run type checking.
- Run relevant tests.
- Fix errors before proceeding.

After each phase:
- Report files created or changed.
- Report tests performed.
- Report outstanding issues.
- Confirm acceptance criteria.

Never silently remove working functionality to make a build pass.

Do not rewrite unrelated project files without a clear reason.

---

# 20. FINAL PRODUCT ACCEPTANCE CRITERIA

OpenQR Studio is ready for its first public release when:

[ ] All MVP QR formats work.

[ ] QR payloads are standards-compliant.

[ ] QR codes can be decoded by independent scanners.

[ ] Live preview works.

[ ] Pattern customization works.

[ ] Foreground and background customization works.

[ ] Gradient customization works.

[ ] Finder patterns can be customized.

[ ] Logo upload works locally.

[ ] PNG export works.

[ ] JPG export works.

[ ] SVG export works.

[ ] Mobile interface works.

[ ] No registration is required.

[ ] No database is used.

[ ] No user payloads are sent to the server.

[ ] No user-content persistence is implemented.

[ ] No analytics tracking is installed.

[ ] Privacy policy is published.

[ ] Documentation is complete.

[ ] MIT license is included.

[ ] Production deployment works.

[ ] Automated tests pass.

---

# 21. FUTURE ENHANCEMENTS

These should not delay the first release.

Potential future features:

- Bulk QR generation from CSV.
- ZIP export.
- Print-ready QR templates.
- Business card templates.
- Restaurant menu QR templates.
- Digital contact card templates.
- QR design sharing through locally generated files.
- Advanced SVG export.
- Offline-first PWA.
- Multi-language interface.
- Additional QR payload standards.
- Custom theme marketplace using locally bundled presets.

Any future feature must preserve the core privacy and free-access commitments.

---

# 22. PRODUCT SUCCESS METRICS

Do not use invasive analytics.

Use privacy-preserving indicators where possible:
- GitHub stars.
- Contributions.
- Issues resolved.
- Releases.
- Community adoption.
- Documentation improvements.
- Independent forks.
- Self-hosted deployments.

Do not track individual users or record their QR content.

---

# FINAL PRODUCT DEFINITION

OpenQR Studio is a browser-based, free and open-source QR code creation and customization platform.

It allows anyone to generate static QR codes for URLs, contacts, Wi-Fi networks, locations, email, phone, SMS, calendar events, social media and custom text.

Users can customize the appearance of their QR codes and export them as PNG, JPG or SVG.

No account is required. No user-generated QR content is sent to the application backend. No subscription, watermark or artificial export restriction exists.

The application is designed to be easy to use, technically maintainable, privacy-conscious, accessible and independently self-hostable.

**Create. Customize. Download. Completely free.**