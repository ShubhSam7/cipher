import Link from "next/link";
import { cn } from "@/lib/utils";
export default function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return <Link href={href} className={cn("inline-flex w-fit items-center gap-2 rounded-lg font-bold", className)} aria-label="Cipher home"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 text-white" aria-hidden>C</span><span className="text-xl">cipher</span></Link>;
}
