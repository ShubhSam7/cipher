"use client";
import { Button } from "@/components/ui/Button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div role="alert" className="mx-auto max-w-lg space-y-4 p-8"><h1 className="text-2xl font-bold">Something went wrong</h1><p>Please try again.</p><Button onClick={reset}>Retry</Button></div>;
}
