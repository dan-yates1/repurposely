"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { Footer } from "@/components/ui/footer";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Navbar } from "@/components/ui/navbar";

// Create a client component that uses useSearchParams
function PricingContent() {
  // Client-side code only
  const [mounted, setMounted] = useState(false);
  const [processingResume, setProcessingResume] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    // Check authentication status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      // Check for resume_checkout parameter and resume checkout if needed
      const resumeCheckout = searchParams.get('resume_checkout');
      const checkoutCancelled = searchParams.get('checkout') === 'cancelled';
      
      if (checkoutCancelled) {
        toast.error("Checkout was cancelled. You can try again when you're ready.");
      }
      
      // Only proceed if user is authenticated and we have a resume parameter
      if (resumeCheckout === 'true' && data.session && !processingResume) {
        setProcessingResume(true);
        
        try {
          // Get the stored checkout intent from localStorage
          const storedIntent = localStorage.getItem('checkout_intent');
          if (storedIntent) {
            const { priceId, planName } = JSON.parse(storedIntent);
            console.log('Resuming checkout with:', { priceId, planName });
            
            // Clear stored intent
            localStorage.removeItem('checkout_intent');
            
            // Create checkout session
            const response = await fetch("/api/stripe/create-checkout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                priceId,
                planName,
              }),
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
              throw new Error(responseData.error || "Failed to create checkout session");
            }
            
            // Redirect to Stripe Checkout
            window.location.href = responseData.checkoutUrl;
          } else {
            console.log('No checkout intent found in localStorage');
          }
        } catch (error) {
          console.error('Error resuming checkout:', error);
          toast.error("Failed to resume checkout. Please try again.");
        } finally {
          setProcessingResume(false);
        }
      }
    };
    
    checkAuth();
  }, [supabase.auth, searchParams, router, processingResume]);

  // Only render animations if client-side
  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="bg-indigo-600 py-24 min-h-screen flex items-center justify-center">
          <div className="text-white text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <section className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Simple, Token-Based Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Pay only for what you use with our flexible token system
          </p>
          <div className="inline-block bg-white rounded-full p-1 shadow-md mb-12">
            <div className="flex">
              <button className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium">
                Monthly
              </button>
              <button className="px-6 py-2 rounded-full text-gray-700 font-medium">
                Annual (Save 20%)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Free
                </h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-5xl font-bold text-indigo-600">$0</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                
                <p className="text-gray-600 mb-8">
                  Perfect for getting started and trying out the platform.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      50 text repurposes (1 token each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      25 quality analyses (2 tokens each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      10 image generations (5 tokens each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Basic output formats</span>
                  </li>
                </ul>
                <Link href="/auth">
                  <Button
                    variant="outline"
                    className="w-full py-3 text-center border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50"
                  >
                    Get Started for Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white py-1 px-4 rounded-bl-lg font-medium">
                Most Popular
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Pro
                </h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-5xl font-bold text-indigo-600">$19</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                
                <p className="text-gray-600 mb-8">
                  For professionals who need more tokens and capabilities.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      500 text repurposes (1 token each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      250 quality analyses (2 tokens each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      100 image generations (5 tokens each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Advanced tone settings
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">Priority support</span>
                  </li>
                </ul>
                
                <CheckoutButton
                  priceId="price_pro" // Replace with your actual Stripe Price ID
                  planName="PRO"
                  className="w-full py-3 text-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Upgrade to Pro
                </CheckoutButton>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Enterprise
                </h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-5xl font-bold text-indigo-600">$49</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                
                <p className="text-gray-600 mb-8">
                  For high-volume users and businesses.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      2000 text repurposes (1 token each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      1000 quality analyses (2 tokens each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      400 image generations (5 tokens each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      50 video processing (10 tokens each)
                    </span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-indigo-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">
                      Dedicated account manager
                    </span>
                  </li>
                </ul>
                
                <CheckoutButton
                  priceId="price_enterprise" // Replace with your actual Stripe Price ID
                  planName="ENTERPRISE"
                  className="w-full py-3 text-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Choose Enterprise
                </CheckoutButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Usage Section */}
      <section className="py-16 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How Tokens Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple token system gives you flexibility to use Repurposely
              however you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Text Repurpose</h3>
              <p className="text-gray-600 mb-2">
                Transform any text content into a new format
              </p>
              <p className="text-indigo-600 font-semibold">
                1 token per transformation
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quality Analysis</h3>
              <p className="text-gray-600 mb-2">
                Get AI feedback on content quality and suggestions
              </p>
              <p className="text-indigo-600 font-semibold">
                2 tokens per analysis
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                5
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Image Generation</h3>
              <p className="text-gray-600 mb-2">
                Create images to complement your content
              </p>
              <p className="text-indigo-600 font-semibold">
                5 tokens per image
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                10
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Video Processing</h3>
              <p className="text-gray-600 mb-2">
                Process and enhance video content
              </p>
              <p className="text-indigo-600 font-semibold">
                10 tokens per video
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
              Token Usage Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Social Media Manager
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 30 text repurposes (30 tokens)</li>
                  <li>• 10 quality analyses (20 tokens)</li>
                  <li>• 0 images/videos (0 tokens)</li>
                  <li className="text-indigo-600 font-medium pt-2">
                    Total: 50 tokens (Free plan)
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Content Creator
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 200 text repurposes (200 tokens)</li>
                  <li>• 50 quality analyses (100 tokens)</li>
                  <li>• 40 images (200 tokens)</li>
                  <li className="text-indigo-600 font-medium pt-2">
                    Total: 500 tokens (Pro plan)
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Marketing Agency
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 800 text repurposes (800 tokens)</li>
                  <li>• 300 quality analyses (600 tokens)</li>
                  <li>• 100 images (500 tokens)</li>
                  <li>• 10 videos (100 tokens)</li>
                  <li className="text-indigo-600 font-medium pt-2">
                    Total: 2000 tokens (Enterprise plan)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Do unused tokens roll over?
              </h3>
              <p className="text-gray-600">
                No, tokens reset at the beginning of each billing cycle. This
                helps us maintain our infrastructure and provide consistent
                service quality.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Can I upgrade my plan mid-month?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade at any time. Your new token allocation will
                be immediately available, and your billing will be prorated.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                What happens if I run out of tokens?
              </h3>
              <p className="text-gray-600">
                You can purchase additional token packs or upgrade to a higher
                plan. We&apos;ll notify you when you&apos;re running low on
                tokens.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Is there a limit to how many tokens I can use per day?
              </h3>
              <p className="text-gray-600">
                There&apos;s no daily limit. You can use your entire monthly
                allocation in one day if needed, giving you maximum flexibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your content?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of content creators who are using Repurposely to
            create better content faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth">
              <Button
                variant="secondary"
                size="lg"
                className="px-8 py-4 text-indigo-600 font-semibold"
              >
                Start for Free
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-white border-white hover:bg-white/10 font-semibold"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
export default function Pricing() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading pricing...</div>}>
      <PricingContent />
    </Suspense>
  );
}
