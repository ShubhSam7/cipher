import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { middleware } from "@/lib/middleware";

const validateSchema = z.object({
  content: z.string().min(1).max(100),
  postId: z.string(),
  parentId: z.string().optional(),
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
;
    const validatedData = validateSchema.parse(body);

    if (!validatedData.content) {
      return NextResponse.json(
        {
          msg: "validated schema not verified",
        },
        { status: 401 }
      );
    }// check for content

    const postExists = await prisma.post.findUnique({
      where: { id: validatedData.postId },
    });

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }// check for post

    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }// check for parent comment to be replied on

      if (parentComment.postId !== validatedData.postId) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this post" },
          { status: 400 }
        );
      }// check for post and comment to be refferenced
    }

    const user = await prisma.comment.create({
      //@ts-ignore
      data: {
        content: validatedData.content.trim(),
        authorId: auth.userId,
        postId: validatedData.postId,
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
        parent: validatedData.parentId ? {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                user_handle: true
              }
            }
          }
        } : false
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

export function GET(req: NextRequest) {}

export function DELETE(req: NextRequest) {}
