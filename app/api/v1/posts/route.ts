import { NextRequest, NextResponse } from "next/server";
import { unknown, z } from "zod";
import { middleware } from "@/lib/middleware";
import prisma from "@/lib/prisma";

const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  mediaURL: z.array(z.string().url()).optional().default([]),
  mediaType: z.array(z.string()).optional().default([]),
  communityId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await middleware(req);

    if (auth instanceof NextResponse) {
      return auth;
    }
    
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              user_handle: true,
              avatar: true,
              bio: true,
            },
          },
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
          hashtags: {
            include: {
              hashtag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.post.count(),
    ]);

    const transformedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      mediaURL: post.mediaURL,
      mediaType: post.mediaType,
      createdAt: post.createdAt,
      author: post.author,
      community: post.community,
      likeCount: post.likes.length,
      isLikedByUser: post.likes.some((like) => like.userId === auth.userId),
      commentCount: post.comments.length,
      hashtags: post.hashtags.map((ht) => ({
        id: ht.hashtag.id,
        name: ht.hashtag.name,
      })),
    }));

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalPosts: totalCount,
        hasMore: skip + posts.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await middleware(req);

    if (auth instanceof NextResponse) {
      return auth;
    }
    
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createPostSchema.parse(body);

    if (validatedData.communityId) {
      const community = await prisma.community.findUnique({
        where: { id: validatedData.communityId },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }
    }

    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        mediaURL: validatedData.mediaURL,
        mediaType: validatedData.mediaType,
        authorId: auth.userId!,
        communityId: validatedData.communityId || null,
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
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: {
          id: post.id,
          content: post.content,
          mediaURL: post.mediaURL,
          mediaType: post.mediaType,
          createdAt: post.createdAt,
          author: post.author,
          community: post.community,
          likeCount: 0,
          isLikedByUser: false,
          commentCount: 0,
          hashtags: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error
         },
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