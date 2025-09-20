import { NextRequest, NextResponse } from "next/server";
import client from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Validate required fields
        if (!data.email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Create user with fields from your schema
        const user = await client.user.create({
            data: {
                email: data.email,      // Required field from your schema
                name: data.name || null // Optional field from your schema
                // password: data.password
            }
        });

        return NextResponse.json({
            msg: "User is Signed Up",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch(e){
        console.log(e);
        return console.log("error occured");
    }
}


export function GET(req: NextRequest){
    //const user = await prisma.user.findFirst();

    return NextResponse.json({
        //user: user
        msg: "Shubh was here"
    })
}