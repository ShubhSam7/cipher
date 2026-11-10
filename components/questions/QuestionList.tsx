"use client";

import { Check, X } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import { useApi } from "@/lib/hooks/useApi";
import { questionSchema, type QuestionDTO } from "@/lib/validation/questions";
import type { QuestionFilter } from "@/lib/validation/search";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import ResourceState from "@/components/ResourceState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl } from "@/components/ui/segmented";
import { Textarea } from "@/components/ui/textarea";
import Field from "@/components/auth/Field";
import RelativeTime from "@/components/RelativeTime";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function QuestionPage({ filter, tag, query, cursor, showMore, onMore }: {
  filter: QuestionFilter;
  tag: string;
  query: string;
  cursor?: string;
  showMore: boolean;
  onMore: (cursor: string) => void;
}) {
  const params = new URLSearchParams({ filter, ...(tag ? { tag } : {}), ...(query ? { q: query } : {}), ...(cursor ? { cursor } : {}) });
  const { data, error, refresh } = useApi<{ questions: QuestionDTO[]; pagination: { hasMore: boolean; nextCursor: string | null } }>(`/api/v1/questions?${params}`);
  if (!data || error) return <ResourceState error={error} retry={refresh} />;

  return <>
    {data.questions.map(question => <article key={question.id} className="content-row question-row">
      <div className={`count-tile ${question.acceptedAnswerId ? "count-tile--answered" : !question.answerCount ? "count-tile--none" : ""}`}>
        {question.acceptedAnswerId && <Check size={16} aria-hidden />}
        <strong>{question.answerCount}</strong><span>{question.answerCount === 1 ? "answer" : "answers"}</span>
      </div>
      <div className="min-w-0 space-y-2">
        <Link href={`/questions/${question.id}`} className="break-words text-lg font-semibold hover:underline">{question.title}</Link>
        <p className="line-clamp-2 break-words text-sm text-muted-foreground">{question.body}</p>
        <p className="break-words text-sm text-muted-foreground">
          <Link href={`/u/${question.author.user_handle}`}>u/{question.author.user_handle}</Link> · <RelativeTime date={question.createdAt} />
          {question.acceptedAnswerId && <> · <span className="status-badge status-badge--success">Answered</span></>}
        </p>
        <div className="flex flex-wrap gap-2">{question.hashtags.map(hashtag => <Link key={hashtag.id} href={`/questions?${new URLSearchParams({ tag: hashtag.name })}`} className="tag-link">#{hashtag.name}</Link>)}</div>
      </div>
    </article>)}
    {!data.questions.length && !cursor && <EmptyState tone="sky" doodle="Bulb"
      title={query ? "No matching questions." : filter === "unanswered" ? "No unanswered questions right now." : filter === "answered" ? "No accepted answers yet." : tag ? `No questions tagged #${tag} yet.` : "No questions yet. Ask the first one."}
      body={query ? "Try a shorter phrase or a different filter." : filter === "answered" ? "Questions appear here when the asker accepts an answer." : undefined} />}
    {showMore && data.pagination.hasMore && data.pagination.nextCursor && <Button variant="outline" onClick={() => onMore(data.pagination.nextCursor!)}>Load more questions</Button>}
    {showMore && !data.pagination.hasMore && (cursor || data.questions.length > 0) && <p className="metadata py-4 text-center" role="status">You’ve reached the end of these questions.</p>}
  </>;
}

export default function QuestionList({ tag, query = "", filter = "all" }: { tag: string; query?: string; filter?: QuestionFilter }) {
  const [search, setSearch] = useState(query);
  const [cursors, setCursors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function navigate(nextQuery: string, nextFilter: QuestionFilter, nextTag = tag) {
    const params = new URLSearchParams({ ...(nextTag ? { tag: nextTag } : {}), ...(nextQuery.trim() ? { q: nextQuery.trim() } : {}), ...(nextFilter !== "all" ? { filter: nextFilter } : {}) });
    startTransition(() => router.push(`/questions${params.size ? `?${params}` : ""}`));
  }

  return <div className="page-stack" data-tone="sky">
    <PageHeader title="Questions" tone="sky" doodle="Bulb" description="A fresh perspective is closer than you think." action={<Button onClick={() => setOpen(true)}>Ask a question</Button>} />
    <form role="search" aria-label="Search questions" className="discovery-search" onSubmit={event => { event.preventDefault(); navigate(search, filter); }}>
      <SearchInput value={search} onValueChange={setSearch} aria-label="Search question titles and details" placeholder="Search questions" />
      <Button type="submit" variant="outline" disabled={pending}>{pending ? "Searching…" : "Search"}</Button>
    </form>
    <div className="discovery-toolbar">
      <SegmentedControl label="Question filters" value={filter} options={[{ value: "all", label: "All" }, { value: "unanswered", label: "Unanswered" }, { value: "answered", label: "Answered" }]} onChange={value => navigate(query, value)} />
      <p className="metadata">{filter === "answered" ? "Accepted answers" : filter === "unanswered" ? "No answers yet" : "Newest first"}</p>
    </div>
    {(tag || query) && <div className="search-summary" role="status"><p>{query && <>Matching <strong>“{query}”</strong></>}{tag && <>{query ? " · " : "Tagged "}<strong>#{tag}</strong></>}</p><Link href={`/questions${filter !== "all" ? `?filter=${filter}` : ""}`} className="flex min-h-11 items-center gap-1 text-sm"><X size={16} aria-hidden />Clear</Link></div>}
    <div aria-busy={pending}>
      <QuestionPage filter={filter} tag={tag} query={query} showMore={!cursors.length} onMore={cursor => setCursors([cursor])} />
      {cursors.map((cursor, index) => <QuestionPage key={cursor} filter={filter} tag={tag} query={query} cursor={cursor} showMore={index === cursors.length - 1} onMore={next => setCursors(previous => previous.includes(next) ? previous : [...previous, next])} />)}
    </div>
    <Dialog open={open} onOpenChange={value => !busy && setOpen(value)}>
      <DialogContent>
        <DialogHeader><DialogTitle>Ask a question</DialogTitle><DialogDescription>Add #hashtags to help others find it.</DialogDescription></DialogHeader>
        <form className="space-y-4 p-6" onSubmit={async event => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setBusy(true);
          try {
            const input = questionSchema.parse({ title: form.get("title"), body: form.get("body") });
            const data = await apiJSON<{ question: QuestionDTO }>("/api/v1/questions", jsonBody("POST", input));
            router.push(`/questions/${data.question.id}`);
          } catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); }
          finally { setBusy(false); }
        }}>
          <Field id="title" label="Title">{aria => <Input {...aria} name="title" minLength={5} maxLength={200} required disabled={busy} />}</Field>
          <Field id="body" label="Details">{aria => <Textarea {...aria} name="body" minLength={10} maxLength={5000} required disabled={busy} />}</Field>
          <Button disabled={busy}>{busy ? "Publishing…" : "Publish question"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
