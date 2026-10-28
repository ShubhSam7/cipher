import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { signinSchema } from "@/lib/validation/auth";
import { isAdmin } from "@/lib/admin";
import { setSessionCookie } from "@/lib/session";

// Spend the same password-hashing work when an account does not exist.
const dummyPasswordHash = bcrypt.hashSync("invalid-account-password", 12);

export async function POST(req: NextRequest) {
  try {
    const body = signinSchema.parse(await req.json());
    const user = await client.user.findUnique({
      where: body.step === "email"
        ? { email: body.email }
        : { user_handle: body.user_handle },
    });
    const validPassword = await bcrypt.compare(
      body.password,
      user?.password ?? dummyPasswordHash
    );
    if (!user || !validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({
      message: "User signed in successfully",
      user: { id: user.id, email: user.email, isAdmin: isAdmin(user.email), user_handle: user.user_handle },
    });
    return await setSessionCookie(response, user);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
