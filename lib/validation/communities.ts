import { z } from "zod";
export const communitySchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{2,39}$/, "Use 3–40 lowercase letters, numbers or hyphens"),
  description: z.string().trim().max(500).default(""), isPublic: z.boolean().default(true),
});
export interface CommunityDTO { id: string; name: string; slug: string; description: string | null; isPublic: boolean; memberCount: number; isMember: boolean }
