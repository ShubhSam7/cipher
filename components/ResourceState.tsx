"use client";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
export default function ResourceState({ error, retry }: { error: string | null; retry: () => void }) {
  return error ? <div role="alert" className="feedback-panel feedback-panel--error flex-col"><p>{error}</p><Button onClick={retry} variant="outline">Retry</Button></div> : <div aria-label="Loading" aria-busy="true" className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>;
}
