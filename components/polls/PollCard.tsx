"use client";
import { useState } from "react";
import { toast } from "sonner";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import type { PollDTO } from "@/lib/validation/polls";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
export default function PollCard({ poll, onChange }: { poll: PollDTO; onChange: () => void }) {
  const [choices, setChoices] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const admin = useAuthStore(state => state.user?.isAdmin);
  const date = new Date(poll.endsAt).toLocaleString();
  async function mutate(method: string, suffix: string, body?: unknown) {
    setBusy(true);
    try { await apiJSON(`/api/v1/polls/${poll.id}${suffix}`, jsonBody(method, body)); onChange(); toast.success("Saved"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); }
    finally { setBusy(false); setConfirmDelete(false); }
  }
  return <article className="space-y-4 rounded-2xl border bg-card p-5"><header><h2 className="break-words text-lg font-semibold">{poll.question}</h2><p className="text-sm text-muted-foreground">{poll.allowMultiple ? "Choose one or more" : "Choose one"} · {poll.ended ? "Ended" : `Ends ${date}`}</p></header>
    {poll.results ? <div className="space-y-3">{poll.options.map(option => { const result = poll.results!.options.find(result => result.id === option.id)!; return <div key={option.id}><p className="flex justify-between gap-3 text-sm"><span>{option.label} {poll.myChoices.includes(option.id) && <strong className="text-primary">· Your choice</strong>}</span><span>{result.percentage}% · {result.count}</span></p><div role="progressbar" aria-label={option.label} aria-valuenow={result.percentage} aria-valuemin={0} aria-valuemax={100} className="mt-1 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${result.percentage}%` }} /></div></div>; })}<p className="text-sm text-muted-foreground">{poll.results.totalVoters} voters{poll.allowMultiple ? " · Percentages are per voter" : ""}</p></div> : poll.hasVoted ? <p className="rounded-lg bg-primary/10 p-4 text-primary">You voted · results on {date}</p> : poll.ended ? <p>Poll ended. Refresh to see results.</p> : <form className="space-y-3" onSubmit={event => { event.preventDefault(); void mutate("POST", "/vote", { optionIds: choices }); }}><fieldset className="space-y-2"><legend className="sr-only">{poll.question}</legend>{poll.options.map(option => <label key={option.id} className="flex min-h-11 cursor-pointer items-start gap-3 break-words rounded-lg border p-3"><input type={poll.allowMultiple ? "checkbox" : "radio"} name={poll.id} value={option.id} checked={choices.includes(option.id)} onChange={event => setChoices(previous => poll.allowMultiple ? event.target.checked ? [...previous, option.id] : previous.filter(id => id !== option.id) : [option.id])} /><span className="min-w-0 break-words">{option.label}</span></label>)}</fieldset><p className="text-xs text-muted-foreground">Votes are final. Results stay hidden until this poll ends.</p><Button disabled={busy || !choices.length}>Submit vote</Button></form>}
    {admin && <div className="flex flex-wrap gap-2 border-t pt-3">{!poll.ended && <Button variant="outline" disabled={busy} onClick={() => mutate("PATCH", "", { action: "end" })}>End now</Button>}<Button variant="ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>Delete poll</Button>{confirmDelete && <div role="alert" className="w-full space-x-2"><p>Delete this poll and its votes permanently?</p><Button variant="destructive" disabled={busy} onClick={() => mutate("DELETE", "")}>Delete permanently</Button><Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button></div>}</div>}
  </article>;
}
