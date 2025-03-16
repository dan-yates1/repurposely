"use client";

import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function TermsOfService() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
            <p className="text-gray-600 mb-4">Last Updated: March 16, 2025</p>

            <div className="prose prose-indigo max-w-none text-gray-600">
              <h2>1. Introduction</h2>
              <p>
                Welcome to Repurposely (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website, mobile application, or any of our services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read these Terms carefully.
              </p>

              <h2>2. Definitions</h2>
              <p>
                <strong>&quot;Service&quot;</strong> refers to the Repurposely platform, which provides AI-powered content creation, repurposing, and quality analysis.
              </p>
              <p>
                <strong>&quot;User&quot;</strong> refers to any individual who accesses or uses our Service.
              </p>
              <p>
                <strong>&quot;Subscription&quot;</strong> refers to the paid or free access to our Service based on the selected plan.
              </p>
              <p>
                <strong>&quot;Tokens&quot;</strong> refer to the digital credits used within our platform to access various features and functionalities.
              </p>

              <h2>3. Account Registration</h2>
              <p>
                To use certain features of our Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>

              <h2>4. Subscription and Payments</h2>
              <p>
                Repurposely offers various subscription plans, each providing a specific number of tokens per month:
              </p>
              <ul>
                <li>Free Plan: 50 tokens per month</li>
                <li>Pro Plan: 500 tokens per month</li>
                <li>Enterprise Plan: 2000 tokens per month</li>
              </ul>
              <p>
                Subscription fees are charged at the beginning of each billing cycle. By subscribing to a paid plan, you authorize us to charge the applicable fees to your designated payment method.
              </p>

              <h2>5. Cancellation Policy</h2>
              <p>
                You may cancel your subscription at any time through your account settings or by contacting our support team. Upon cancellation:
              </p>
              <ul>
                <li>Your subscription will remain active until the end of the current billing period.</li>
                <li>You will not receive a refund for the current billing period.</li>
                <li>You will lose access to premium features once the current billing period ends.</li>
                <li>Any unused tokens will expire at the end of the billing period.</li>
              </ul>

              <h2>6. Refund Policy</h2>
              <p>
                We offer refunds under the following circumstances:
              </p>
              <ul>
                <li>Technical issues that prevent you from accessing or using our Service for more than 24 consecutive hours.</li>
                <li>Billing errors where you were charged incorrectly.</li>
                <li>Within 7 days of your first subscription payment if you are not satisfied with our Service (first-time subscribers only).</li>
              </ul>
              <p>
                To request a refund, please contact our support team at support@repurposely.com with details about your request. All refund requests will be reviewed on a case-by-case basis.
              </p>

              <h2>7. Dispute Resolution</h2>
              <p>
                If you have a dispute with our Service, please contact us first at support@repurposely.com. We will attempt to resolve the dispute informally. If we cannot resolve the dispute informally, you and we agree to resolve any disputes through binding arbitration in accordance with the laws of the jurisdiction where our company is registered.
              </p>

              <h2>8. Intellectual Property</h2>
              <p>
                You retain all rights to the content you create using our Service. However, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content solely for the purpose of providing and improving our Service.
              </p>
              <p>
                Repurposely and its associated logos, designs, and content are our intellectual property and may not be used without our express permission.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Repurposely shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our Service.
              </p>

              <h2>10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website and updating the &quot;Last Updated&quot; date. Your continued use of our Service after such changes constitutes your acceptance of the new Terms.
              </p>

              <h2>11. Contact Information</h2>
              <p>
                If you have any questions or concerns about these Terms, please contact us at:
              </p>
              <p>
                Email: support@repurposely.com<br />
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
