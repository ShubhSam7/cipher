import Link from "next/link";
import { cn } from "@/lib/utils";
import { CipherMark } from "./brand/CipherMark";
import { CipherWordmark } from "./brand/CipherWordmark";
export default function Logo({ href = "/", className, size = "sm" }: { href?: string; className?: string; size?: "sm" | "lg" }) { return <Link href={href} className={cn("inline-flex w-fit items-center gap-2.5 rounded-lg", className)} aria-label="Cipher home"><span className="brand-mark" aria-hidden><CipherMark size={size === "lg" ? 32 : 26} /></span><CipherWordmark /></Link>; }
