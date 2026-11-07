import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Code2,
  Download,
  Palette,
  Grid,
  Image as ImageIcon,
  Maximize2,
  CheckCircle2,
  Github,
  BookOpen,
  Copy,
  FileCode2,
  FileImage,
  HelpCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { QR_TYPES } from "@/lib/constants/qr-types";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — Free Open-Source QR Code Generator & Design Studio`,
  description:
    "Create, customize, and export static QR codes for websites, vCard contacts, Wi-Fi networks, calendar events, and more directly in your browser. Free, open-source, and no account required.",
  ...(APP_CONFIG.siteUrl
    ? {
        alternates: {
          canonical: APP_CONFIG.siteUrl,
        },
      }
    : {}),
  openGraph: {
    title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    description:
      "Generate, customize, and download static QR codes in PNG, JPEG, and standalone vector SVG formats directly in your browser.",
    ...(APP_CONFIG.siteUrl ? { url: APP_CONFIG.siteUrl } : {}),
    siteName: APP_CONFIG.name,
    type: "website",
  },
};

const PRODUCT_BENEFITS = [
  {
    title: "Free & Open Source",
    description:
      "Released under the MIT License with no subscriptions, watermarks, scan limits, or expiring redirect links.",
    icon: Code2,
  },
  {
    title: "No Account Required",
    description:
      "Open the workspace and start generating static QR codes immediately without registration, logins, or email walls.",
    icon: CheckCircle2,
  },
  {
    title: "Browser-Based Generation",
    description:
      "Payload formatting, input validation, live SVG rendering, and raster exports run locally in your browser session.",
    icon: ShieldCheck,
  },
  {
    title: "12 QR Code Types",
    description:
      "Structured forms and live validation for URLs, vCard 3.0 contacts, Wi-Fi credentials, iCalendar events, WhatsApp, and more.",
    icon: Grid,
  },
  {
    title: "Customizable QR Designs",
    description:
      "Style module patterns, solid colours, linear and radial gradients, finder corners, and custom logos with live scanability checks.",
    icon: Palette,
  },
  {
    title: "High-Res & Vector Exports",
    description:
      "Download lossless PNGs (up to 4096×4096 px with optional transparency), JPEGs with quality controls, and standalone vector SVGs.",
    icon: Download,
  },
] as const;

const CUSTOMIZATION_CAPABILITIES = [
  {
    title: "6 Module Pattern Styles",
    description:
      "Choose between Square, Dots, Rounded, Classy, Classy Rounded, and Extra Rounded data module geometries.",
    icon: Grid,
    details: "Square • Dots • Rounded • Classy • Classy Rounded • Extra Rounded",
  },
  {
    title: "Solid Colours & Gradients",
    description:
      "Pick custom hex colours for foreground and background, or configure 2-stop linear (0°–360°) and radial gradients.",
    icon: Palette,
    details: "Hex Colour Picker • Linear & Radial Gradients • Transparent PNG Toggle",
  },
  {
    title: "Independent Finder Customization",
    description:
      "Style the three corner finder patterns independently with outer frame shapes (Square, Dot, Extra Rounded), inner eye shapes (Square, Dot), and custom colours.",
    icon: Maximize2,
    details: "3 Outer Frame Styles • 2 Inner Dot Styles • Independent Corner Colours",
  },
  {
    title: "Logo Integration & Backing Plates",
    description:
      "Embed PNG, JPEG, WebP, or sanitized SVG logos up to 2 MB. Independently adjust logo scale (10%–30%, default 22%), outer clearance padding (0–16 px, default 4 px), container shape, and solid backing plates.",
    icon: ImageIcon,
    details: "Square, Rounded & Circle Containers • Optional Solid Backing Plate",
  },
  {
    title: "Quiet Zone & Error Correction",
    description:
      "Adjust the quiet-zone perimeter margin (0–12 modules in the studio, 4 default and minimum recommended, converted proportionally to pixels on export) and select error correction levels L (~7%), M (~15%), Q (~25%), or H (~30%).",
    icon: ShieldCheck,
    details: "ISO/IEC 18004 Margin Control • Levels L, M, Q, H • Advisory Scanability Checks",
  },
  {
    title: "10 Curated Design Presets",
    description:
      "Apply studio-tested themes in one click—including Classic Black, Midnight, Ocean Blue, Emerald, Sunset, and Modern Gradient—or reset to default settings.",
    icon: Sparkles,
    details: "10 Built-in Presets • Instant Live Preview • One-Click Reset",
  },
] as const;

const EXPORT_OPTIONS = [
  {
    format: "PNG",
    subtitle: "Lossless Raster with Optional Alpha Transparency",
    icon: FileImage,
    highlights: [
      "Preset resolutions: 256×256, 512×512, 1024×1024 (default), and 2048×2048 px.",
      "Custom square resolution from 128×128 px up to 4096×4096 px.",
      "Supports true 32-bit RGBA alpha transparency when transparent background is enabled.",
      "Ideal for web graphics, presentations, digital overlays, and high-DPI raster workflows.",
    ],
  },
  {
    format: "JPEG",
    subtitle: "Compressed Raster with Quality Controls",
    icon: Download,
    highlights: [
      "Preset resolutions (256–2048 px) and custom dimensions from 128×128 px to 4096×4096 px.",
      "Selectable compression quality presets: Standard (80%), High (92%, default), and Maximum (100%).",
      "Because JPEG does not support alpha transparency, transparent designs are automatically composited onto a solid white (#FFFFFF) background.",
      "Ideal for lightweight document attachments, email signatures, and standard photo workflows.",
    ],
  },
  {
    format: "SVG",
    subtitle: "Standalone Scalable Vector Graphics",
    icon: FileCode2,
    highlights: [
      "Standards-compliant XML 1.0 vector file with explicit xmlns, width, height, and viewBox attributes.",
      "Preserves crisp vector paths, unique linear/radial gradient definitions, and self-contained base64 data-URI logos.",
      "Scales to any physical dimension without pixelation or compression artifacts.",
      "Ideal for commercial print, signage, packaging, laser engraving, and vector editors (Figma, Illustrator, Inkscape).",
    ],
  },
  {
    format: "Clipboard",
    subtitle: "Instant Image & Payload Copying",
    icon: Copy,
    highlights: [
      "Copy QR Image writes a rendered PNG directly to your system clipboard via the browser ClipboardItem API.",
      "Automatic fallback downloads the PNG file locally if your browser does not support binary image clipboard writing.",
      "Copy Payload copies the exact formatted QR string (preserving UTF-8 characters and line breaks) to your clipboard.",
      "Displays clear status feedback if clipboard permissions are denied by your browser.",
    ],
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Is OpenQR Studio free?",
    answer:
      "Yes. OpenQR Studio is completely free to use and released under the open-source MIT License. There are no paid tiers, watermarks, scan quotas, or expiring trial periods.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. OpenQR Studio has no user registration, login system, or account dashboard. Every QR content type, design control, and export format is available immediately in the QR Design Studio.",
  },
  {
    question: "What types of QR codes can I generate?",
    answer:
      "You can generate 12 static QR code types: Website URL, Plain Text (UTF-8), vCard Contact (vCard 3.0), Wi-Fi Network (WPA/WEP/Open), Email (mailto:), Phone Call (tel:), SMS Message (sms:), Geographic Location (geo: URI or Google Maps link), WhatsApp (wa.me), Social Media Profiles (9 dedicated platforms plus Custom URL), Calendar Event (iCalendar VEVENT), and Custom Payload.",
  },
  {
    question: "Can I add my own logo?",
    answer:
      "Yes. You can upload a PNG, JPEG, WebP, or SVG logo file up to 2 MB. In the Logo tab, you can adjust the logo scale (10%–30% of the QR width), clearance padding (0–16 px), container shape (square, rounded, or circle), and optional solid backing plate colour. Selecting error correction level H (or Q) is recommended when embedding a logo.",
  },
  {
    question: "Can I download QR codes as SVG?",
    answer:
      "Yes. Selecting the SVG export format downloads a standalone XML 1.0 vector file (.svg) containing vector module geometry, gradient definitions, and any uploaded logo embedded as a self-contained data URI.",
  },
  {
    question: "Can I generate transparent PNG files?",
    answer:
      "Yes. Enabling the transparent background toggle in the Colours tab or Export Studio produces a 32-bit RGBA PNG file with a transparent background channel. Note that JPEG exports do not support transparency and automatically composite transparent designs onto a solid white (#FFFFFF) background.",
  },
  {
    question: "Are QR codes generated in my browser?",
    answer:
      "Yes. Payload formatting, input validation, live SVG preview rendering, SVG logo sanitization, and PNG/JPEG/SVG file generation execute client-side in your web browser using JavaScript, DOM, and HTML5 Canvas APIs.",
  },
  {
    question: "Are my QR code contents stored?",
    answer:
      "OpenQR Studio does not store your entered QR payloads or uploaded logos on an application server, nor does it save them in browser localStorage, sessionStorage, or IndexedDB. Your QR content exists only in active browser memory while the page is open. (Only your light/dark interface theme preference is stored in localStorage.)",
  },
  {
    question: "Can I use generated QR codes commercially?",
    answer:
      "The OpenQR Studio software is licensed under the MIT License, and the application imposes no fees, watermarks, or usage restrictions on the static QR code files you export for personal or commercial use. Because static QR codes directly encode the data and images you supply, you remain responsible for ensuring you have the right to use any URLs, trademarks, or logos you embed, and for testing your printed QR codes prior to production.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* A. Hero Section */}
      <section className="mx-auto max-w-3xl text-center" aria-labelledby="hero-heading">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>Free & Open Source (MIT) • Browser-Based Generation • No Account Required</span>
        </div>

        <h1
          id="hero-heading"
          className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
        >
          {APP_CONFIG.tagline}
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Generate, customize, and download QR codes for links, contact details,
          Wi-Fi networks, social profiles, calendar events, and more.{" "}
          {APP_CONFIG.name} gives you powerful design and export tools while
          keeping QR code generation directly in your browser.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button asChild variant="accent" size="lg">
            <Link href="/create">
              Create a QR Code
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/documentation">
              <BookOpen className="h-4 w-4" />
              Explore Documentation
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a
              href={APP_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* B. Product Benefits */}
      <section className="mt-24" aria-labelledby="benefits-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="benefits-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Why Use {APP_CONFIG.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Practical static QR generation built for clarity, visual control, and local browser execution.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* C. Supported QR Types (All 12 Types) */}
      <section id="qr-types" className="mt-24" aria-labelledby="qr-types-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="qr-types-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            12 Supported QR Code Types
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select any content format to open the studio with dedicated input fields and real-time validation.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QR_TYPES.map((type) => (
            <Link
              key={type.id}
              href={`/create?type=${type.id}`}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/50 hover:bg-secondary/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-accent">
                    {type.label}
                  </h3>
                  <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {type.shortLabel}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {type.description}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground group-hover:text-accent">
                Open {type.shortLabel} Generator
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* D. Customization Capabilities */}
      <section id="features" className="mt-24" aria-labelledby="customization-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="customization-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            QR Design & Customization Capabilities
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fine-tune every structural element of your QR code while monitoring contrast and scanability in real time.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CUSTOMIZATION_CAPABILITIES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-6"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <p className="mt-4 border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
                  {item.details}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* E. Export Options */}
      <section id="exports" className="mt-24" aria-labelledby="exports-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="exports-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Production-Ready Export Formats
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Export high-resolution raster images, standalone vector graphics, or copy directly to your clipboard.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {EXPORT_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.format}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {option.format}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {option.subtitle}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {option.highlights.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* F. Privacy Section & G. Open-Source Section */}
      <section className="mt-24 grid grid-cols-1 gap-6 lg:grid-cols-2" aria-label="Privacy and Open Source">
        {/* F. Privacy Section */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
              <Lock className="h-3.5 w-3.5 text-success" />
              <span>Privacy-Conscious Architecture</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Local Browser Processing
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              When you enter a website URL, vCard contact, Wi-Fi password, or
              calendar event, {APP_CONFIG.name} generates and renders the QR
              code locally in your browser memory. Uploaded logo files are
              validated, sanitized, and embedded client-side without being
              uploaded to an application backend server.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {APP_CONFIG.name} does not use a database or analytics scripts,
              and does not persist your QR payloads in{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
                localStorage
              </code>
              ,{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
                sessionStorage
              </code>
              , or{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
                IndexedDB
              </code>
              .
            </p>
          </div>
          <div className="mt-6 pt-2">
            <Button asChild variant="outline">
              <Link href="/privacy">
                Read Full Privacy Policy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* G. Open-Source Section */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
              <Code2 className="h-3.5 w-3.5 text-foreground" />
              <span>MIT Licensed Open Source</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              Inspect the Source Code
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {APP_CONFIG.name} is an open-source project built with Next.js,
              React, and TypeScript. You can inspect the payload encoders, SVG
              logo sanitization logic, scanability checks, and standalone export
              pipeline directly in the public GitHub repository.
            </p>
            <p className="mt-3 font-mono text-xs text-muted-foreground break-all">
              {APP_CONFIG.githubUrl}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 pt-2">
            <Button asChild variant="default">
              <a
                href={APP_CONFIG.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/about">Learn About the Project</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* H. FAQ Section */}
      <section id="faq" className="mt-24" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2
            id="faq-heading"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Common Questions About {APP_CONFIG.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Straightforward answers about supported QR types, exports, privacy, and licensing.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h3 className="text-base font-semibold text-foreground">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-8 text-center">
          <h3 className="text-xl font-bold text-foreground">
            Ready to generate your QR code?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Launch the QR Design Studio to create, customize, and download your QR code in seconds—or browse the documentation for detailed payload and scanability guides.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/create">
                Create a QR Code
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/documentation">Read Documentation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
