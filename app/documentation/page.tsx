import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clipboard,
  Code2,
  Download,
  FileCode2,
  FileImage,
  Github,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Lock,
  Palette,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants/app-config";

export const metadata: Metadata = {
  title: "Documentation & User Guide",
  description: `Complete user guide for ${APP_CONFIG.name}: learn how to create all 12 QR code types, customize patterns and logos, export PNG, JPEG, and vector SVG files, and optimize scanability.`,
  ...(APP_CONFIG.siteUrl
    ? {
        alternates: {
          canonical: `${APP_CONFIG.siteUrl}/documentation`,
        },
      }
    : {}),
  openGraph: {
    title: `${APP_CONFIG.name} Documentation & User Guide`,
    description:
      "Practical guide covering all 12 QR code formats, studio design controls, logo guidelines, PNG/JPEG/SVG exports, and scanability troubleshooting.",
    ...(APP_CONFIG.siteUrl ? { url: `${APP_CONFIG.siteUrl}/documentation` } : {}),
    siteName: APP_CONFIG.name,
    type: "article",
  },
};

const DOC_SECTIONS = [
  { id: "getting-started", number: "1", title: "Getting Started" },
  { id: "choosing-a-qr-type", number: "2", title: "Choosing a QR Code Type" },
  { id: "qr-design-customization", number: "3", title: "QR Design Customization" },
  { id: "logo-guidelines", number: "4", title: "Logo Guidelines" },
  { id: "exporting-qr-codes", number: "5", title: "Exporting QR Codes" },
  { id: "clipboard-features", number: "6", title: "Clipboard Features" },
  { id: "qr-code-scanability", number: "7", title: "QR Code Scanability" },
  { id: "troubleshooting", number: "8", title: "Troubleshooting" },
  { id: "privacy-and-security", number: "9", title: "Privacy & Security" },
  { id: "technical-information", number: "10", title: "Technical Information" },
] as const;

interface QRTypeDocItem {
  id: string;
  name: string;
  whatItDoes: string;
  whenToUse: string;
  requiredFields: string;
  optionalFields: string;
  validationRules: string;
  payloadFormat: string;
  examplePayload: string;
}

const QR_TYPE_DOCUMENTATION: readonly QRTypeDocItem[] = [
  {
    id: "url",
    name: "1. Website URL",
    whatItDoes:
      "Opens a web page or online resource in the user's default mobile browser when scanned.",
    whenToUse:
      "Landing pages, digital restaurant menus, product pages, portfolios, and online documentation.",
    requiredFields: "Website URL (e.g., https://example.com).",
    optionalFields: "None.",
    validationRules:
      "Must use http:// or https:// with a valid domain or host. If you enter a bare domain such as example.com, the form offers a one-click helper to prepend https://. Unsafe schemes (such as javascript: or data:) are rejected.",
    payloadFormat: "Direct HTTP/HTTPS URI string.",
    examplePayload: "https://example.com/menu",
  },
  {
    id: "text",
    name: "2. Plain Text",
    whatItDoes:
      "Displays unformatted multiline text directly on the scanning device without requiring an internet connection.",
    whenToUse:
      "Serial numbers, inventory codes, short instructions, classroom prompts, or multilingual notes.",
    requiredFields: "Plain Text content (UTF-8).",
    optionalFields: "None.",
    validationRules:
      "Cannot be empty or whitespace-only, and must remain within the byte capacity of the selected error correction level.",
    payloadFormat:
      "Raw UTF-8 text string (supports Latin, Sinhala, Tamil, Japanese, Arabic, Emoji, and other Unicode scripts).",
    examplePayload: "Batch #4092 — Inspected 2026-11-07",
  },
  {
    id: "vcard",
    name: "3. vCard Contact",
    whatItDoes:
      "Prompts the scanning device to save a structured contact card directly into its address book.",
    whenToUse:
      "Printed business cards, conference badges, email signatures, and office reception signage.",
    requiredFields:
      "First Name and/or Last Name (at least one name field is required).",
    optionalFields:
      "Organization, Job Title, Phone Number, Email Address, Website, Street Address, City, State / Province, Postal Code, and Country.",
    validationRules:
      "Phone numbers (if provided) must contain 5–15 digits with valid formatting. Email (if provided) must be a valid email address. Website (if provided) must begin with http:// or https://.",
    payloadFormat:
      "RFC 2426 vCard 3.0 block delimited by BEGIN:VCARD and END:VCARD with CRLF line endings and escaped special characters.",
    examplePayload:
      "BEGIN:VCARD\\r\\nVERSION:3.0\\r\\nN:Silva;Nimal;;;\\r\\nFN:Nimal Silva\\r\\nORG:OpenQR Studio\\r\\nTEL;TYPE=CELL:+14155550199\\r\\nEMAIL:nimal@example.com\\r\\nEND:VCARD",
  },
  {
    id: "wifi",
    name: "4. Wi-Fi Network",
    whatItDoes:
      "Allows smartphones and tablets to join a wireless network automatically without typing the network name or password.",
    whenToUse:
      "Home guest networks, cafes, hotels, coworking spaces, and conference venues.",
    requiredFields:
      "Network Name (SSID) and Password (when security is set to WPA/WPA2/WPA3 or WEP).",
    optionalFields:
      "Security Type (WPA/WPA2/WPA3, WEP, or None/Open) and Hidden Network toggle.",
    validationRules:
      "SSID is required (up to 32 UTF-8 bytes per IEEE 802.11). WPA/WPA2/WPA3 passphrases must be 8–63 characters (or 64 hex digits). WEP keys must be 5 or 13 ASCII characters (or 10 or 26 hex digits). Switching encryption to None (Open) automatically clears the password field so credentials are not inadvertently encoded.",
    payloadFormat:
      "Common WIFI: credential string (ZXing / Android / iOS convention) with escaped special characters (\\, ;, ,, :, \").",
    examplePayload: "WIFI:T:WPA;S:Guest_Network;P:SecretPass123;H:false;;",
  },
  {
    id: "email",
    name: "5. Email",
    whatItDoes:
      "Opens the device's default email app with the recipient address, subject line, and message body pre-populated.",
    whenToUse:
      "Customer support contact codes, RSVP replies, feedback cards, and helpdesk stickers.",
    requiredFields: "Recipient Email Address.",
    optionalFields: "Subject line and Message Body.",
    validationRules:
      "Recipient email must follow valid user@domain.tld syntax.",
    payloadFormat:
      "URI-encoded mailto: link with optional subject and body query parameters.",
    examplePayload:
      "mailto:support@example.com?subject=Product%20Inquiry&body=Hello%20team",
  },
  {
    id: "phone",
    name: "6. Phone Call",
    whatItDoes:
      "Opens the phone dialer on mobile devices with the telephone number ready to call.",
    whenToUse:
      "Emergency contact signs, service hotlines, storefront windows, and business directories.",
    requiredFields: "Phone Number.",
    optionalFields: "None.",
    validationRules:
      "Must contain between 5 and 15 digits. Accepts international E.164 format (leading + followed by a non-zero country code digit 1–9) or local digits with balanced spaces, hyphens, or parentheses.",
    payloadFormat: "Normalized tel: URI with formatting characters removed.",
    examplePayload: "tel:+14155550199",
  },
  {
    id: "sms",
    name: "7. SMS Message",
    whatItDoes:
      "Opens the device's default text messaging app addressed to a phone number with an optional pre-filled message.",
    whenToUse:
      "SMS opt-in campaigns, appointment confirmations, and quick text-back support.",
    requiredFields: "Recipient Phone Number.",
    optionalFields: "SMS Message Text.",
    validationRules:
      "Phone number must contain 5–15 digits and pass international/local telephone validation.",
    payloadFormat: "Normalized sms: URI with optional URI-encoded ?body= parameter.",
    examplePayload: "sms:+14155550199?body=Confirm%20appointment",
  },
  {
    id: "location",
    name: "8. Location",
    whatItDoes:
      "Opens a map application at exact geographic coordinates or a Google Maps pin.",
    whenToUse:
      "Event venues, trailheads, delivery entrances, tourist landmarks, and physical store directions.",
    requiredFields: "Latitude (-90 to 90) and Longitude (-180 to 180).",
    optionalFields:
      "Location Label and Map Link Format (Standard RFC 5870 geo: or Google Maps Pin URL).",
    validationRules:
      "Latitude must be a valid decimal number between -90 and 90. Longitude must be a valid decimal number between -180 and 180.",
    payloadFormat:
      "Either an RFC 5870 geo:lat,lng URI (with optional ?q= label query) or a Google Maps search URL.",
    examplePayload: "geo:37.7749,-122.4194?q=37.7749,-122.4194(Ferry%20Building)",
  },
  {
    id: "whatsapp",
    name: "9. WhatsApp",
    whatItDoes:
      "Starts a direct WhatsApp chat with the specified phone number and optional pre-written greeting.",
    whenToUse:
      "Customer service chat links, order inquiries, booking requests, and small-business packaging.",
    requiredFields: "Phone Number (with Country Code or full international digits).",
    optionalFields: "Country Code prefix and Pre-filled Message.",
    validationRules:
      "Combined country code and subscriber number must total 7–15 digits with a valid non-zero country code. Formatting symbols and leading domestic trunk zeros (0) after a country code are stripped automatically.",
    payloadFormat:
      "Official WhatsApp Universal Link (https://wa.me/<digits>) with optional ?text= query.",
    examplePayload: "https://wa.me/14155550199?text=Hello%21%20I%20have%20a%20question.",
  },
  {
    id: "social",
    name: "10. Social Media",
    whatItDoes:
      "Links directly to a social media profile, channel, or custom social URL.",
    whenToUse:
      "Creator merch, event posters, packaging inserts, and portfolio cards.",
    requiredFields:
      "Platform selection (Facebook, Instagram, TikTok, LinkedIn, YouTube, X (Twitter), Pinterest, Snapchat, Telegram, or Custom URL) and Username/Handle or Profile URL.",
    optionalFields: "None.",
    validationRules:
      "Accepts either a valid platform handle (such as @username, which is converted to the canonical platform URL) or a full http:///https:// URL. Handles containing invalid spaces or unsupported characters are flagged.",
    payloadFormat: "Canonical HTTPS profile URL for the chosen platform.",
    examplePayload: "https://www.instagram.com/openqrstudio",
  },
  {
    id: "calendar",
    name: "11. Calendar Event",
    whatItDoes:
      "Prompts the user's device to add an appointment or event to their calendar application.",
    whenToUse:
      "Conferences, webinars, workshops, concerts, and community meetups.",
    requiredFields:
      "Event Title, Start Date (and Start Time if not all-day), and End Date (and End Time if not all-day).",
    optionalFields: "All-Day Event toggle, Location, and Event Description.",
    validationRules:
      "Calendar dates are checked against real calendar month lengths and leap years. The end date/time cannot be earlier than the start date/time.",
    payloadFormat:
      "RFC 5545 iCalendar (VCALENDAR / VEVENT) payload. Timed events use UTC timestamps (YYYYMMDDTHHMMSSZ). For all-day events, the form accepts an inclusive end date and automatically advances DTEND;VALUE=DATE by 1 calendar day to satisfy RFC 5545 exclusive end-date semantics.",
    examplePayload:
      "BEGIN:VCALENDAR\\r\\nVERSION:2.0\\r\\nBEGIN:VEVENT\\r\\nSUMMARY:Product Launch\\r\\nDTSTART;VALUE=DATE:20261115\\r\\nDTEND;VALUE=DATE:20261116\\r\\nEND:VEVENT\\r\\nEND:VCALENDAR",
  },
  {
    id: "custom",
    name: "12. Custom Payload",
    whatItDoes:
      "Encodes any raw string, custom URI scheme, or unformatted payload exactly as entered.",
    whenToUse:
      "Mobile app deep links (myapp://...), IoT provisioning strings, internal warehouse barcodes, or specialized protocols.",
    requiredFields: "Raw Payload Data string.",
    optionalFields: "None.",
    validationRules:
      "Must contain at least 1 character (cannot be empty) and fit within QR byte capacity.",
    payloadFormat: "Unmodified UTF-8 byte stream of the entered string.",
    examplePayload: "myapp://device/provision?id=A94F-2201",
  },
] as const;

const TROUBLESHOOTING_ITEMS = [
  {
    problem: "QR code is not scanning on mobile cameras",
    solution:
      "Check the Scanability status badge below the preview. Ensure the quiet-zone margin is at least 4 modules, foreground modules are darker than the background (avoid inverted light-on-dark schemes), and the contrast ratio is at least 4.5:1.",
  },
  {
    problem: "QR code looks too dense or has tiny modules",
    solution:
      "Long payloads (such as detailed vCards or long URLs with tracking parameters) require higher QR versions with more modules. Shorten optional text fields, remove unnecessary URL query parameters, or lower Error Correction from H to M if you are not using a center logo.",
  },
  {
    problem: "Embedded logo prevents the QR code from scanning",
    solution:
      "Reduce the Logo Size slider to 22% or lower, enable the solid Backing Plate so underlying modules do not bleed through transparent parts of your logo, and set Error Correction Level to H (~30%) or Q (~25%).",
  },
  {
    problem: "Low contrast or inverted colour warning",
    solution:
      "Hardware and smartphone scanners expect dark modules and dark corner finder patterns against a lighter surface. Darken your foreground or gradient stops, lighten the background colour, and verify that all three corner finder frames and inner dots also maintain high contrast.",
  },
  {
    problem: "Form shows an invalid input error",
    solution:
      "Each QR type validates its required syntax before rendering. For URLs, ensure the address begins with https:// or http:// (or click the prefix helper). For Phone, SMS, and WhatsApp, ensure the number contains 5–15 digits without unbalanced parentheses. For Calendar events, ensure the end date/time is not before the start date/time.",
  },
  {
    problem: "Export download fails or times out",
    solution:
      "If you are exporting a very large raster dimension (such as 4096×4096 px) on a memory-constrained mobile device, try exporting at 1024×1024 px or 2048×2048 px, or export as a vector SVG file which requires minimal memory and scales infinitely.",
  },
  {
    problem: "Copy QR Image or Copy Payload reports a permission error",
    solution:
      "Modern browsers require clipboard write permission. If you previously blocked clipboard access for the site, click the site permissions icon in your browser's address bar to allow Clipboard access, or use the Download PNG / SVG button directly.",
  },
  {
    problem: "Browser does not support copying images to the clipboard",
    solution:
      "Some browsers restrict the ClipboardItem API for binary PNG images. When image clipboard writing is unavailable, clicking Copy QR Image automatically falls back to downloading the PNG file (openqr-<type>.png) to your device.",
  },
  {
    problem: "Exported SVG displays differently in external software",
    solution:
      "OpenQR Studio exports standalone XML 1.0 SVG files with explicit width, height, viewBox, and embedded base64 logos. If a legacy CAD or vinyl cutter tool does not support SVG <linearGradient> or <image> tags, disable gradients and logos or use a vector editor (such as Inkscape or Illustrator) to flatten shapes before cutting.",
  },
] as const;

export default function DocumentationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="border-b border-border pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
          <BookOpen className="h-3.5 w-3.5 text-foreground" />
          <span>User Guide & Reference Documentation</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {APP_CONFIG.name} Documentation
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
          Learn how to generate all 12 QR code types, customize module patterns
          and logos, export high-resolution PNG, JPEG, and standalone SVG files,
          and ensure reliable scanability across cameras and print media.
        </p>
      </div>

      {/* Mobile & Tablet Quick Navigation */}
      <nav
        aria-label="Documentation sections mobile navigation"
        className="mt-6 rounded-xl border border-border bg-card p-4 lg:hidden"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Jump to Section
        </p>
        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {DOC_SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span className="font-mono text-foreground">{sec.number}.</span>{" "}
              {sec.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Main Layout: Desktop Sticky Sidebar + Content */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Desktop Sidebar TOC */}
        <aside className="hidden lg:col-span-3 lg:block">
          <nav
            aria-label="Documentation table of contents"
            className="sticky top-24 space-y-6 rounded-xl border border-border bg-card p-5"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On This Page
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {DOC_SECTIONS.map((sec) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="block rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <span className="mr-1.5 font-mono text-foreground">
                        {sec.number}.
                      </span>
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <Button asChild variant="accent" size="sm" className="w-full">
                <Link href="/create">
                  Open QR Studio
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </nav>
        </aside>

        {/* Documentation Body */}
        <div className="space-y-16 lg:col-span-9">
          {/* 1. Getting Started */}
          <section
            id="getting-started"
            className="scroll-mt-24"
            aria-labelledby="heading-getting-started"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                1
              </span>
              <h2
                id="heading-getting-started"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Getting Started
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {APP_CONFIG.name} runs directly in your browser with no account
              creation or software installation required. Follow these six steps
              to create and download a custom QR code:
            </p>

            <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li className="rounded-xl border border-border bg-card p-5">
                <span className="font-mono text-xs font-semibold text-accent">
                  Step 1 • Access the Studio
                </span>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Open the QR Design Studio
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Navigate to the{" "}
                  <Link href="/create" className="underline hover:text-foreground">
                    Create QR
                  </Link>{" "}
                  workspace from the top navigation bar or homepage.
                </p>
              </li>

              <li className="rounded-xl border border-border bg-card p-5">
                <span className="font-mono text-xs font-semibold text-accent">
                  Step 2 • Select Content Type
                </span>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Choose a QR Code Type
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Pick one of the 12 supported QR content tabs (such as Website
                  URL, Wi-Fi Network, vCard Contact, or Calendar Event).
                </p>
              </li>

              <li className="rounded-xl border border-border bg-card p-5">
                <span className="font-mono text-xs font-semibold text-accent">
                  Step 3 • Enter Details
                </span>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Fill in the Content Form
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Enter your information into the guided fields. Inline
                  validation checks required fields, phone numbers, URLs, and
                  dates automatically.
                </p>
              </li>

              <li className="rounded-xl border border-border bg-card p-5">
                <span className="font-mono text-xs font-semibold text-accent">
                  Step 4 • Inspect Live Preview
                </span>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Preview & Check Scanability
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  As soon as your input is valid, the live QR preview updates
                  instantly alongside an advisory Scanability badge and contrast
                  ratio readout.
                </p>
              </li>

              <li className="rounded-xl border border-border bg-card p-5">
                <span className="font-mono text-xs font-semibold text-accent">
                  Step 5 • Customize Appearance
                </span>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Style Patterns, Colours & Logo
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Use the Design Studio tabs (Presets, Shape, Colours, Logo, and
                  Setup) to customize module patterns, gradients, finder
                  corners, and logos.
                </p>
              </li>

              <li className="rounded-xl border border-border bg-card p-5">
                <span className="font-mono text-xs font-semibold text-accent">
                  Step 6 • Export or Copy
                </span>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  Download PNG, JPEG, or SVG
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  In the Export Studio panel, choose PNG, JPEG, or SVG, select
                  your target pixel dimensions or quality setting, and download
                  or copy to your clipboard.
                </p>
              </li>
            </ol>
          </section>

          {/* 2. Choosing a QR Code Type */}
          <section
            id="choosing-a-qr-type"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-choosing-type"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                2
              </span>
              <h2
                id="heading-choosing-type"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Choosing a QR Code Type
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {APP_CONFIG.name} supports 12 static QR code types. Each generator
              formats your input into the appropriate URI, vCard, Wi-Fi,
              iCalendar, or text payload format:
            </p>

            <div className="mt-6 space-y-5">
              {QR_TYPE_DOCUMENTATION.map((item) => (
                <div
                  key={item.id}
                  id={`type-${item.id}`}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/create?type=${item.id}`}>
                        Open {item.id.toUpperCase()} Form
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        What It Does
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {item.whatItDoes}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        When to Use It
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.whenToUse}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Required Information
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.requiredFields}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Optional Fields
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.optionalFields}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">
                        Validation & Formatting:
                      </strong>{" "}
                      {item.validationRules}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">
                        Generated Payload Format:
                      </strong>{" "}
                      {item.payloadFormat}
                    </p>
                    <div className="rounded-lg bg-secondary/70 p-2.5 font-mono text-[11px] text-foreground break-all">
                      {item.examplePayload}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. QR Design Customization */}
          <section
            id="qr-design-customization"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-design-customization"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                3
              </span>
              <h2
                id="heading-design-customization"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                QR Design Customization
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The QR Design Studio is organized into five tabs (
              <strong>Presets</strong>, <strong>Shape</strong>,{" "}
              <strong>Colours</strong>, <strong>Logo</strong>, and{" "}
              <strong>Setup</strong>) so you can customize visual styling while
              maintaining structural scanability:
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold">
                    Design Presets & Reset
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Choose from 10 curated presets: <em>Classic Black</em>,{" "}
                  <em>Midnight</em>, <em>Ocean Blue</em>, <em>Emerald</em>,{" "}
                  <em>Royal Purple</em>, <em>Sunset</em>, <em>Minimal White</em>,{" "}
                  <em>Soft Rose</em>, <em>Premium Gold</em>, and{" "}
                  <em>Modern Gradient</em>. Clicking <strong>Reset Design</strong>{" "}
                  in the studio header immediately restores the default{" "}
                  <em>Classic Black</em> configuration (square{" "}
                  <code className="font-mono">#171717</code> modules on{" "}
                  <code className="font-mono">#FFFFFF</code>, 4-module quiet zone,
                  error correction level <code className="font-mono">M</code>, and{" "}
                  <code className="font-mono">1024×1024 px</code> dimensions) and
                  removes any uploaded logo.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <Layers className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold">
                    Module Pattern Styles
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Under the <strong>Shape</strong> tab, select from 6 data module
                  styles: <code className="font-mono">Square</code>,{" "}
                  <code className="font-mono">Dots</code>,{" "}
                  <code className="font-mono">Rounded</code>,{" "}
                  <code className="font-mono">Classy</code>,{" "}
                  <code className="font-mono">Classy Rounded</code>, and{" "}
                  <code className="font-mono">Extra Rounded</code>. Classic{" "}
                  <code className="font-mono">Square</code> and{" "}
                  <code className="font-mono">Rounded</code> patterns offer the
                  highest optical definition at small print sizes.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <Palette className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold">
                    Colours & Gradients
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Under the <strong>Colours</strong> tab, configure solid{" "}
                  <code className="font-mono">#RRGGBB</code> hex colours or enable
                  2-stop <strong>Linear</strong> (<code className="font-mono">0°–360°</code>{" "}
                  rotation angle) or <strong>Radial</strong> gradients for both
                  foreground modules and the background surface. You can also
                  enable <strong>Transparent background</strong> for PNG and SVG
                  exports.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <ScanLine className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold">
                    Finder Frames & Inner Dots
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Customize the three corner alignment markers independently:
                  choose outer frame styles (<code className="font-mono">Square</code>,{" "}
                  <code className="font-mono">Dot</code>,{" "}
                  <code className="font-mono">Extra Rounded</code>) and inner eye
                  dot styles (<code className="font-mono">Square</code>,{" "}
                  <code className="font-mono">Dot</code>), and assign custom hex
                  colours to both outer frames and inner dots.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <Wrench className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold">
                    Quiet-Zone Margin Settings
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Under the <strong>Setup</strong> tab, the quiet-zone slider
                  adjusts the perimeter margin from{" "}
                  <code className="font-mono">0</code> to{" "}
                  <code className="font-mono">12</code> QR modules in{" "}
                  <code className="font-mono">1</code>-module steps (default{" "}
                  <code className="font-mono">4</code> modules; programmatic
                  design state clamps values to{" "}
                  <code className="font-mono">0–24</code> modules). The value is
                  stored in QR modules and converted proportionally into pixel
                  margins during live preview (<code className="font-mono">320 px</code>)
                  and export (<code className="font-mono">128–4096 px</code>)
                  based on the QR version&apos;s module grid width (
                  <code className="font-mono">
                    round(dimensionPx × marginModules / (modulesPerSide + 2 × marginModules))
                  </code>
                  ). Setting the quiet zone below{" "}
                  <code className="font-mono">4</code> modules triggers an
                  advisory scanability warning per ISO/IEC 18004.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold">
                    Error Correction Levels (L, M, Q, H)
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Select Reed-Solomon error correction under <strong>Setup</strong>:
                  <strong> L (~7%)</strong> for compact codes on clean screens,
                  <strong> M (~15%, default)</strong> for general everyday use,
                  <strong> Q (~25%)</strong> for printed packaging, and
                  <strong> H (~30%)</strong> when embedding a center logo.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Logo Guidelines */}
          <section
            id="logo-guidelines"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-logo-guidelines"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                4
              </span>
              <h2
                id="heading-logo-guidelines"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Logo Guidelines
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The <strong>Logo</strong> tab lets you embed a custom brand mark or
              icon in the center of your QR code. Review these verified technical
              limits and best practices:
            </p>

            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className=" flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ImageIcon className="h-4 w-4 text-accent" />
                    Accepted Formats & File Size
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                    <li>
                      • <strong>Supported Formats:</strong>{" "}
                      <code className="font-mono">PNG</code> (<code className="font-mono">image/png</code>),{" "}
                      <code className="font-mono">JPEG</code> (<code className="font-mono">image/jpeg</code>),{" "}
                      <code className="font-mono">WebP</code> (<code className="font-mono">image/webp</code>), and{" "}
                      <code className="font-mono">SVG</code> (<code className="font-mono">image/svg+xml</code>).
                    </li>
                    <li>
                      • <strong>Maximum Upload Size:</strong>{" "}
                      <code className="font-mono">2.0 MB</code> (2,097,152 bytes).
                    </li>
                    <li>
                      • <strong>SVG Security Sanitization:</strong> Uploaded SVG
                      logos are parsed and sanitized in the browser. SVGs with{" "}
                      <code className="font-mono">&lt;script&gt;</code>,{" "}
                      <code className="font-mono">&lt;foreignObject&gt;</code>,
                      event handlers (<code className="font-mono">onload</code>),
                      or external network URLs are rejected.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Palette className="h-4 w-4 text-accent" />
                    Logo Scale, Clearance Padding & Backing Plates
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                    <li>
                      • <strong>Logo Scale (Logo Size Ratio):</strong> Adjustable
                      via the studio slider from{" "}
                      <code className="font-mono">10%</code> to{" "}
                      <code className="font-mono">30%</code> in{" "}
                      <code className="font-mono">1%</code> steps (default{" "}
                      <code className="font-mono">22%</code> /{" "}
                      <code className="font-mono">0.22</code>; engine clamps{" "}
                      <code className="font-mono">8%–30%</code>). This ratio
                      determines the size of the central module-clearance zone
                      relative to the QR grid and active error correction level.
                      Keeping scale at or below{" "}
                      <code className="font-mono">24%</code> is recommended.
                    </li>
                    <li>
                      • <strong>Clearance Padding (Outer Margin):</strong>{" "}
                      Adjustable from <code className="font-mono">0 px</code> to{" "}
                      <code className="font-mono">16 px</code> in{" "}
                      <code className="font-mono">1 px</code> steps (default{" "}
                      <code className="font-mono">4 px</code>; engine clamps{" "}
                      <code className="font-mono">0–32 px</code>). Clearance
                      padding adds an outer pixel gap between the surrounding QR
                      data modules and the outer edge of the logo container/backing
                      plate (<code className="font-mono">boxSize - 2 × margin</code>).
                    </li>
                    <li>
                      • <strong>Container Shapes & Solid Backing Plate:</strong>{" "}
                      Choose a <code className="font-mono">Square</code>,{" "}
                      <code className="font-mono">Rounded</code> (18.75% corner
                      radius), or <code className="font-mono">Circle</code> (50%
                      radius) container. Enabling the optional{" "}
                      <strong>Solid Logo Backing Plate</strong> (default{" "}
                      <code className="font-mono">#FFFFFF</code>) fills the
                      clipped container box and automatically insets the inner
                      logo image by <code className="font-mono">9.375%</code> (
                      <code className="font-mono">24 / 256</code> on each side,
                      leaving an <code className="font-mono">81.25%</code> inner
                      artwork box) so the logo graphic has internal padding
                      within the coloured plate.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
                <strong className="text-foreground">
                  Error Correction Recommendation:
                </strong>{" "}
                Because a center logo covers underlying data modules, always set{" "}
                <strong>Error Correction Level to H (~30%)</strong> or{" "}
                <strong>Q (~25%)</strong> in the Setup tab when embedding a logo.
              </div>
            </div>
          </section>

          {/* 5. Exporting QR Codes */}
          <section
            id="exporting-qr-codes"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-exporting"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                5
              </span>
              <h2
                id="heading-exporting"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Exporting QR Codes
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The <strong>Export Studio</strong> panel beneath the live preview
              lets you download your customized QR code in three formats. Every
              exported file is verified client-side before download and named{" "}
              <code className="font-mono">openqr-&lt;type&gt;.&lt;ext&gt;</code>:
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* PNG */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-accent" />
                  <h3 className="text-base font-semibold text-foreground">
                    PNG Export
                  </h3>
                </div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                  <li>
                    <strong>Preset Dimensions:</strong>{" "}
                    <code className="font-mono">256 px</code>,{" "}
                    <code className="font-mono">512 px</code>,{" "}
                    <code className="font-mono">1024 px</code> (default), and{" "}
                    <code className="font-mono">2048 px</code>.
                  </li>
                  <li>
                    <strong>Custom Dimensions:</strong> Any square pixel size from{" "}
                    <code className="font-mono">128×128 px</code> to{" "}
                    <code className="font-mono">4096×4096 px</code>.
                  </li>
                  <li>
                    <strong>Transparency Behaviour:</strong> Supports true 32-bit
                    RGBA alpha transparency when the transparent background switch
                    is enabled.
                  </li>
                </ul>
              </div>

              {/* JPEG */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-accent" />
                  <h3 className="text-base font-semibold text-foreground">
                    JPEG Export
                  </h3>
                </div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                  <li>
                    <strong>Available Dimensions:</strong> Presets (
                    <code className="font-mono">256</code>–
                    <code className="font-mono">2048 px</code>) and custom sizes (
                    <code className="font-mono">128</code>–
                    <code className="font-mono">4096 px</code>).
                  </li>
                  <li>
                    <strong>Quality Settings:</strong> Choose{" "}
                    <code className="font-mono">Standard (80%)</code>,{" "}
                    <code className="font-mono">High (92%, default)</code>, or{" "}
                    <code className="font-mono">Maximum (100%)</code>.
                  </li>
                  <li>
                    <strong>Background Compositing:</strong> Because JPEG does not
                    support transparency, transparent designs are automatically
                    composited onto a solid white (
                    <code className="font-mono">#FFFFFF</code>) background.
                  </li>
                </ul>
              </div>

              {/* SVG */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-accent" />
                  <h3 className="text-base font-semibold text-foreground">
                    SVG Vector Export
                  </h3>
                </div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                  <li>
                    <strong>Vector Format:</strong> Standalone XML 1.0 document
                    with explicit <code className="font-mono">xmlns</code>,{" "}
                    <code className="font-mono">width</code>,{" "}
                    <code className="font-mono">height</code>, and{" "}
                    <code className="font-mono">viewBox</code> attributes.
                  </li>
                  <li>
                    <strong>Logo Embedding:</strong> Uploaded logos and backing
                    plates are embedded inside the SVG as self-contained{" "}
                    <code className="font-mono">data:</code> URIs.
                  </li>
                  <li>
                    <strong>Best Use Cases:</strong> Commercial printing,
                    signage, packaging, and editing in Illustrator, Figma, or
                    Inkscape.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Clipboard Features */}
          <section
            id="clipboard-features"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-clipboard"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                6
              </span>
              <h2
                id="heading-clipboard"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Clipboard Features
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold text-foreground">
                    Copy QR Image & PNG Fallback
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Clicking <strong>Copy QR Image</strong> renders a PNG at your
                  currently selected export resolution and writes it to your
                  system clipboard using the browser{" "}
                  <code className="font-mono">ClipboardItem</code> API so you can
                  paste directly into slides, documents, or design tools.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <strong>Automatic Fallback:</strong> If your browser does not
                  support binary image clipboard writing, {APP_CONFIG.name}{" "}
                  automatically downloads the PNG file (
                  <code className="font-mono">openqr-&lt;type&gt;.png</code>) and
                  displays an informational notice.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-accent" />
                  <h3 className="text-base font-semibold text-foreground">
                    Copy Payload & Browser Permissions
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Clicking <strong>Copy Payload</strong> copies the exact
                  formatted QR data string (such as the full{" "}
                  <code className="font-mono">BEGIN:VCARD...END:VCARD</code> block
                  or <code className="font-mono">WIFI:T:...</code> string,
                  preserving all UTF-8 characters and line breaks) via{" "}
                  <code className="font-mono">navigator.clipboard.writeText</code>.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  <strong>Permission Handling:</strong> Both clipboard actions
                  wait for browser confirmation before reporting success. If
                  clipboard permission is denied by your browser settings, an
                  explicit error message is shown.
                </p>
              </div>
            </div>
          </section>

          {/* 7. QR Code Scanability */}
          <section
            id="qr-code-scanability"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-scanability"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                7
              </span>
              <h2
                id="heading-scanability"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                QR Code Scanability
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Real-world QR scanning depends on optical and physical conditions.
              Keep these seven factors in mind when styling and printing your QR
              codes:
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="block text-sm text-foreground">
                  1. Contrast & Colour Polarity
                </strong>
                Always use dark foreground modules and dark corner finder
                patterns on a lighter background. Aim for a contrast ratio of at
                least <code className="font-mono">4.5:1</code> (ratios below{" "}
                <code className="font-mono">3.0:1</code> or inverted light-on-dark
                palettes frequently fail to scan).
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="block text-sm text-foreground">
                  2. QR Data Density
                </strong>
                Encoding large amounts of data increases the QR version and
                reduces individual module size. Keep payloads concise when printing
                at small physical dimensions (under 2.5 cm / 1 inch).
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="block text-sm text-foreground">
                  3. Center Logo Size
                </strong>
                A center logo intentionally obscures data modules. Keep logo scale
                at or below <code className="font-mono">24%</code> and enable the
                solid backing plate for clear optical separation.
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="block text-sm text-foreground">
                  4. Quiet-Zone Margin
                </strong>
                Maintain at least a <code className="font-mono">4</code>-module
                quiet zone around the perimeter so cameras can distinguish the QR
                symbol from surrounding text or borders.
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="block text-sm text-foreground">
                  5. Error Correction Level
                </strong>
                Use level <code className="font-mono">M</code> (~15%) for standard
                codes, and increase to <code className="font-mono">Q</code> (~25%)
                or <code className="font-mono">H</code> (~30%) when adding a logo
                or printing on surfaces subject to wear.
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
                <strong className="block text-sm text-foreground">
                  6. Print Quality & Camera Differences
                </strong>
                Glossy laminations, curved packaging, ink bleed, low-light
                environments, and older smartphone lenses affect decoding speed.
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-xs leading-relaxed text-muted-foreground">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
              <p>
                <strong className="text-foreground">Advisory Notice:</strong> The
                in-app scanability indicator (<em>Good Scanability</em>,{" "}
                <em>Scanability Caution</em>, or <em>High Scanability Risk</em>)
                is an automated heuristic evaluation and cannot guarantee
                universal scanability across all cameras, lighting conditions, or
                print materials. Always test exported QR codes on multiple physical
                devices before mass printing.
              </p>
            </div>
          </section>

          {/* 8. Troubleshooting */}
          <section
            id="troubleshooting"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-troubleshooting"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                8
              </span>
              <h2
                id="heading-troubleshooting"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Troubleshooting
              </h2>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Solutions for common QR scanning, validation, export, and browser
              issues:
            </p>

            <div className="mt-6 space-y-3">
              {TROUBLESHOOTING_ITEMS.map((item) => (
                <div
                  key={item.problem}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <HelpCircle className="h-4 w-4 shrink-0 text-accent" />
                    {item.problem}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 9. Privacy and Security */}
          <section
            id="privacy-and-security"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-privacy-security"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                9
              </span>
              <h2
                id="heading-privacy-security"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Privacy and Security
              </h2>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lock className="h-4 w-4 text-success" />
                <span>Client-Side Processing & Logo Sanitization</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                All QR payloads (including Wi-Fi passwords, vCard contacts, and
                URLs) and uploaded logo files are processed locally in your
                browser memory. {APP_CONFIG.name} does not send your QR content to
                an application server or store it in{" "}
                <code className="font-mono">localStorage</code>,{" "}
                <code className="font-mono">sessionStorage</code>, or{" "}
                <code className="font-mono">IndexedDB</code>. Uploaded SVG logos
                undergo strict client-side XML and DOMPurify sanitization before
                rendering.
              </p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/privacy">
                    Read Full Privacy Policy
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* 10. Technical Information */}
          <section
            id="technical-information"
            className="scroll-mt-24 border-t border-border pt-12"
            aria-labelledby="heading-technical-info"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                10
              </span>
              <h2
                id="heading-technical-info"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Technical Information
              </h2>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-card p-6">
              <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                <li>
                  • <strong className="text-foreground">Execution Model:</strong>{" "}
                  Client-side payload generation, SVG DOM rendering, and HTML5
                  Canvas rasterization in modern web browsers.
                </li>
                <li>
                  • <strong className="text-foreground">Character Encoding:</strong>{" "}
                  Full UTF-8 Byte-mode encoding supporting international scripts
                  and emoji across Plain Text, vCard, Wi-Fi, Calendar, and Custom
                  payloads.
                </li>
                <li>
                  • <strong className="text-foreground">Export Formats:</strong>{" "}
                  PNG (<code className="font-mono">image/png</code>, 32-bit RGBA),
                  JPEG (<code className="font-mono">image/jpeg</code>, 80% / 92% /
                  100% quality composited on <code className="font-mono">#FFFFFF</code>
                  ), and standalone XML 1.0 SVG (
                  <code className="font-mono">image/svg+xml</code>).
                </li>
                <li>
                  • <strong className="text-foreground">Open-Source License:</strong>{" "}
                  {APP_CONFIG.license} License. Source code is publicly available
                  at{" "}
                  <a
                    href={APP_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono underline underline-offset-4 hover:text-foreground"
                  >
                    {APP_CONFIG.githubUrl}
                  </a>
                  .
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
                <Button asChild variant="accent">
                  <Link href="/create">
                    Launch QR Design Studio
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={APP_CONFIG.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    View Source on GitHub
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
