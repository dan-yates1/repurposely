import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure dynamic handling

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Check for errors returned in query parameters
  if (errorParam) {
    console.error(`Auth callback error: ${errorParam} - ${errorDescription}`);
    return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(errorDescription || errorParam)}`, request.url));
  }

  // Check if code exists (standard flow)
  if (code) {
    console.log(`Auth callback: Found code parameter: ${code}`);
    try {
      const cookieOptions = { name: `sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF}-auth-token` }; 
      const supabase = createRouteHandlerClient({ cookies }, { cookieOptions });
      
      console.log(`Auth callback: Attempting to exchange code...`);
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Auth callback: Error during code exchange:", exchangeError);
        throw exchangeError; 
      }
      
      console.log("Auth callback successful via code exchange.");
      return NextResponse.redirect(new URL('/dashboard', request.url)); 

    } catch (error) {
      console.error("Error processing auth code:", error);
      return NextResponse.redirect(new URL('/auth?error=Could not authenticate user via code', request.url));
    }
  } 
  
  // Fallback: Check URL fragment for session info (sometimes happens with OAuth)
  // Note: This part might not be directly reachable in Route Handlers as fragments are client-side.
  // However, the auth-helpers might handle this implicitly if configured correctly.
  // If the code above consistently fails without a code, it points to a deeper config issue.
  console.warn("Auth callback called without a code parameter in the search query.");
  
  // Attempt to get session anyway, maybe the helper handled the fragment?
  try {
     const supabase = createRouteHandlerClient({ cookies });
     const { data: { session } } = await supabase.auth.getSession();
     if (session) {
       console.log("Auth callback: Found session via getSession() despite missing code.");
       return NextResponse.redirect(new URL('/dashboard', request.url));
     }
  } catch (error) {
     console.error("Error checking session in callback despite missing code:", error);
  }

  // If neither code nor session found, redirect with error
  console.error("Auth callback failed: No code and no session found.");
  return NextResponse.redirect(new URL('/auth?error=Authentication failed or code missing', request.url));
}
