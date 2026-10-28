import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { isAdmin } from "@/lib/admin";
import { HttpError } from "@/lib/route";
import { pollSchema } from "@/lib/validation/polls";
import { pollInclude, pollDTO } from "@/lib/polls";
export const GET = withAuth(async (_, session) => {
  const now = new Date();
  const [active, ended] = await Promise.all([
    prisma.poll.findMany({ where: { closedAt: null, endsAt: { gt: now } }, orderBy: { createdAt: "desc" }, take: 100, include: pollInclude(session.userId) }),
    prisma.poll.findMany({ where: { OR: [{ closedAt: { not: null } }, { endsAt: { lte: now } }] }, orderBy: { createdAt: "desc" }, take: 100, include: pollInclude(session.userId) }),
  ]);
  return NextResponse.json({ polls: [...active, ...ended].map(poll => pollDTO(poll)) });
});
export const POST = withAuth(async (req, session) => {
  if (!isAdmin(session.email)) throw new HttpError(403, "Admin access required");
  const input = pollSchema.parse(await req.json());
  const hours = { "1h": 1, "1d": 24, "3d": 72, "7d": 168 };
  const now = Date.now();
  const endsAt = input.duration === "custom" ? new Date(input.endsAt!) : new Date(now + hours[input.duration] * 3600000);
  if (!Number.isFinite(+endsAt) || +endsAt <= now || +endsAt > now + 30 * 86400000) throw new HttpError(400, "End time must be in the next 30 days");
  const poll = await prisma.poll.create({ data: { question: input.question, allowMultiple: input.allowMultiple, endsAt, createdById: session.userId,
    options: { create: input.options.map((label, position) => ({ label, position })) } }, include: pollInclude(session.userId) });
  return NextResponse.json({ poll: pollDTO(poll) }, { status: 201 });
});
