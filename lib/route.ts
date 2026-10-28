import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
export class HttpError extends Error { constructor(public status: number, message: string, public extra: Record<string, unknown> = {}) { super(message); } }
export function segment(req: NextRequest, after: string) { const parts = new URL(req.url).pathname.split("/"); return decodeURIComponent(parts[parts.indexOf(after) + 1] ?? ""); }
export function routeError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message, ...error.extra }, { status: error.status });
  if (error instanceof z.ZodError || error instanceof SyntaxError) return NextResponse.json({ error: error instanceof z.ZodError ? error.issues[0].message : "Invalid JSON" }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  console.error("Request failed", error);
  return NextResponse.json({ error: "Request failed" }, { status: 500 });
}
