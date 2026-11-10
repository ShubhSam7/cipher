"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useAuthStore } from "@/lib/store/authStore";
import type { SessionUser } from "@/lib/validation/auth";
export default function SessionSync() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/about") return;
    let controller: AbortController;
    const sync = () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      apiFetch("/api/v1/me", { signal: request.signal, cache: "no-store" }).then(async response => {
        if (response.ok) { const user = await response.json() as SessionUser; if (!request.signal.aborted) useAuthStore.getState().login(user); }
      }).catch(() => {});
    };
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) sync(); };
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", onPageShow);
    return () => { controller?.abort(); window.removeEventListener("focus", sync); window.removeEventListener("pageshow", onPageShow); };
  }, [pathname]);
  return null;
}
