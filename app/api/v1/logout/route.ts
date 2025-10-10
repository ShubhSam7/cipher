import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextResponse){
    try{
        const c_storage = cookies();

        const response = NextResponse.json({
            message: "Logged out successfully",
            success: true
        }, {status: 200})

        response.cookies.set('token', "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            path: "/",
            expires: new Date(0)
        })

        return response;
    }
    catch(e){
        console.error("Logout failed:", e)
        return NextResponse.json(
            {
                error: "Failed to logout",
                success: false
            },
            {
                status: 500
            }
        )
    }
}