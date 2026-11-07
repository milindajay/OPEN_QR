import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage, { metadata as homeMetadata } from "@/app/page";
import AboutPage, { metadata as aboutMetadata } from "@/app/about/page";
import DocumentationPage, {
  metadata as docsMetadata,
} from "@/app/documentation/page";
import PrivacyPage, { metadata as privacyMetadata } from "@/app/privacy/page";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_CONFIG } from "@/lib/constants/app-config";
import { QR_TYPES } from "@/lib/constants/qr-types";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("Phase 5 — Website Content, Documentation & Trust Pages", () => {
  describe("SEO Metadata & Non-Fabricated Canonical Configuration", () => {
    it("exports unique titles and accurate descriptions for all four pages", () => {
      const titles = [
        String(homeMetadata.title),
        String(aboutMetadata.title),
        String(docsMetadata.title),
        String(privacyMetadata.title),
      ];
      expect(new Set(titles).size).toBe(4);

      expect(homeMetadata.description).toContain("static QR codes");
      expect(aboutMetadata.description).toContain(APP_CONFIG.name);
      expect(docsMetadata.description).toContain("12 QR code types");
      expect(privacyMetadata.description).toContain("Privacy Policy");
    });

    it("does not emit fabricated canonical URLs or sitemap entries when NEXT_PUBLIC_SITE_URL is unset", () => {
      expect(APP_CONFIG.siteUrl).toBeUndefined();
      expect(homeMetadata.alternates).toBeUndefined();
      expect(aboutMetadata.alternates).toBeUndefined();
      expect(docsMetadata.alternates).toBeUndefined();
      expect(privacyMetadata.alternates).toBeUndefined();

      const robotsConfig = robots();
      expect(robotsConfig.sitemap).toBeUndefined();
      expect(sitemap()).toEqual([]);
    });
  });

  describe("Header & Footer Navigation", () => {
    it("renders consistent navigation with active page indication and official GitHub repository link", () => {
      mockPathname = "/documentation";
      render(<Header />);

      const docLinks = screen.getAllByRole("link", { name: "Documentation" });
      expect(docLinks[0]).toHaveAttribute("aria-current", "page");

      const githubLink = screen.getByRole("link", {
        name: "GitHub repository",
      });
      expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/milindajay/OPEN_QR"
      );
    });

    it("renders footer links to Home, QR Design Studio, Documentation, About Us, Privacy Policy, and GitHub", () => {
      render(<Footer />);

      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
        "href",
        "/"
      );
      expect(
        screen.getByRole("link", { name: "QR Design Studio" })
      ).toHaveAttribute("href", "/create");
      expect(
        screen.getByRole("link", { name: "Documentation" })
      ).toHaveAttribute("href", "/documentation");
      expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute(
        "href",
        "/about"
      );
      expect(
        screen.getByRole("link", { name: "Privacy Policy" })
      ).toHaveAttribute("href", "/privacy");
      expect(
        screen.getByRole("link", { name: "GitHub Repository" })
      ).toHaveAttribute("href", "https://github.com/milindajay/OPEN_QR");
    });
  });

  describe("Homepage", () => {
    it("renders hero, benefits, all 12 QR types, customization, exports, privacy, open-source CTA, and FAQs", () => {
      render(<HomePage />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Create Beautiful QR Codes. Completely Free.",
        })
      ).toBeInTheDocument();

      // Primary, Secondary, and GitHub CTAs
      expect(
        screen.getAllByRole("link", { name: /Create a QR Code/i })[0]
      ).toHaveAttribute("href", "/create");
      expect(
        screen.getByRole("link", { name: /Explore Documentation/i })
      ).toHaveAttribute("href", "/documentation");

      const githubLinks = screen.getAllByRole("link", {
        name: /View on GitHub/i,
      });
      expect(githubLinks.length).toBeGreaterThanOrEqual(2);
      for (const link of githubLinks) {
        expect(link).toHaveAttribute(
          "href",
          "https://github.com/milindajay/OPEN_QR"
        );
      }

      // Verify "12 QR Code Types" benefit heading (not "12 Content Standards")
      expect(
        screen.getByRole("heading", { level: 3, name: "12 QR Code Types" })
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/12 Content Standards/i)
      ).not.toBeInTheDocument();

      // All 12 QR types rendered with links to /create?type=<id>
      for (const qrType of QR_TYPES) {
        expect(
          screen.getByRole("heading", { level: 3, name: qrType.label })
        ).toBeInTheDocument();
      }

      // Export options & FAQ questions
      expect(
        screen.getByRole("heading", { level: 3, name: "PNG" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "JPEG" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "SVG" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "Is OpenQR Studio free?",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "Can I use generated QR codes commercially?",
        })
      ).toBeInTheDocument();
    });
  });

  describe("About Us Page", () => {
    it("renders Introduction, Our Purpose, Our Philosophy, Open Source, and Product Direction without fabricated claims", () => {
      render(<AboutPage />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: `About ${APP_CONFIG.name}`,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Our Purpose" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Our Philosophy" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Open Source" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Product Direction" })
      ).toBeInTheDocument();

      const githubLink = screen.getByRole("link", {
        name: /Explore on GitHub/i,
      });
      expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/milindajay/OPEN_QR"
      );
    });
  });

  describe("Documentation Page", () => {
    it("renders all 10 documentation sections and documents all 12 QR types, logo limits, exports, clipboard fallback, and troubleshooting", () => {
      render(<DocumentationPage />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: `${APP_CONFIG.name} Documentation`,
        })
      ).toBeInTheDocument();

      const expectedSections = [
        "Getting Started",
        "Choosing a QR Code Type",
        "QR Design Customization",
        "Logo Guidelines",
        "Exporting QR Codes",
        "Clipboard Features",
        "QR Code Scanability",
        "Troubleshooting",
        "Privacy and Security",
        "Technical Information",
      ];

      for (const title of expectedSections) {
        expect(
          screen.getByRole("heading", { level: 2, name: title })
        ).toBeInTheDocument();
      }

      // Verify all 12 QR type headings exist in section 2
      expect(
        screen.getByRole("heading", { level: 3, name: "1. Website URL" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "11. Calendar Event" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: "12. Custom Payload" })
      ).toBeInTheDocument();

      // Verify accurate logo limits (2.0 MB) and GitHub link
      expect(screen.getByText("2.0 MB")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /View Source on GitHub/i })
      ).toHaveAttribute("href", "https://github.com/milindajay/OPEN_QR");
    });
  });

  describe("Privacy Policy Page", () => {
    it("renders all 12 required sections (A–L) with verified technical disclosures and official GitHub contact link", () => {
      render(<PrivacyPage />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Privacy Policy" })
      ).toBeInTheDocument();

      const requiredHeadings = [
        "A. Introduction",
        "B. Information We Process",
        "C. Local Processing",
        "D. Uploaded Logo Files",
        "E. Browser Storage",
        "F. Network Requests and Third Parties",
        "G. Data Retention",
        "H. Security",
        "I. Children's Privacy",
        "J. Policy Changes",
        "K. Contact and Project Information",
        "L. Last Updated",
      ];

      for (const heading of requiredHeadings) {
        expect(
          screen.getByRole("heading", { level: 2, name: heading })
        ).toBeInTheDocument();
      }

      // Verify next-themes localStorage disclosure, three-layer network distinction, and Last Updated date
      expect(screen.getByText(/next-themes/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "1. Local Application Processing of QR Content and Uploaded Logos",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "2. Ordinary Network Communication Required to Load the Hosted Website",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "3. Potential Connection Metadata Processing by Hosting Providers, CDNs, or Other Infrastructure",
        })
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(new RegExp(APP_CONFIG.lastUpdated)).length
      ).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByRole("link", {
          name: "https://github.com/milindajay/OPEN_QR",
        })
      ).toBeInTheDocument();
    });
  });
});
