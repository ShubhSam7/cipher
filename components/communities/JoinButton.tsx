"use client";
import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
export default function JoinButton({ slug, isMember, onChange }: { slug: string; isMember: boolean; onChange?: () => void }) {
  const [pop, setPop] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return <Button className="shrink-0 min-w-24" aria-pressed={isMember} data-pop={pop} onAnimationEnd={() => setPop(false)} variant={isMember ? "secondary" : "default"} disabled={busy} onClick={async () => {
    setBusy(true);
    try { await apiJSON(`/api/v1/communities/${encodeURIComponent(slug)}/membership`, jsonBody(isMember ? "DELETE" : "POST")); setPop(!isMember); onChange?.(); router.refresh(); toast.success(isMember ? "Left community" : "Joined community"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); }
    finally { setBusy(false); }
  }}>{isMember && <Check size={16} aria-hidden/>}{busy ? "Saving…" : isMember ? "Leave" : "Join"}</Button>;
}
