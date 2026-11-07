import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Database,
  FileCheck2,
  Github,
  Globe,
  HardDrive,
  Image as ImageIcon,
  Lock,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants/app-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Read the ${APP_CONFIG.name} Privacy Policy: learn how QR payloads, vCards, Wi-Fi credentials, and uploaded logo files are processed locally in your browser.`,
  ...(APP_CONFIG.siteUrl
    ? {
        alternates: {
          canonical: `${APP_CONFIG.siteUrl}/privacy`,
        },
      }
    : {}),
  openGraph: {
    title: `${APP_CONFIG.name} Privacy Policy`,
    description:
      "Transparent technical documentation of how OpenQR Studio handles QR payloads, uploaded logos, browser storage, and network requests.",
    ...(APP_CONFIG.siteUrl ? { url: `${APP_CONFIG.siteUrl}/privacy` } : {}),
    siteName: APP_CONFIG.name,
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-border pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>Client-Side QR Processing • Last Updated: {APP_CONFIG.lastUpdated}</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>

        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          This Privacy Policy explains how {APP_CONFIG.name} processes the
          information and files you enter when generating, customizing, and
          exporting QR codes, based directly on the verified source code of the
          application.
        </p>
      </div>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground">
        {/* A. Introduction */}
        <section
          id="introduction"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-intro"
        >
          <h2
            id="heading-privacy-intro"
            className="text-lg font-bold text-foreground sm:text-xl"
          >
            A. Introduction
          </h2>
          <p className="mt-3">
            {APP_CONFIG.name} is an open-source web application designed with a
            privacy-conscious architecture. Because QR codes frequently contain
            personal or sensitive details—such as vCard contact cards, Wi-Fi
            network passwords, phone numbers, or private links—the application
            is engineered to perform QR payload generation, visual styling, logo
            embedding, and file export operations directly within your web
            browser rather than on an application backend server.
          </p>
          <p className="mt-3">
            This policy describes what information the application processes in
            your browser, how uploaded logos and browser storage mechanisms are
            handled, and the distinction between client-side application logic
            and standard web hosting infrastructure.
          </p>
        </section>

        {/* B. Information We Process */}
        <section
          id="information-we-process"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-info"
        >
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-info"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              B. Information We Process
            </h2>
          </div>
          <p className="mt-3">
            Depending on which QR code type and design options you choose, you
            may enter or select the following categories of information in the{" "}
            {APP_CONFIG.name} interface:
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <li className="rounded-lg bg-secondary/50 px-3 py-2 text-xs">
              <strong className="text-foreground">QR Payload Content:</strong>{" "}
              Website URLs and multiline plain text in any UTF-8 language.
            </li>
            <li className="rounded-lg bg-secondary/50 px-3 py-2 text-xs">
              <strong className="text-foreground">vCard Contact Information:</strong>{" "}
              Names, organization, job title, phone numbers, email address,
              website, physical address, and notes.
            </li>
            <li className="rounded-lg bg-secondary/50 px-3 py-2 text-xs">
              <strong className="text-foreground">Wi-Fi Network Details:</strong>{" "}
              Network SSID, encryption type (WPA, WEP, or Open), Wi-Fi password,
              and hidden network status.
            </li>
            <li className="rounded-lg bg-secondary/50 px-3 py-2 text-xs">
              <strong className="text-foreground">Email, Phone & SMS Data:</strong>{" "}
              Recipient email addresses, subjects, telephone numbers, WhatsApp
              numbers, and pre-filled message bodies.
            </li>
            <li className="rounded-lg bg-secondary/50 px-3 py-2 text-xs">
              <strong className="text-foreground">Location & Calendar Data:</strong>{" "}
              Geographic coordinates (latitude, longitude, location label) and
              iCalendar event titles, dates, times, locations, and descriptions.
            </li>
            <li className="rounded-lg bg-secondary/50 px-3 py-2 text-xs">
              <strong className="text-foreground">Social, Custom & Logo Inputs:</strong>{" "}
              Social media profile handles/URLs, raw custom payload strings, and
              uploaded logo image files.
            </li>
          </ul>
          <p className="mt-4">
            In the verified application code, all of the information listed
            above is held in active in-memory React component state (
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">
              React.useState
            </code>
            ) while you interact with the page so the application can validate
            your input, render the live QR preview, and generate your requested
            export files.
          </p>
        </section>

        {/* C. Local Processing */}
        <section
          id="local-processing"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-local"
        >
          <div className="flex items-center gap-2.5">
            <HardDrive className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-local"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              C. Local Processing
            </h2>
          </div>
          <p className="mt-3">
            The following operations execute client-side inside your web
            browser:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm">
            <li>
              <strong>QR Payload Generation & Validation:</strong> Formatting
              your input into URL, vCard 3.0, Wi-Fi, mailto, tel, sms, geo,
              WhatsApp, social, iCalendar, or custom strings and checking field
              validity.
            </li>
            <li>
              <strong>Live Rendering & Design Customization:</strong> Applying
              module patterns, solid colours, linear and radial gradients,
              corner finder styles, quiet-zone margins, and error correction
              levels via client-side SVG DOM generation.
            </li>
            <li>
              <strong>Scanability Analysis:</strong> Calculating relative
              luminance contrast ratios, quiet-zone compliance, and estimated QR
              version capacity.
            </li>
            <li>
              <strong>Export & Clipboard Generation:</strong> Serializing
              standalone SVG vector files, rasterizing PNG and JPEG images via
              the browser&apos;s HTML5{" "}
              <code className="font-mono text-xs text-foreground">&lt;canvas&gt;</code>{" "}
              API, and copying PNG blobs or payload strings to your system
              clipboard when you click the copy buttons.
            </li>
          </ul>
          <p className="mt-3 text-xs">
            <strong>Important Scope Clarification:</strong> Client-side
            processing applies to how {APP_CONFIG.name} generates and exports QR
            codes in your browser. It does not govern the external websites,
            platforms (such as WhatsApp, Google Maps, or social networks), or
            mail/phone services that a user&apos;s device connects to after
            scanning a QR code you have created.
          </p>
        </section>

        {/* D. Uploaded Logo Files */}
        <section
          id="uploaded-logo-files"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-logos"
        >
          <div className="flex items-center gap-2.5">
            <ImageIcon className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-logos"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              D. Uploaded Logo Files
            </h2>
          </div>
          <p className="mt-3">
            When you select a logo image (<code className="font-mono text-xs">PNG</code>,{" "}
            <code className="font-mono text-xs">JPEG</code>,{" "}
            <code className="font-mono text-xs">WebP</code>, or{" "}
            <code className="font-mono text-xs">SVG</code> up to{" "}
            <code className="font-mono text-xs">2 MB</code>) in the Logo tab:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm">
            <li>
              The file is read locally in browser memory using the browser{" "}
              <code className="font-mono text-xs text-foreground">FileReader</code>{" "}
              API (<code className="font-mono text-xs">readAsText</code> for SVG
              files; <code className="font-mono text-xs">readAsDataURL</code>{" "}
              for raster images).
            </li>
            <li>
              Uploaded SVG files are parsed and sanitized locally in your
              browser, then encoded as an in-memory base64{" "}
              <code className="font-mono text-xs">data:image/svg+xml;base64,...</code>{" "}
              URI. Raster images are held as in-memory base64{" "}
              <code className="font-mono text-xs">data:image/...;base64,...</code>{" "}
              URIs.
            </li>
            <li>
              Uploaded logo files are <strong>not</strong> uploaded or
              transmitted to an {APP_CONFIG.name} server.
            </li>
            <li>
              The in-memory logo data URI is retained only for the duration of
              your active page session and is discarded immediately when you
              click <strong>Remove Logo</strong>, click{" "}
              <strong>Reset Design</strong>, refresh the page, or close the
              browser tab.
            </li>
          </ul>
        </section>

        {/* E. Browser Storage */}
        <section
          id="browser-storage"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-storage"
        >
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-storage"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              E. Browser Storage
            </h2>
          </div>
          <p className="mt-3">
            Based on inspection of the {APP_CONFIG.name} codebase and runtime
            dependencies, browser storage mechanisms are used as follows:
          </p>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm">
            <li>
              • <strong className="text-foreground">localStorage:</strong>{" "}
              {APP_CONFIG.name} does <strong>not</strong> save your QR payloads,
              form inputs, design customizations, or uploaded logos in{" "}
              <code className="font-mono text-xs">localStorage</code>. The
              application uses the <code className="font-mono text-xs">next-themes</code>{" "}
              provider solely to store your interface appearance preference (
              <code className="font-mono text-xs">&quot;light&quot;</code>,{" "}
              <code className="font-mono text-xs">&quot;dark&quot;</code>, or{" "}
              <code className="font-mono text-xs">&quot;system&quot;</code>) under
              the <code className="font-mono text-xs">theme</code> key in{" "}
              <code className="font-mono text-xs">localStorage</code>.
            </li>
            <li>
              • <strong className="text-foreground">sessionStorage:</strong> Not
              used by the application code.
            </li>
            <li>
              • <strong className="text-foreground">IndexedDB:</strong> Not used
              by the application code.
            </li>
            <li>
              • <strong className="text-foreground">Cookies:</strong>{" "}
              {APP_CONFIG.name}&apos;s application code does not set or read
              cookies.
            </li>
            <li>
              • <strong className="text-foreground">Cache Storage & Service Workers:</strong>{" "}
              {APP_CONFIG.name} does not register a service worker or write user
              payloads to the browser Cache Storage API.
            </li>
          </ul>
          <p className="mt-3 text-xs">
            <strong>Browser & System Note:</strong> Your web browser, operating
            system, browser extensions, autofill features, download history, or
            system clipboard (when you explicitly use <em>Copy QR Image</em> or{" "}
            <em>Copy Payload</em>) operate independently of {APP_CONFIG.name} and
            may cache assets or retain data according to your device and browser
            settings.
          </p>
        </section>

        {/* F. Network Requests and Third Parties */}
        <section
          id="network-requests"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-network"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-network"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              F. Network Requests and Third Parties
            </h2>
          </div>
          <p className="mt-3">
            To provide an accurate technical picture, this policy distinguishes
            between three separate layers of operation:
          </p>
          <div className="mt-4 space-y-4 text-xs sm:text-sm">
            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <h3 className="font-semibold text-foreground">
                1. Local Application Processing of QR Content and Uploaded Logos
              </h3>
              <p className="mt-1.5 text-muted-foreground">
                Once the {APP_CONFIG.name} web application has loaded in your
                browser, entering QR payload data, uploading a logo image,
                customizing design settings, and exporting PNG, JPEG, or SVG
                files occur locally in your browser memory. The application
                includes no third-party analytics scripts, advertising pixels, or
                telemetry SDKs, and makes no application network requests carrying
                your QR payloads or uploaded logos to any external service.
                Application typography (<code className="font-mono text-xs">Geist Sans</code>{" "}
                and <code className="font-mono text-xs">Geist Mono</code>) is
                bundled locally at build time rather than requested from an
                external font CDN at runtime.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <h3 className="font-semibold text-foreground">
                2. Ordinary Network Communication Required to Load the Hosted Website
              </h3>
              <p className="mt-1.5 text-muted-foreground">
                When you navigate to a hosted deployment of {APP_CONFIG.name} in
                your browser, your device performs standard HTTP/HTTPS network
                requests to download the website&apos;s static HTML pages, CSS
                stylesheets, JavaScript bundles, web app manifest, and bundled
                font files so the application can run in your browser. Similarly,
                if you click an external link on the site (such as a link to{" "}
                <code className="font-mono text-xs">{APP_CONFIG.githubUrl}</code>),
                your browser connects directly to that external destination.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 p-4">
              <h3 className="font-semibold text-foreground">
                3. Potential Connection Metadata Processing by Hosting Providers, CDNs, or Other Infrastructure
              </h3>
              <p className="mt-1.5 text-muted-foreground">
                During the ordinary HTTP/HTTPS requests required to load the
                hosted website, the underlying web hosting provider, Content
                Delivery Network (CDN), DNS resolver, or network infrastructure
                necessarily receives standard connection metadata—such as your IP
                address, requested page URL, timestamp, and browser user-agent
                header—to route and deliver the site&apos;s files.
              </p>
              <p className="mt-2 text-muted-foreground">
                <strong className="text-foreground">
                  Infrastructure Verification Limitation:
                </strong>{" "}
                Because {APP_CONFIG.name} is an open-source software project that
                can be self-hosted or deployed on third-party hosting platforms
                configured outside this source repository, the application source
                code cannot verify or control how a specific hosting provider or
                CDN configures server access logs, IP address logging, log
                retention periods, or infrastructure-level privacy terms. We do
                not make unverified claims regarding hosting-provider log
                retention or infrastructure-level anonymity.
              </p>
            </div>
          </div>
        </section>

        {/* G. Data Retention */}
        <section
          id="data-retention"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-retention"
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-retention"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              G. Data Retention
            </h2>
          </div>
          <p className="mt-3">
            {APP_CONFIG.name} does not maintain a backend database and does not
            retain your QR payloads or uploaded logo files after your browser
            session ends:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm">
            <li>
              <strong>Temporary In-Memory State:</strong> Entered form values and
              logo data URIs exist only in browser memory while the tab is open
              and are cleared when you reset the form, refresh the page, or close
              the tab.
            </li>
            <li>
              <strong>Temporary Download Blobs & Canvas Buffers:</strong> When
              you download a PNG, JPEG, or SVG file, the application creates a
              temporary local <code className="font-mono text-xs">Blob</code>{" "}
              object URL (<code className="font-mono text-xs">URL.createObjectURL</code>)
              and revokes it automatically (<code className="font-mono text-xs">URL.revokeObjectURL</code>{" "}
              after 250 milliseconds). Temporary offscreen HTML5{" "}
              <code className="font-mono text-xs">&lt;canvas&gt;</code> elements
              used during raster export have their dimensions reset to{" "}
              <code className="font-mono text-xs">0×0</code> immediately upon
              completion.
            </li>
            <li>
              <strong>Downloaded Files & Clipboard:</strong> Any PNG, JPEG, or
              SVG files you download to your device and any images or text you
              copy to your clipboard remain stored locally on your device until
              you delete or overwrite them.
            </li>
          </ul>
        </section>

        {/* H. Security */}
        <section
          id="security"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-security"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-security"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              H. Security
            </h2>
          </div>
          <p className="mt-3">
            {APP_CONFIG.name} implements defensive client-side security controls
            in its codebase:
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm">
            <li>
              <strong>SVG Logo Sanitization:</strong> Uploaded SVG files are
              checked for XML entity declarations (<code className="font-mono text-xs">&lt;!ENTITY</code> /{" "}
              <code className="font-mono text-xs">&lt;!DOCTYPE</code>), parsed via{" "}
              <code className="font-mono text-xs">DOMParser(&quot;image/svg+xml&quot;)</code>,
              inspected to reject forbidden elements (<code className="font-mono text-xs">&lt;script&gt;</code>,{" "}
              <code className="font-mono text-xs">&lt;foreignObject&gt;</code>,{" "}
              <code className="font-mono text-xs">&lt;iframe&gt;</code>, SMIL
              animation tags), inline <code className="font-mono text-xs">on*</code>{" "}
              event handlers, external URLs, and unsafe CSS rules, sanitized with{" "}
              <code className="font-mono text-xs">DOMPurify</code>, and encoded as
              a base64 data URI so raw uploaded SVG markup is never injected
              directly into the page DOM.
            </li>
            <li>
              <strong>Scheme & Input Validation:</strong> Website and social URL
              fields validate protocols and block executable schemes such as{" "}
              <code className="font-mono text-xs">javascript:</code> and{" "}
              <code className="font-mono text-xs">data:</code>.
            </li>
            <li>
              <strong>Export Verification:</strong> Generated PNG, JPEG, and SVG
              files are inspected before download to verify binary headers,
              pixel dimensions, and absence of unsafe script or external URL
              constructs.
            </li>
          </ul>
          <p className="mt-3 text-xs">
            <strong>Responsible Use Reminder:</strong> No software or browser
            environment can guarantee absolute security. Because static QR codes
            can be read by anyone with a camera, avoid placing QR codes that
            contain sensitive passwords or private personal data in public areas,
            and ensure your own device and browser extensions are trustworthy.
          </p>
        </section>

        {/* I. Children's Privacy */}
        <section
          id="childrens-privacy"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-children"
        >
          <div className="flex items-center gap-2.5">
            <Users className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-children"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              I. Children&apos;s Privacy
            </h2>
          </div>
          <p className="mt-3">
            {APP_CONFIG.name} is a general-audience utility tool that does not
            offer user accounts, community profiles, or data collection forms,
            and does not knowingly collect or store personal information from
            anyone, including children.
          </p>
        </section>

        {/* J. Policy Changes */}
        <section
          id="policy-changes"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-changes"
        >
          <div className="flex items-center gap-2.5">
            <RefreshCw className="h-5 w-5 text-accent" />
            <h2
              id="heading-privacy-changes"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              J. Policy Changes
            </h2>
          </div>
          <p className="mt-3">
            This Privacy Policy may be updated if the functionality or technical
            behaviour of {APP_CONFIG.name} changes. Any updates will be published
            on this page and committed to the public source repository with an
            updated revision date.
          </p>
        </section>

        {/* K. Contact and Project Information */}
        <section
          id="contact-information"
          className="rounded-xl border border-border bg-card p-6"
          aria-labelledby="heading-privacy-contact"
        >
          <div className="flex items-center gap-2.5">
            <Github className="h-5 w-5 text-foreground" />
            <h2
              id="heading-privacy-contact"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              K. Contact and Project Information
            </h2>
          </div>
          <p className="mt-3">
            {APP_CONFIG.name} is an open-source project maintained on GitHub. If
            you have questions about this Privacy Policy, wish to inspect the
            source code, or want to report a technical or privacy issue, please
            visit the official GitHub repository:
          </p>
          <div className="mt-4 rounded-lg border border-border bg-secondary/50 px-4 py-3 font-mono text-xs text-foreground break-all">
            <a
              href={APP_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-accent"
            >
              {APP_CONFIG.githubUrl}
            </a>
          </div>
        </section>

        {/* L. Last Updated */}
        <section
          id="last-updated"
          className="rounded-xl border border-border bg-secondary/40 p-6"
          aria-labelledby="heading-privacy-updated"
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5 text-foreground" />
            <h2
              id="heading-privacy-updated"
              className="text-lg font-bold text-foreground sm:text-xl"
            >
              L. Last Updated
            </h2>
          </div>
          <p className="mt-2 text-sm text-foreground">
            This Privacy Policy was last updated on{" "}
            <strong>{APP_CONFIG.lastUpdated}</strong>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="accent">
              <Link href="/create">
                Open QR Design Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/documentation">Read Documentation</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
