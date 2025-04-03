// Keep Metadata import for server-side export
import type { Metadata } from "next";
// Import the client component
import HomeClient from "@/components/home/home-client";

// Keep page-specific metadata export (Server Component)
export const metadata: Metadata = {
  title:
    "AI Content Repurposing Tool for Social Media, Blogs & More | Repurposely",
  description:
    "Save time and maximize reach! Repurposely uses AI to instantly transform your content into engaging formats for Twitter, LinkedIn, blogs, emails, YouTube, and more.",
  alternates: {
    canonical: "/",
  },
};

// This is now a Server Component by default
export default function HomePage() {
  // Render the client component which contains the interactive parts
  return <HomeClient />;
}
