import { AmbientBackground } from "@/components/decor/AmbientBackground";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import AuthenticatedRedirect from "@/components/auth/AuthenticatedRedirect";

export const metadata: Metadata = { robots: { index: false } };

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if ((await getServerSession()).success) redirect("/feed");
  return <><AuthenticatedRedirect /><AmbientBackground intensity="public" />{children}</>;
}
