import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define base URL (replace if needed, or use env var later)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; 
// Define a default social image URL (create/upload an image to /public)
const defaultSocialImage = `${baseUrl}/social-preview.png`; // Example path

export const metadata: Metadata = {
  // Title Template: %s will be replaced by page-specific titles
  title: {
    default: 'Repurposely | AI Content Repurposing Tool', // Default title
    template: '%s | Repurposely', // Template for other pages
  },
  description: "Effortlessly repurpose your content into engaging social media posts, blog articles, email newsletters, video scripts, and more with Repurposely's AI-powered tool.",
  // Add relevant keywords
  keywords: ['content repurposing', 'ai content generator', 'social media content', 'blog generator', 'email newsletter tool', 'video script generator', 'content marketing', 'ai writer'],
  // Basic metadata
  applicationName: 'Repurposely',
  authors: [{ name: 'Repurposely Team', url: baseUrl }], // Updated author info
  // Open Graph (for Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Repurposely | AI Content Repurposing Tool',
    description: "Effortlessly repurpose your content into engaging social media posts, blog articles, email newsletters, video scripts, and more.",
    url: baseUrl,
    siteName: 'Repurposely',
    images: [
      {
        url: defaultSocialImage, // Default preview image
        width: 1200, // Standard OG image width
        height: 630, // Standard OG image height
        alt: 'Repurposely Application Preview',
      },
    ],
    locale: 'en_US', // Adjust if needed
    type: 'website',
  },
  // Twitter Card
  twitter: {
    card: 'summary_large_image', // Use 'summary_large_image' for better visibility
    title: 'Repurposely | AI Content Repurposing Tool',
    description: "Repurpose content instantly for social media, blogs, emails & more with AI.", // Shorter description for Twitter
    // creator: '@yourTwitterHandle', // Optional: Add your Twitter handle
    images: [defaultSocialImage], // Must be an absolute URL
  },
  // Robots meta tag (adjust as needed for production)
  robots: {
    index: true, // Allow indexing by search engines
    follow: true, // Allow following links
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Icons (ensure favicon.ico exists in /app)
  icons: {
    icon: '/favicon.ico',
    // shortcut: '/shortcut-icon.png', // Optional
    // apple: '/apple-touch-icon.png', // Optional
  },
  // Manifest (if you have a manifest.json)
  // manifest: '/manifest.json', 
  // Canonical URL (important for avoiding duplicate content issues)
  metadataBase: new URL(baseUrl), // Sets the base for resolving relative paths
  alternates: {
     canonical: '/', // Canonical URL for the homepage
     // languages: { // Optional: If supporting multiple languages
     //   'en-US': '/en-US',
     // },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Add JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Repurposely",
            "url": baseUrl,
            "logo": `${baseUrl}/logo.svg`, // Assuming logo exists at /public/logo.svg
            "sameAs": [ // Add links to your social media profiles here
              // "https://www.facebook.com/yourprofile",
              // "https://www.twitter.com/yourprofile",
              // "https://www.linkedin.com/company/yourprofile"
            ]
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Repurposely",
            "url": baseUrl,
            // Optional: Add potential actions like search
            // "potentialAction": {
            //   "@type": "SearchAction",
            //   "target": `${baseUrl}/search?q={search_term_string}`,
            //   "query-input": "required name=search_term_string"
            // }
          }) }}
        />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#FFFFFF',
              color: '#333333',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            success: {
              iconTheme: {
                primary: '#4F46E5',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
