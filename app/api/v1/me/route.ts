import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { isAdmin } from "@/lib/admin";
import { HttpError } from "@/lib/route";
import { containsRollNumber } from "@/lib/validation/auth";
import { HANDLE_COOLDOWN, updateUserSchema } from "@/lib/validation/users";

function dto(user: { id: string; email: string; user_handle: string; bio: string | null; handleChangedAt: Date | null }) {
  return { id: user.id, email: user.email, user_handle: user.user_handle, bio: user.bio, isAdmin: isAdmin(user.email),
    handleChangeAvailableAt: user.handleChangedAt ? new Date(+user.handleChangedAt + HANDLE_COOLDOWN).toISOString() : null };
}
export const GET = withAuth(async (_, session) => {
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new HttpError(401, "Session expired");
  return NextResponse.json(dto(user));
});
export const PATCH = withAuth(async (req, session) => {
  const input = updateUserSchema.parse(await req.json());
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  const changing = input.user_handle !== undefined && input.user_handle !== user.user_handle;
  if (input.user_handle && containsRollNumber(input.user_handle, user.email)) throw new HttpError(400, "Don't use your roll number in a public handle");
  const now = new Date();
  const available = user.handleChangedAt ? new Date(+user.handleChangedAt + HANDLE_COOLDOWN) : null;
  if (changing && available && available > now) throw new HttpError(429, "You can change your username once every 30 days", { handleChangeAvailableAt: available.toISOString() });
  // The cooldown predicate is checked by the write, so parallel renames cannot bypass it.
  const changed = await prisma.user.updateMany({
    where: { id: user.id, ...(changing ? { OR: [{ handleChangedAt: null }, { handleChangedAt: { lte: new Date(+now - HANDLE_COOLDOWN) } }] } : {}) },
    data: { ...input, ...(changing ? { handleChangedAt: now } : {}) },
  });
  if (!changed.count) {
    const current = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    throw new HttpError(429, "Username cooldown is active", { handleChangeAvailableAt: dto(current).handleChangeAvailableAt });
  }
  return NextResponse.json(dto(await prisma.user.findUniqueOrThrow({ where: { id: user.id } })));
});
