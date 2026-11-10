"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Shuffle } from "lucide-react";
import { cn, generateAnonymousHandle } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import {
  collegeEmailSchema, userHandleSchema, containsRollNumber, sendOtpSchema, verifyOtpSchema, completeSignupSchema,
  type SessionUser,
} from "@/lib/validation/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import AuthShell from "@/components/auth/AuthShell";
import Field from "@/components/auth/Field";
import PasswordInput from "@/components/auth/PasswordInput";
import { Stepper } from "@/components/auth/Stepper";
import { StepTransition } from "@/components/motion/Presence";
import OtpInput from "@/components/auth/OtpInput";

type SignupStep = "email" | "otp" | "complete";
type FieldName = "email" | "otp" | "user_handle" | "password" | "confirmPassword";

const RESEND_SECONDS = 60;
const OTP_TTL_SECONDS = 10 * 60;

interface ApiResponse {
  error?: string;
  email?: string;
  user?: SessionUser;
  details?: { path: (string | number)[]; message: string }[];
}

function passwordChecks(password: string) {
  return [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function SignupPage() {
  const login = useAuthStore((state) => state.login);
  const [step, setCurrentStep] = useState<SignupStep>("email");
  const [direction, setDirection] = useState(1);
  function setStep(next: SignupStep) { const order = { email: 0, otp: 1, complete: 2 }; setDirection(order[next] > order[step] ? 1 : -1); setCurrentStep(next); }
  const [form, setForm] = useState({ email: "", otp: "", user_handle: "", password: "", confirmPassword: "" });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [sentAt, setSentAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (step !== "otp") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [step]);

  const elapsed = Math.floor((now - sentAt) / 1000);
  const resendIn = Math.max(0, RESEND_SECONDS - elapsed);
  const expiresIn = Math.max(0, OTP_TTL_SECONDS - elapsed);

  const set = (field: FieldName) => (value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setServerErrors((previous) => ({ ...previous, [field]: undefined }));
  };
  const touch = (field: FieldName) => () => setTouched((previous) => ({ ...previous, [field]: true }));

  const checks = passwordChecks(form.password);
  const strongEnough = checks[0].ok && checks.filter((check) => check.ok).length >= 3;
  const clientErrors: Partial<Record<FieldName, string>> = {
    email: collegeEmailSchema.safeParse(form.email.trim().toLowerCase()).success
      ? undefined
      : "Use your IIITN email, e.g. bt22cse001@iiitn.ac.in",
    user_handle: containsRollNumber(form.user_handle, form.email) ? "Don’t use your roll number" : userHandleSchema.safeParse(form.user_handle).error?.issues[0]?.message.replace(
      /^Too small.*|^Too big.*/,
      "3–20 characters"
    ),
    password: strongEnough ? undefined : "Use 8+ characters with a mix of letters, numbers or symbols",
    confirmPassword: form.confirmPassword === form.password ? undefined : "Passwords don't match",
  };
  const fieldError = (field: FieldName) => serverErrors[field] ?? (touched[field] ? clientErrors[field] : undefined);

  const post = async (body: unknown): Promise<{ ok: boolean; status: number; data: ApiResponse }> => {
    const response = await fetch("/api/v1/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: response.ok, status: response.status, data: await response.json() };
  };

  // Put server validation errors next to the field they belong to.
  const applyServerError = (data: ApiResponse, fallback: string) => {
    const mapped: Partial<Record<FieldName, string>> = {};
    for (const detail of data.details ?? []) {
      const field = detail.path[0];
      if (typeof field === "string" && field in form) mapped[field as FieldName] = detail.message;
    }
    if (data.error === "Username already taken") mapped.user_handle = data.error;
    if (data.error === "User already exists") mapped.email = "An account with this email already exists.";
    setServerErrors(mapped);
    if (Object.keys(mapped).length === 0) setError(data.error || fallback);
  };

  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError("");
    try {
      await action();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = () => {
    setTouched((previous) => ({ ...previous, email: true }));
    const parsed = sendOtpSchema.safeParse({ email: form.email.trim().toLowerCase(), step: "send-otp" });
    if (!parsed.success) return;
    return run(async () => {
      const { ok, data } = await post(parsed.data);
      if (!ok) return applyServerError(data, "Failed to send code");
      setMaskedEmail(data.email ?? parsed.data.email);
      setSentAt(Date.now());
      setNow(Date.now());
      setForm((previous) => ({ ...previous, otp: "" }));
      setStep("otp");
    });
  };

  const verifyOtp = (otp = form.otp) => {
    const parsed = verifyOtpSchema.safeParse({ email: form.email.trim().toLowerCase(), otp, step: "verify-otp" });
    if (!parsed.success) {
      setServerErrors({ otp: "Enter the 6-digit code" });
      return;
    }
    return run(async () => {
      const { ok, data } = await post(parsed.data);
      if (!ok) {
        setServerErrors({ otp: data.error || "Invalid code" });
        return;
      }
      setForm((previous) => ({ ...previous, user_handle: previous.user_handle || generateAnonymousHandle() }));
      setStep("complete");
    });
  };

  const completeSignup = () => {
    setTouched({ email: true, user_handle: true, password: true, confirmPassword: true });
    const parsed = completeSignupSchema.safeParse({
      email: form.email.trim().toLowerCase(),
      user_handle: form.user_handle,
      password: form.password,
      step: "complete-signup",
    });
    if (!parsed.success || clientErrors.user_handle || clientErrors.password || clientErrors.confirmPassword) return;
    return run(async () => {
      const { ok, data } = await post(parsed.data);
      if (!ok || !data.user) return applyServerError(data, "Failed to create account");
      login(data.user);
      window.location.replace("/feed");
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (step === "email") void sendOtp();
    else if (step === "otp") void verifyOtp();
    else void completeSignup();
  };

  const primaryLabel = { email: "Send code", otp: "Verify", complete: "Create account" }[step];

  return (
    <AuthShell
      title="Join Cipher"
      subtitle="Sign up with your IIIT Nagpur email"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Stepper current={step} />

      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error} {error.toLowerCase().includes("already exists") && <Link href="/signin" className="underline">Sign in</Link>}
          </div>
        )}

        <StepTransition direction={direction} step={{email:0,otp:1,complete:2}[step]}><div className="space-y-5">
        {step === "email" && (
          <Field id="email" label="College email" error={fieldError("email")}>
            {(aria) => (
              <Input
                {...aria}
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                onBlur={touch("email")}
                placeholder="bt22cse001@iiitn.ac.in"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
              />
            )}
          </Field>
        )}

        {step === "otp" && (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium text-foreground">{maskedEmail}</span>
            </p>
            <OtpInput
              value={form.otp}
              onChange={set("otp")}
              onComplete={(otp) => void verifyOtp(otp)}
              invalid={!!serverErrors.otp}
              disabled={loading}
              describedBy={serverErrors.otp ? "otp-error" : undefined}
            />
            {serverErrors.otp && (
              <p id="otp-error" role="alert" className="text-center text-sm text-destructive">
                {serverErrors.otp}
              </p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground" aria-live="polite">
                {expiresIn > 0 ? `Expires in ${formatSeconds(expiresIn)}` : "Code expired"}
              </span>
              <button
                type="button"
                onClick={() => void sendOtp()}
                disabled={resendIn > 0 || loading}
                className="font-medium text-brand hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Use a different email
            </button>
          </div>
        )}

        {step === "complete" && (
          <>
            <Field
              id="user_handle"
              label="Username"
              error={fieldError("user_handle")}
              hint="This is public. Don’t use your real name or roll number."
            >
              {(aria) => (
                <div className="flex gap-2">
                  <Input
                    {...aria}
                    value={form.user_handle}
                    onChange={(e) => set("user_handle")(e.target.value)}
                    onBlur={touch("user_handle")}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => set("user_handle")(generateAnonymousHandle())}
                    aria-label="Suggest a random username"
                  >
                    <Shuffle className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              )}
            </Field>

            <Field
              id="password"
              label="Password"
              error={fieldError("password")}
              hint={
                form.password && (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {checks.map((check) => (
                      <li key={check.label} className={cn("flex items-center gap-1.5", check.ok && "text-brand")}>
                        <Check className={cn("h-3.5 w-3.5", !check.ok && "opacity-30")} aria-hidden />
                        {check.label}
                        <span className="sr-only">{check.ok ? "(met)" : "(not met)"}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
            >
              {(aria) => (
                <PasswordInput
                  {...aria}
                  value={form.password}
                  onChange={(e) => set("password")(e.target.value)}
                  onBlur={touch("password")}
                  autoComplete="new-password"
                />
              )}
            </Field>

            <Field id="confirmPassword" label="Confirm password" error={fieldError("confirmPassword")}>
              {(aria) => (
                <PasswordInput
                  {...aria}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    set("confirmPassword")(e.target.value);
                    touch("confirmPassword")();
                  }}
                  autoComplete="new-password"
                />
              )}
            </Field>
          </>
        )}

        </div></StepTransition>
        <Button
          type="submit"
          size="lg"
          disabled={loading || (step === "otp" && form.otp.length < 6)}
          className="w-full"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {primaryLabel}
        </Button>
      </form>
    </AuthShell>
  );
}
