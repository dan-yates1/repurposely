import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Try to create a server-side Supabase client
    let serverError = null;
    let serverSession = null;
    let serverUser = null;
    
    try {
      const supabase = createServerSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      
      serverSession = sessionData.session;
      serverUser = userData.user;
    } catch (error) {
      serverError = error instanceof Error ? error.message : String(error);
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      server: {
        error: serverError,
        hasSession: !!serverSession,
        hasUser: !!serverUser,
        sessionData: serverSession ? {
          userId: serverSession.user.id,
          email: serverSession.user.email,
          // Add a null check for expires_at
          expiresAt: serverSession.expires_at ? 
            new Date(serverSession.expires_at * 1000).toISOString() : 
            null,
        } : null,
        userData: serverUser ? {
          id: serverUser.id,
          email: serverUser.email,
        } : null,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
