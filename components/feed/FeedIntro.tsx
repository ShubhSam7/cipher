"use client";
import { Plus } from "lucide-react";
import { useUiStore } from "@/lib/store/uiStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { UserAvatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/PageHeader";
export default function FeedIntro({ compact = false }: { compact?: boolean }) { const openCreatePost = useUiStore(state => state.setCreatePostOpen); const user = useAuthStore(state => state.user); const hydrated = useHydrated(); return <header className="feed-intro">{!compact && <div className="mb-4"><PageHeader eyebrow="IIIT Nagpur" title="Around campus" description="A little of what’s on everyone’s mind." tone="lime" doodle="Squiggle"/></div>}<button type="button" className="feed-composer" onClick={() => openCreatePost(true)}>{hydrated && user ? <UserAvatar handle={user.user_handle}/> : <span className="h-10 w-10 shrink-0 rounded-full bg-muted"/>}<span className="min-w-0 break-words">Something on your mind{hydrated && user ? `, u/${user.user_handle}` : ""}?</span><span className="composer-action" aria-hidden><Plus size={20}/></span></button></header>; }
