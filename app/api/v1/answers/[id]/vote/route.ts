import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { segment } from "@/lib/route";
const vote = (up: boolean) => withAuth(async (req, session) => {
  const answerId = segment(req, "answers");
  await prisma.answer.findUniqueOrThrow({ where: { id: answerId } });
  const where = { answerId, userId: session.userId };
  if (up) await prisma.answerVote.createMany({ data: [where], skipDuplicates: true });
  else await prisma.answerVote.deleteMany({ where });
  return NextResponse.json({ success: true });
});
export const POST = vote(true);
export const DELETE = vote(false);
