import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { createCommentSchema, deleteCommentSchema } from "@/lib/validation/comments";
import prisma from "@/lib/prisma";
import { postWhere } from "@/lib/posts";
import { withAuth } from "@/lib/withAuth";

export const POST = withAuth(async (req, auth) => {
  try {
    const validatedData = createCommentSchema.parse(await req.json());

    const postExists = await prisma.post.findFirst({
      where: { id: validatedData.postId, ...postWhere(auth.userId) }, select: { id: true },
    });

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    } // check for post

    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      } // check for parent comment to be replied on

      if (parentComment.postId !== validatedData.postId) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this post" },
          { status: 400 }
        );
      } // check for post and comment to be refferenced
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content.trim(),
        authorId: auth.userId,
        postId: validatedData.postId,
        parentId: validatedData.parentId || null,
      },
      include: { author: { select: { id: true, user_handle: true, avatar: true } } },
    });

    return NextResponse.json({ msg: "Comment created", comment }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (req, auth) => {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const parentId = searchParams.get("parentId");

    if (!postId) {
      return NextResponse.json(
        {
          msg: "postId is required in the URL",
        },
        { status: 400 }
      );
    }

    if (!await prisma.post.findFirst({ where: { id: postId, ...postWhere(auth.userId) }, select: { id: true } })) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Build where clause based on parentId parameter
    const whereClause: Prisma.CommentWhereInput = { postId };
    
    // Only filter by parentId if explicitly requested (and not "null" string)
    if (parentId && parentId !== "null") {
      // Fetch replies for specific comment
      whereClause.parentId = parentId;
    }
    // Otherwise, fetch ALL comments for the post (both top-level and replies)
    // The frontend will organize them into a tree structure

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            user_handle: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      msg: "Comments fetched successfully",
      comments: comments,
    });
  } catch (error) {
    console.error("Get comment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req, auth) => {
  try {
    const validatedData = deleteCommentSchema.parse(await req.json());
    const comment = await prisma.comment.findUnique({
      where: { id: validatedData.id },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (comment.authorId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // PostgreSQL cascades deletion through all nested replies and comment likes.
    await prisma.comment.delete({ where: { id: comment.id } });

    return NextResponse.json({
      success: true,
      msg: `Comment ${validatedData.id} is deleted successfully`,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Deleting comment error:", error);
    return NextResponse.json(
      { error: "Failed to delete the comment" },
      { status: 500 }
    );
  }
});
