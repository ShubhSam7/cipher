"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
      <h1 className="mb-2 text-xl font-semibold">Something went wrong</h1>
      <p className="mb-6 text-muted-foreground">This page failed to load. Try again, or head back to the feed.</p>
      <div className="flex justify-center gap-3">
        <Button onClick={reset} className="bg-primary text-primary-foreground hover:bg-primary/90">Try again</Button>
        <Button asChild variant="outline">
          <Link href="/feed">Go to feed</Link>
        </Button>
      </div>
    </div>
  );
}
