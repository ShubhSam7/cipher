"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { safeNext } from "@/lib/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { signinSchema, type SessionUser } from "@/lib/validation/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import AuthShell from "@/components/auth/AuthShell";
import Field from "@/components/auth/Field";
import PasswordInput from "@/components/auth/PasswordInput";

export default function SignInPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = identifier.trim();
    // One field for both: anything with an @ is treated as an email.
    const parsed = signinSchema.safeParse(
      id.includes("@")
        ? { step: "email", email: id.toLowerCase(), password }
        : { step: "username", user_handle: id.replace(/^u\//, ""), password }
    );
    if (!parsed.success) {
      setError(id ? "Enter a valid email or username and a password of at least 8 characters." : "Enter your email or username.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: { user?: SessionUser; error?: string } = await response.json();
      if (!response.ok || !data.user) {
        setError(response.status === 401 ? "Incorrect email/username or password." : data.error || "Sign in failed");
        return;
      }
      login(data.user);
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your campus feed"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field id="identifier" label="Email or username">
          {(aria) => (
            <Input
              {...aria}
              aria-invalid={!!error && !identifier.trim()}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="bt22cse001@iiitn.ac.in or your_handle"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
            />
          )}
        </Field>

        <Field id="password" label="Password">
          {(aria) => (
            <PasswordInput
              {...aria}
              aria-invalid={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          )}
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
