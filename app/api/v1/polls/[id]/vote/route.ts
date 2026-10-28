import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { segment, HttpError } from "@/lib/route";
import { voteSchema } from "@/lib/validation/polls";
export const POST = withAuth(async (req, session) => {
  const { optionIds } = voteSchema.parse(await req.json());
  const id = segment(req, "polls");
  await prisma.$transaction(async tx => {
    // Serialize voting with end/delete operations; recheck the deadline after the lock.
    await tx.$queryRaw`SELECT "id" FROM "polls" WHERE "id" = ${id} FOR UPDATE`;
    const poll = await tx.poll.findUnique({ where: { id }, include: { options: { select: { id: true } } } });
    if (!poll) throw new HttpError(404, "Poll not found");
    if (poll.closedAt || poll.endsAt <= new Date()) throw new HttpError(400, "Poll is closed");
    if (!poll.allowMultiple && optionIds.length !== 1) throw new HttpError(400, "Choose exactly one option");
    if (optionIds.some(id => !poll.options.some(option => option.id === id))) throw new HttpError(400, "Option does not belong to this poll");
    if (await tx.pollBallot.findUnique({ where: { userId_pollId: { userId: session.userId, pollId: id } } })) throw new HttpError(409, "You already voted");
    await tx.pollBallot.create({ data: { userId: session.userId, pollId: id,
      votes: { create: optionIds.map(optionId => ({ optionId })) } } });
  });
  return NextResponse.json({ success: true });
});
