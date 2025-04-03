import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  /* config options here */
  images: {
    // Using remotePatterns for better security and flexibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
      },
      {
        protocol: 'https',
        hostname: 'placeimg.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
         hostname: 'lh3.googleusercontent.com',
       },
       // { // Remove OpenAI hostname as images will be served from Supabase
       //   protocol: 'https',
       //   hostname: 'oaidalleapiprodscus.blob.core.windows.net',
       // },
       {
         // Add Supabase storage hostname (using wildcard for testing)
         protocol: 'https',
         hostname: '**.supabase.co', // Allow any subdomain under supabase.co
       },
     ],
  }
};

export default nextConfig;
