import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import crypto from "node:crypto";
import { signupSchema, iiitnEmailPattern, type SendOtpInput, type VerifyOtpInput, type CompleteSignupInput } from "@/lib/validation/auth";
import { sendOtpEmail } from "@/lib/mail";
import { isAdmin } from "@/lib/admin";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = signupSchema.parse(await req.json());
    const { step } = body;

    switch (step) {
      case "send-otp":
        return await sendOTP(body);
      case "verify-otp":
        return await verifyOTP(body);
      case "complete-signup":
        return await completeSignup(body);
      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

async function sendOTP(body: SendOtpInput) {
  const { email } = body;

  try {
    const existingUser = await client.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
    const now = new Date();
    const data = {
      otp: crypto.createHash("sha256").update(otp).digest("hex"),
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      lastSentAt: now,
      attempts: 0,
      verified: false,
    };

    // Creation and resends are gated in the database, including concurrent requests.
    const created = await client.verificationToken.createMany({
      data: [{ email, ...data }],
      skipDuplicates: true,
    });
    if (created.count === 0) {
      const resent = await client.verificationToken.updateMany({
        where: {
          email,
          lastSentAt: { lte: new Date(now.getTime() - 60_000) },
        },
        data,
      });
      if (resent.count === 0) {
        return NextResponse.json(
          { error: "Please wait 60 seconds before requesting another OTP" },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    }

    // Send email
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      message: "OTP sent successfully",
      email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

async function verifyOTP(body: VerifyOtpInput) {
  const { email, otp } = body;
  const storedOTP = await client.verificationToken.findUnique({ where: { email } });
  if (!storedOTP) {
    return NextResponse.json({ error: "OTP not found" }, { status: 400 });
  }
  if (Date.now() >= storedOTP.expiresAt.getTime()) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }
  if (storedOTP.attempts >= 5) {
    return NextResponse.json({ error: "Too many attempts. Request a new OTP" }, { status: 429 });
  }

  const suppliedHash = crypto.createHash("sha256").update(otp).digest();
  const storedHash = Buffer.from(storedOTP.otp, "hex");
  const matches = storedHash.length === suppliedHash.length &&
    crypto.timingSafeEqual(storedHash, suppliedHash);

  // Conditional writes prevent parallel attempts or resends from bypassing the limit.
  const where = {
    id: storedOTP.id,
    otp: storedOTP.otp,
    lastSentAt: storedOTP.lastSentAt,
    verified: false,
    attempts: { lt: 5 },
    expiresAt: { gt: new Date() },
  };
  if (!matches) {
    const attempt = await client.verificationToken.updateMany({
      where,
      data: { attempts: { increment: 1 } },
    });
    if (attempt.count === 0) {
      return NextResponse.json({ error: "OTP unavailable. Request a new OTP" }, { status: 429 });
    }
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }
  if (storedOTP.verified) {
    return NextResponse.json({ message: "OTP verified successfully" });
  }
  const verified = await client.verificationToken.updateMany({
    where,
    data: { verified: true },
  });
  if (verified.count === 0) {
    return NextResponse.json({ error: "OTP unavailable. Request a new OTP" }, { status: 400 });
  }
  return NextResponse.json({ message: "OTP verified successfully" });
}

async function completeSignup(body: CompleteSignupInput) {
  const { email, user_handle, password } = body;

  // Check OTP verification
  const storedData = await client.verificationToken.findUnique({
    where: { email },
  });
  if (!storedData || !storedData.verified || storedData.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Email not verified" }, { status: 400 });
  }

  try {
    // Check if username is taken
    const existingHandle = await client.user.findFirst({
      where: { user_handle },
    });
    if (existingHandle) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Extract year from email
    const match = email.match(iiitnEmailPattern);
    const year = match ? `20${match[1]}` : null;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Consume the unexpired verification grant and create the account atomically.
    const user = await client.$transaction(async (tx) => {
      const consumed = await tx.verificationToken.deleteMany({
        where: {
          id: storedData.id,
          otp: storedData.otp,
          lastSentAt: storedData.lastSentAt,
          verified: true,
          expiresAt: { gt: new Date() },
        },
      });
      if (consumed.count === 0) return null;
      return tx.user.create({
        data: { email, user_handle, password: hashedPassword, year },
      });
    });
    if (!user) {
      return NextResponse.json({ error: "Email verification expired or already used" }, { status: 400 });
    }

    const response = NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        isAdmin: isAdmin(user.email), user_handle: user.user_handle,
        year: user.year,
      },
      redirectTo: "/feed",
    });
    return await setSessionCookie(response, user);
  } catch (error) {
    console.error("Complete signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
