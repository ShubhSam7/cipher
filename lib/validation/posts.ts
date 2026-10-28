import { z } from "zod";

export const MAX_CONTENT_LENGTH = 500;
export const contentSchema = z.string().trim().min(1).max(MAX_CONTENT_LENGTH);
export const createPostSchema = z.object({
  content: contentSchema,
  mediaURL: z.array(z.string().url()).optional().default([]),
  mediaType: z.array(z.string()).optional().default([]),
  communityId: z.string().min(1).optional(),
});
export const paginationSchema = z.object({
  cursor: z.string().min(1).max(128).optional(),
  limit: z.coerce.number().int().safe().transform(value => Math.min(50, Math.max(1, value))).default(10),
});
export const tagSchema = z.string().trim().toLowerCase().regex(/^\w{1,50}$/, "Invalid hashtag");
export const postLikeSchema = z.object({ postId: z.string().min(1) });
export type CreatePostInput = z.input<typeof createPostSchema>;
export type PostLikeInput = z.infer<typeof postLikeSchema>;
export type PaginationInput = z.input<typeof paginationSchema>;
