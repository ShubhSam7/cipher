import { z } from "zod";
import { userHandleSchema } from "./auth";
export const updateUserSchema = z.object({ user_handle: userHandleSchema.optional(), bio: z.string().trim().max(160).optional() })
  .refine(value => value.user_handle !== undefined || value.bio !== undefined, "Provide a username or bio");
export const HANDLE_COOLDOWN = 30 * 24 * 60 * 60 * 1000;
