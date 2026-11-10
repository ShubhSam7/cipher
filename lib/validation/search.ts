import { z } from "zod";

export const MAX_SEARCH_LENGTH = 100;
export const searchSchema = z.string().trim().max(MAX_SEARCH_LENGTH);
export const questionFilterSchema = z.enum(["all", "unanswered", "answered"]);
export type QuestionFilter = z.infer<typeof questionFilterSchema>;
