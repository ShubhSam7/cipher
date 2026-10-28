"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/hooks/useApi";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import { useAuthStore } from "@/lib/store/authStore";
import { communitySchema, type CommunityDTO } from "@/lib/validation/communities";
import JoinButton from "./JoinButton";
import ResourceState from "@/components/ResourceState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Field from "@/components/auth/Field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export default function CommunityList() {
  const { data, error, refresh } = useApi<{ communities: CommunityDTO[] }>("/api/v1/communities");
  const admin = useAuthStore(state => state.user?.isAdmin);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return <div className="mx-auto max-w-3xl space-y-5"><div className="flex items-center justify-between"><h1 className="break-words text-2xl font-bold">Communities</h1>{admin && <Button onClick={() => setOpen(true)}>New community</Button>}</div>
    {!data || error ? <ResourceState error={error} retry={refresh} /> : data.communities.length ? data.communities.map(community => <article key={community.id} className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5"><div className="min-w-0 flex-1"><Link href={`/c/${community.slug}`} className="break-words text-lg font-semibold hover:underline">c/{community.name}</Link><p className="whitespace-pre-wrap break-words text-muted-foreground">{community.description}</p><p className="text-sm text-muted-foreground">{community.memberCount} members · {community.isPublic ? "Public" : "Members only"}</p></div><JoinButton slug={community.slug} isMember={community.isMember} onChange={refresh} /></article>) : <p className="rounded-xl border border-dashed p-8 text-center">No communities yet.</p>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>New community</DialogTitle><DialogDescription>Create a campus space.</DialogDescription></DialogHeader><form className="space-y-4 p-6" onSubmit={async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true);
      try { const input = communitySchema.parse({ name: form.get("name"), slug: form.get("slug"), description: form.get("description"), isPublic: form.get("isPublic") === "on" }); await apiJSON("/api/v1/communities", jsonBody("POST", input)); setOpen(false); refresh(); toast.success("Community created"); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); } finally { setBusy(false); }
    }}><Field id="name" label="Name">{aria => <Input {...aria} name="name" required minLength={3} maxLength={50} />}</Field><Field id="slug" label="URL slug" hint="Lowercase letters, numbers and hyphens">{aria => <Input {...aria} name="slug" required pattern="[a-z0-9][a-z0-9-]{2,39}" />}</Field><Field id="description" label="Description">{aria => <Textarea {...aria} name="description" maxLength={500} />}</Field><label className="flex gap-2"><input type="checkbox" name="isPublic" defaultChecked />Public posts</label><Button disabled={busy}>Create</Button></form></DialogContent></Dialog>
  </div>;
}
