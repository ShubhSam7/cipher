import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/withAuth";
import prisma from "@/lib/prisma";
import { postInclude, toPostDTO, extractHashtags, postWhere } from "@/lib/posts";
import { createPostSchema, paginationSchema, tagSchema } from "@/lib/validation/posts";

export const GET = withAuth(async (req, session) => {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId }, include: postInclude(session.userId),
      });
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      if (post.community && !await prisma.post.findFirst({ where: { id: post.id, ...postWhere(session.userId) }, select: { id: true } })) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      return NextResponse.json({ post: toPostDTO(post) });
    }

    const { cursor, limit } = paginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const tag = searchParams.get("tag");
    const where = postWhere(session.userId, { tag: tag ? tagSchema.parse(tag) : undefined, author: searchParams.get("author") ?? undefined, community: searchParams.get("community") ?? undefined });
    const rows = await prisma.post.findMany({
      where,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: postInclude(session.userId),
    });
    const hasMore = rows.length > limit;
    const posts = rows.slice(0, limit);
    return NextResponse.json({
      posts: posts.map(toPostDTO),
      pagination: { hasMore, nextCursor: hasMore ? posts[posts.length - 1].id : null },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query", details: error.issues }, { status: 400 });
    }
    console.error("Get posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
});

export const POST = withAuth(async (req, session) => {
  try {
    const input = createPostSchema.parse(await req.json());
    if (input.communityId && !await prisma.community.findUnique({ where: { id: input.communityId } })) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    if (input.communityId && !await prisma.communityMember.findUnique({ where: { userId_communityId: { userId: session.userId, communityId: input.communityId } } })) {
      return NextResponse.json({ error: "Join this community before posting" }, { status: 403 });
    }
    const names = extractHashtags(input.content);
    const post = await prisma.$transaction(async tx => {
      const created = await tx.post.create({
        data: { ...input, authorId: session.userId, communityId: input.communityId ?? null },
        select: { id: true },
      });
      if (names.length > 0) {
        await tx.hashtag.createMany({ data: names.map(name => ({ name })), skipDuplicates: true });
        const tags = await tx.hashtag.findMany({ where: { name: { in: names } }, select: { id: true } });
        await tx.postHashtag.createMany({
          data: tags.map(tag => ({ postId: created.id, hashtagId: tag.id })),
          skipDuplicates: true,
        });
        await tx.hashtag.updateMany({ where: { id: { in: tags.map(tag => tag.id) } }, data: { useCount: { increment: 1 } } });
      }
      return tx.post.findUniqueOrThrow({ where: { id: created.id }, include: postInclude(session.userId) });
    });
    return NextResponse.json({ message: "Post created successfully", post: toPostDTO(post) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: "Validation failed", ...(error instanceof z.ZodError ? { details: error.issues } : {}) }, { status: 400 });
    }
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
});
