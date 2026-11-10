"use client";

import { useEffect, useRef } from "react";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_CONTENT_LENGTH } from "@/lib/validation/posts";
import type { CommentData } from "@/lib/comments";

export default function CommentComposer({ value, onChange, onSubmit, replyTo, onCancel, busy, submitting, error }: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  replyTo?: CommentData;
  onCancel?: () => void;
  busy: boolean;
  submitting: boolean;
  error: string | null;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const id = replyTo ? `reply-input-${replyTo.id}` : "comment-input";

  useEffect(() => {
    if (!replyTo) return;
    input.current?.focus({ preventScroll: true });
    input.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [replyTo]);

  return <form className="comment-composer" aria-label={replyTo ? `Reply to u/${replyTo.author.user_handle}` : "Add a comment"} onSubmit={event => { event.preventDefault(); onSubmit(); }}>
    {replyTo && <div className="flex min-w-0 items-center justify-between gap-2" data-tone="sky">
      <p className="min-w-0 break-words text-sm text-[var(--tone-ink)]">Replying to <strong>u/{replyTo.author.user_handle}</strong></p>
      <button type="button" onClick={onCancel} disabled={busy} aria-label="Cancel reply" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50"><X size={16} aria-hidden /></button>
    </div>}
    <label htmlFor={id} className="sr-only">{replyTo ? `Reply to u/${replyTo.author.user_handle}` : "Write a comment"}</label>
    <Textarea ref={input} id={id} value={value} disabled={busy} onChange={event => onChange(event.target.value)} placeholder={replyTo ? "Write a reply…" : "Write a comment…"}
      maxLength={MAX_CONTENT_LENGTH} aria-describedby={`${id}-count${error ? ` ${id}-error` : ""}`} aria-invalid={!!error} className="min-h-24 resize-y"
      onKeyDown={event => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
    {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="comment-composer-footer">
      <span id={`${id}-count`} className="metadata">{value.length}/{MAX_CONTENT_LENGTH}</span>
      <div className="flex items-center gap-2">
        {replyTo && <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>Cancel</Button>}
        <Button type="submit" size="sm" disabled={busy || !value.trim()}>
          {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={16} aria-hidden />}
          {submitting ? "Sending…" : replyTo ? "Reply" : "Comment"}
        </Button>
      </div>
    </div>
  </form>;
}
