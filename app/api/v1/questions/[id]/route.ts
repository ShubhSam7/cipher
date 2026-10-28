import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { HttpError, segment } from "@/lib/route";
import { questionInclude, questionDTO } from "@/lib/questions";
export const GET = withAuth(async (req, session) => {
  const question = await prisma.question.findUnique({ where: { id: segment(req, "questions") }, include: { ...questionInclude,
    answers: { include: { author: { select: { id: true, user_handle: true, avatar: true } }, _count: { select: { votes: true } }, votes: { where: { userId: session.userId }, select: { userId: true } } } },
  } });
  if (!question) throw new HttpError(404, "Question not found");
  const answers = question.answers.map(answer => ({ id: answer.id, body: answer.body, author: answer.author, createdAt: answer.createdAt.toISOString(), voteCount: answer._count.votes, isUpvoted: answer.votes.length > 0 }))
    .sort((a, b) => Number(b.id === question.acceptedAnswerId) - Number(a.id === question.acceptedAnswerId) || b.voteCount - a.voteCount || a.createdAt.localeCompare(b.createdAt));
  return NextResponse.json({ question: { ...questionDTO(question), answers } });
});
export const DELETE = withAuth(async (req, session) => {
  const question = await prisma.question.findUniqueOrThrow({ where: { id: segment(req, "questions") } });
  if (question.authorId !== session.userId) throw new HttpError(403, "Only the asker can delete this question");
  await prisma.question.delete({ where: { id: question.id } });
  return NextResponse.json({ success: true });
});
