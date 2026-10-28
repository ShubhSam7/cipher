import { env } from "@/lib/env";
export function isAdmin(email: string) {
  return env.ADMIN_EMAILS.split(",").map(value => value.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
