"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiFetch";
import { createCommentSchema } from "@/lib/validation/comments";
import { groupComments, commentBranchIds, type CommentData } from "@/lib/comments";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import CommentCard from "./CommentCard";
import CommentComposer from "./CommentComposer";

interface ApiError {
  error?: string;
  details?: { message: string }[];
}

function errorMessage(data: ApiError, fallback: string) {
  return data.details?.[0]?.message ?? data.error ?? fallback;
}

// Render with key={postId} so a different post starts from fresh state.
export default function CommentSection({ postId, postAuthorId }: { postId: string; postAuthorId?: string }) {
  const currentUserId = useAuthStore(state => state.user?.id);
  const [newIds, setNewIds] = useState<Set<string>>(() => new Set());
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CommentData | null>(null);
  const [loading, setLoading] = useState(true);
  // undefined = idle; null = posting a top-level comment; string = replying.
  const [submittingId, setSubmittingId] = useState<string | null | undefined>();
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const busy = submittingId !== undefined || deleting;

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/api/v1/comments?postId=${encodeURIComponent(postId)}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(errorMessage(data, "Failed to load comments"));
        if (controller.signal.aborted) return;
        setComments(Array.isArray(data.comments) ? data.comments : []);
        setLoadError(null);
      })
      .catch(error => {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Failed to load comments");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [postId, revision]);

  const { topLevel, repliesByParent } = useMemo(() => groupComments(comments), [comments]);

  const cancelReply = () => {
    if (replyTo) document.getElementById(`reply-button-${replyTo.id}`)?.focus({ preventScroll: true });
    setReplyTo(null);
    setReplyError(null);
  };

  const submitComment = async (parent: CommentData | null) => {
    const content = parent ? replyContent : newComment;
    if (!content.trim() || busy) return;
    setSubmittingId(parent?.id ?? null);
    const setError = parent ? setReplyError : setCommentError;
    setError(null);
    try {
      const response = await apiFetch("/api/v1/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createCommentSchema.parse({ content, postId, parentId: parent?.id })),
      });
      const data: ApiError & { comment?: CommentData } = await response.json();
      if (!response.ok || !data.comment) throw new Error(errorMessage(data, "Failed to post comment"));
      const created = data.comment;
      setNewIds(previous => new Set(previous).add(created.id));
      setComments(previous => previous.some(comment => comment.id === created.id) ? previous : [...previous, created]);
      if (parent) {
        setReplyContent("");
        cancelReply();
      } else setNewComment("");
      toast.success(parent ? "Reply posted" : "Comment posted");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to post comment");
    } finally {
      setSubmittingId(undefined);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return;
    setDeleting(true);
    try {
      const response = await apiFetch("/api/v1/comments", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pendingDelete.id }),
      });
      if (!response.ok) throw new Error(errorMessage(await response.json(), "Failed to delete comment"));
      const removed = commentBranchIds(comments, pendingDelete.id);
      setComments(previous => previous.filter(comment => !removed.has(comment.id)));
      if (replyTo && removed.has(replyTo.id)) { setReplyTo(null); setReplyContent(""); setReplyError(null); }
      setPendingDelete(null);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  };

  const replyComposer = replyTo && <CommentComposer key={replyTo.id} replyTo={replyTo} value={replyContent} onChange={setReplyContent} onSubmit={() => void submitComment(replyTo)} onCancel={cancelReply} busy={busy || loading} submitting={submittingId === replyTo.id} error={replyError} />;

  return <section id="comments" className="mt-8 min-w-0 scroll-mt-20" aria-labelledby="comments-heading">
    <h2 id="comments-heading" className="mb-4 text-xl font-bold">Comments {!loading && <span className="text-muted-foreground">({comments.length})</span>}</h2>
    <CommentComposer value={newComment} onChange={setNewComment} onSubmit={() => void submitComment(null)} busy={busy || loading || !!loadError} submitting={submittingId === null} error={commentError} />
    {loading && <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading comments">{[0, 1].map(index => <Skeleton key={index} className="h-24 w-full rounded-xl" />)}</div>}
    {loadError && <div role="alert" className="feedback-panel mt-4"><p>{loadError}</p><Button variant="outline" onClick={() => { setLoading(true); setRevision(value => value + 1); }}>Try again</Button></div>}
    {!loading && !loadError && !comments.length && <div className="mt-4"><EmptyState tone="sky" title="No comments yet. Start the conversation." /></div>}
    <ul className="min-w-0">
      {topLevel.map(comment => <CommentCard key={comment.id} comment={comment} newIds={newIds} repliesByParent={repliesByParent} currentUserId={currentUserId} postAuthorId={postAuthorId}
        onReply={target => { if (busy) return; setReplyTo(target); setReplyError(null); }} onDelete={setPendingDelete} activeReplyId={replyTo?.id} replyComposer={replyComposer} busy={busy}
        onCollapse={target => { if (replyTo && target.id !== replyTo.id && commentBranchIds(comments, target.id).has(replyTo.id)) { setReplyTo(null); setReplyError(null); } }} />)}
    </ul>
    <ConfirmDialog open={!!pendingDelete} onOpenChange={open => { if (!open) setPendingDelete(null); }} busy={deleting} onConfirm={() => void confirmDelete()} title="Delete comment?" description={pendingDelete && repliesByParent.has(pendingDelete.id) ? "This also deletes all replies to it. This can't be undone." : "This can't be undone."} />
  </section>;
}
