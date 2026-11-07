/**
 * Triggers a browser file download from an in-memory Blob and releases
 * the temporary object URL immediately afterward.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 250);
  }
}
