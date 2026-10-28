import { z } from "zod";

export const iiitnEmailPattern = /^bt(\d{2})(cse|csa|csd|csh|ece|iot)\d{3}@iiitn\.ac\.in$/;
export const collegeEmailSchema = z.string().regex(iiitnEmailPattern, "Invalid IIITN email format");
export const passwordSchema = z.string().min(8);
// Block institute IDs even when the user includes only the numeric roll number.
export function containsRollNumber(handle: string, email?: string) {
  const value = handle.toLowerCase();
  if (/bt\d{2}(?:cse|csa|csd|csh|ece|iot)\d{3}/i.test(value) || /\d{7,}/.test(value)) return true;
  const match = email?.match(iiitnEmailPattern);
  const local = email?.split("@")[0].toLowerCase();
  if (local && value.includes(local)) return true;
  const roll = local?.replace(/\D/g, "");
  return !!match && !!roll && value.includes(roll);
}
export const userHandleSchema = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Invalid user handle")
  .refine(value => !containsRollNumber(value), "Don't use your roll number in a public handle");

export const signinSchema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("email"), email: z.string().email(), password: passwordSchema }),
  z.object({ step: z.literal("username"), user_handle: z.string().min(1).max(20), password: passwordSchema }),
]);
export const sendOtpSchema = z.object({ email: collegeEmailSchema, step: z.literal("send-otp") });
export const verifyOtpSchema = z.object({
  email: collegeEmailSchema,
  otp: z.string().regex(/^\d{6}$/, "Enter a 6-digit OTP"),
  step: z.literal("verify-otp"),
});
export const completeSignupSchema = z.object({
  email: collegeEmailSchema, user_handle: userHandleSchema, password: passwordSchema,
  step: z.literal("complete-signup"),
}).refine(value => !containsRollNumber(value.user_handle, value.email), {
  path: ["user_handle"], message: "Don't use your roll number in a public handle",
});
export const signupSchema = z.discriminatedUnion("step", [sendOtpSchema, verifyOtpSchema, completeSignupSchema]);
export type SigninInput = z.infer<typeof signinSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CompleteSignupInput = z.infer<typeof completeSignupSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export interface SessionUser { id: string; email: string; user_handle: string; isAdmin: boolean; bio?: string | null; handleChangeAvailableAt?: string | null }
