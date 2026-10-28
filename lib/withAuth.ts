import { NextRequest, NextResponse } from "next/server";
import { routeError } from "@/lib/route";
import { getSession, type Session } from "@/lib/session";

type AuthenticatedHandler = (request: NextRequest, session: Session) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<Response> => {
    const session = await getSession(request);
    if (!session.success) {
      return NextResponse.json({ error: session.error || "Unauthorized" }, { status: 401 });
    }
    try { return await handler(request, session); } catch (error) { return routeError(error); }
  };
}
