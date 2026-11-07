"use client";

import * as React from "react";

/**
 * Manages a temporary browser Object URL and guarantees URL.revokeObjectURL
 * cleanup whenever the blob changes or the component unmounts.
 */
export function useObjectUrl(blob: Blob | File | null): string | null {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!blob || typeof URL === "undefined" || !URL.createObjectURL) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(blob);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return objectUrl;
}
