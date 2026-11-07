import "@testing-library/jest-dom/vitest";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof URL !== "undefined") {
  if (typeof URL.createObjectURL !== "function") {
    URL.createObjectURL = () => "blob:http://localhost:3000/jsdom-object-url";
  }
  if (typeof URL.revokeObjectURL !== "function") {
    URL.revokeObjectURL = () => {};
  }
}

// In jsdom, HTMLImageElement does not automatically decode data:image URIs or fire onload.
// Provide a deterministic onload trigger so qr-code-styling's SVG/logo pipeline resolves in unit tests.
if (
  typeof window !== "undefined" &&
  typeof HTMLImageElement !== "undefined" &&
  window.navigator?.userAgent?.includes("jsdom")
) {
  const originalSrcDescriptor = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    "src"
  );

  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: true,
    enumerable: true,
    get() {
      return originalSrcDescriptor?.get?.call(this) ?? "";
    },
    set(value: string) {
      originalSrcDescriptor?.set?.call(this, value);
      if (!this.width) {
        Object.defineProperty(this, "width", {
          value: 256,
          configurable: true,
          writable: true,
        });
      }
      if (!this.height) {
        Object.defineProperty(this, "height", {
          value: 256,
          configurable: true,
          writable: true,
        });
      }
      queueMicrotask(() => {
        if (typeof value === "string" && value.startsWith("data:image/")) {
          this.onload?.(new Event("load"));
          this.dispatchEvent(new Event("load"));
        } else if (value) {
          this.onerror?.(new Event("error"));
          this.dispatchEvent(new Event("error"));
        }
      });
    },
  });
}
