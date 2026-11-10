"use client";

import { m } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { CommentData } from "@/lib/comments";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/avatar";
import RelativeTime from "@/components/RelativeTime";

const VISIBLE_REPLIES = 3;

export type { CommentData } from "@/lib/comments";

interface CommentCardProps {
  comment: CommentData;
  repliesByParent?: ReadonlyMap<string, CommentData[]>;
  currentUserId?: string;
  postAuthorId?: string;
  onReply?: (comment: CommentData) => void;
  onDelete: (comment: CommentData) => void;
  depth?: number;
  activeReplyId?: string;
  replyComposer?: ReactNode;
  busy?: boolean;
  onCollapse?: (comment: CommentData) => void;
  newIds?: ReadonlySet<string>;
}

export default function CommentCard({
  comment,
  repliesByParent,
  currentUserId,
  postAuthorId,
  onReply,
  onDelete,
  depth = 0,
  activeReplyId,
  replyComposer,
  busy,
  onCollapse,
  newIds,
}: CommentCardProps) {
  const reduce = usePrefersReducedMotion();
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const replies = repliesByParent?.get(comment.id) ?? [];
  const revealNew = replies.some(reply => newIds?.has(reply.id));
  const visibleReplies = showAllReplies || revealNew ? replies : replies.slice(0, VISIBLE_REPLIES);
  const hiddenCount = replies.length - visibleReplies.length;
  const isOwn = currentUserId === comment.author.id;

  return (
    <m.li id={`comment-${comment.id}`} initial={!reduce && newIds?.has(comment.id) ? {opacity:0,y:8} : false} animate={{opacity:1,y:0}} transition={{duration:.16}} className={cn("min-w-0", depth ? "mt-3" : "mt-4")}>
      <article className="comment-entry" aria-label={`Comment by ${comment.author.user_handle}`}>
        <header className="mb-2 flex items-center gap-3">
          <UserAvatar handle={comment.author.user_handle} src={comment.author.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold"><Link href={`/u/${comment.author.user_handle}`} className="min-w-0 break-words hover:underline">u/{comment.author.user_handle}</Link> {postAuthorId === comment.author.id && <span className="status-badge status-badge--op shrink-0" data-tone="sky"><span aria-hidden>OP</span><span className="sr-only">Original poster</span></span>}</p>
            <RelativeTime date={comment.createdAt} className="metadata" />
          </div>
          {replies.length > 0 && <button type="button" disabled={busy} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent" aria-label={collapsed ? "Show replies" : "Hide replies"} title={collapsed ? "Show replies" : "Hide replies"} aria-expanded={!collapsed} aria-controls={`replies-${comment.id}`} onClick={() => {
            if (!collapsed) onCollapse?.(comment);
            setCollapsed(value => !value);
          }}>{collapsed ? <ChevronRight size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}</button>}
        </header>

        <p className="content-body mb-2">
          {comment.content}
        </p>

        <div className="comment-actions flex-wrap">
          {onReply && (
            <button
              id={`reply-button-${comment.id}`}
              type="button"
              onClick={() => onReply(comment)}
              disabled={busy}
              aria-expanded={activeReplyId === comment.id}
              aria-controls={activeReplyId === comment.id ? `reply-form-${comment.id}` : undefined}
              className="min-h-11 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-brand"
            >
              Reply
            </button>
          )}
          {isOwn && (
            <button
              type="button"
              onClick={() => onDelete(comment)}
              disabled={busy}
              aria-label="Delete comment"
              className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </button>
          )}
        </div>
      </article>

      {activeReplyId === comment.id && <div id={`reply-form-${comment.id}`} className="comment-inline-composer">{replyComposer}</div>}

      {replies.length > 0 && (
        <ul id={`replies-${comment.id}`} hidden={collapsed} className={cn("comment-replies", depth >= 1 && "comment-replies--flat")} aria-label={`Replies to ${comment.author.user_handle}`}>
          {visibleReplies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              repliesByParent={repliesByParent}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              onReply={onReply}
              onDelete={onDelete}
              newIds={newIds}
              depth={depth + 1}
              activeReplyId={activeReplyId}
              replyComposer={replyComposer}
              busy={busy}
              onCollapse={onCollapse}
            />
          ))}
          {hiddenCount > 0 && (
            <li className="mt-2">
              <button
                type="button"
                onClick={() => setShowAllReplies(true)}
                className="min-h-11 rounded-lg px-2 text-sm font-medium text-brand hover:bg-accent"
              >
                Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
              </button>
            </li>
          )}
        </ul>
      )}
    </m.li>
  );
}
