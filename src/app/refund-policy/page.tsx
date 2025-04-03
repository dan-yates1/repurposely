// Keep Metadata import for server-side export
import type { Metadata } from "next";
// Import the client component
import RefundPolicyClient from "@/components/refund-policy/refund-policy-client";

// Keep page-specific metadata export (Server Component)
export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Repurposely",
  description: "Understand the refund and cancellation policy for Repurposely subscriptions. Learn about eligibility for refunds and how to cancel your plan.",
  alternates: {
    canonical: "/refund-policy",
  },
  robots: { // Discourage indexing of legal pages
    index: false,
    follow: true,
  },
};

// This is now a Server Component by default
export default function RefundPolicyPage() {
  // Render the client component which contains the interactive parts
  return <RefundPolicyClient />;
}
