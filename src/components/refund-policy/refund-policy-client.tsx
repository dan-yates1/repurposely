"use client"; // Keep this directive here

// Removed Metadata import
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/ui/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Renamed the component
export default function RefundPolicyClient() {
  // All the original client-side logic remains here
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

  // The original JSX return remains here
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund & Cancellation Policy</h1>
            <p className="text-gray-600 mb-4">Last Updated: March 16, 2025</p>

            <div className="prose prose-indigo max-w-none text-gray-600">
              <h2>Refund Policy</h2>
              <p>
                At Repurposely, we want you to be completely satisfied with our services. This refund policy outlines when and how you can request a refund for your subscription.
              </p>

              <h3>Eligibility for Refunds</h3>
              <p>
                We offer refunds under the following circumstances:
              </p>
              <ul>
                <li><strong>7-Day Money-Back Guarantee for New Subscribers:</strong> If you are a first-time subscriber to any of our paid plans, you may request a full refund within 7 days of your initial payment if you are not satisfied with our service.</li>
                <li><strong>Service Unavailability:</strong> If our service is unavailable for more than 24 consecutive hours due to technical issues on our end, you may be eligible for a prorated refund for the affected period.</li>
                <li><strong>Billing Errors:</strong> If you were charged incorrectly or multiple times for the same subscription period, you are entitled to a refund of the overcharged amount.</li>
              </ul>

              <h3>Non-Refundable Situations</h3>
              <p>
                Refunds are generally not provided in the following situations:
              </p>
              <ul>
                <li>After the 7-day money-back guarantee period has expired</li>
                <li>For partial or unused subscription periods after cancellation</li>
                <li>For unused tokens within your subscription plan</li>
                <li>If your account has been suspended or terminated due to violations of our Terms of Service</li>
                <li>For any add-on services or one-time purchases</li>
              </ul>

              <h3>How to Request a Refund</h3>
              <p>
                To request a refund, please contact our support team at support@repurposely.com with the following information:
              </p>
              <ul>
                <li>Your account email address</li>
                <li>Date of payment</li>
                <li>Reason for requesting a refund</li>
                <li>Any relevant details or documentation supporting your request</li>
              </ul>
              <p>
                Our support team will review your request and respond within 2 business days. If your refund is approved, it will be processed to the original payment method used for the purchase. Depending on your payment provider, it may take 5-10 business days for the refund to appear in your account.
              </p>

              <h2>Cancellation Policy</h2>
              <p>
                You may cancel your subscription at any time. Here&apos;s what happens when you cancel:
              </p>

              <h3>How to Cancel Your Subscription</h3>
              <p>
                You can cancel your subscription in one of the following ways:
              </p>
              <ul>
                <li>Through your account settings page by selecting &quot;Manage Subscription&quot; and then &quot;Cancel Subscription&quot;</li>
                <li>By emailing our support team at support@repurposely.com with your cancellation request</li>
              </ul>

              <h3>What Happens After Cancellation</h3>
              <p>
                When you cancel your subscription:
              </p>
              <ul>
                <li>Your subscription will remain active until the end of your current billing period</li>
                <li>You will continue to have access to all features included in your plan until the end of the billing period</li>
                <li>You will not be charged for future billing periods</li>
                <li>Any unused tokens will expire at the end of your billing period</li>
                <li>After your subscription ends, your account will automatically downgrade to the Free plan with its limited features and token allocation</li>
              </ul>

              <h3>Reactivating Your Subscription</h3>
              <p>
                If you decide to reactivate your subscription after cancellation, you can do so at any time by logging into your account and selecting a new subscription plan. Please note that any unused portion of your previous subscription period will not be credited toward your new subscription.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions or concerns about our refund and cancellation policies, please contact our support team:
              </p>
              <p>
                Email: support@repurposely.com<br />
                Phone: (555) 123-4567<br />
                Hours of Operation: Monday to Friday, 9:00 AM to 5:00 PM PST
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
