'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

// Component that uses useSearchParams
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Capture checkout parameters if they exist
  const checkoutPrice = searchParams.get('checkout_price');
  const checkoutPlan = searchParams.get('checkout_plan');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error.message);
          setAuthError('Failed to check authentication status');
          return;
        }
        
        console.log('Auth page session check:', !!data.session);
        
        if (data.session) {
          console.log('User already logged in');
          
          // If checkout parameters exist, immediately redirect to handle checkout
          if (checkoutPrice && checkoutPlan) {
            console.log('Redirecting to initiate checkout with plan:', checkoutPlan);
            router.push(`/api/stripe/direct-checkout?priceId=${checkoutPrice}&planName=${checkoutPlan}`);
          } else {
            // No checkout intent, go to dashboard
            router.push('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error in auth page:', err);
        setAuthError('An unexpected error occurred');
      }
    };

    checkUser();
    
    // Store checkout intent if parameters exist
    if (checkoutPrice && checkoutPlan) {
      try {
        localStorage.setItem('checkout_intent', JSON.stringify({
          priceId: checkoutPrice,
          planName: checkoutPlan
        }));
        console.log('Stored checkout intent for:', checkoutPlan);
      } catch (err) {
        console.error('Failed to store checkout intent:', err);
      }
    }
  }, [router, checkoutPrice, checkoutPlan]);

  // Handle auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, redirecting');
          
          // Check if we have a stored checkout intent
          try {
            const storedIntent = localStorage.getItem('checkout_intent');
            if (storedIntent) {
              const { priceId, planName } = JSON.parse(storedIntent);
              console.log('Found stored checkout intent for:', planName);
              
              // Redirect to handle checkout
              router.push(`/api/stripe/direct-checkout?priceId=${priceId}&planName=${planName}`);
              return;
            }
          } catch (err) {
            console.error('Error processing stored checkout intent:', err);
          }
          
          // No checkout intent, go to dashboard
          router.push('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-500 to-purple-600 transform -skew-y-6 -translate-y-36 opacity-20"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400 rounded-full opacity-10 animate-float" style={{ animationDelay: "1s" }}></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400 rounded-full opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>
      
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-xl relative z-10 border border-gray-100 animate-fadeIn">
        <div className="text-center">
          <div className="mb-6 animate-slideDown text-center">
            <Logo text={true} large={true} className="inline-block" />
          </div>
          <p className="mt-2 text-gray-600 animate-slideDown" style={{ animationDelay: "0.2s" }}>Sign in to create amazing content</p>
        </div>

        {authError && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {authError}
          </div>
        )}
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
          redirectTo={`${window.location.origin}/auth/callback`}
        />

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

// Main component with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
