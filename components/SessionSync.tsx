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
    const controller = new AbortController();
    apiFetch("/api/v1/me", { signal: controller.signal }).then(async response => {
      if (response.ok) { const user = await response.json() as SessionUser; if (!controller.signal.aborted) useAuthStore.getState().login(user); }
    }).catch(() => {});
    return () => controller.abort();
  }, [pathname]);
  return null;
}
