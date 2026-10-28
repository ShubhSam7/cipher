import Link from "next/link";
import { cn } from "@/lib/utils";
export default function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return <Link href={href} className={cn("inline-flex w-fit items-center gap-2.5 rounded-lg", className)} aria-label="Cipher home"><span className="brand-mark" aria-hidden>C</span><span className="brand-wordmark">cipher</span></Link>;
}
