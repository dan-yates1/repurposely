"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";

export default function Home() {
  // Client-side code only
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Add required styles for animations
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-fadeIn {
        animation: fadeIn 1s ease forwards;
        opacity: 0;
      }
      .animate-slideUp {
        animation: slideUp 1s ease forwards;
        opacity: 0;
      }
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      .animate-gradient {
        animation: gradient 15s ease infinite;
        background-size: 200% 200%;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 py-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply opacity-20 animate-pulse"></div>
          <div
            className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply opacity-20 animate-pulse"
            style={{ animationDelay: "1s", animationDuration: "7s" }}
          ></div>
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply opacity-20 animate-pulse"
            style={{ animationDelay: "2s", animationDuration: "8s" }}
          ></div>
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply opacity-20 animate-pulse"
            style={{ animationDelay: "3s", animationDuration: "10s" }}
          ></div>
        </div>

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-2/5 text-white mb-12 lg:mb-0 lg:pr-8">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/30 backdrop-blur-sm text-sm font-semibold text-indigo-100 mb-6 animate-fadeIn">
                AI-POWERED CONTENT PLATFORM
              </div>
              <h1
                className="text-5xl md:text-6xl font-bold mb-8 leading-tight animate-slideUp"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  Repurpose content
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  with AI precision
                </span>
              </h1>
              <p
                className="text-xl text-indigo-100 mb-10 max-w-lg animate-slideUp"
                style={{ animationDelay: "0.4s" }}
              >
                Transform your content into multiple formats with AI-powered quality analysis. 
                Create, optimize, and repurpose content faster than ever before.
              </p>
              <div
                className="mb-8 animate-slideUp"
                style={{ animationDelay: "0.6s" }}
              >
                <a
                  href="/auth"
                  className="inline-block transition-transform hover:scale-105"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="px-10 py-6 text-lg font-semibold text-indigo-600 hover:bg-white hover:shadow-indigo-200/50 shadow-xl rounded-xl"
                  >
                    Start free with 50 tokens
                  </Button>
                </a>
              </div>
              <p
                className="text-sm text-indigo-200 animate-fadeIn"
                style={{ animationDelay: "0.8s" }}
              >
                No credit card required. Upgrade anytime to Pro (500 tokens) or Enterprise (2000 tokens).
              </p>
            </div>
            <div
              className="lg:w-3/5 animate-slideUp"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="relative">
                {/* Decorative elements */}
                <div
                  className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-400 rounded-full opacity-70 animate-float"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute -bottom-6 -left-6 w-12 h-12 bg-indigo-300 rounded-full opacity-70 animate-float"
                  style={{ animationDelay: "2s" }}
                ></div>
                <div
                  className="absolute top-1/2 -right-4 w-8 h-8 bg-purple-400 rounded-full opacity-70 animate-float"
                  style={{ animationDelay: "3s" }}
                ></div>
                <div
                  className="absolute bottom-1/3 -left-2 w-6 h-6 bg-blue-400 rounded-full opacity-70 animate-float"
                  style={{ animationDelay: "2.5s" }}
                ></div>

                {/* Dashboard image with glow effect */}
                <div className="relative z-10 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:scale-[1.02] hover:shadow-indigo-500/20 hover:shadow-2xl">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-1000 animate-gradient"></div>
                  <div className="relative">
                    <Image
                      src="/dashboard.jpg"
                      width={2000}
                      height={1500}
                      alt="Dashboard Preview"
                      className="w-full rounded-xl"
                      priority
                      quality={100}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              AI-Powered Content Creation & Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Repurposely helps you create high-quality content with intelligent analysis and optimization tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Content Repurposing
              </h3>
              <p className="text-gray-600">
                Transform your blog posts, articles, or transcripts into multiple formats with just one click.
              </p>
              <p className="text-indigo-600 mt-2 text-sm font-medium">
                1 token per text repurpose
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Quality Analysis
              </h3>
              <p className="text-gray-600">
                Get real-time feedback on readability, engagement, and SEO with our AI-powered content analysis.
              </p>
              <p className="text-indigo-600 mt-2 text-sm font-medium">
                2 tokens per analysis
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Advanced Media
              </h3>
              <p className="text-gray-600">
                Generate images and process videos to complement your content and increase engagement.
              </p>
              <p className="text-indigo-600 mt-2 text-sm font-medium">
                5-10 tokens per media item
              </p>
            </div>
          </div>
          
          {/* Token System */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Flexible Token System</h3>
              <p className="text-gray-600">Pay only for what you use with our simple token-based pricing</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-all duration-300">
                <h4 className="text-lg font-semibold mb-2">Free</h4>
                <p className="text-3xl font-bold text-indigo-600 mb-4">50 tokens</p>
                <p className="text-gray-600 mb-4">Perfect for trying out the platform</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>50 text repurposes</li>
                  <li>25 quality analyses</li>
                  <li>10 image generations</li>
                </ul>
                <Link href="/auth">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
              
              <div className="border-2 border-indigo-500 rounded-lg p-6 text-center shadow-md relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h4 className="text-lg font-semibold mb-2">Pro</h4>
                <p className="text-3xl font-bold text-indigo-600 mb-4">500 tokens</p>
                <p className="text-gray-600 mb-4">For content creators and small teams</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>500 text repurposes</li>
                  <li>250 quality analyses</li>
                  <li>100 image generations</li>
                </ul>
                <Link href="/pricing">
                  <Button variant="primary" className="w-full">Upgrade to Pro</Button>
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-all duration-300">
                <h4 className="text-lg font-semibold mb-2">Enterprise</h4>
                <p className="text-3xl font-bold text-indigo-600 mb-4">2000 tokens</p>
                <p className="text-gray-600 mb-4">For agencies and large teams</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>2000 text repurposes</li>
                  <li>1000 quality analyses</li>
                  <li>400 image generations</li>
                </ul>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* How It Works */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-8">How Repurposely Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Input Your Content
              </h3>
              <p className="text-gray-600">
                Paste your blog post, article, or transcript into our intuitive editor.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Analyze & Optimize
              </h3>
              <p className="text-gray-600">
                Get AI-powered quality analysis and actionable suggestions for improvement.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Transform & Publish
              </h3>
              <p className="text-gray-600">
                Convert your content into multiple formats and publish across platforms.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Loved by Content Creators
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users are saying about Repurposely
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Jane Doe</h4>
                  <p className="text-sm text-gray-600">Content Marketer</p>
                </div>
              </div>
              <p className="text-gray-700">
                &quot;Repurposely has transformed our content strategy. We can now create 5x more content with the same team size.&quot;
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  MS
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Mark Smith</h4>
                  <p className="text-sm text-gray-600">Blogger</p>
                </div>
              </div>
              <p className="text-gray-700">
                &quot;The quality analysis feature has improved my writing tremendously. My engagement rates have increased by 40%.&quot;
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  AJ
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">Alex Johnson</h4>
                  <p className="text-sm text-gray-600">Agency Owner</p>
                </div>
              </div>
              <p className="text-gray-700">
                &quot;The token system is perfect for our agency. We can easily track usage and scale up as needed.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your content strategy?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of content creators who are using Repurposely to create better content faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth">
              <Button variant="secondary" size="lg" className="px-8 py-4 text-indigo-600 font-semibold">
                Start for Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="px-8 py-4 text-white border-white hover:bg-white/10 font-semibold">
                View Pricing
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
