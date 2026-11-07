import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Compass,
  Eye,
  Github,
  Layers,
  ShieldCheck,
  Sliders,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants/app-config";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about the purpose, philosophy, and open-source development of ${APP_CONFIG.name}, a free browser-based QR code generator and design studio.`,
  ...(APP_CONFIG.siteUrl
    ? {
        alternates: {
          canonical: `${APP_CONFIG.siteUrl}/about`,
        },
      }
    : {}),
  openGraph: {
    title: `About ${APP_CONFIG.name}`,
    description: `Purpose, guiding principles, and open-source architecture behind ${APP_CONFIG.name}.`,
    ...(APP_CONFIG.siteUrl ? { url: `${APP_CONFIG.siteUrl}/about` } : {}),
    siteName: APP_CONFIG.name,
    type: "website",
  },
};

const PHILOSOPHY_PRINCIPLES = [
  {
    title: "Accessibility",
    description:
      "Every content type, design customization control, and high-resolution export format is available free of charge in modern browsers without requiring account sign-ups or subscriptions.",
    icon: Sparkles,
  },
  {
    title: "Simplicity",
    description:
      "Structured forms handle standard formatting details—such as vCard 3.0 syntax, Wi-Fi credential escaping, and iCalendar event formatting—so anyone can create valid QR codes without memorizing technical specifications.",
    icon: Layers,
  },
  {
    title: "User Control",
    description:
      "Generated QR codes encode your target payload directly as static data rather than routing scans through third-party redirect servers that can expire or require ongoing fees.",
    icon: Sliders,
  },
  {
    title: "Privacy-Conscious Design",
    description:
      "Payload formatting, input validation, SVG logo sanitization, and PNG, JPEG, and SVG exports run client-side in your browser session without transmitting your QR content to an application database.",
    icon: ShieldCheck,
  },
  {
    title: "Open-Source Development",
    description:
      "Licensed under the MIT License, the complete source code is publicly available on GitHub so users and developers can inspect how data encoding, security sanitization, and exports work.",
    icon: Code2,
  },
  {
    title: "Practical Functionality",
    description:
      "Creative controls—such as gradients, custom finder corners, and center logos—are paired with real-time contrast, quiet-zone, and density checks to help users create scannable designs.",
    icon: Eye,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* A. Introduction */}
      <section aria-labelledby="about-intro-heading">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
          <Code2 className="h-3.5 w-3.5 text-foreground" />
          <span>Independent Open-Source Project • {APP_CONFIG.license} License</span>
        </div>

        <h1
          id="about-intro-heading"
          className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          About {APP_CONFIG.name}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {APP_CONFIG.name} is a free, open-source web application for generating,
          customizing, and exporting static QR codes directly in the browser.
        </p>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Creating a reliable QR code should be a straightforward task. However,
          many online generators require account registration, route simple
          links through intermediary tracking URLs that stop working after a
          trial period, or restrict vector SVG and high-resolution downloads
          behind paywalls. {APP_CONFIG.name} was built to provide a clean,
          transparent alternative that runs locally in your browser and produces
          static QR codes you control.
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          {APP_CONFIG.name} is an independent open-source software project and is
          not affiliated with Adobe or other commercial QR generator brands.
        </p>
      </section>

      {/* B. Our Purpose */}
      <section
        className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8"
        aria-labelledby="about-purpose-heading"
      >
        <h2
          id="about-purpose-heading"
          className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          Our Purpose
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The purpose of {APP_CONFIG.name} is to make static QR code creation
          accessible, customizable, and dependable for everyday personal,
          educational, and professional workflows.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Instead of offering a basic black-and-white generator or an
          overcomplicated marketing dashboard, {APP_CONFIG.name} focuses on a
          dedicated studio workspace. Users can select from 12 structured QR
          content types, receive immediate input validation, customize visual
          patterns and brand logos with real-time scanability feedback, and
          download production-ready PNG, JPEG, and standalone SVG files.
        </p>
      </section>

      {/* C. Our Philosophy */}
      <section className="mt-12" aria-labelledby="about-philosophy-heading">
        <h2
          id="about-philosophy-heading"
          className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          Our Philosophy
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Six core principles guide how {APP_CONFIG.name} is designed and implemented:
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PHILOSOPHY_PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {principle.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* D. Open Source */}
      <section
        className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8"
        aria-labelledby="about-opensource-heading"
      >
        <div className="flex items-center gap-2.5">
          <Github className="h-5 w-5 text-foreground" />
          <h2
            id="about-opensource-heading"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Open Source
          </h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {APP_CONFIG.name} is open-source software released under the{" "}
          <strong>{APP_CONFIG.license} License</strong>. Open-source development
          ensures that our privacy and technical claims are verifiable rather
          than reliant on marketing assurances.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Anyone can browse the repository to inspect the TypeScript payload
          generators for all 12 QR formats, the client-side SVG logo
          sanitization pipeline, the WCAG luminance contrast and scanability
          evaluators, and the standalone PNG, JPEG, and SVG export engines. You
          are welcome to explore the codebase, review the implementation, or
          use the project in accordance with the MIT License.
        </p>

        <div className="mt-5 rounded-lg border border-border bg-secondary/50 px-4 py-3 font-mono text-xs text-foreground break-all">
          Official Repository:{" "}
          <a
            href={APP_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-accent"
          >
            {APP_CONFIG.githubUrl}
          </a>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="default">
            <a
              href={APP_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              Explore on GitHub
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/privacy">Review Privacy Policy</Link>
          </Button>
        </div>
      </section>

      {/* E. Product Direction */}
      <section
        className="mt-12 rounded-2xl border border-border bg-secondary/30 p-6 sm:p-8"
        aria-labelledby="about-direction-heading"
      >
        <div className="flex items-center gap-2.5">
          <Compass className="h-5 w-5 text-accent" />
          <h2
            id="about-direction-heading"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Product Direction
          </h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {APP_CONFIG.name} is focused on delivering a focused, self-contained
          QR creation experience. Rather than expanding into server-hosted user
          accounts, analytics tracking, or subscription redirect services, the
          project prioritizes accurate payload formatting, responsive studio
          controls, clear scanability guidance, and dependable client-side file
          exports.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button asChild variant="accent">
            <Link href="/create">
              Open QR Design Studio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/documentation">
              <BookOpen className="h-4 w-4" />
              Read User Documentation
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
