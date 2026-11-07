import { test, expect } from "@playwright/test";

test("homepage renders hero and navigates to QR studio", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Create Beautiful QR Codes. Completely Free.",
    })
  ).toBeVisible();
  await page.getByRole("link", { name: "Create a QR Code" }).first().click();
  await expect(page).toHaveURL(/\/create/);
});

test("/create renders live QR preview, validates input, and sends zero external payload requests", async ({
  page,
}) => {
  const externalRequests: string[] = [];

  page.on("request", (req) => {
    const url = req.url();
    if (!url.startsWith("http://localhost:3000") && !url.startsWith("data:") && !url.startsWith("blob:")) {
      externalRequests.push(url);
    }
  });

  await page.goto("/create");

  const previewCanvas = page.getByTestId("qr-preview-canvas");
  await expect(previewCanvas.locator("svg")).toBeVisible();

  // Enter invalid URL and verify error state
  const urlInput = page.getByLabel("Website URL");
  await urlInput.fill("not-a-valid-url");
  await expect(page.locator("#qr-url-error")).toContainText(
    "URL must begin with https:// or http://."
  );
  await expect(page.getByTestId("qr-preview-empty")).toBeVisible();

  // Switch to Plain Text and test multilingual Unicode rendering
  await page.getByRole("tab", { name: "Plain Text" }).click();
  const textInput = page.getByLabel("Plain Text (UTF-8)");
  await textInput.fill("ආයුබෝවන් | வணக்கம் | こんにちは | مرحبا 🚀");

  await expect(previewCanvas.locator("svg")).toBeVisible();
  await expect(page.getByTestId("scanability-status-badge")).toContainText(
    "Good Scanability"
  );

  // Confirm zero external requests were made with user payloads
  expect(externalRequests).toEqual([]);
});
