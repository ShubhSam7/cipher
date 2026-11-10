"use client";
import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
export function UpvoteButton({ pressed, count, busy, onClick }: { pressed: boolean; count: number; busy: boolean; onClick: () => void }) { const [pop,setPop] = useState(false); return <Button data-tone="sky" variant="outline" className="upvote-button" aria-pressed={pressed} disabled={busy} data-pop={pop} onAnimationEnd={() => setPop(false)} onClick={() => {setPop(!pressed);onClick();}} aria-label={`${pressed ? "Remove upvote from" : "Upvote"} answer, ${count} ${count === 1 ? "vote" : "votes"}`}><ArrowUp size={16} aria-hidden/>{count}</Button>; }
