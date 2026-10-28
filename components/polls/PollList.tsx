"use client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/hooks/useApi";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import { pollSchema, type PollDTO } from "@/lib/validation/polls";
import { useAuthStore } from "@/lib/store/authStore";
import PollCard from "./PollCard";
import ResourceState from "@/components/ResourceState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import Field from "@/components/auth/Field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export default function PollList() {
  const { data, error, refresh } = useApi<{ polls: PollDTO[] }>("/api/v1/polls");
  const admin = useAuthStore(state => state.user?.isAdmin);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState("1d");
  const [busy, setBusy] = useState(false);
  useEffect(() => { const timer = setInterval(refresh, 30000); return () => clearInterval(timer); }, [refresh]);
  return <div className="page-stack"><header className="page-header"><div><h1 className="page-title">Polls</h1><p className="page-description">Have your say. See where campus stands when voting closes.</p></div>{admin && <Button onClick={() => setOpen(true)}>New poll</Button>}</header>{!data || error ? <ResourceState error={error} retry={refresh} /> : <>{[false, true].map(ended => <section key={String(ended)} className="space-y-4" aria-label={ended ? "Ended polls" : "Active polls"}><h2 className="section-title">{ended ? "Ended" : "Active"}</h2>{data.polls.filter(poll => poll.ended === ended).length ? data.polls.filter(poll => poll.ended === ended).map(poll => <PollCard key={poll.id} poll={poll} onChange={refresh} />) : <p className="rounded-xl border border-dashed p-6 text-muted-foreground">No {ended ? "ended" : "active"} polls.</p>}</section>)}</>}
    <Dialog open={open} onOpenChange={value => !busy && setOpen(value)}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>New poll</DialogTitle><DialogDescription>Results stay hidden from everyone until the poll ends.</DialogDescription></DialogHeader><form className="space-y-4 p-6" onSubmit={async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true);
      try { const custom = form.get("endsAt") as string; const input = pollSchema.parse({ question: form.get("question"), options, allowMultiple: form.get("multiple") === "on", duration, ...(duration === "custom" ? { endsAt: new Date(custom).toISOString() } : {}) }); await apiJSON("/api/v1/polls", jsonBody("POST", input)); setOpen(false); setOptions(["", ""]); refresh(); toast.success("Poll created"); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); } finally { setBusy(false); }
    }}><Field id="question" label="Question">{aria => <Input {...aria} name="question" required maxLength={200} />}</Field><fieldset className="space-y-2"><legend className="font-medium">Options</legend>{options.map((option, index) => <div key={index} className="flex gap-2"><Input aria-label={`Option ${index + 1}`} value={option} onChange={event => setOptions(previous => previous.map((value, position) => position === index ? event.target.value : value))} required maxLength={120} /><Button type="button" variant="outline" aria-label={`Remove option ${index + 1}`} disabled={options.length <= 2} onClick={() => setOptions(previous => previous.filter((_, position) => position !== index))}><X className="h-4 w-4" aria-hidden /></Button></div>)}<Button type="button" variant="outline" disabled={options.length >= 10} onClick={() => setOptions(previous => [...previous, ""])}>Add option</Button></fieldset><label className="flex gap-2"><input type="checkbox" name="multiple" />Allow multiple choices</label><label htmlFor="duration" className="block">Duration</label><select id="duration" className="control-select" value={duration} onChange={event => setDuration(event.target.value)}>{["1h", "1d", "3d", "7d", "custom"].map(value => <option key={value}>{value}</option>)}</select>{duration === "custom" && <Field id="endsAt" label="End time (within 30 days)">{aria => <Input {...aria} type="datetime-local" name="endsAt" required />}</Field>}<Button disabled={busy}>{busy ? "Creating…" : "Create poll"}</Button></form></DialogContent></Dialog>
  </div>;
}
