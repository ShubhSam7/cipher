import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { segment } from "@/lib/route";
import { answerSchema } from "@/lib/validation/questions";
export const POST = withAuth(async (req, session) => {
  const { body } = answerSchema.parse(await req.json());
  const questionId = segment(req, "questions");
  await prisma.question.findUniqueOrThrow({ where: { id: questionId } });
  const answer = await prisma.answer.create({ data: { body, questionId, authorId: session.userId }, select: { id: true } });
  return NextResponse.json({ answer }, { status: 201 });
});
