import { cache } from "react";
import prisma from "@/lib/prisma";
import { postInclude, toPostDTO, postWhere } from "@/lib/posts";

// Cached per request so generateMetadata and the page share one query.
export const getPostById = cache(async (id: string, userId: string) => {
  const post = await prisma.post.findFirst({ where: { id, ...postWhere(userId) }, include: postInclude(userId) });
  return post ? toPostDTO(post) : null;
});
