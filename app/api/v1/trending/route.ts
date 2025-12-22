import { middleware } from "@/lib/middleware";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await middleware(req);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const tags = await prisma.hashtag.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { useCount: "desc" },
      take: 3,
    });

    if(!tags){
        return NextResponse.json({
            msg: "No tags such found"
        })
    }

    return NextResponse.json({
        msg: "These are the tags",
        tags
    })
  } catch (e) {
    console.log(e);
  }
}