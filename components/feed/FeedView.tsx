"use client";
import { apiFetch } from "@/lib/apiFetch";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import PinnedPoll from "@/components/polls/PinnedPoll";
import FeedIntro from "@/components/feed/FeedIntro";
import PostCard from "@/components/feed/PostCard";
import TrendingTags from "@/components/feed/TrendingTags";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/lib/store/uiStore";
import type { PostDTO, PostsResponse } from "@/lib/posts";
import { paginationSchema } from "@/lib/validation/posts";

function PostSkeleton() {
  return (
    <div className="post-entry" aria-hidden>
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// Keyed by tag in the page, so switching tags starts from a fresh instance.
export default function FeedView({ tag, community, author }: { tag: string | null; community?: string; author?: string }) {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const activeRequest = useRef<AbortController | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const createdPosts = useUiStore((state) => state.createdPosts);
  const openCreatePost = useUiStore((state) => state.setCreatePostOpen);

  // Starts a page request, aborting any in-flight one. State is only set in the
  // promise callbacks, so this is safe to call from an effect.
  const fetchPosts = useCallback((cursor?: string) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const input = paginationSchema.parse({ cursor, limit: 10 });
    const query = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) query.set("cursor", input.cursor);
    if (tag) query.set("tag", tag);
    if (community) query.set("community", community);
    if (author) query.set("author", author);

    return apiFetch(`/api/v1/posts?${query}`, { credentials: "include", signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Couldn't load posts. Check your connection and try again.");
        return response.json() as Promise<PostsResponse>;
      })
      .then(data => {
        if (controller.signal.aborted) return;
        setPosts(previous => {
          if (!cursor) return data.posts;
          const existingIds = new Set(previous.map(post => post.id));
          return [...previous, ...data.posts.filter(post => !existingIds.has(post.id))];
        });
        setNextCursor(data.pagination.nextCursor);
        setHasMore(data.pagination.hasMore);
        setError(null);
      })
      .catch(err => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (activeRequest.current === controller) {
          activeRequest.current = null;
          setLoading(false);
        }
      });
  }, [tag, community, author]);

  // `loading` starts true, so only later, user-triggered fetches need to set it.
  const refetch = useCallback((cursor?: string) => {
    setLoading(true);
    void fetchPosts(cursor);
  }, [fetchPosts]);

  useEffect(() => {
    void fetchPosts();
    return () => activeRequest.current?.abort();
  }, [fetchPosts]);

  // Merge in posts created from the dialog instead of refetching the feed.
  const visiblePosts = useMemo(() => {
    const loaded = new Set(posts.map(post => post.id));
    const extra = createdPosts.filter(
      post => (!community || post.community?.slug === community) && (!author || post.author.user_handle === author) && !loaded.has(post.id) && (!tag || post.hashtags.some(hashtag => hashtag.name === tag))
    );
    if (extra.length === 0) return posts;
    return [...extra, ...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [posts, createdPosts, tag, community, author]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading && !error && nextCursor) refetch(nextCursor);
  }, [hasMore, loading, error, nextCursor, refetch]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => entries[0].isIntersecting && loadMore(),
      { rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="feed-layout">
      <div className="feed-column">
        <FeedIntro compact={!!community || !!author} />
        {(community || author) && <h2 className="sr-only">Posts</h2>}

        {!community && !author && <PinnedPoll />}
        <div className="mobile-trending"><TrendingTags activeTag={tag} refreshKey={createdPosts[0]?.id} /></div>
        {tag && (
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4 text-xs">
            <p>
              Showing posts tagged <span className="font-semibold text-primary">#{tag}</span>
            </p>
            <Link
              href="/feed"
              className="flex items-center gap-1 rounded-lg p-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden /> Clear
            </Link>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => refetch(nextCursor ?? undefined)}>
              Retry
            </Button>
          </div>
        )}

        <div className="stream-heading"><p className="section-label">Latest conversations</p><span className="stream-order">Newest first</span></div>
        {loading && visiblePosts.length === 0 && (
          <div className="space-y-1" aria-busy="true" aria-label="Loading posts">
            {[0, 1, 2].map(i => <PostSkeleton key={i} />)}
          </div>
        )}

        {visiblePosts.map(post => <PostCard key={post.id} post={post} />)}

        {!loading && visiblePosts.length === 0 && !error && (
          <div className="feed-empty">
            <p className="mb-4 text-lg text-muted-foreground">
              {tag ? `No posts tagged #${tag} yet.` : "No posts yet. Be the first to share something."}
            </p>
            <Button onClick={() => openCreatePost(true)} >
              Create a post
            </Button>
          </div>
        )}

        <div ref={sentinel} />
        {hasMore && visiblePosts.length > 0 && (
          <div className="flex justify-center pt-2">
            {/* Fallback for when the observer doesn't fire (e.g. very tall viewports). */}
            <Button variant="outline" onClick={loadMore} disabled={loading} aria-live="polite">
              {loading ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
        {!hasMore && visiblePosts.length > 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
        )}
      </div>

      <aside className="feed-rail" aria-label="Trending">
        <div>
          <TrendingTags activeTag={tag} refreshKey={createdPosts[0]?.id} />
          <div className="rail-note"><span className="section-label">A little more campus.</span><p>Find your people.<br />Start a conversation worth having.</p><Link href="/community" className="text-action">Explore communities <ArrowUpRight className="h-4 w-4" aria-hidden /></Link></div>
        </div>
      </aside>
    </div>
  );
}
