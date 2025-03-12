"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      <nav className="bg-white py-4 border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex space-x-6 items-center">
              <Link href="/auth">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full px-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Sign Up
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Get Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
                CONTENT TRANSFORMATION PLATFORM
              </div>
              <h1
                className="text-5xl md:text-6xl font-bold mb-8 leading-tight animate-slideUp"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  Powerful,
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  not overpowering
                </span>
              </h1>
              <p
                className="text-xl text-indigo-100 mb-10 max-w-lg animate-slideUp"
                style={{ animationDelay: "0.4s" }}
              >
                Finally, a content platform that&apos;s both powerful and easy
                to use. Create impactful content experiences.
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
                    Start free or get a demo
                  </Button>
                </a>
              </div>
              <p
                className="text-sm text-indigo-200 animate-fadeIn"
                style={{ animationDelay: "0.8s" }}
              >
                Get started with free tools, or get more with our premium
                software.
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
            <h2 className="text-4xl font-bold text-gray-800">
              The Content Platform Your Business Will Love
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Input Your Content
              </h3>
              <p className="text-gray-600">
                Paste your blog post, article, or transcript into our platform.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Choose Your Format
              </h3>
              <p className="text-gray-600">
                Select the output format and tone that matches your needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Get Repurposed Content
              </h3>
              <p className="text-gray-600">
                Our AI transforms your content into the perfect format for your
                needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
