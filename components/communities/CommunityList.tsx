"use client";
import Link from "next/link";
import { CommunityMark } from "./CommunityMark";
import { useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/hooks/useApi";
import { apiJSON, jsonBody } from "@/lib/apiFetch";
import { useAuthStore } from "@/lib/store/authStore";
import { communitySchema, type CommunityDTO } from "@/lib/validation/communities";
import JoinButton from "./JoinButton";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import ResourceState from "@/components/ResourceState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedControl } from "@/components/ui/segmented";
import { filterCommunities } from "@/lib/search";
import { Textarea } from "@/components/ui/textarea";
import Field from "@/components/auth/Field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
export default function CommunityList() {
  const { data, error, refresh } = useApi<{ communities: CommunityDTO[] }>("/api/v1/communities");
  const admin = useAuthStore(state => state.user?.isAdmin);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const communities = filterCommunities(data?.communities ?? [], search, filter === "joined");
  return <div className="page-stack" data-tone="peach"><PageHeader title="Communities" tone="peach" doodle="Chai" description="Shared interests. Familiar faces. Find your corner of campus." action={admin && <Button onClick={() => setOpen(true)}>New community</Button>}/>
    <SearchInput value={search} onValueChange={setSearch} aria-label="Search communities by name or description" placeholder="Find a community" />
    <div className="discovery-toolbar"><SegmentedControl label="Community filters" value={filter} options={[{ value: "all", label: "All communities" }, { value: "joined", label: "Joined" }]} onChange={setFilter} />{data && !error && <p className="metadata" role="status">{communities.length} {communities.length === 1 ? "community" : "communities"}</p>}</div>
    {!data || error ? <ResourceState error={error} retry={refresh} /> : communities.length ? <div className="community-grid">{communities.map(community => <article key={community.id} className="community-card" data-tone="peach"><CommunityMark slug={community.slug} name={community.name}/><div className="min-w-0 flex-1"><Link href={`/c/${community.slug}`} className="break-words text-lg font-semibold hover:underline">c/{community.name}</Link><p className="line-clamp-3 whitespace-pre-wrap break-words text-muted-foreground">{community.description}</p><p className="text-sm text-muted-foreground">{community.memberCount} {community.memberCount === 1 ? "member" : "members"} · {community.isPublic ? "Campus-visible" : "Members only"}</p></div><JoinButton slug={community.slug} isMember={community.isMember} onChange={refresh} /></article>)}</div> : <EmptyState tone="peach" doodle="Chai" title={search.trim() ? "No matching communities." : filter === "joined" ? "Find your people." : "No communities yet."} body={search.trim() ? "Try another name or a broader search." : filter === "joined" ? "Join a community to see it here and start posting." : undefined} action={(search || filter === "joined") && <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }}>Explore all communities</Button>}/>}
    <Dialog open={open} onOpenChange={value => !busy && setOpen(value)}><DialogContent><DialogHeader><DialogTitle>New community</DialogTitle><DialogDescription>Create a campus space.</DialogDescription></DialogHeader><form className="space-y-4 p-6" onSubmit={async event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true);
      try { const input = communitySchema.parse({ name: form.get("name"), slug: form.get("slug"), description: form.get("description"), isPublic: form.get("isPublic") === "on" }); await apiJSON("/api/v1/communities", jsonBody("POST", input)); setOpen(false); refresh(); toast.success("Community created"); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); } finally { setBusy(false); }
    }}><Field id="name" label="Name">{aria => <Input {...aria} name="name" required minLength={3} maxLength={50} />}</Field><Field id="slug" label="URL slug" hint="Lowercase letters, numbers and hyphens">{aria => <Input {...aria} name="slug" required pattern="[a-z0-9][a-z0-9-]{2,39}" />}</Field><Field id="description" label="Description">{aria => <Textarea {...aria} name="description" maxLength={500} />}</Field><label className="flex gap-2"><input type="checkbox" name="isPublic" defaultChecked />Visible to all campus members</label><Button disabled={busy}>{busy ? "Creating…" : "Create community"}</Button></form></DialogContent></Dialog>
  </div>;
}
