import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { toneFor } from "@/lib/avatar";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { UserAvatar } from "@/components/ui/avatar";
import FeedView from "@/components/feed/FeedView";
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const session = await getServerSession();
  if (!session.success) redirect(`/signin?next=${encodeURIComponent(`/u/${handle}`)}`);
  // Deliberately exclude email, year, password and all other private account fields.
  const user = await prisma.user.findUnique({ where: { user_handle: handle }, select: { id: true, user_handle: true, bio: true, avatar: true, createdAt: true, _count: { select: { posts: true } } } });
  if (!user) notFound();
  return <div className="profile-page space-y-6"><header data-tone={toneFor(handle)} className="profile-header profile-hero panel space-y-3"><div className="profile-banner pattern-dots"/><UserAvatar handle={user.user_handle} src={user.avatar} size="lg" className="hero-avatar"/><h1 className="break-words page-title">u/{user.user_handle}</h1><p className="whitespace-pre-wrap">{user.bio}</p><p className="chip">Joined {user.createdAt.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })} · {user._count.posts} posts</p>{session.userId === user.id && <div><Button asChild variant="outline"><Link href="/settings">Edit profile</Link></Button></div>}</header><FeedView tag={null} author={handle} showComposer={session.userId === user.id} /></div>;
}
