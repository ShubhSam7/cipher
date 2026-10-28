import type { Prisma } from "@prisma/client";
export const questionInclude = {
  author: { select: { id: true, user_handle: true, avatar: true } },
  _count: { select: { answers: true } },
  hashtags: { select: { hashtag: { select: { id: true, name: true } } } },
} satisfies Prisma.QuestionInclude;
export function questionDTO(question: Prisma.QuestionGetPayload<{ include: typeof questionInclude }>) {
  return { id: question.id, title: question.title, body: question.body, author: question.author,
    acceptedAnswerId: question.acceptedAnswerId, createdAt: question.createdAt.toISOString(), answerCount: question._count.answers,
    hashtags: question.hashtags.map(({ hashtag }) => hashtag) };
}
