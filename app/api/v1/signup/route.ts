import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import nodemailer from "nodemailer";
import crypto from "crypto";

const allowedBranches = ["cse", "csa", "csd", "csh", "ece", "iot"];

const validEmail = z.string().refine(
  (email) => {
    const match = email.match(/^bt(\d{2})([a-z]{3})(\d{3})@iiitn\.ac\.in$/);
    if (!match) return false;
    const [, year, branch] = match;
    return allowedBranches.includes(branch);
  },
  { message: "Invalid IIITN email format" }
);

const signupSchema = z.object({
  email: validEmail,
  step: z.enum(["send-otp", "verify-otp", "complete-signup"]),
});

const verifyOtpSchema = z.object({
  email: validEmail,
  otp: z.string().length(6),
  step: z.literal("verify-otp"),
});

const completeSignupSchema = z.object({
  email: validEmail,
  user_handle: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Invalid user handle"),
  password: z.string().min(8),
  step: z.literal("complete-signup"),
});

const otpStore = new Map<string, { otp: string; expires: number; verified: boolean }>();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step } = signupSchema.parse(body);

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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Validation failed", details: error },
      { status: 400 }
    );
  }
}

async function sendOTP(body: any) {
  const { email } = body;
  
  try {
    // Check if user already exists
    const existingUser = await client.user.findFirst({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { otp, expires, verified: false });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "IIIT Nagpur Cipher - Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to IIIT Nagpur Platform Cipher</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "OTP sent successfully",
      email: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

async function verifyOTP(body: any) {
  const { email, otp } = verifyOtpSchema.parse(body);

  const storedOTP = otpStore.get(email);
  if (!storedOTP) {
    return NextResponse.json({ error: "OTP not found" }, { status: 400 });
  }

  if (Date.now() > storedOTP.expires) {
    otpStore.delete(email);
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  if (storedOTP.otp !== otp) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  // Mark as verified
  otpStore.set(email, { ...storedOTP, verified: true });
  
  return NextResponse.json({ message: "OTP verified successfully" });
}

async function completeSignup(body: any) {
  const { email, user_handle, password } = completeSignupSchema.parse(body);

  // Check OTP verification
  const storedData = otpStore.get(email);
  if (!storedData || !storedData.verified) {
    return NextResponse.json({ error: "Email not verified" }, { status: 400 });
  }

  try {
    // Check if username is taken
    const existingHandle = await client.user.findFirst({
      where: { user_handle },
    });
    if (existingHandle) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Extract year and branch from email
    const match = email.match(/^bt(\d{2})([a-z]{3})(\d{3})@iiitn\.ac\.in$/);
    const year = match ? `20${match[1]}` : null;
    const branch = match ? match[2].toUpperCase() : null;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await client.user.create({
      data: {
        email,
        user_handle,
        password: hashedPassword,
        year
      },
    });

    // Clean up OTP
    otpStore.delete(email);

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        user_handle: user.user_handle,
        year: user.year
      },
      redirectTo: "/feed",
    });
  } catch (error) {
    console.error("Complete signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}