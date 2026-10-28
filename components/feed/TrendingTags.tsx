"use client";
import { apiFetch } from "@/lib/apiFetch";

import { useEffect, useState, useId } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingTag { id: string; name: string; useCount: number }

export default function TrendingTags({ activeTag, refreshKey }: { activeTag?: string | null; refreshKey?: string }) {
  const headingId = useId();
  const [retry, setRetry] = useState(0);
  const [tags, setTags] = useState<TrendingTag[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/api/v1/trending", { credentials: "include", signal: controller.signal })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error())))
      .then((data: { tags?: TrendingTag[] }) => {
        setTags(Array.isArray(data.tags) ? data.tags : []);
        setError(false);
      })
      .catch(() => !controller.signal.aborted && setError(true));
    return () => controller.abort();
  }, [refreshKey, retry]);

  return (
    <section className="rounded-2xl border bg-card p-4" aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-3 flex items-center gap-2 font-semibold">
        <TrendingUp className="h-4 w-4 text-primary" aria-hidden /> Trending on campus
      </h2>
      {error && <p className="text-sm text-destructive">Couldn&apos;t load trending tags. <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
      {!error && tags === null && (
        <div className="space-y-3" aria-hidden>
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-5 w-3/4" />)}
        </div>
      )}
      {tags?.length === 0 && <p className="text-sm text-muted-foreground">No trending hashtags yet.</p>}
      {tags && tags.length > 0 && (
        <ol className="-mx-2 flex gap-2 overflow-x-auto lg:block lg:space-y-0.5">
          {tags.map(tag => (
            <li key={tag.id}>
              <Link
                href={`/feed?tag=${encodeURIComponent(tag.name)}`}
                aria-current={activeTag === tag.name ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent",
                  activeTag === tag.name ? "text-primary" : "text-foreground/90 hover:text-primary"
                )}
              >
                <span className="truncate">#{tag.name}</span>
                <span className="text-xs text-muted-foreground">
                  {tag.useCount} {tag.useCount === 1 ? "post" : "posts"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
