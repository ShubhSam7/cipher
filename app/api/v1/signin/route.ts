import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import z from 'zod'

const signin_with_email = async(body: any) => {
  const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const user = await client.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "password error" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json(
      {
        message: "User signed in successfully",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_handle,
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 // 1 hour
    });

    return response;
}

const signin_with_username = async(body: any) => {
  const { user_handle, password } = body;

    if (!user_handle || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }
    const user = await client.user.findUnique({
      where: { user_handle }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "password error" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json(
      {
        message: "User signed in successfully",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_handle,
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 // 1 hour
    });

    return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stepSchema = z.object({
      step: z.enum(["email", "username"])
    });
    const { step } = stepSchema.parse(body);

    switch (step) {
      case "email":
          return await signin_with_email(body);
      case "username":
          return await signin_with_username(body);
      default:
        return NextResponse.json({
          msg: "Choose the right step"
        }, {status: 400})
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}