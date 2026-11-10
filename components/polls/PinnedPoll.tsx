"use client";
import Link from "next/link";
import { Doodle } from "@/components/decor/Doodles";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { useApi } from "@/lib/hooks/useApi";
import type { PollDTO } from "@/lib/validation/polls";

export function PinnedPollLink({ poll }: { poll: Pick<PollDTO, "question" | "hasVoted"> }) {
  return (
    <Link href="/polls" prefetch={false} className="pinned-poll" data-tone="lavender">
      <div className="flex items-center gap-3"><span className="icon-tile"><BarChart3 size={20}/></span><p className="section-label">Campus ballot</p><Doodle name="Sparkle" className="ml-auto h-6 w-6"/></div>
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
