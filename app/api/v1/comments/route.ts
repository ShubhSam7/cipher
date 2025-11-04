import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { middleware } from "@/lib/middleware";

const validateSchema = z.object({
  content: z.string().min(1).max(100),
  postId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await middleware(req);
    const body = await req.json();
    console.log("middleware checked")
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("validating")
    const validatedData = validateSchema.parse(body);
    console.log("validated")
    if (!validatedData.content) {
      return NextResponse.json(
        {
          msg: "validated schema not verified",
        },
        { status: 401 }
      );
    }
    console.log("starting prisma")
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
