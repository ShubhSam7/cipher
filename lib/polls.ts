import type { Prisma } from "@prisma/client";
import type { PollDTO } from "@/lib/validation/polls";
export function pollInclude(userId: string) {
  return { options: { orderBy: { position: "asc" as const }, include: { _count: { select: { votes: true } } } },
    ballots: { where: { userId }, select: { votes: { select: { optionId: true } } } }, _count: { select: { ballots: true } } } satisfies Prisma.PollInclude;
}
export function pollDTO(poll: Prisma.PollGetPayload<{ include: ReturnType<typeof pollInclude> }>, now = new Date()): PollDTO {
  const ended = !!poll.closedAt || poll.endsAt <= now;
  const base: PollDTO = { id: poll.id, question: poll.question, allowMultiple: poll.allowMultiple, endsAt: poll.endsAt.toISOString(), closedAt: poll.closedAt?.toISOString() ?? null, createdAt: poll.createdAt.toISOString(), ended,
    options: poll.options.map(({ id, label, position }) => ({ id, label, position })), hasVoted: poll.ballots.length > 0, myChoices: poll.ballots.flatMap(ballot => ballot.votes.map(vote => vote.optionId)) };
  // Explicit projection: neither option counts nor total ballots cross the wire before closing.
  if (ended) base.results = { totalVoters: poll._count.ballots, options: poll.options.map(option => ({ id: option.id, count: option._count.votes, percentage: poll._count.ballots ? Math.round(option._count.votes / poll._count.ballots * 100) : 0 })) };
  return base;
}
