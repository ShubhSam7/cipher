import { postWhere } from "@/lib/posts";
import { withAuth } from "@/lib/withAuth";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { postLikeSchema } from "@/lib/validation/posts";
import { Prisma } from "@prisma/client";
export const POST = withAuth(async (req, auth) => {
  try {
    const body = await req.json();
    const validatedData = postLikeSchema.parse(body);
    if (!await prisma.post.findFirst({ where: { id: validatedData.postId, ...postWhere(auth.userId) }, select: { id: true } })) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }


    try {
      await prisma.postlike.upsert({
        where: {
          userId_postId: { userId: auth.userId, postId: validatedData.postId },
        },
        update: {},
        create: { userId: auth.userId, postId: validatedData.postId },
      });
    } catch (error) {
      // Prisma may emulate upsert; a competing request can win the insert.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
        throw error;
      }
    }

    return NextResponse.json({
        success: true,
        msg: `Post ${validatedData.postId} liked successfully`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Like post error:", error);
    return NextResponse.json(
      { error: "Failed to like the post" },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (req, auth) => {
    try {
      // Get postId from query parameters
      const { searchParams } = new URL(req.url);
      const postId = searchParams.get('postId');

      if (!postId) {
        return NextResponse.json(
          { error: "postId is required" },
          { status: 400 }
        );
      }

      if (!await prisma.post.findFirst({ where: { id: postId, ...postWhere(auth.userId) }, select: { id: true } })) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      // Count total likes for this post
      const count = await prisma.postlike.count({
        where: {
          postId: postId
        }
      });

      return NextResponse.json({
        success: true,
        postId: postId,
        likeCount: count
      });
    } catch (error) {
      console.error("Get like count error:", error);
      return NextResponse.json(
        { error: "Failed to get like count" },
        { status: 500 }
      );
    }
});

export const DELETE = withAuth(async (req, auth) => {
  try {
    const body = await req.json();
    const validatedData = postLikeSchema.parse(body);


    // Delete the like
    const deletedLike = await prisma.postlike.deleteMany({
        where: {
            postId: validatedData.postId,
            userId: auth.userId
        }
    });

    if (deletedLike.count === 0) {
      return NextResponse.json(
        { error: "Like not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      msg: `Post ${validatedData.postId} unliked successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Unlike post error:", error);
    return NextResponse.json(
      { error: "Failed to unlike the post" },
      { status: 500 }
    );
  }
});
