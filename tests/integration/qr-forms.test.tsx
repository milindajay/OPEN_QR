import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QRWorkspace } from "@/components/generator/qr-workspace";

describe("Phase 3 Content Forms Integration (All 12 QR Types)", () => {
  it("1. URL Form: validates HTTP/HTTPS, offers https:// quick-fix for bare domains, and shows error on invalid scheme", () => {
    render(<QRWorkspace />);

    const urlInput = screen.getByLabelText(/Website URL/i);
    expect(urlInput).toHaveValue("https://openqr.studio");

    // Enter bare domain without protocol -> quick-fix button appears
    fireEvent.change(urlInput, { target: { value: "openqr.studio/docs" } });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /URL must begin with https:\/\/ or http:\/\//i
    );
    const prependBtn = screen.getByTestId("url-prepend-https-btn");
    fireEvent.click(prependBtn);
    expect(urlInput).toHaveValue("https://openqr.studio/docs");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("2. Plain Text Form: supports multilingual Unicode and updates UTF-8 byte counter", () => {
    render(<QRWorkspace />);

    fireEvent.click(screen.getByTestId("qr-type-text"));
    expect(screen.getByTestId("form-text")).toBeInTheDocument();

    const textInput = screen.getByLabelText(/Plain Text \(UTF-8\)/i);
    fireEvent.change(textInput, {
      target: { value: "English | ආයුබෝවන් | வணக்கம் | こんにちは | مرحبا 🚀" },
    });

    expect(screen.getByTestId("text-capacity-counter")).toHaveTextContent(
      /UTF-8 bytes/i
    );
  });

  it("3. vCard Form: renders all contact fields, validates email/phone/website, and updates live state", () => {
    render(<QRWorkspace />);

    fireEvent.click(screen.getByTestId("qr-type-vcard"));
    expect(screen.getByTestId("form-vcard")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/Organization/i), {
      target: { value: "Analytical Engine Labs" },
    });
    fireEvent.change(screen.getByLabelText(/Job Title/i), {
      target: { value: "Chief Mathematician" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "+44 20 7946 0958" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "invalid-email" },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      /valid contact email address/i
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "ada@openqr.studio" },
    });
    fireEvent.change(screen.getByLabelText(/Website/i), {
      target: { value: "https://openqr.studio" },
    });
    fireEvent.change(screen.getByLabelText(/Street Address/i), {
      target: { value: "10 St James's Square" },
    });
    fireEvent.change(screen.getByLabelText(/^City$/i), {
      target: { value: "London" },
    });
    fireEvent.change(screen.getByLabelText(/State \/ Province/i), {
      target: { value: "Greater London" },
    });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), {
      target: { value: "SW1Y 4LE" },
    });
    fireEvent.change(screen.getByLabelText(/^Country$/i), {
      target: { value: "United Kingdom" },
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("4. Wi-Fi Form: toggles password visibility, clears password on open network ('nopass'), and toggles hidden network", () => {
    render(<QRWorkspace />);

    fireEvent.click(screen.getByTestId("qr-type-wifi"));
    expect(screen.getByTestId("form-wifi")).toBeInTheDocument();

    const ssidInput = screen.getByLabelText(/Network Name \(SSID\)/i);
    fireEvent.change(ssidInput, { target: { value: "Studio_WiFi" } });

    const passwordInput = screen.getByLabelText(/Network Password/i);
    fireEvent.change(passwordInput, { target: { value: "short" } });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /at least 8 characters/i
    );

    fireEvent.change(passwordInput, { target: { value: "valid-wpa2-secret" } });
    expect(screen.queryByRole("alert")).toBeNull();

    // Toggle show/hide password
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByTestId("wifi-toggle-password"));
    expect(passwordInput).toHaveAttribute("type", "text");

    // Select open network (nopass) -> password input is hidden and cleared
    fireEvent.click(screen.getByTestId("wifi-security-nopass"));
    expect(screen.queryByLabelText(/Network Password/i)).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("5–7. Email, Phone, and SMS Forms: validate addresses and international phone numbers", () => {
    render(<QRWorkspace />);

    // Email
    fireEvent.click(screen.getByTestId("qr-type-email"));
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "bad-email" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/valid email address/i);

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "contact@openqr.studio" },
    });
    fireEvent.change(screen.getByLabelText(/Subject/i), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByLabelText(/Message/i), {
      target: { value: "Body text" },
    });
    expect(screen.queryByRole("alert")).toBeNull();

    // Phone
    fireEvent.click(screen.getByTestId("qr-type-phone"));
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "123" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/minimum 5 digits/i);
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "+1 415 555 0199" },
    });
    expect(screen.queryByRole("alert")).toBeNull();

    // SMS
    fireEvent.click(screen.getByTestId("qr-type-sms"));
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "+94 77 123 4567" },
    });
    fireEvent.change(screen.getByLabelText(/Pre-filled Message/i), {
      target: { value: "ආයුබෝවන් SMS!" },
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("8–10. Location, WhatsApp, and Social Media Forms: validate coordinates, wa.me normalization, and all 9 social platforms", () => {
    render(<QRWorkspace />);

    // Location
    fireEvent.click(screen.getByTestId("qr-type-location"));
    fireEvent.change(screen.getByLabelText(/Latitude/i), {
      target: { value: "99.5" },
    });
    fireEvent.change(screen.getByLabelText(/Longitude/i), {
      target: { value: "79.8612" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /between -90 and 90 degrees/i
    );

    fireEvent.change(screen.getByLabelText(/Latitude/i), {
      target: { value: "6.9271" },
    });
    fireEvent.change(screen.getByLabelText(/Location Label/i), {
      target: { value: "Colombo" },
    });
    expect(screen.queryByRole("alert")).toBeNull();

    // WhatsApp
    fireEvent.click(screen.getByTestId("qr-type-whatsapp"));
    fireEvent.change(screen.getByLabelText(/Country Code/i), {
      target: { value: "+94" },
    });
    fireEvent.change(screen.getByLabelText(/International Phone Number/i), {
      target: { value: "077 123 4567" },
    });
    expect(screen.getByTestId("whatsapp-normalized-preview")).toHaveTextContent(
      "wa.me/94771234567"
    );

    // Social Media (test Snapchat, Telegram, and incomplete username validation)
    fireEvent.click(screen.getByTestId("qr-type-social"));
    fireEvent.click(screen.getByTestId("social-provider-snapchat"));
    const socialInput = screen.getByPlaceholderText(/openqrstudio/i);
    fireEvent.change(socialInput, { target: { value: "@" } });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /complete username/i
    );

    fireEvent.change(socialInput, { target: { value: "openqrstudio" } });
    expect(screen.getByTestId("social-resolved-url")).toHaveTextContent(
      "https://www.snapchat.com/add/openqrstudio"
    );

    fireEvent.click(screen.getByTestId("social-provider-telegram"));
    expect(screen.getByTestId("social-resolved-url")).toHaveTextContent(
      "https://t.me/openqrstudio"
    );
  });

  it("11–12. Calendar & Custom Forms + State Preservation Across Type Switches", () => {
    render(<QRWorkspace />);

    // Apply Sunset design preset first
    fireEvent.click(screen.getByTestId("preset-sunset"));
    expect(screen.getByTestId("design-summary-bar")).toHaveTextContent(
      /linear gradient/i
    );

    // Calendar
    fireEvent.click(screen.getByTestId("qr-type-calendar"));
    fireEvent.change(screen.getByLabelText(/Event Title/i), {
      target: { value: "OpenQR v1 Launch" },
    });
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: "2026-11-20" },
    });
    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: "2026-11-18" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      /earlier than the start/i
    );

    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: "2026-11-21" },
    });
    expect(screen.queryByRole("alert")).toBeNull();

    // Toggle All-Day Event -> Start Time and End Time inputs disappear
    fireEvent.click(screen.getByRole("switch", { name: /All-Day Event/i }));
    expect(screen.queryByLabelText(/Start Time/i)).toBeNull();

    // Switch to Custom Data
    fireEvent.click(screen.getByTestId("qr-type-custom"));
    fireEvent.change(screen.getByLabelText(/Custom Payload String/i), {
      target: { value: "upi://pay?pa=studio@upi&pn=OpenQR" },
    });
    expect(screen.queryByRole("alert")).toBeNull();

    // Design preset remains intact after switching across types
    expect(screen.getByTestId("design-summary-bar")).toHaveTextContent(
      /linear gradient/i
    );

    // Switch back to Calendar -> Event Title is still preserved
    fireEvent.click(screen.getByTestId("qr-type-calendar"));
    expect(screen.getByLabelText(/Event Title/i)).toHaveValue(
      "OpenQR v1 Launch"
    );
  });
});
