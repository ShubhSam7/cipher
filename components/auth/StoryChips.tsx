"use client";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { m } from "framer-motion";
import { UserAvatar } from "@/components/ui/avatar";
export function StoryChips() { const reduce = usePrefersReducedMotion(); return <div className="story-chips"><div className="flex flex-wrap gap-3">{["midnight_mango","quiet_orbit","paper_plane","chai_break","little_comet"].map((handle,i) => <m.span key={handle} className="story-chip" animate={reduce ? {} : {y:[0,-5,0]}} transition={{duration:5+i,repeat:Infinity,ease:"easeInOut",delay:i*.3}}><UserAvatar handle={handle} size="sm"/>u/{handle}</m.span>)}</div><p className="metadata mt-4">Illustrative handles</p></div>; }
