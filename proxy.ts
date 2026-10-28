import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeNext } from "@/lib/navigation";
import { getSession } from "@/lib/session";

const publicRoutes = new Set(["/", "/signin", "/signup", "/about"]);
// These endpoints must be reachable before a session exists.
const publicApiRoutes = new Set(["/api/v1/signin", "/api/v1/signup"]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (publicApiRoutes.has(pathname)) return NextResponse.next();

  const auth = await getSession(request);
  if (auth.success && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url));
  }
  if (!auth.success && !publicRoutes.has(pathname)) {
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signin = new URL("/signin", request.url);
    signin.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(signin);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static(?:/|$)|_next/image(?:/|$)|(?:icon|favicon\\.ico)$).*)",
  ],
};
