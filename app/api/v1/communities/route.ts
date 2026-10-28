import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { isAdmin } from "@/lib/admin";
import { HttpError } from "@/lib/route";
import { communitySchema } from "@/lib/validation/communities";
export const GET = withAuth(async (_, session) => {
  const communities = await prisma.community.findMany({ orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true, isPublic: true, memberCount: true, members: { where: { userId: session.userId }, select: { userId: true } } } });
  return NextResponse.json({ communities: communities.map(({ members, ...community }) => ({ ...community, isMember: members.length > 0 })) });
});
export const POST = withAuth(async (req, session) => {
  if (!isAdmin(session.email)) throw new HttpError(403, "Admin access required");
  const input = communitySchema.parse(await req.json());
  const community = await prisma.community.create({ data: { ...input, creatorId: session.userId }, select: { id: true, slug: true } });
  return NextResponse.json({ community }, { status: 201 });
});
