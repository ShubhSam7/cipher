"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { cn } from "@/lib/utils";
import styles from "@/components/landing/glass.module.css";

export default function HomeNavbar() {
  const hydrated = useHydrated();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signedIn = hydrated && isAuthenticated;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-3 pt-3 md:px-4 md:pt-4">
      <nav aria-label="Main" className={cn(styles.glassContainer, "w-full max-w-[1200px] rounded-full px-6 py-3 md:px-8")}>
        <div className="flex items-center justify-between gap-4">
          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            <Link href="/" aria-current="page" className={cn(styles.navLink, styles.active)}>
              Home
            </Link>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            {!signedIn && (
              <Link href="/signin" className={styles.navLink}>
                Sign in
              </Link>
            )}
          </div>

          <Link
            href={signedIn ? "/feed" : "/signup"}
            className={cn(
              styles.glassButton,
              "rounded-full px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 md:px-6"
            )}
          >
            {signedIn ? "Open feed" : "Get started"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
