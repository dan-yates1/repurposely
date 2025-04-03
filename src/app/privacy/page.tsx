// Keep Metadata import for server-side export
import type { Metadata } from "next";
// Import the client component
import PrivacyClient from "@/components/privacy/privacy-client";

// Keep page-specific metadata export (Server Component)
export const metadata: Metadata = {
  title: "Privacy Policy | Repurposely",
  description: "Learn how Repurposely collects, uses, and protects your personal information when you use our AI content repurposing platform. Understand your data rights.",
  alternates: {
    canonical: "/privacy",
  },
  robots: { // Discourage indexing of legal pages
    index: false,
    follow: true,
  },
};

// This is now a Server Component by default
export default function PrivacyPage() {
  // Render the client component which contains the interactive parts
  return <PrivacyClient />;
}
