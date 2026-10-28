"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/avatar";
import RelativeTime from "@/components/RelativeTime";

const VISIBLE_REPLIES = 3;

export interface CommentData {
  id: string;
  content: string;
  author: { id: string; user_handle: string; avatar: string | null };
  createdAt: string;
  parentId: string | null;
}

interface CommentCardProps {
  comment: CommentData;
  replies?: CommentData[];
  currentUserId?: string;
  postAuthorId?: string;
  onReply?: (comment: CommentData) => void;
  onDelete: (comment: CommentData) => void;
  isReply?: boolean;
}

export default function CommentCard({
  comment,
  replies = [],
  currentUserId,
  postAuthorId,
  onReply,
  onDelete,
  isReply = false,
}: CommentCardProps) {
  const [showAllReplies, setShowAllReplies] = useState(false);
  const visibleReplies = showAllReplies ? replies : replies.slice(0, VISIBLE_REPLIES);
  const hiddenCount = replies.length - visibleReplies.length;
  const isOwn = currentUserId === comment.author.id;

  return (
    <li className={cn(isReply ? "mt-3" : "mt-4")}>
      <article className="comment-entry" aria-label={`Comment by ${comment.author.user_handle}`}>
        <header className="mb-2 flex items-center gap-3">
          <UserAvatar handle={comment.author.user_handle} src={comment.author.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold"><Link href={`/u/${comment.author.user_handle}`} className="hover:underline">u/{comment.author.user_handle}</Link> {postAuthorId === comment.author.id && <span className="status-badge">Original poster</span>}</p>
            <RelativeTime date={comment.createdAt} className="metadata" />
          </div>
        </header>

        <p className="content-body mb-2">
          {comment.content}
        </p>

        <div className="-ml-2 flex items-center gap-1">
          {/* Replies are one level deep, so only top-level comments can be replied to. */}
          {!isReply && onReply && (
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="min-h-11 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              Reply
            </button>
          )}
          {isOwn && (
            <button
              type="button"
              onClick={() => onDelete(comment)}
              aria-label="Delete comment"
              className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </button>
          )}
        </div>
      </article>

      {replies.length > 0 && (
        <ul className="comment-replies" aria-label={`Replies to ${comment.author.user_handle}`}>
          {visibleReplies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              onDelete={onDelete}
              isReply
            />
          ))}
          {hiddenCount > 0 && (
            <li className="mt-2">
              <button
                type="button"
                onClick={() => setShowAllReplies(true)}
                className="min-h-11 rounded-lg px-2 text-sm font-medium text-primary hover:bg-accent"
              >
                Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
              </button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}
