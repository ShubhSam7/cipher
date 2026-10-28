"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ fallback = "/feed", label = "Back" }: { fallback?: string; label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className="-ml-2 flex min-h-11 items-center gap-2 rounded-lg px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden />
      {label}
    </button>
  );
}
