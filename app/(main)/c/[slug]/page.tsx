import { CommunityMark } from "@/components/communities/CommunityMark";
import { EmptyState } from "@/components/EmptyState";
import { toneFor } from "@/lib/avatar";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import FeedView from "@/components/feed/FeedView";
import JoinButton from "@/components/communities/JoinButton";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession();
  if (!session.success) redirect(`/signin?next=${encodeURIComponent(`/c/${slug}`)}`);
  const community = await prisma.community.findUnique({ where: { slug }, select: { name: true, description: true, memberCount: true, isPublic: true, members: { where: { userId: session.userId }, select: { userId: true } } } });
  if (!community) notFound();
  return <div className="profile-page space-y-6"><header data-tone={toneFor(slug)} className="profile-header profile-hero panel flex flex-wrap items-start justify-between gap-4"><div className="profile-banner pattern-dots"/><div><CommunityMark slug={slug} name={community.name} className="hero-avatar mb-4 h-16 w-16"/><h1 className="break-words page-title">c/{community.name}</h1><p className="whitespace-pre-wrap break-words text-muted-foreground">{community.description}</p><p className="chip mt-3">{community.memberCount} members · {community.isPublic ? "Campus-visible" : "Members only"}</p></div><JoinButton slug={slug} isMember={!!community.members.length} /></header>{community.isPublic || community.members.length ? <FeedView tag={null} community={slug} /> : <EmptyState tone="peach" doodle="Lock" title="Join to see what’s inside."/>}</div>;
}
