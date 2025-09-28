import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const user = await req.json();

    if (!user.email || !user.password) {
      return NextResponse.json(
        { error: "Email & Password is required" },
        { status: 400 }
      );
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const sign = await client.user.create({
        data: {
            email: user.email,
            user_handle: user.user_handle || null,
            password: hashedPassword,
        }
    });

    return NextResponse.json({
      msg: "User is Signed Up",
      user: sign
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ 
        msg : "error occured"
    });
  }
}

export async function GET(req: NextRequest) {
  const user = await client.user.findFirst();

  return NextResponse.json({
        user: user,
        msg: "Shubh was here",
  });
}
