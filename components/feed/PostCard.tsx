"use client";
import { apiFetch } from "@/lib/apiFetch";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { postLikeSchema } from "@/lib/validation/posts";
import type { PostDTO } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/avatar";
import RelativeTime from "@/components/RelativeTime";

const CLAMP_CHARS = 320;

interface PostCardProps {
  post: PostDTO;
  // On the post page the card is the page itself, so it shouldn't link to itself.
  isDetail?: boolean;
}

function PostContent({ content }: { content: string }) {
  return content.split(/(#\w+)/g).map((part, index) =>
    /^#\w+$/.test(part) ? (
      <Link
        key={index}
        href={`/feed?tag=${encodeURIComponent(part.slice(1).toLowerCase())}`}
        className="relative z-10 text-primary hover:underline"
      >
        {part}
      </Link>
    ) : (
      part
    )
  );
}

export default function PostCard({ post, isDetail = false }: PostCardProps) {
  const [likes, setLikes] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(isDetail);
  const href = `/post/${post.id}`;
  const author = `u/${post.author.user_handle}`;
  const isLong = post.content.length > CLAMP_CHARS;

  const handleLike = async () => {
    if (isLoading) return;
    const previous = { likes, isLiked };
    setIsLoading(true);
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      const response = await apiFetch("/api/v1/postlikes", {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postLikeSchema.parse({ postId: post.id })),
      });
      if (!response.ok) throw new Error();
    } catch {
      setIsLiked(previous.isLiked);
      setLikes(previous.likes);
      toast.error("Couldn't update like. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const url = new URL(href, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: `Post by ${author}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) toast.error("Couldn't share this post");
    }
  };

  return (
    <article
      className={cn(
        "post-entry",
        isDetail && "post-entry--detail"
      )}
    >
      {!isDetail && (
        <Link href={href} className="absolute inset-0" aria-label={`Open post by ${author}`} />
      )}

      <header className="mb-4 flex items-center gap-3">
        <UserAvatar handle={post.author.user_handle} src={post.author.avatar} />
        <div className="min-w-0">
          <p className="post-meta flex flex-wrap items-center">
            {post.community && <><Link href={`/c/${post.community.slug}`} className="relative z-10 hover:underline">c/{post.community.name}</Link><span>•</span></>}
            <Link href={`/u/${post.author.user_handle}`} className="relative z-10 hover:underline">u/{post.author.user_handle}</Link><span>•</span>
            <RelativeTime date={post.createdAt} className="text-muted-foreground" />
          </p>
        </div>
      </header>

      <p
        className={cn(
          "post-body mb-2 whitespace-pre-wrap break-words",
          isLong && !expanded && "line-clamp-6"
        )}
      >
        <PostContent content={post.content} />
      </p>
      {isLong && !isDetail && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="relative z-10 mb-2 text-sm font-medium text-primary hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      <div className="post-actions relative z-10 -ml-2 flex w-fit items-center">
        <button
          type="button"
          onClick={handleLike}
          disabled={isLoading}
          aria-pressed={isLiked}
          aria-label={`${isLiked ? "Unlike" : "Like"} post, ${likes} ${likes === 1 ? "like" : "likes"}`}
          className={cn(
            "post-action flex items-center gap-2 transition-colors disabled:opacity-60",
            isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} aria-hidden />
          <span className="text-sm font-medium">{likes}</span>
        </button>

        <Link
          href={`${href}#comments`}
          aria-label={`${post.commentCount} ${post.commentCount === 1 ? "comment" : "comments"}`}
          className="post-action flex items-center gap-2 transition-colors"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          <span className="text-sm font-medium">{post.commentCount}</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share post"
          className="post-action flex items-center gap-2 transition-colors"
        >
          <Share2 className="h-5 w-5" aria-hidden />
          <span className="hidden text-sm font-medium sm:inline">Share</span>
        </button>
      </div>
    </article>
  );
}
