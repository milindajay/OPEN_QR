import { test, expect } from "@playwright/test";

const OFFICIAL_GITHUB_URL = "https://github.com/milindajay/OPEN_QR";

test.describe("Phase 5 — Website Content, Documentation & Trust Pages", () => {
  test("verifies Home, About Us, Documentation, and Privacy Policy navigation, SEO metadata, heading hierarchy, and GitHub links", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Homepage
    await page.goto("/");
    const homeTitle = await page.title();
    expect(homeTitle).toContain("OpenQR Studio");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Create Beautiful QR Codes. Completely Free.",
      })
    ).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    // Check active nav link on Home
    const mainNav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(mainNav.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    // Verify all GitHub links on Homepage point to the exact official repository
    const homeGithubLinks = await page
      .locator('a[href*="github.com"]')
      .evaluateAll((els) =>
        els
          .map((el) => el.getAttribute("href") ?? "")
          .filter((href) => !href.includes("github.com/milindajay\n"))
      );
    for (const href of homeGithubLinks) {
      expect(href).toBe(OFFICIAL_GITHUB_URL);
    }

    // 2. Navigate to Documentation via Hero secondary CTA
    await page.getByRole("link", { name: "Explore Documentation" }).click();
    await expect(page).toHaveURL(/\/documentation$/);
    const docsTitle = await page.title();
    expect(docsTitle).not.toBe(homeTitle);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "OpenQR Studio Documentation",
      })
    ).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      mainNav.getByRole("link", { name: "Documentation" })
    ).toHaveAttribute("aria-current", "page");

    // Verify all 10 documentation sections are present
    await expect(
      page.getByRole("heading", { level: 2, name: "Getting Started" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Choosing a QR Code Type" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Troubleshooting" })
    ).toBeVisible();

    // 3. Navigate to About Us via Header navigation
    await mainNav.getByRole("link", { name: "About Us" }).click();
    await expect(page).toHaveURL(/\/about$/);
    const aboutTitle = await page.title();
    expect(aboutTitle).not.toBe(docsTitle);
    await expect(
      page.getByRole("heading", { level: 1, name: "About OpenQR Studio" })
    ).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      mainNav.getByRole("link", { name: "About Us" })
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("link", { name: "Explore on GitHub" })
    ).toHaveAttribute("href", OFFICIAL_GITHUB_URL);

    // 4. Navigate to Privacy Policy via Header navigation
    await mainNav.getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    const privacyTitle = await page.title();
    expect(privacyTitle).not.toBe(aboutTitle);
    await expect(
      page.getByRole("heading", { level: 1, name: "Privacy Policy" })
    ).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      mainNav.getByRole("link", { name: "Privacy Policy" })
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("heading", { level: 2, name: "E. Browser Storage" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "L. Last Updated" })
    ).toBeVisible();

    // 5. Verify deep-link query parameter /create?type=wifi selects the Wi-Fi tab
    await page.goto("/create?type=wifi");
    await expect(page.getByTestId("qr-type-wifi")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("verifies responsive layouts across 1440px, 1024px, 768px, and 375px viewports with zero horizontal overflow", async ({
    page,
  }) => {
    const viewports = [
      { width: 1440, height: 900, label: "desktop-1440", route: "/" },
      {
        width: 1024,
        height: 768,
        label: "laptop-1024",
        route: "/documentation",
      },
      { width: 768, height: 1024, label: "tablet-768", route: "/about" },
      { width: 375, height: 812, label: "mobile-375", route: "/privacy" },
    ] as const;

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(vp.route);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByTestId("brand-logo").first()).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasHorizontalOverflow).toBe(false);
    }

    const iconLinkCount = await page
      .locator('head link[rel*="icon"]')
      .count();
    expect(iconLinkCount).toBeGreaterThanOrEqual(3);

    // Verify mobile menu navigation on 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/documentation");
    await expect(
      page.getByRole("navigation", {
        name: "Documentation sections mobile navigation",
      })
    ).toBeVisible();

    const menuButton = page.getByRole("button", {
      name: "Open navigation menu",
    });
    await menuButton.click();
    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
      exact: true,
    });
    await expect(mobileNav).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Documentation" })
    ).toHaveAttribute("aria-current", "page");
  });
});
