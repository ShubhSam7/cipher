"use client";
import Link from "next/link";
import { useApi } from "@/lib/hooks/useApi";
import type { PollDTO } from "@/lib/validation/polls";
export default function PinnedPoll() {
  const { data } = useApi<{ polls: PollDTO[] }>("/api/v1/polls");
  const poll = data?.polls.find(poll => !poll.ended);
  return poll ? <Link href="/polls" className="block space-y-1 rounded-2xl border border-primary/50 bg-primary/10 p-5"><p className="text-xs font-semibold uppercase text-primary">Pinned campus poll</p><p className="font-semibold">{poll.question}</p><p className="text-sm text-muted-foreground">{poll.hasVoted ? "You voted · results after closing" : "Cast your vote →"}</p></Link> : null;
}
