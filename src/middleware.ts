import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is a simplified middleware that doesn't try to use server-side Supabase
// which was causing issues with authentication
export async function middleware(req: NextRequest) {
  console.log('Middleware running for path:', req.nextUrl.pathname);
  
  // For now, we'll just allow all requests to go through
  // Authentication will be handled on the client side
  return NextResponse.next();
}

// Only run middleware on auth and dashboard routes
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
