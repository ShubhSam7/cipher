"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { cn } from "@/lib/utils";
import styles from "@/components/landing/glass.module.css";

const pill = "flex min-h-12 items-center gap-2 rounded-full px-8 py-3 text-base font-medium transition-all duration-200";
const primary = cn(styles.glassButton, pill, "text-primary hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95");
const secondary = cn(styles.glassInput, pill, "text-foreground hover:border-cyan-400/50");

export default function HeroActions() {
  const hydrated = useHydrated();
  const { isAuthenticated, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Reserve the row's height until persisted auth state is known, so nothing jumps.
  if (!hydrated) return <div className="mt-4 h-12" aria-hidden />;

  if (isAuthenticated) {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } finally {
              setIsLoggingOut(false);
            }
          }}
          disabled={isLoggingOut}
          className={cn(secondary, "disabled:cursor-not-allowed disabled:opacity-50")}
        >
          {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
        <Link href="/feed" className={primary}>
          Open feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      <Link href="/signin" className={secondary}>
        Sign in
      </Link>
      <Link href="/signup" className={primary}>
        Sign up
      </Link>
    </div>
  );
}
