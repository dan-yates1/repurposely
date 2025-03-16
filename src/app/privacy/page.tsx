"use client";

import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function PrivacyPolicy() {
  // Client-side code only
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render if client-side
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      {/* Content */}
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white shadow-sm rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <p className="text-gray-600 mb-4">Last Updated: March 16, 2025</p>

            <div className="prose prose-indigo max-w-none text-gray-600">
              <h2>1. Introduction</h2>
              <p>
                At Repurposely (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or any of our services (collectively, the &quot;Service&quot;).
              </p>
              <p>
                By accessing or using our Service, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
              </p>

              <h2>2. Information We Collect</h2>
              <h3>2.1 Personal Information</h3>
              <p>
                We may collect personal information that you provide directly to us, including:
              </p>
              <ul>
                <li>Account information (name, email address, password)</li>
                <li>Billing information (payment method details, billing address)</li>
                <li>Profile information (profile picture, job title, company)</li>
                <li>Content you upload, create, or modify using our Service</li>
                <li>Communications you send to us (support requests, feedback)</li>
              </ul>

              <h3>2.2 Usage Information</h3>
              <p>
                We automatically collect certain information about your device and how you interact with our Service, including:
              </p>
              <ul>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent on the Service)</li>
                <li>Token usage and transaction history</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul>
                <li>Providing, maintaining, and improving our Service</li>
                <li>Processing transactions and managing your account</li>
                <li>Sending you technical notices, updates, and support messages</li>
                <li>Responding to your comments, questions, and requests</li>
                <li>Monitoring and analyzing trends, usage, and activities</li>
                <li>Detecting, preventing, and addressing technical issues</li>
                <li>Personalizing your experience and providing content recommendations</li>
              </ul>

              <h2>4. How We Share Your Information</h2>
              <p>
                We may share your information in the following circumstances:
              </p>
              <ul>
                <li>With service providers who perform services on our behalf (e.g., payment processing, data analysis)</li>
                <li>With business partners with whom we jointly offer products or services</li>
                <li>As required by law or to comply with legal process</li>
                <li>To protect the rights, property, or safety of Repurposely, our users, or others</li>
                <li>In connection with a merger, sale, or acquisition of all or a portion of our company</li>
              </ul>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When determining how long to retain information, we consider the amount, nature, and sensitivity of the information, the potential risk of harm from unauthorized use or disclosure, and the purposes for which we process the information.
              </p>

              <h2>7. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>Accessing, correcting, or deleting your personal information</li>
                <li>Restricting or objecting to our use of your personal information</li>
                <li>Receiving a copy of your personal information in a structured, machine-readable format</li>
                <li>Withdrawing your consent at any time (where processing is based on consent)</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@repurposely.com.
              </p>

              <h2>8. Children’s Privacy</h2>
              <p>
                Our Service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will promptly delete that information.
              </p>

              <h2>9. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on our website and update the &quot;Last Updated&quot; date. Your continued use of our Service after the effective date of the revised Privacy Policy constitutes your acceptance of the revised terms.
              </p>

              <h2>10. Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p>
                Email: privacy@repurposely.com<br />
                Address: 123 AI Avenue, Suite 456, San Francisco, CA 94103
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
