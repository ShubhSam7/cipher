import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { segment, HttpError } from "@/lib/route";
export const DELETE = withAuth(async (req, session) => {
  const answer = await prisma.answer.findUniqueOrThrow({ where: { id: segment(req, "answers") } });
  if (answer.authorId !== session.userId) throw new HttpError(403, "Only the author can delete this answer");
  await prisma.answer.delete({ where: { id: answer.id } });
  return NextResponse.json({ success: true });
});
