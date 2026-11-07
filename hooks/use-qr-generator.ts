"use client";

import * as React from "react";
import type { QRPayload, QRPayloadByType } from "@/types/payload";
import type { QRDesign } from "@/types/design";
import type { QRType } from "@/types/qr";
import { generatePayload } from "@/lib/qr/payloads";
import { validatePayload } from "@/lib/qr/validation/payload-validation";
import { estimateQrCapacity } from "@/lib/qr/validation/qr-capacity";
import { analyzeScanability } from "@/lib/qr/validation/scanability";
import { createDefaultDesign } from "@/lib/qr/presets/design-presets";
import { useQrDesign } from "@/hooks/use-qr-design";

export function createDefaultPayloadsByType(): QRPayloadByType {
  return {
    url: {
      type: "url",
      url: "https://openqr.studio",
    },
    text: {
      type: "text",
      text: "",
    },
    vcard: {
      type: "vcard",
      firstName: "",
      lastName: "",
      fullName: "",
      organization: "",
      jobTitle: "",
      mobile: "",
      phone: "",
      email: "",
      website: "",
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
      note: "",
    },
    wifi: {
      type: "wifi",
      ssid: "",
      password: "",
      security: "WPA",
      hidden: false,
    },
    email: {
      type: "email",
      email: "",
      subject: "",
      message: "",
    },
    phone: {
      type: "phone",
      phone: "",
    },
    sms: {
      type: "sms",
      phone: "",
      message: "",
    },
    location: {
      type: "location",
      latitude: Number.NaN,
      longitude: Number.NaN,
      label: "",
      format: "geo",
    },
    whatsapp: {
      type: "whatsapp",
      countryCode: "",
      phone: "",
      message: "",
    },
    social: {
      type: "social",
      provider: "instagram",
      url: "",
    },
    calendar: {
      type: "calendar",
      title: "",
      start: "",
      end: "",
      allDay: false,
      location: "",
      description: "",
      url: "",
    },
    custom: {
      type: "custom",
      value: "",
    },
  };
}

const INITIAL_PAYLOAD: QRPayload = {
  type: "url",
  url: "https://openqr.studio",
};

export function useQrGenerator(
  initialPayload: QRPayload = INITIAL_PAYLOAD,
  initialDesign: QRDesign = createDefaultDesign()
) {
  const [payloadsByType, setPayloadsByType] = React.useState<QRPayloadByType>(
    () => {
      const defaults = createDefaultPayloadsByType();
      return {
        ...defaults,
        [initialPayload.type]: initialPayload,
      };
    }
  );
  const [activeType, setActiveType] = React.useState<QRType>(
    initialPayload.type
  );

  const payload = payloadsByType[activeType];

  const setPayload = React.useCallback((nextPayload: QRPayload) => {
    setActiveType(nextPayload.type);
    setPayloadsByType((prev) => ({
      ...prev,
      [nextPayload.type]: nextPayload,
    }));
  }, []);

  const setQrType = React.useCallback((nextType: QRType) => {
    setActiveType(nextType);
  }, []);

  const resetCurrentPayload = React.useCallback(() => {
    const defaults = createDefaultPayloadsByType();
    setPayloadsByType((prev) => ({
      ...prev,
      [activeType]: defaults[activeType],
    }));
  }, [activeType]);

  const designController = useQrDesign(initialDesign);
  const { design, resetDesign } = designController;

  const validation = React.useMemo(
    () => validatePayload(payload, design.errorCorrection),
    [payload, design.errorCorrection]
  );

  const encodedPayload = React.useMemo(() => {
    if (!validation.isValid) {
      return "";
    }
    try {
      return generatePayload(payload);
    } catch {
      return "";
    }
  }, [payload, validation.isValid]);

  const rawDraftString = React.useMemo(() => {
    try {
      return generatePayload(payload);
    } catch {
      return "";
    }
  }, [payload]);

  const capacity = React.useMemo(
    () => estimateQrCapacity(rawDraftString, design.errorCorrection),
    [rawDraftString, design.errorCorrection]
  );

  const scanability = React.useMemo(
    () => analyzeScanability(rawDraftString, design),
    [rawDraftString, design]
  );

  const resetAll = React.useCallback(() => {
    setPayloadsByType(createDefaultPayloadsByType());
    setActiveType("url");
    resetDesign();
  }, [resetDesign]);

  return {
    payload,
    payloadsByType,
    activeType,
    setPayload,
    setQrType,
    resetCurrentPayload,
    ...designController,
    validation,
    encodedPayload,
    capacity,
    scanability,
    resetAll,
  };
}
