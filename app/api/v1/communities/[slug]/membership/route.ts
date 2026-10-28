import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { HttpError, segment } from "@/lib/route";

const membership = (join: boolean) => withAuth(async (req, session) => {
  const result = await prisma.$transaction(async tx => {
    const community = await tx.community.findUnique({ where: { slug: segment(req, "communities") } });
    if (!community) throw new HttpError(404, "Community not found");
    const where = { communityId: community.id, userId: session.userId };
    const changed = join ? await tx.communityMember.createMany({ data: [where], skipDuplicates: true }) : await tx.communityMember.deleteMany({ where });
    const updated = changed.count ? await tx.community.update({ where: { id: community.id }, data: { memberCount: { increment: join ? 1 : -1 } } }) : community;
    return { isMember: join, memberCount: updated.memberCount };
  });
  return NextResponse.json(result);
});
export const POST = membership(true);
export const DELETE = membership(false);
