import type { Prisma } from "@prisma/client";

export function postInclude(userId: string) {
  return {
    author: { select: { id: true, user_handle: true, avatar: true, bio: true } },
    community: { select: { id: true, name: true, slug: true, avatar: true } },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId }, select: { userId: true } },
    hashtags: { select: { hashtag: { select: { id: true, name: true } } } },
  } satisfies Prisma.PostInclude;
}

type PostWithRelations = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;
export function toPostDTO(post: PostWithRelations) {
  return {
    id: post.id,
    content: post.content,
    mediaURL: post.mediaURL,
    mediaType: post.mediaType,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    community: post.community,
    likeCount: post._count.likes,
    isLikedByUser: post.likes.length > 0,
    commentCount: post._count.comments,
    hashtags: post.hashtags.map(({ hashtag }) => hashtag),
  };
}
export type PostDTO = ReturnType<typeof toPostDTO>;
export interface PostsResponse {
  posts: PostDTO[];
  pagination: { nextCursor: string | null; hasMore: boolean };
}
export function extractHashtags(content: string): string[] {
  return [...new Set((content.match(/#(\w+)/g) ?? []).map(tag => tag.slice(1).toLowerCase()))];
}

export function postWhere(userId: string, filters: { tag?: string; author?: string; community?: string } = {}): Prisma.PostWhereInput {
  return {
    AND: [
      { OR: [{ communityId: null }, { community: { isPublic: true } }, { community: { members: { some: { userId } } } }] },
      ...(filters.tag ? [{ hashtags: { some: { hashtag: { name: filters.tag } } } }] : []),
      ...(filters.author ? [{ author: { user_handle: filters.author } }] : []),
      ...(filters.community ? [{ community: { slug: filters.community } }] : []),
    ],
  };
}
