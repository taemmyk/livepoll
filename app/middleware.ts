import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Simple middleware to protect admin routes
export function middleware(request: NextRequest) {
  // Only check admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for NextAuth.js session cookie - use both secure and non-secure versions
    const hasSession = request.cookies.has('next-auth.session-token') || 
                       request.cookies.has('__Secure-next-auth.session-token');
    
    if (!hasSession) {
      // Redirect to signin page with callback URL
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Specify which routes this middleware applies to
export const config = {
  matcher: ['/admin/:path*'],
}; 