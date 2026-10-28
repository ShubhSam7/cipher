import { z } from "zod";
export const questionSchema = z.object({ title: z.string().trim().min(5).max(200), body: z.string().trim().min(10).max(5000) });
export const answerSchema = z.object({ body: z.string().trim().min(1).max(5000) });
export const acceptSchema = z.object({ answerId: z.string().min(1).nullable() });
export interface AnswerDTO { id: string; body: string; author: { id: string; user_handle: string; avatar: string | null }; createdAt: string; voteCount: number; isUpvoted: boolean }
export interface QuestionDTO { id: string; title: string; body: string; author: { id: string; user_handle: string; avatar: string | null }; acceptedAnswerId: string | null; createdAt: string; answerCount: number; hashtags: { id: string; name: string }[]; answers?: AnswerDTO[] }
