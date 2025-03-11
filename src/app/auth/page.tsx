'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);

    // Check if user is already logged in
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error.message);
          setAuthError('Failed to check authentication status');
          return;
        }
        
        console.log('Auth page session check:', !!data.session);
        
        if (data.session) {
          console.log('User already logged in, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        setAuthError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, redirecting to dashboard');
          // Add a small delay to ensure the session is properly set
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">ContentRemix</h1>
          <p className="mt-2 text-gray-600">Sign in to repurpose your content</p>
        </div>

        {authError && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {authError}
            <button 
              className="ml-2 text-sm underline"
              onClick={() => setAuthError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="mt-8">
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              redirectTo={`${window.location.origin}/dashboard`}
              theme="light"
              onlyThirdPartyProviders={false}
              view="sign_in"
            />
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
