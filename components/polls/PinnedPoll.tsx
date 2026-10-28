"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useApi } from "@/lib/hooks/useApi";
import type { PollDTO } from "@/lib/validation/polls";

export function PinnedPollLink({ poll }: { poll: Pick<PollDTO, "question" | "hasVoted"> }) {
  return (
    <Link href="/polls" className="pinned-poll">
      <p className="section-label">Campus ballot</p>
      <p className="pinned-poll-title">{poll.question}</p>
      <div className="pinned-poll-footer"><span>{poll.hasVoted ? "You’re in. Results after closing." : "Your campus. Your say."}</span><span className="flex items-center gap-2">{poll.hasVoted ? "View poll" : "Cast a vote"}<ArrowUpRight size={13} aria-hidden /></span></div>
    </Link>
  );
}
export default function PinnedPoll() {
  const { data } = useApi<{ polls: PollDTO[] }>("/api/v1/polls");
  const poll = data?.polls.find(poll => !poll.ended);
  return poll ? <PinnedPollLink poll={poll} /> : null;
}
