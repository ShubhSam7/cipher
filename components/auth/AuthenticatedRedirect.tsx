"use client";

import { useEffect } from "react";

// Also covers an auth page restored from the client navigation cache.
export default function AuthenticatedRedirect() {
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/me", { credentials: "include", cache: "no-store", signal: controller.signal })
      .then(response => { if (response.ok && !controller.signal.aborted) window.location.replace("/feed"); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return null;
}
