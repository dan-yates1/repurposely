// Keep Metadata import for server-side export
import type { Metadata } from "next";
// Import the client component
import ContactClient from "@/components/contact/contact-client";

// Keep page-specific metadata export (Server Component)
export const metadata: Metadata = {
  title: "Contact Us | Repurposely",
  description: "Get in touch with the Repurposely team. Contact us for support, billing inquiries, feature requests, or partnership opportunities.",
  alternates: {
    canonical: "/contact",
  },
};

// This is now a Server Component by default
export default function ContactPage() {
  // Render the client component which contains the interactive parts
  return <ContactClient />;
}
