"use client";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { m } from "framer-motion";
import { growX } from "@/lib/motion";
import { useState } from "react";
import { toast } from "sonner";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import type { PollDTO } from "@/lib/validation/polls";
import { Button } from "@/components/ui/Button";
export default function PollCard({ poll, onChange, admin = false }: { poll: PollDTO; onChange: () => void; admin?: boolean }) {
  const reduce = usePrefersReducedMotion();
  const [choices, setChoices] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const date = new Date(poll.endsAt).toLocaleString("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) + " IST";
  async function mutate(method: string, suffix: string, body?: unknown) {
    setBusy(true);
    try { await apiJSON(`/api/v1/polls/${poll.id}${suffix}`, jsonBody(method, body)); onChange(); toast.success(suffix === "/vote" ? "Vote submitted" : method === "DELETE" ? "Poll deleted" : "Poll ended"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); }
    finally { setBusy(false); setConfirmDelete(false); }
  }
  return <article data-tone="lavender" className={`panel poll-card space-y-4 ${!poll.ended ? "poll-card--active" : ""}`}><header><h2 className="break-words text-lg font-semibold">{poll.question}</h2><p className="text-sm text-muted-foreground">{poll.allowMultiple ? "Choose one or more" : "Choose one"} · {poll.ended ? "Ended" : `Ends ${date}`}</p></header>
    {poll.results ? <div className="space-y-3">{poll.options.map(option => { const result = poll.results!.options.find(result => result.id === option.id)!; return <div key={option.id}><p className="flex justify-between gap-3 text-sm"><span>{option.label} {poll.myChoices.includes(option.id) && <strong className="chip">Your choice</strong>}</span><span className="shrink-0 whitespace-nowrap">{result.percentage}% · {result.count}</span></p><div role="progressbar" aria-label={option.label} aria-valuenow={result.percentage} aria-valuemin={0} aria-valuemax={100} className="poll-bar mt-2"><m.div className="poll-bar__fill" initial={reduce ? false : "hidden"} whileInView="show" viewport={{once:true}} variants={growX} style={{ width: `${result.percentage}%`, opacity: result.percentage === Math.max(...poll.results!.options.map(item => item.percentage)) ? 1 : .55 }} /></div></div>; })}<p className="text-sm text-muted-foreground">{poll.results.totalVoters} {poll.results.totalVoters === 1 ? "voter" : "voters"}{poll.allowMultiple ? " · Percentages are per voter" : ""}</p></div> : poll.hasVoted ? <p className="rounded-lg bg-[var(--tone-soft)] p-4 text-[var(--tone-ink)]">You voted · results on {date}</p> : poll.ended ? <p>Poll ended. Refresh to see results.</p> : <form className="space-y-3" onSubmit={event => { event.preventDefault(); void mutate("POST", "/vote", { optionIds: choices }); }}><fieldset className="space-y-2"><legend className="sr-only">{poll.question}</legend>{poll.options.map(option => <label key={option.id} className="poll-option"><input type={poll.allowMultiple ? "checkbox" : "radio"} name={poll.id} value={option.id} disabled={busy} checked={choices.includes(option.id)} onChange={event => setChoices(previous => poll.allowMultiple ? event.target.checked ? [...previous, option.id] : previous.filter(id => id !== option.id) : [option.id])} /><span className="min-w-0 break-words">{option.label}</span></label>)}</fieldset><p className="metadata">Votes are final. Results stay hidden until this poll ends.</p><Button disabled={busy || !choices.length}>{busy ? "Submitting…" : "Submit vote"}</Button></form>}
    {admin && <div className="flex flex-wrap gap-2 border-t pt-3">{!poll.ended && <Button variant="outline" disabled={busy} onClick={() => mutate("PATCH", "", { action: "end" })}>End now</Button>}<Button variant="ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>Delete poll</Button><ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Delete poll?" description="This permanently deletes the poll and its votes." busy={busy} onConfirm={() => mutate("DELETE", "")}/></div>}
  </article>;
}
