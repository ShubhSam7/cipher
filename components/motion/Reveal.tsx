"use client";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { m } from "framer-motion";
import { fadeUp, stagger } from "./variants";
type Props = { children: React.ReactNode; className?: string; delay?: number };
export function Reveal({ children, className, delay = 0 }: Props) { const reduce = usePrefersReducedMotion(); return <m.div className={className} initial={reduce ? false : "hidden"} whileInView="show" viewport={{once:true, amount:.1}} variants={fadeUp} transition={{delay}}>{children}</m.div>; }
export function RevealGroup({ children, className }: Props) { const reduce = usePrefersReducedMotion(); return <m.div className={className} initial={reduce ? false : "hidden"} whileInView="show" viewport={{once:true, amount:.1}} variants={stagger}>{children}</m.div>; }
export function RevealItem({ children, className }: Props) { return <m.div className={className} variants={fadeUp}>{children}</m.div>; }
