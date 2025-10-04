import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function verifyAuth(req: NextRequest): Promise<{
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
}> {
  try {
    const token = req.headers.get('token');

    if (!token) {
      return { success: false, error: "Authorization token not found" };
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return { success: false, error: "Server configuration error" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

    if (!decoded || !decoded.userId ) {
      return { success: false, error: "Invalid token payload" };
    }

    return {
      success: true,
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return { success: false, error: "Token expired" };
    } else if (e instanceof jwt.JsonWebTokenError) {
      return { success: false, error: "Invalid token" };
    }
    return { success: false, error: "Authentication failed" };
  }
}   