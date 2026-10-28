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
  return <div className="space-y-6"><header className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-6"><div><h1 className="break-words text-2xl font-bold">c/{community.name}</h1><p className="whitespace-pre-wrap break-words text-muted-foreground">{community.description}</p><p>{community.memberCount} members</p></div><JoinButton slug={slug} isMember={!!community.members.length} /></header>{community.isPublic || community.members.length ? <FeedView tag={null} community={slug} /> : <p>Join to view this community&apos;s posts.</p>}</div>;
}
