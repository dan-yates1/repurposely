'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { Logo } from '@/components/ui/logo';
import { Navbar } from '@/components/ui/navbar'; 
import { Footer } from '@/components/ui/footer'; 
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input';   
import { Label } from '@/components/ui/label';   
import { Loader2 } from 'lucide-react'; 
import toast, { Toaster } from 'react-hot-toast'; 

// Component that uses useSearchParams
function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [isSignUp, setIsSignUp] = useState(true); // Default to sign-up initially
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); 

  // Capture checkout parameters if they exist
  const checkoutPrice = searchParams.get('checkout_price');
  const checkoutPlan = searchParams.get('checkout_plan');

  // Check if user is already logged in (runs once on mount)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('User already logged in, redirecting to dashboard.');
          router.push('/dashboard'); 
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };
    checkUser();
  }, [router]);

  // Set initial view based on query param after mount
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'signin') { 
      setIsSignUp(false);
    } 
  }, [searchParams]); 

  // Store checkout intent if parameters exist (runs once on mount)
  useEffect(() => {
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
  }, [checkoutPrice, checkoutPlan]);


  // Handle auth state change for redirect after sign-in/sign-up confirmation
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, checking for checkout intent...');
          try {
            const storedIntent = localStorage.getItem('checkout_intent');
            if (storedIntent) {
              const { planName } = JSON.parse(storedIntent); 
              console.log('Found stored checkout intent for:', planName, '- redirecting to pricing page to resume.');
              router.push(`/pricing?resume_checkout=true`); 
              return; 
            } else {
              console.log('No checkout intent found.');
            }
          } catch (err) {
            console.error('Error processing stored checkout intent:', err);
          }
          console.log('Redirecting signed-in user to dashboard.');
          router.push('/dashboard');
        }
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, 
        },
      });

      if (signUpError) {
        throw signUpError;
      }
      
      setMessage('Sign-up successful! Please check your email to confirm your account.');
      toast.success('Sign-up successful! Check your email.');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      console.error('Sign up error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during sign up.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setLoading(true);
     setError(null);
     setMessage(null);

     try {
       const { error: signInError } = await supabase.auth.signInWithPassword({
         email,
         password,
       });

       if (signInError) {
         if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password.');
         }
         throw signInError;
       }
       console.log('Sign in attempt successful, waiting for redirect...');

     } catch (err) {
       console.error('Sign in error:', err);
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during sign in.';
       setError(errorMessage);
       toast.error(errorMessage);
     } finally {
       setLoading(false);
     }
   };
 
   // Handle Google Sign In
   const handleGoogleSignIn = async () => {
     console.log("handleGoogleSignIn called"); // Add log
     setLoading(true); 
     setError(null);
     setMessage(null);
     try {
       console.log("Attempting supabase.auth.signInWithOAuth..."); // Add log
       // Removed the options object entirely to rely on Supabase default redirect behavior
       const { error } = await supabase.auth.signInWithOAuth({
         provider: 'google'
       });
       console.log("signInWithOAuth call completed. Error:", error); // Add log
       if (error) throw error;
       console.log("Google sign-in initiated, redirect should happen."); // Add log
     } catch (err) {
       console.error('Google Sign in error:', err);
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during Google sign in.';
       setError(errorMessage);
       toast.error(errorMessage);
       setLoading(false); 
     } 
   };
 
   return (
     <div className="flex min-h-screen flex-col"> 
      <Navbar /> 
      <main className="flex flex-grow items-center justify-center p-4 bg-gray-50"> 
        <Toaster position="top-center" />
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200"> 
          <div className="text-center">
            <div className="mb-4 text-center"> 
              <Logo text={true} large={true} className="inline-block" />
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h2>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          {message && (
             <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
               {message}
             </div>
           )}

          <form className="space-y-6" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
            )}

            <div>
              <Button className="w-full flex justify-center" disabled={loading}> 
                {loading && <Loader2 className="animate-spin h-5 w-5 mr-3" />}
                {isSignUp ? 'Sign up' : 'Sign in'}
             </Button>
             </div>
           </form>
 
           {/* Divider */}
           <div className="relative my-6">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
               <div className="w-full border-t border-gray-300" />
             </div>
             <div className="relative flex justify-center text-sm">
               <span className="bg-white px-2 text-gray-500">OR</span>
             </div>
           </div>
 
           {/* Google Sign In Button */}
           <div>
             <Button 
               variant="outline" 
               className="w-full flex justify-center items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50" // Adjusted styling
               onClick={handleGoogleSignIn}
               disabled={loading} 
             >
               {/* Use Image component for the logo */}
               <Image src="/google.svg" alt="Google logo" width={18} height={18} />
               Sign in with Google 
             </Button>
           </div>
 
           <div className="text-sm text-center mt-6"> 
            <button
              onClick={() => { 
                setIsSignUp(!isSignUp); 
                setError(null); 
                setMessage(null); 
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-4 text-center"> 
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer /> 
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
