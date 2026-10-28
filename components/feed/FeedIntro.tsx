"use client";

import { PenLine, Plus } from "lucide-react";
import { useUiStore } from "@/lib/store/uiStore";

export default function FeedIntro({ compact = false }: { compact?: boolean }) {
  const openCreatePost = useUiStore(state => state.setCreatePostOpen);
  return (
    <header className="feed-intro">
      {!compact && <div className="feed-intro-heading">
        <div><p className="section-label mb-2">IIIT Nagpur</p><h1 className="feed-title">Around campus</h1><p className="feed-description">A little of what’s on everyone’s mind.</p></div>
        <PenLine className="mt-2 h-6 w-6 text-muted-foreground" aria-hidden />
      </div>}
      <button type="button" className="feed-composer" onClick={() => openCreatePost(true)}>
        <span className="composer-mark" aria-hidden><PenLine size={20} /></span>
        <span>Something on your mind?</span>
        <span className="composer-action" aria-hidden><Plus size={20} /></span>
      </button>
    </header>
  );
}
