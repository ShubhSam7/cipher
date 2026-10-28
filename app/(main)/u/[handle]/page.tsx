import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { UserAvatar } from "@/components/ui/avatar";
import FeedView from "@/components/feed/FeedView";
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!(await getServerSession()).success) redirect(`/signin?next=${encodeURIComponent(`/u/${handle}`)}`);
  // Deliberately exclude email, year, password and all other private account fields.
  const user = await prisma.user.findUnique({ where: { user_handle: handle }, select: { user_handle: true, bio: true, avatar: true, createdAt: true, _count: { select: { posts: true } } } });
  if (!user) notFound();
  return <div className="space-y-6"><header className="space-y-3 rounded-2xl border bg-card p-6"><UserAvatar handle={user.user_handle} src={user.avatar} /><h1 className="break-words text-2xl font-bold">u/{user.user_handle}</h1><p className="whitespace-pre-wrap">{user.bio}</p><p className="text-muted-foreground">Joined {user.createdAt.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })} · {user._count.posts} posts</p></header><FeedView tag={null} author={handle} /></div>;
}
