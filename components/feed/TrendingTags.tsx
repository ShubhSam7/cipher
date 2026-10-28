"use client";

import { useEffect, useState, useId } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface TrendingTag { id: string; name: string; useCount: number }

export function TrendingList({ tags, activeTag, error, onRetry }: {
  tags: TrendingTag[] | null;
  activeTag?: string | null;
  error?: boolean;
  onRetry?: () => void;
}) {
  const headingId = useId();
  return (
    <section className="trend-panel" aria-labelledby={headingId}>
      <p className="section-label mb-3">CAMPUS PULSE</p>
      <h2 id={headingId} className="trend-title">On the radar.</h2>
      {error && <p className="text-xs leading-relaxed text-muted-foreground">Couldn&apos;t load trending tags. <button className="text-foreground underline underline-offset-4" onClick={onRetry}>Retry</button></p>}
      {!error && tags === null && <div className="space-y-6 py-3" aria-label="Loading trending tags">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-3 w-3/4" />)}</div>}
      {!error && tags?.length === 0 && <p className="text-xs leading-relaxed text-muted-foreground">The next conversation starts with you.</p>}
      {tags && tags.length > 0 && (
        <ol className="trend-list">
          {tags.map((tag, index) => (
            <li key={tag.id}>
              <Link href={`/feed?tag=${encodeURIComponent(tag.name)}`} aria-current={activeTag === tag.name ? "page" : undefined}
                className={cn("trend-link", activeTag === tag.name ? "text-primary" : "text-foreground/90")}>
                <span className="trend-rank" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                <span className="trend-name">#{tag.name}</span>
                <span className="trend-count">{tag.useCount} {tag.useCount === 1 ? "post" : "posts"}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function TrendingTags({ activeTag, refreshKey }: { activeTag?: string | null; refreshKey?: string }) {
  const [retry, setRetry] = useState(0);
  const [tags, setTags] = useState<TrendingTag[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/api/v1/trending", { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject(new Error()))
      .then((data: { tags?: TrendingTag[] }) => { setTags(Array.isArray(data.tags) ? data.tags : []); setError(false); })
      .catch(() => !controller.signal.aborted && setError(true));
    return () => controller.abort();
  }, [refreshKey, retry]);
  return <TrendingList tags={tags} activeTag={activeTag} error={error} onRetry={() => setRetry(value => value + 1)} />;
}
