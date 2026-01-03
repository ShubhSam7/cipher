import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { middleware } from "@/lib/middleware";

const validateSchema = z.object({
  content: z.string().min(1).max(500),
  postId: z.string(),
  parentId: z.string().nullish(), // Accepts string | null | undefined
});

const deleteValidateSchema = z.object({
  id: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await middleware(req);
    const body = await req.json();

    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const validatedData = validateSchema.parse(body);

    if (!validatedData.content) {
      return NextResponse.json(
        {
          msg: "validated schema not verified",
        },
        { status: 401 }
      );
    } // check for content

    const postExists = await prisma.post.findUnique({
      where: { id: validatedData.postId },
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

    const user = await prisma.comment.create({
      data: {
        content: validatedData.content.trim(),
        authorId: auth.userId,
        postId: validatedData.postId,
        parentId: validatedData.parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            user_handle: true,
            avatar: true,
            bio: true,
          },
        },
        parent: validatedData.parentId
          ? {
              select: {
                id: true,
                content: true,
                author: {
                  select: {
                    user_handle: true,
                  },
                },
              },
            }
          : false,
      },
    });

    return NextResponse.json({
      msg: `Comment is create by ${user.authorId} on ${user.postId} that is `,
      content: user.content,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    // Build where clause based on parentId parameter
    const whereClause: any = { postId };
    
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
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await middleware(req);
    const body = await req.json();
    console.log("authenticating");
    const validatedData = deleteValidateSchema.parse(body);

    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    if (!validatedData.id) {
      return NextResponse.json(
        {
          msg: "validated schema not verified",
        },
        { status: 401 }
      );
    }

    console.log("authenticated");

    const deleted = await prisma.comment.deleteMany({
      where: {
        id: validatedData.id,
      },
    });

    await prisma.comment.deleteMany({
      where: {
        parentId: validatedData.id || null,
      },
    });

    console.log("prisma delete done");

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    console.log("prisma delete checked");

    return NextResponse.json({
      success: true,
      msg: `Comment ${validatedData.id} is deleted successfully`,
    });
  } catch (error) {
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
}