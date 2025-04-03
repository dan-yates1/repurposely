"use client"; // Keep this directive here

// Removed Metadata import
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react"; // Keep Suspense if used within client logic
import { Footer } from "@/components/ui/footer";
import { CheckoutButton } from "@/components/ui/checkout-button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Navbar } from "@/components/ui/navbar";
import { Skeleton } from "@/components/ui/skeleton";

type BillingPeriod = "monthly" | "annual";

// Define plan amounts (IDs will come from env vars)
const planAmounts = {
  monthly: { pro: 9.99, enterprise: 29.99 },
  annual: { pro: 99, enterprise: 280 },
};

// Renamed the component (was PricingContent)
export default function PricingClient() {
  // All the original client-side logic remains here
  const [mounted, setMounted] = useState(false);
  const [processingResume, setProcessingResume] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook requires "use client"

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
    // Return the skeleton directly here, no need for Suspense inside the client component
    return <PricingSkeleton />;
  }

  // The original JSX return remains here
  return (
     <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <section className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Simple, Flexible Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. Pay monthly or save with annual billing.
          </p>
          {/* Toggle Switch */}
          <div className="inline-block bg-gray-100 rounded-full p-1 shadow-inner mb-12">
            <div className="flex">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                  billingPeriod === "annual"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Annual (Save ~20%)
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
                  {/* No period needed for free */}
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
                  {/* Removed quality analyses list item */}
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
                    {/* Update Free plan - Image Gen N/A */}
                    <span className="text-gray-700 text-gray-400 line-through">
                      Image Generation
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
                  <span className="text-5xl font-bold text-indigo-600">
                    ${billingPeriod === "monthly" ? planAmounts.monthly.pro : Math.round(planAmounts.annual.pro / 12)}
                  </span>
                  <span className="text-gray-500 ml-2">
                    /month{billingPeriod === "annual" ? " (billed annually)" : ""}
                  </span>
                </div>
                {billingPeriod === "annual" && (
                  <p className="text-sm text-gray-500 mb-2">
                    Total ${planAmounts.annual.pro}/year
                  </p>
                )}
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
                  {/* Removed quality analyses list item */}
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
                    {/* Update Pro plan - 50 images @ 10 tokens */}
                    <span className="text-gray-700">
                      Up to 50 image generations (10 tokens each)
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
                  // Use environment variables for Price IDs
                  priceId={billingPeriod === "monthly"
                    ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!
                    : process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID!
                  }
                  planName="PRO"
                  className="w-full py-3 text-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
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
                   <span className="text-5xl font-bold text-indigo-600">
                    ${billingPeriod === "monthly" ? planAmounts.monthly.enterprise : Math.round(planAmounts.annual.enterprise / 12)}
                  </span>
                  <span className="text-gray-500 ml-2">
                    /month{billingPeriod === "annual" ? " (billed annually)" : ""}
                  </span>
                </div>
                 {billingPeriod === "annual" && (
                  <p className="text-sm text-gray-500 mb-2">
                    Total ${planAmounts.annual.enterprise}/year
                  </p>
                )}
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
                  {/* Removed quality analyses list item */}
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
                    {/* Update Enterprise plan - 200 images @ 10 tokens */}
                    <span className="text-gray-700">
                      Up to 200 image generations (10 tokens each)
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
                {/* Changed CheckoutButton to a Link for Enterprise */}
                <Link href="/contact">
                   <Button
                     variant="primary" // Use primary variant for consistency
                     className="w-full py-3 text-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                   >
                     Contact Sales
                   </Button>
                </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"> {/* Adjusted grid columns */}
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

            {/* Removed the empty div for Quality Analysis */}

            <div className="bg-white p-6 rounded-xl shadow-sm"> {/* This is now the 2nd box */}
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2 {/* Renumbered */}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Image Generation</h3>
              <p className="text-gray-600 mb-2">
                Create images to complement your content (Pro/Enterprise only)
              </p>
              <p className="text-indigo-600 font-semibold">
                10 tokens per image
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3 {/* Renumbered */}
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
                  <li>• Up to 50 text repurposes (50 tokens)</li>
                  {/* Removed quality analyses */}
                  <li>• Image Generation N/A</li>
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
                  <li>• Up to 500 text repurposes (500 tokens)</li>
                  {/* Removed quality analyses */}
                  <li>• 0 images (0 tokens)</li> {/* Example assumes no images used, adjust if needed */}
                  <li className="text-indigo-600 font-medium pt-2">
                    Total: 500 tokens (Pro plan) {/* Example calculation */}
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Marketing Agency
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Up to 1500 text repurposes (1500 tokens)</li>
                  {/* Removed quality analyses */}
                  <li>• 50 images (500 tokens)</li> {/* Example: 50 images * 10 tokens */}
                  <li>• 0 videos (0 tokens)</li> {/* Example assumes no videos */}
                  <li className="text-indigo-600 font-medium pt-2">
                    Total: 2000 tokens (Enterprise plan) {/* Example calculation */}
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
            {/* Changed CTA link for Enterprise/Contact Sales */}
            <Link href="/contact">
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

// Skeleton loader for the pricing page
function PricingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Skeleton Navbar (simplified) */}
      <nav className="bg-white py-4 border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[40px]">
             <Skeleton className="h-8 w-32" />
             <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </nav>

      {/* Skeleton Header */}
      <section className="py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-xl mx-auto mb-8" />
          <Skeleton className="h-10 w-64 mx-auto mb-12 rounded-full" />
        </div>
      </section>

      {/* Skeleton Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl mt-4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other sections could also have skeletons, but this covers the main content */}
       <Skeleton className="h-96 w-full" /> {/* Placeholder for lower sections */}
    </div>
  );
}
