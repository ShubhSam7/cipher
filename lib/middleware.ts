import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// API middleware for authenticating API routes
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
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
    return { success: false, error: "Invalid or expired token" };
  }
}