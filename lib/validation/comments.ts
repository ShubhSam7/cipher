import { z } from "zod";
import { contentSchema } from "./posts";

export const createCommentSchema = z.object({
  content: contentSchema,
  postId: z.string().min(1),
  parentId: z.string().min(1).nullish(),
});
export const deleteCommentSchema = z.object({ id: z.string().min(1) });
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
