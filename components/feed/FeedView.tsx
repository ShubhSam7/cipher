"use client";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { apiFetch } from "@/lib/apiFetch";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import PinnedPoll from "@/components/polls/PinnedPoll";
import FeedIntro from "@/components/feed/FeedIntro";
import PostCard from "@/components/feed/PostCard";
import TrendingTags from "@/components/feed/TrendingTags";
import { PostSkeleton } from "./PostSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { StickerTile } from "@/components/StickerTile";
import { Doodle } from "@/components/decor/Doodles";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/lib/store/uiStore";
import type { PostDTO, PostsResponse } from "@/lib/posts";
import { paginationSchema } from "@/lib/validation/posts";

// The page keys this by search/tag so each result set starts with fresh pagination.
export default function FeedView({ tag, community, author, query = "", showComposer = true }: { tag: string | null; community?: string; author?: string; query?: string; showComposer?: boolean }) {
  const reduce = usePrefersReducedMotion();
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
    const params = new URLSearchParams({ limit: String(input.limit) });
    if (input.cursor) params.set("cursor", input.cursor);
    if (tag) params.set("tag", tag);
    if (community) params.set("community", community);
    if (author) params.set("author", author);
    if (query) params.set("q", query);

    return apiFetch(`/api/v1/posts?${params}`, { credentials: "include", signal: controller.signal })
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
  }, [tag, community, author, query]);

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
      post => (!community || post.community?.slug === community) && (!author || post.author.user_handle === author) && !loaded.has(post.id) && (!tag || post.hashtags.some(hashtag => hashtag.name === tag)) && (!query || post.content.toLowerCase().includes(query.toLowerCase()))
    );
    if (extra.length === 0) return posts;
    return [...extra, ...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [posts, createdPosts, tag, community, author, query]);

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
        {showComposer && <FeedIntro compact={!!community || !!author} />}
        {(community || author) && <h2 className="sr-only">Posts</h2>}

        {!community && !author && !query && !tag && <PinnedPoll />}
        <div className="mobile-trending"><TrendingTags activeTag={tag} refreshKey={createdPosts[0]?.id} /></div>
        {(tag || query) && (
          <div className="search-summary mb-6" role="status">
            <p>
              {query ? <>Posts matching <strong>“{query}”</strong>{tag && <> in <span className="text-brand">#{tag}</span></>}</> : <>Showing posts tagged <span className="font-semibold text-brand">#{tag}</span></>}
            </p>
            <Link
              href="/feed"
              className="flex items-center gap-1 rounded-lg p-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden /> Clear
            </Link>
          </div>
        )}
        {query && <p className="metadata mb-4"><Link className="text-action" href={`/questions?${new URLSearchParams({ q: query })}`}>Search questions for “{query}” <ArrowUpRight size={16} aria-hidden /></Link></p>}

        {error && (
          <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => refetch(nextCursor ?? undefined)}>
              Retry
            </Button>
          </div>
        )}

        <div className="stream-heading"><p className="section-label">{query ? "Search results" : author ? "Posts" : "Latest conversations"}</p><span className="stream-order">Newest first</span></div>
        {loading && visiblePosts.length === 0 && (
          <div className="space-y-1" aria-busy="true" aria-label="Loading posts">
            {[0, 1, 2].map(i => <PostSkeleton key={i} />)}
          </div>
        )}

        {visiblePosts.map((post, index) => <m.div key={post.id} initial={reduce || index >= 10 ? false : "hidden"} animate="show" variants={fadeUp} transition={{delay:index < 10 ? index * .03 : 0}}><PostCard post={post} /></m.div>)}

        {!loading && visiblePosts.length === 0 && !error && (
          <EmptyState title={query ? "No matching posts." : tag ? `No posts tagged #${tag} yet.` : author ? "Nothing posted yet." : "Nothing here yet."} body={query ? "Try a different phrase or search for a #hashtag." : author && !showComposer ? "Posts from this student will appear here." : "A conversation starts with a thought."} action={query ? <Button asChild variant="outline"><Link href="/feed">Back to feed</Link></Button> : showComposer ? <Button onClick={() => openCreatePost(true)}>Create a post</Button> : undefined}/>
        )}

        <div ref={sentinel} />
        {hasMore && visiblePosts.length > 0 && (
          <div className="flex justify-center pt-2">
            {/* Fallback for when the observer doesn't fire (e.g. very tall viewports). */}
            <Button variant="outline" onClick={loadMore} disabled={loading || !!error} aria-live="polite">
              {loading ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
        {!hasMore && visiblePosts.length > 0 && (
          <div className="feed-end"><Doodle name="Sparkle" className="doodle--keep"/><span>{query || tag ? "You’ve reached the end of these results." : "You’re all caught up."}</span><button className="text-action" onClick={() => window.scrollTo({top:0,behavior:reduce ? "instant" : "smooth"})}>Back to top</button></div>
        )}
      </div>

      <aside className="feed-rail" aria-label="Trending">
        <div>
          <TrendingTags activeTag={tag} refreshKey={createdPosts[0]?.id} />
          <div className="rail-note"><StickerTile tone="peach" compact><span className="section-label">A little more campus.</span><p>Find your people.<br />Start a conversation worth having.</p><Link href="/community" className="text-action">Explore communities <ArrowUpRight className="h-4 w-4" aria-hidden /></Link></StickerTile></div>
        </div>
      </aside>
    </div>
  );
}
