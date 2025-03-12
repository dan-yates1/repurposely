'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

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
        
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
          console.log('User signed in, redirecting to dashboard');
          // Add a small delay to ensure the session is properly set
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-500 to-purple-600 transform -skew-y-6 -translate-y-36 opacity-20"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400 rounded-full opacity-10 animate-float" style={{ animationDelay: "1s" }}></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400 rounded-full opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>
      
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-xl relative z-10 border border-gray-100 animate-fadeIn">
        <div className="text-center">
          <div className="flex justify-center mb-4 animate-slideDown">
            <Logo className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-slideDown" style={{ animationDelay: "0.1s" }}>ContentRemix</h1>
          <p className="mt-2 text-gray-600 animate-slideDown" style={{ animationDelay: "0.2s" }}>Sign in to create amazing content</p>
        </div>

        {authError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 animate-fadeIn flex justify-between items-center">
            <span>{authError}</span>
            <button 
              className="ml-2 text-sm text-red-500 hover:text-red-700 transition-colors"
              onClick={() => setAuthError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-8 animate-pulse">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="mt-8 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#4f46e5',
                      brandAccent: '#4338ca',
                      brandButtonText: 'white',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '0.5rem',
                      buttonBorderRadius: '0.5rem',
                      inputBorderRadius: '0.5rem',
                    },
                  },
                },
                className: {
                  button: 'rounded-lg hover:shadow-md transition-all duration-200',
                  input: 'rounded-lg border-gray-200',
                  label: 'text-gray-600',
                },
              }}
              providers={['google']}
              redirectTo={`${window.location.origin}/auth`}
              theme="light"
              onlyThirdPartyProviders={false}
              view="sign_in"
            />
          </div>
        )}

        <div className="mt-6 text-center animate-fadeIn" style={{ animationDelay: "0.4s" }}>
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
