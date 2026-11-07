import { test, expect } from "@playwright/test";

test.describe("Phase 2 — QR Design Studio E2E Verification", () => {
  test("applies presets, clears gradients/logos on transition, preserves logo filename across tabs, and resets design with zero external requests", async ({
    page,
  }) => {
    const externalRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (
        !url.startsWith("http://localhost:3000") &&
        !url.startsWith("data:") &&
        !url.startsWith("blob:")
      ) {
        externalRequests.push(url);
      }
    });

    await page.goto("/create");

    // 1. Verify initial live preview renders SVG
    const previewCanvas = page.getByTestId("qr-preview-canvas");
    await expect(previewCanvas.locator("svg")).toBeVisible();
    await expect(page.getByTestId("design-summary-bar")).toContainText("square");

    // 2. Apply Sunset preset and verify linearGradient is rendered in live SVG
    await page.getByTestId("preset-sunset").click();
    await expect(page.getByTestId("design-summary-bar")).toContainText(
      "extra rounded"
    );
    await expect(page.getByTestId("design-summary-bar")).toContainText(
      "linear gradient"
    );
    await expect(previewCanvas.locator("svg linearGradient")).toHaveCount(1);

    // 3. Switch to Classic Black solid preset -> linearGradient must be cleared from live SVG
    await page.getByTestId("preset-classic-black").click();
    await expect(previewCanvas.locator("svg linearGradient")).toHaveCount(0);

    // 4. Switch to Logo tab, upload clean SVG logo, verify <image> in preview & filename persistence across tabs
    await page.getByRole("tab", { name: "Logo" }).click();
    const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2563EB"/></svg>`;
    await page.locator("#qr-logo-upload-input").setInputFiles({
      name: "brand-icon.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(cleanSvg, "utf-8"),
    });
    await expect(page.getByTestId("uploaded-logo-filename")).toHaveText(
      "brand-icon.svg"
    );
    await expect(previewCanvas.locator("svg image")).toHaveCount(1);

    // Switch to Pattern tab and back to Logo tab -> filename must persist
    await page.getByRole("tab", { name: "Pattern" }).click();
    await page.getByTestId("pattern-dots").click();
    await page.getByRole("tab", { name: "Logo" }).click();
    await expect(page.getByTestId("uploaded-logo-filename")).toHaveText(
      "brand-icon.svg"
    );

    // Remove logo -> <image> must immediately disappear from live preview SVG
    await page.getByTestId("remove-logo-btn").click();
    await expect(previewCanvas.locator("svg image")).toHaveCount(0);

    // 5. Switch to Colours tab and toggle transparent background
    await page.getByRole("tab", { name: "Colours" }).click();
    await page.getByRole("switch", { name: "Transparent background" }).click();
    await expect(page.getByTestId("design-summary-bar")).toContainText(
      "Transparent"
    );
    await expect(page.getByTestId("scanability-status-badge")).toContainText(
      "Scanability Warning"
    );

    // 6. Switch to Corners tab and change outer & inner finder styles
    await page.getByRole("tab", { name: "Corners" }).click();
    await page.getByTestId("corner-outer-dot").click();
    await page.getByTestId("corner-inner-square").click();

    // 7. Switch to Layout tab, change export dimensions & error correction
    await page.getByRole("tab", { name: "Layout" }).click();
    await page.getByTestId("dimension-preset-2048").click();
    await expect(page.getByTestId("design-summary-bar")).toContainText(
      "2048×2048px"
    );
    await page.getByTestId("ec-level-H").click();
    await expect(page.getByTestId("capacity-summary")).toContainText("EC H");

    // 8. Reset Design restores defaults
    await page.getByTestId("reset-design-btn").click();
    await expect(page.getByTestId("design-summary-bar")).toContainText("square");
    await expect(page.getByTestId("design-summary-bar")).toContainText(
      "1024×1024px"
    );
    await expect(page.getByTestId("scanability-status-badge")).toContainText(
      "Good Scanability"
    );

    // 9. Verify zero outbound requests
    expect(externalRequests).toEqual([]);
  });

  test("mobile viewport (375x812) renders sticky live preview bar and responsive layout without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/create");

    const stickyPreviewBar = page.getByTestId("mobile-sticky-preview-bar");
    await expect(stickyPreviewBar).toBeVisible();
    await expect(
      page.getByTestId("mobile-mini-qr-canvas").locator("svg")
    ).toBeVisible();

    await expect(
      page.getByTestId("qr-preview-canvas").locator("svg")
    ).toBeVisible();
    await expect(page.getByTestId("design-studio-panel")).toBeVisible();
    await expect(page.getByTestId("download-png-btn")).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});
