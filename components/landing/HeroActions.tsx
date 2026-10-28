"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Button } from "@/components/ui/Button";

export default function HeroActions() {
  const hydrated = useHydrated();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const signedIn = hydrated && isAuthenticated;
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-4">
      <Button asChild size="lg"><Link href={signedIn ? "/feed" : "/signup"}>{signedIn ? "Open your feed" : "Join your campus"}<ArrowRight className="h-4 w-4" aria-hidden /></Link></Button>
      {!signedIn && <Link href="/signin" className="text-action">Already here? Sign in</Link>}
    </div>
  );
}
