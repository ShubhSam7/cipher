"use client";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { AnimatePresence, m } from "framer-motion";
export function StepTransition({ step, direction = 1, children }: { step: number; direction?: number; children: React.ReactNode }) { const reduce = usePrefersReducedMotion(); return <AnimatePresence mode="wait" initial={false}><m.div key={step} initial={{opacity:0,x:reduce?0:12*direction}} animate={{opacity:1,x:0}} exit={{opacity:0,x:reduce?0:-12*direction}} transition={{duration:.16}}>{children}</m.div></AnimatePresence>; }
