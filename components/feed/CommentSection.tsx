"use client";
import { apiFetch } from "@/lib/apiFetch";

import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, Send, X } from "lucide-react";
import { createCommentSchema, type CreateCommentInput } from "@/lib/validation/comments";
import { MAX_CONTENT_LENGTH } from "@/lib/validation/posts";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import CommentCard, { type CommentData } from "./CommentCard";

interface ApiError {
  error?: string;
  details?: { message: string }[];
}

function errorMessage(data: ApiError, fallback: string) {
  return data.details?.[0]?.message ?? data.error ?? fallback;
}

// Render with key={postId} so a different post starts from fresh state.
export default function CommentSection({ postId, postAuthorId }: { postId: string; postAuthorId?: string }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CommentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/api/v1/comments?postId=${encodeURIComponent(postId)}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(errorMessage(data, "Failed to load comments"));
        setComments(Array.isArray(data.comments) ? data.comments : []);
        setLoadError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setLoadError(err instanceof Error ? err.message : "Failed to load comments");
        }
      })
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [postId]);

  const { topLevel, repliesByParent } = useMemo(() => {
    const repliesByParent = new Map<string, CommentData[]>();
    const topLevel: CommentData[] = [];
    for (const comment of comments) {
      if (comment.parentId) {
        repliesByParent.set(comment.parentId, [...(repliesByParent.get(comment.parentId) ?? []), comment]);
      } else {
        topLevel.push(comment);
      }
    }
    return { topLevel, repliesByParent };
  }, [comments]);

  const handleReply = (comment: CommentData) => {
    setReplyTo(comment);
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: CreateCommentInput = { content: newComment.trim(), postId };
      if (replyTo) payload.parentId = replyTo.id;

      const response = await apiFetch("/api/v1/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createCommentSchema.parse(payload)),
      });
      const data: ApiError & { comment?: CommentData } = await response.json();
      if (!response.ok || !data.comment) throw new Error(errorMessage(data, "Failed to post comment"));

      setComments((previous) => [...previous, data.comment!]);
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await apiFetch("/api/v1/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: pendingDelete.id }),
      });
      if (!response.ok) throw new Error(errorMessage(await response.json(), "Failed to delete comment"));

      // The database cascades to replies, so drop them locally too.
      const removedId = pendingDelete.id;
      setComments((previous) => previous.filter((c) => c.id !== removedId && c.parentId !== removedId));
      if (replyTo?.id === removedId) setReplyTo(null);
      toast.success("Comment deleted");
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section id="comments" className="mt-8 scroll-mt-20" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-4 text-xl font-bold">
        Comments {!loading && <span className="text-muted-foreground">({comments.length})</span>}
      </h2>

      <form onSubmit={handleSubmitComment} className="mb-6 rounded-2xl border bg-card p-4 focus-within:ring-2 focus-within:ring-ring">
        {replyTo && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm">
            <span className="truncate text-primary">Replying to u/{replyTo.author.user_handle}</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              aria-label="Cancel reply"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
        <label htmlFor="comment-input" className="sr-only">
          {replyTo ? `Reply to u/${replyTo.author.user_handle}` : "Write a comment"}
        </label>
        <Textarea
          id="comment-input"
          onKeyDown={event => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
          ref={inputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? "Write a reply…" : "Write a comment…"}
          maxLength={MAX_CONTENT_LENGTH}
          className="border-0 bg-transparent p-0 focus-visible:ring-0"
        />
        {submitError && <p role="alert" className="mt-2 text-sm text-destructive">{submitError}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {newComment.length}/{MAX_CONTENT_LENGTH}
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            {replyTo ? "Reply" : "Comment"}
          </Button>
        </div>
      </form>

      {loading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading comments">
          {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      )}
      {loadError && <p role="alert" className="text-destructive">{loadError}</p>}
      {!loading && !loadError && comments.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No comments yet. Start the conversation.</p>
      )}

      <ul>
        {topLevel.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            replies={repliesByParent.get(comment.id)}
            currentUserId={currentUserId}
            postAuthorId={postAuthorId}
            onReply={handleReply}
            onDelete={setPendingDelete}
          />
        ))}
      </ul>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}>
        <DialogContent hideClose className="max-w-sm">
          <DialogHeader className="pb-2">
            <DialogTitle>Delete comment?</DialogTitle>
            <DialogDescription>
              {pendingDelete && repliesByParent.has(pendingDelete.id)
                ? "This also deletes all replies to it. This can't be undone."
                : "This can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
