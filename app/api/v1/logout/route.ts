import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  return clearSessionCookie(NextResponse.json({ message: "Logged out successfully", success: true }));
}
