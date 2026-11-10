import { AmbientBackground } from "@/components/decor/AmbientBackground";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <><AmbientBackground intensity="public" />{children}</>;
}
