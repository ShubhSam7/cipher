import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define route categories
  const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isProtectedRoute = pathname.startsWith('/feed') ||
                          pathname.startsWith('/community') ||
                          pathname.startsWith('/message') ||
                          pathname.startsWith('/profile') ||
                          pathname.startsWith('/upload') || 
                          pathname.startsWith('/postlikes')

  // Check if user is authenticated
  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );
      isAuthenticated = true;
    } catch {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // Redirect authenticated users away from auth pages to /feed
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Redirect unauthenticated users from protected routes to /signin
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/signin',
    '/signup',
    '/feed/:path*',
    '/community/:path*',
    '/message/:path*',
    '/profile/:path*',
    '/upload/:path*', 
    '/postlikes/:path*'
  ]
};
