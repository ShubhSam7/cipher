import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/generated/prisma/prisma"

export async function POST(req: NextRequest){
    const data = await req.json();

    await prisma.User.create({
        data: {
            username: data.username,
            password: data.password
        }
    })

    return NextResponse.json({
            msg: "User is Signed Up"
    })
}