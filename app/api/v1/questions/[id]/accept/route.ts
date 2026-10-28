import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { segment, HttpError } from "@/lib/route";
import { acceptSchema } from "@/lib/validation/questions";
export const PATCH = withAuth(async (req, session) => {
  const question = await prisma.question.findUniqueOrThrow({ where: { id: segment(req, "questions") } });
  if (question.authorId !== session.userId) throw new HttpError(403, "Only the asker can accept an answer");
  const { answerId } = acceptSchema.parse(await req.json());
  if (answerId && !await prisma.answer.findFirst({ where: { id: answerId, questionId: question.id } })) throw new HttpError(400, "Answer does not belong to this question");
  await prisma.question.update({ where: { id: question.id }, data: { acceptedAnswerId: answerId } });
  return NextResponse.json({ success: true });
});
