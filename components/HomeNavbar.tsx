"use client";

import Logo from "@/components/Logo";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Button } from "@/components/ui/Button";

export default function HomeNavbar() {
  const hydrated = useHydrated();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const signedIn = hydrated && isAuthenticated;
  return (
    <header className="border-b">
      <nav aria-label="Main" className="public-nav">
        <Logo />
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/about" className="text-action public-about">About Cipher</Link>
          <Button asChild variant="outline"><Link href={signedIn ? "/feed" : "/signin"}>{signedIn ? "Open feed" : "Sign in"}</Link></Button>
        </div>
      </nav>
    </header>
  );
}
