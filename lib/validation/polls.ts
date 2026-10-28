import { z } from "zod";
export const pollSchema = z.object({
  question: z.string().trim().min(1).max(200),
  options: z.array(z.string().trim().min(1).max(120)).min(2).max(10)
    .refine(values => new Set(values.map(value => value.toLowerCase())).size === values.length, "Options must be unique"),
  allowMultiple: z.boolean().default(false),
  duration: z.enum(["1h", "1d", "3d", "7d", "custom"]).default("1d"),
  endsAt: z.string().datetime().optional(),
}).refine(value => value.duration !== "custom" || !!value.endsAt, "Choose an end time");
export const voteSchema = z.object({ optionIds: z.array(z.string().min(1)).min(1).max(10).refine(ids => new Set(ids).size === ids.length, "Choose each option once") });
export interface PollDTO { id: string; question: string; allowMultiple: boolean; endsAt: string; closedAt: string | null; createdAt: string; ended: boolean; options: { id: string; label: string; position: number }[]; hasVoted: boolean; myChoices: string[]; results?: { totalVoters: number; options: { id: string; count: number; percentage: number }[] } }
