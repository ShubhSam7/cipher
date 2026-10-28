import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { isAdmin } from "@/lib/admin";
import { segment, HttpError } from "@/lib/route";
const manage = (remove: boolean) => withAuth(async (req, session) => {
  if (!isAdmin(session.email)) throw new HttpError(403, "Admin access required");
  if (!remove && (await req.json()).action !== "end") throw new HttpError(400, "Invalid action");
  const id = segment(req, "polls");
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "polls" WHERE "id" = ${id} FOR UPDATE`;
    if (remove) await tx.poll.delete({ where: { id } });
    else await tx.poll.update({ where: { id }, data: { closedAt: new Date() } });
  });
  return NextResponse.json({ success: true });
});
export const PATCH = manage(false);
export const DELETE = manage(true);
