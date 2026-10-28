import { postWhere } from "@/lib/posts";
import { withAuth } from "@/lib/withAuth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = withAuth(async (_, session) => {
  try {
    const recentTags = await prisma.postHashtag.groupBy({
      by: ["hashtagId"],
      where: {
        post: { ...postWhere(session.userId), createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      },
      _count: { postId: true },
      orderBy: [{ _count: { postId: "desc" } }, { hashtagId: "asc" }],
      take: 5,
    });
    const hashtags = await prisma.hashtag.findMany({
      where: { id: { in: recentTags.map((tag) => tag.hashtagId) } },
      select: { id: true, name: true },
    });
    const byId = new Map(hashtags.map((tag) => [tag.id, tag]));
    const tags = recentTags.flatMap((tag) => {
      const hashtag = byId.get(tag.hashtagId);
      return hashtag ? [{ ...hashtag, useCount: tag._count.postId }] : [];
    });

    return NextResponse.json({ msg: "These are the tags", tags });
  } catch (error) {
    console.error("Get trending hashtags error:", error);
    return NextResponse.json({ error: "Failed to fetch trending hashtags" }, { status: 500 });
  }
});
