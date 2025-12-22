import { middleware } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
const postlikeschema = z.object({
  postId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await middleware(req);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = postlikeschema.parse(body);

    if(!auth.userId){
        return NextResponse.json(
            {
                error: "userId not found",
                status: 401,
            },
            { status: 401 }
        )
    }

    // Check if already liked to prevent duplicates
    const existingLike = await prisma.postlike.findFirst({
      where: {
        postId: validatedData.postId,
        userId: auth.userId
      }
    });

    if (existingLike) {
      return NextResponse.json({
        success: true,
        msg: "Post already liked",
        alreadyLiked: true
      });
    }

    const data = await prisma.postlike.create({
        data: {
            postId: validatedData.postId,
            userId: auth.userId
        },
    })

    return NextResponse.json({
        success: true,
        msg: `Post ${data.postId} liked successfully`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Likeing post error:", error);
    return NextResponse.json(
      { error: "Failed to like the post" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest){
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
}

export async function DELETE(req: NextRequest){
  try {
    const auth = await middleware(req);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = postlikeschema.parse(body);

    if(!auth.userId){
        return NextResponse.json(
            {
                error: "User not authenticated",
                status: 401,
            },
            { status: 401 }
        )
    }

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
}