// Keep Metadata import for server-side export
import type { Metadata } from "next";
// Import the client component
import TermsClient from "@/components/terms/terms-client";

// Keep page-specific metadata export (Server Component)
export const metadata: Metadata = {
  title: "Terms of Service | Repurposely",
  description: "Read the Terms of Service for using the Repurposely AI content repurposing platform, including subscription details, cancellation policy, and intellectual property rights.",
  alternates: {
    canonical: "/terms",
  },
  robots: { // Discourage indexing of legal pages, focus on core content
    index: false,
    follow: true,
  },
};

// This is now a Server Component by default
export default function TermsPage() {
  // Render the client component which contains the interactive parts
  return <TermsClient />;
}
