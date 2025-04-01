'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react'; // Removed Appearance type import
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Navbar } from '@/components/ui/navbar'; // Import Navbar
import { Footer } from '@/components/ui/footer'; // Import Footer

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

          // If checkout parameters exist, they will be stored in localStorage below.
          // No immediate redirect here. Just go to dashboard if already logged in.
          // The checkout flow will resume after login if intent is stored.
          if (!(checkoutPrice && checkoutPlan)) {
             router.push('/dashboard');
          } else {
             console.log('User already logged in, checkout intent will be handled by Pricing page resume logic or after manual navigation.');
             // Redirect to dashboard. The pricing page useEffect will handle resume if needed.
             router.push('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error in auth page:', err);
        setAuthError('An unexpected error occurred');
      }
    };

    checkUser();

    // Store checkout intent if parameters exist and user is NOT logged in
    // (checkUser handles the logged-in case)
    const storeIntentIfNotLoggedIn = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session && checkoutPrice && checkoutPlan) {
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
    };
    storeIntentIfNotLoggedIn();

  }, [router, checkoutPrice, checkoutPlan]);

  // Handle auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, checking for checkout intent...');

          // Check if we have a stored checkout intent
          try {
            const storedIntent = localStorage.getItem('checkout_intent');
            if (storedIntent) {
              // We only need planName for logging here. Pricing page reads the full intent.
              const { planName } = JSON.parse(storedIntent); 
              console.log('Found stored checkout intent for:', planName, '- redirecting to pricing page to resume.');

              // Redirect back to pricing page with a flag to resume.
              // Pricing page useEffect will read the intent from localStorage and then remove it.
              router.push(`/pricing?resume_checkout=true`); 
              return; // Important: stop execution here to prevent dashboard redirect
            } else {
              console.log('No checkout intent found.');
            }
          } catch (err) {
            console.error('Error processing stored checkout intent:', err);
          }

          // No checkout intent, go to dashboard
          console.log('Redirecting signed-in user to dashboard.');
          router.push('/dashboard');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Define custom appearance (will customize further later)
  // Removed Appearance type annotation
  const customAppearance = {
    theme: ThemeSupa, // Start with the default theme
    variables: {
      default: {
        colors: {
          brand: 'var(--primary)', // Use CSS variable for primary color
          brandAccent: 'var(--primary-hover)', // Use CSS variable for hover color
          // Add other color overrides if needed
        },
        // Override fonts, borders, etc. if needed
        // fonts: { ... },
        // radii: { ... },
      },
    },
    // Add class overrides to match app components
    className: {
      button: 'rounded-lg font-medium transition-colors py-2 px-4 text-sm', // Base button styles from Button component
      // Apply input styling similar to other inputs in the app (assuming standard Tailwind form styles)
      input: 'block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3',
      label: 'block text-sm font-medium text-gray-700',
      // Add more overrides as needed for anchors, containers, messages, etc.
      // anchor: 'text-indigo-600 hover:text-indigo-800',
      // container: 'space-y-4',
      // message: 'text-sm text-red-600', // Example for error messages
    }
  };


  return (
    <div className="flex min-h-screen flex-col"> {/* Removed centering/gradient */}
      <Navbar /> {/* Add Navbar */}
      <main className="flex flex-grow items-center justify-center p-4 bg-gray-50"> {/* Added main content area */}
        {/* Removed decorative elements as they might clash with Navbar/Footer */}

        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200"> {/* Adjusted styles */}
          <div className="text-center">
            <div className="mb-4 text-center"> {/* Reduced margin */}
              <Logo text={true} large={true} className="inline-block" />
            </div>
            <p className="text-gray-600">Sign in or create an account</p> {/* Simplified text */}
          </div>

          {authError && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {authError}
          </div>
        )}

        <Auth
          supabaseClient={supabase}
          appearance={customAppearance} // Apply custom appearance
          theme="light" // Keep light theme for now
          providers={[]}
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
          // socialLayout="horizontal" // Optional: Change social provider layout
        />

        <div className="mt-4 text-center"> {/* Reduced margin */}
          <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
    <Footer /> {/* Add Footer */}
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
