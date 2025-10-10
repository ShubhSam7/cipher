import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// interface DecodedToken {
//   userId: string;
//   email: string;
//   iat?: number;
//   exp?: number;
// }

// export async function verifyAuth(req: NextRequest): Promise<{
//   success: boolean;
//   userId?: string;
//   email?: string;
//   error?: string;
// }> {
//   try {
//     const token = req.headers.get('token');

//     if (!token) {
//       return { success: false, error: "Authorization token not found" };
//     }

//     if (!process.env.JWT_SECRET) {
//       console.error("JWT_SECRET is not defined");
//       return { success: false, error: "Server configuration error" };
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

//     if (!decoded || !decoded.userId ) {
//       return { success: false, error: "Invalid token payload" };
//     }

//     return {
//       success: true,
//       userId: decoded.userId,
//       email: decoded.email
//     };
//   } catch (e) {
//     if (e instanceof jwt.TokenExpiredError) {
//       return { success: false, error: "Token expired" };
//     } else if (e instanceof jwt.JsonWebTokenError) {
//       return { success: false, error: "Invalid token" };
//     }
//     return { success: false, error: "Authentication failed" };
//   }
// }   

//////////////////////////////////////////////////////////////////
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    if (!token) {
      return { success: false, error: "Token not found" };
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    return {
      success: true,
      userId: payload.userId as string,
      email: payload.email as string
    };
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
}