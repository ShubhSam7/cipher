import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { questionInclude, questionDTO } from "@/lib/questions";
import { questionSchema } from "@/lib/validation/questions";
import { paginationSchema, tagSchema } from "@/lib/validation/posts";
import { extractHashtags } from "@/lib/posts";
export const GET = withAuth(async req => {
  const params = new URL(req.url).searchParams;
  const { cursor, limit } = paginationSchema.parse({ cursor: params.get("cursor") ?? undefined, limit: params.get("limit") ?? undefined });
  const tag = params.get("tag") ? tagSchema.parse(params.get("tag")) : undefined;
  const rows = await prisma.question.findMany({
    where: { ...(params.get("filter") === "unanswered" ? { answers: { none: {} } } : {}), ...(tag ? { hashtags: { some: { hashtag: { name: tag } } } } : {}) },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), take: limit + 1, orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: questionInclude,
  });
  const questions = rows.slice(0, limit);
  return NextResponse.json({ questions: questions.map(questionDTO), pagination: { hasMore: rows.length > limit, nextCursor: rows.length > limit ? questions.at(-1)!.id : null } });
});
export const POST = withAuth(async (req, session) => {
  const input = questionSchema.parse(await req.json());
  const question = await prisma.$transaction(async tx => {
    const created = await tx.question.create({ data: { ...input, authorId: session.userId } });
    const names = extractHashtags(input.title + " " + input.body);
    if (names.length) {
      await tx.hashtag.createMany({ data: names.map(name => ({ name })), skipDuplicates: true });
      const tags = await tx.hashtag.findMany({ where: { name: { in: names } }, select: { id: true } });
      await tx.questionHashtag.createMany({ data: tags.map(tag => ({ questionId: created.id, hashtagId: tag.id })), skipDuplicates: true });
      await tx.hashtag.updateMany({ where: { id: { in: tags.map(tag => tag.id) } }, data: { useCount: { increment: 1 } } });
    }
    return tx.question.findUniqueOrThrow({ where: { id: created.id }, include: questionInclude });
  });
  return NextResponse.json({ question: questionDTO(question) }, { status: 201 });
});
