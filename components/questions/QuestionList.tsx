"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import { useApi } from "@/lib/hooks/useApi";
import { questionSchema, type QuestionDTO } from "@/lib/validation/questions";
import ResourceState from "@/components/ResourceState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Field from "@/components/auth/Field";
import RelativeTime from "@/components/RelativeTime";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
function QuestionPage({ filter, tag, cursor, onMore }: { filter: string; tag: string; cursor?: string; onMore: (cursor: string) => void }) {
  const query = new URLSearchParams({ filter, ...(tag ? { tag } : {}), ...(cursor ? { cursor } : {}) });
  const { data, error, refresh } = useApi<{ questions: QuestionDTO[]; pagination: { hasMore: boolean; nextCursor: string | null } }>(`/api/v1/questions?${query}`);
  if (!data || error) return <ResourceState error={error} retry={refresh} />;
  return <>{data.questions.length ? data.questions.map(question => <article key={question.id} className="content-row space-y-2"><Link href={`/questions/${question.id}`} className="break-words text-lg font-semibold hover:underline">{question.title}</Link><p className="text-sm text-muted-foreground"><Link href={`/u/${question.author.user_handle}`}>u/{question.author.user_handle}</Link> · <RelativeTime date={question.createdAt} /> · {question.answerCount} {question.answerCount === 1 ? "answer" : "answers"} {question.acceptedAnswerId && <span className="status-badge status-badge--success">Answered</span>}</p><div className="flex flex-wrap gap-2">{question.hashtags.map(tag => <Link key={tag.id} href={`/questions?tag=${tag.name}`} className="tag-link">#{tag.name}</Link>)}</div></article>) : !cursor && <p className="rounded-xl border border-dashed p-8 text-center">{filter === "unanswered" ? "No unanswered questions right now." : tag ? `No questions tagged #${tag} yet.` : "No questions yet. Ask the first one."}</p>}{data.pagination.hasMore && data.pagination.nextCursor && <Button variant="outline" onClick={() => onMore(data.pagination.nextCursor!)}>Load more questions</Button>}</>;
}
export default function QuestionList({ tag }: { tag: string }) {
  const [filter, setFilter] = useState("all");
  const [cursors, setCursors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return <div className="page-stack"><header className="page-header"><div><h1 className="page-title">Questions</h1><p className="page-description">A fresh perspective is closer than you think.</p></div><Button onClick={() => setOpen(true)}>Ask a question</Button></header><div className="filter-tabs" role="group" aria-label="Question filters">{["all", "unanswered"].map(value => <Button key={value} aria-pressed={filter === value} className="filter-tab" variant="ghost" onClick={() => { setFilter(value); setCursors([]); }}>{value === "all" ? "All" : "Unanswered"}</Button>)}</div>{tag && <p>Tagged #{tag} · <Link href="/questions" className="underline">Clear</Link></p>}<QuestionPage key={filter} filter={filter} tag={tag} onMore={cursor => setCursors(previous => previous.includes(cursor) ? previous : [...previous, cursor])} />{cursors.map((cursor, index) => <QuestionPage key={`${filter}:${cursor}`} filter={filter} tag={tag} cursor={cursor} onMore={next => setCursors(previous => previous.includes(next) ? previous : [...previous.slice(0, index + 1), next])} />)}
    <Dialog open={open} onOpenChange={value => !busy && setOpen(value)}><DialogContent><DialogHeader><DialogTitle>Ask a question</DialogTitle><DialogDescription>Add #hashtags to help others find it.</DialogDescription></DialogHeader><form className="space-y-4 p-6" onSubmit={async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true);
      try { const input = questionSchema.parse({ title: form.get("title"), body: form.get("body") }); const data = await apiJSON<{ question: QuestionDTO }>("/api/v1/questions", jsonBody("POST", input)); router.push(`/questions/${data.question.id}`); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); } finally { setBusy(false); }
    }}><Field id="title" label="Title">{aria => <Input {...aria} name="title" minLength={5} maxLength={200} required />}</Field><Field id="body" label="Details">{aria => <Textarea {...aria} name="body" minLength={10} maxLength={5000} required />}</Field><Button disabled={busy}>{busy ? "Publishing…" : "Publish question"}</Button></form></DialogContent></Dialog>
  </div>;
}
