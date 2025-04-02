import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure dynamic handling

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      console.log("Auth callback successful, session exchanged.");
      // URL to redirect to after successful sign in
      // Redirect to dashboard or intended page
      return NextResponse.redirect(new URL('/dashboard', request.url)); 
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      // URL to redirect to in case of error
      return NextResponse.redirect(new URL('/auth?error=Could not authenticate user', request.url));
    }
  } else {
     console.error("Auth callback called without a code parameter.");
     // URL to redirect to if the code is missing
     return NextResponse.redirect(new URL('/auth?error=Authentication code missing', request.url));
  }
}
