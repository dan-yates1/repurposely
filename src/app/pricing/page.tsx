// Keep Metadata import for server-side export
import type { Metadata } from "next";
import { Suspense } from "react"; // Keep Suspense for wrapping client component
// Import the client component
import PricingClient from "@/components/pricing/pricing-client";
// Import Skeleton for the fallback
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/ui/navbar"; // Keep Navbar if skeleton uses it

// Keep page-specific metadata export (Server Component)
export const metadata: Metadata = {
  title: "Pricing Plans | Repurposely",
  description: "Choose the perfect Repurposely plan. Flexible monthly and annual options with generous token allowances for content repurposing and AI image generation.",
  alternates: {
    canonical: "/pricing",
  },
};

// Keep the skeleton component here for the Suspense fallback
function PricingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Skeleton Navbar (simplified) */}
      <Navbar /> {/* Assuming Navbar is okay in Server Component or doesn't break skeleton */}

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

// This is now a Server Component by default
export default function PricingPage() {
  // Render the client component wrapped in Suspense
  return (
    <Suspense fallback={<PricingSkeleton />}>
      <PricingClient />
    </Suspense>
  );
}
