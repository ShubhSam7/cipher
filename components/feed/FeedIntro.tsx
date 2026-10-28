"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import { useUiStore } from "@/lib/store/uiStore";

export default function FeedIntro({ compact = false }: { compact?: boolean }) {
  const openCreatePost = useUiStore(state => state.setCreatePostOpen);

  return (
    <header className={`feed-intro ${compact ? "feed-intro--compact" : ""}`}>
      {!compact && <>
        <p className="section-label"><span className="status-dot" /> IIIT NAGPUR · THE CAMPUS NETWORK</p>
        <h1 className="feed-title">Campus, <em>unfiltered.</em></h1>
        <p className="feed-description">The thoughts, questions, and conversations<br className="hidden sm:block" /> that make this place yours.</p>
      </>}
      <button className="feed-composer" onClick={() => openCreatePost(true)}>
        <span className="composer-mark" aria-hidden><Plus size={18} strokeWidth={1.5} /></span>
        <span>Something on your mind?</span>
        <span className="composer-action">Share a thought <ArrowUpRight size={15} aria-hidden /></span>
      </button>
    </header>
  );
}
