import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

export interface Session { userId: string; email: string }
export type AuthResult = ({ success: true } & Session) | { success: false; error: string };
const key = new TextEncoder().encode(env.JWT_SECRET);
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export function signSession(user: { id: string; email: string }) {
  return new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

async function verifySession(token: string | undefined): Promise<AuthResult> {
  if (!token) return { success: false, error: "Token not found" };
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"], requiredClaims: ["exp"] });
    if (typeof payload.userId !== "string" || !payload.userId || typeof payload.email !== "string") {
      return { success: false, error: "Invalid token payload" };
    }
    return { success: true, userId: payload.userId, email: payload.email };
  } catch {
    return { success: false, error: "Invalid or expired token" };
  }
}

export function getSession(request: NextRequest): Promise<AuthResult> {
  return verifySession(request.cookies.get("token")?.value);
}

// For server components, which have no NextRequest.
export async function getServerSession(): Promise<AuthResult> {
  return verifySession((await cookies()).get("token")?.value);
}

export async function setSessionCookie(response: NextResponse, user: { id: string; email: string }) {
  response.cookies.set("token", await signSession(user), { ...cookieOptions, maxAge: 3600 });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set("token", "", { ...cookieOptions, expires: new Date(0), maxAge: 0 });
  return response;
}
