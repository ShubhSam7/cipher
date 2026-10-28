"use client";
import Link from "next/link";
import { ArrowUp, Check } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApi } from "@/lib/hooks/useApi";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import { useAuthStore } from "@/lib/store/authStore";
import { answerSchema, type QuestionDTO } from "@/lib/validation/questions";
import ResourceState from "@/components/ResourceState";
import RelativeTime from "@/components/RelativeTime";
import { UserAvatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";
export default function QuestionDetail({ id }: { id: string }) {
  const { data, error, refresh } = useApi<{ question: QuestionDTO }>(`/api/v1/questions/${id}`);
  const userId = useAuthStore(state => state.user?.id);
  const [busy, setBusy] = useState(false);
  const [body, setBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const router = useRouter();
  async function mutate(url: string, method: string, payload?: unknown) {
    setBusy(true);
    try { await apiJSON(url, jsonBody(method, payload)); refresh(); toast.success("Saved"); return true; }
    catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); return false; }
    finally { setBusy(false); }
  }
  if (!data || error) return <ResourceState error={error} retry={refresh} />;
  const question = data.question;
  const asker = userId === question.author.id;
  return <div className="page-stack"><BackButton fallback="/questions" /><article className="space-y-3 border-b pb-6"><h1 className="page-title">{question.title}</h1><p className="text-sm text-muted-foreground"><Link href={`/u/${question.author.user_handle}`}>u/{question.author.user_handle}</Link> · <RelativeTime date={question.createdAt} /></p><p className="content-body">{question.body}</p>{asker && <Button variant="ghost" onClick={() => setConfirmDelete(`/api/v1/questions/${id}`)}>Delete question</Button>}</article><h2 className="text-xl font-bold">{question.answerCount} {question.answerCount === 1 ? "answer" : "answers"}</h2>{question.answers?.length ? question.answers.map(answer => <article key={answer.id} className="comment-entry space-y-3"><header className="post-meta"><UserAvatar handle={answer.author.user_handle} src={answer.author.avatar} size="sm" /><Link href={`/u/${answer.author.user_handle}`} className="hover:underline">u/{answer.author.user_handle}</Link><RelativeTime date={answer.createdAt} className="text-sm text-muted-foreground" /></header>{question.acceptedAnswerId === answer.id && <p className="status-badge status-badge--success"><Check className="h-4 w-4" aria-hidden />Accepted answer</p>}<p className="content-body">{answer.body}</p><div className="flex flex-wrap gap-2"><Button variant="outline" aria-pressed={answer.isUpvoted} disabled={busy} onClick={() => mutate(`/api/v1/answers/${answer.id}/vote`, answer.isUpvoted ? "DELETE" : "POST")} aria-label={`${answer.isUpvoted ? "Remove upvote from" : "Upvote"} answer, ${answer.voteCount} ${answer.voteCount === 1 ? "vote" : "votes"}`}><ArrowUp className="h-4 w-4" aria-hidden />{answer.voteCount}</Button>{asker && <Button variant="outline" disabled={busy} onClick={() => mutate(`/api/v1/questions/${id}/accept`, "PATCH", { answerId: question.acceptedAnswerId === answer.id ? null : answer.id })}>{question.acceptedAnswerId === answer.id ? "Unaccept" : "Accept answer"}</Button>}{userId === answer.author.id && <Button variant="ghost" onClick={() => setConfirmDelete(`/api/v1/answers/${answer.id}`)}>Delete answer</Button>}</div></article>) : <p className="p-6 text-muted-foreground">No answers yet. Can you help?</p>}
    <form className="space-y-3 rounded-2xl border bg-card p-5" onSubmit={async event => { event.preventDefault(); const parsed = answerSchema.safeParse({ body }); if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; } if (await mutate(`/api/v1/questions/${id}/answers`, "POST", parsed.data)) setBody(""); }}><label htmlFor="answer" className="font-semibold">Your answer</label><Textarea id="answer" value={body} onChange={event => setBody(event.target.value)} required maxLength={5000} /><Button disabled={busy || !body.trim()}>{busy ? "Posting…" : "Post answer"}</Button></form>
    {confirmDelete && <div role="alert" className="space-x-2 rounded-xl border border-destructive p-4"><p>Delete permanently?</p><Button variant="destructive" disabled={busy} onClick={async () => { if (await mutate(confirmDelete, "DELETE")) { setConfirmDelete(null); if (confirmDelete === `/api/v1/questions/${id}`) router.push("/questions"); } }}>Delete</Button><Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button></div>}
  </div>;
}
