import { z } from "zod";

// Validate server configuration as soon as a server module is loaded.
export const env = z.object({
  ADMIN_EMAILS: z.string().default(""),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(1),
}).parse({
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
});
