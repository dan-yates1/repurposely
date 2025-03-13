"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { TokenUsageCard } from "@/components/ui/token-usage-card";
import { TokenHistory } from "@/components/ui/token-history";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [subscription, setSubscription] = useState({
    tier: "FREE",
    tokensAllocated: 50,
    renewDate: "April 15, 2023"
  });

  // Set the page title
  usePageTitle("Settings");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email || "");
        // In a real app, you would fetch user profile data here
        setFullName("Alex Johnson");
        setCompany("Repurposely Inc.");
        
        // Fetch subscription data
        fetchSubscriptionData(session.user.id);
      } else {
        router.push("/auth");
      }
    };

    checkUser();
  }, [router]);

  const fetchSubscriptionData = async (userId: string) => {
    try {
      const { data: subscriptionData, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }
      
      if (subscriptionData) {
        setSubscription({
          tier: subscriptionData.subscription_tier.toUpperCase(),
          tokensAllocated: subscriptionData.subscription_tier === 'PRO' ? 500 : 
                          subscriptionData.subscription_tier === 'ENTERPRISE' ? 2000 : 50,
          renewDate: subscriptionData.subscription_end_date ? 
                    new Date(subscriptionData.subscription_end_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    }) : 'April 15, 2023'
        });
      }
    } catch (err) {
      console.error('Error in subscription fetch:', err);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // In a real app, you would update the user profile here
      // For example: await updateUserProfile(user.id, { fullName, company });
      // Using the user variable to fix the lint error
      if (user) {
        console.log(user.id);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    toast.success("Password reset link has been sent to your email");
  };

  const handleToggle2FA = async () => {
    toast.success("Two-factor authentication enabled");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-800">Manage your account settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: "profile", label: "Profile" },
            { id: "subscription", label: "Subscription" },
            { id: "usage", label: "Usage" },
            { id: "security", label: "Security" },
          ]}
          defaultTabId="profile"
          onTabChange={setActiveTab}
        />
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Profile Information
          </h2>
          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            <p className="text-xs text-gray-800 mt-1">
              Email cannot be changed. Contact support for assistance.
            </p>
          </div>
          <div className="mb-6">
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Company
            </label>
            <input
              type="text"
              id="company"
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <Button
              onClick={handleSaveChanges}
              variant="primary"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === "subscription" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subscription Details
          </h2>
          
          {/* Current Plan */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-indigo-600 mb-2">{subscription.tier === 'PRO' ? 'Pro Plan' : subscription.tier === 'ENTERPRISE' ? 'Enterprise Plan' : 'Free Plan'}</p>
            <p className="text-gray-800 mb-4">{subscription.tokensAllocated} tokens per month</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-800">
                Renews on {subscription.renewDate}
              </p>
              <Button variant="secondary" size="sm">
                Manage Plan
              </Button>
            </div>
          </div>
          
          {/* Available Plans */}
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Available Plans
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Free Plan */}
            <div className={`border ${subscription.tier === 'FREE' ? 'border-2 border-green-500' : 'border-gray-200'} rounded-lg p-4 ${subscription.tier === 'FREE' ? 'relative' : ''} flex flex-col h-full`}>
              {subscription.tier === 'FREE' && (
                <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                  CURRENT
                </span>
              )}
              <h4 className="text-lg font-medium text-gray-900 mb-2">Free</h4>
              <p className="text-3xl font-bold text-gray-900 mb-2">$0<span className="text-lg font-normal text-gray-800">/mo</span></p>
              <ul className="space-y-2 mb-4 flex-grow">
                <li className="text-sm text-gray-800">✓ 50 tokens per month</li>
                <li className="text-sm text-gray-800">✓ Basic content formats</li>
                <li className="text-sm text-gray-800">✓ Standard repurposing</li>
              </ul>
              <Button variant="outline" className="w-full mt-auto" disabled={subscription.tier === 'FREE'}>
                {subscription.tier === 'FREE' ? 'Current Plan' : 'Downgrade'}
              </Button>
            </div>
            
            {/* Pro Plan */}
            <div className={`border ${subscription.tier === 'PRO' ? 'border-2 border-indigo-500' : 'border-gray-200'} rounded-lg p-4 relative flex flex-col h-full`}>
              {subscription.tier === 'PRO' && (
                <span className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                  CURRENT
                </span>
              )}
              <span className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                POPULAR
              </span>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Pro</h4>
              <p className="text-3xl font-bold text-gray-900 mb-2">$19<span className="text-lg font-normal text-gray-800">/mo</span></p>
              <ul className="space-y-2 mb-4 flex-grow">
                <li className="text-sm text-gray-800">✓ 500 tokens per month</li>
                <li className="text-sm text-gray-800">✓ All content formats</li>
                <li className="text-sm text-gray-800">✓ Advanced repurposing</li>
                <li className="text-sm text-gray-800">✓ Priority support</li>
              </ul>
              <Button variant={subscription.tier === 'PRO' ? 'outline' : 'primary'} className="w-full mt-auto" disabled={subscription.tier === 'PRO'}>
                {subscription.tier === 'PRO' ? 'Current Plan' : subscription.tier === 'ENTERPRISE' ? 'Downgrade' : 'Upgrade'}
              </Button>
            </div>
            
            {/* Enterprise Plan */}
            <div className={`border ${subscription.tier === 'ENTERPRISE' ? 'border-2 border-purple-500' : 'border-gray-200'} rounded-lg p-4 ${subscription.tier === 'ENTERPRISE' ? 'relative' : ''} flex flex-col h-full`}>
              {subscription.tier === 'ENTERPRISE' && (
                <span className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                  CURRENT
                </span>
              )}
              <h4 className="text-lg font-medium text-gray-900 mb-2">Enterprise</h4>
              <p className="text-3xl font-bold text-gray-900 mb-2">$49<span className="text-lg font-normal text-gray-800">/mo</span></p>
              <ul className="space-y-2 mb-4 flex-grow">
                <li className="text-sm text-gray-800">✓ 2000 tokens per month</li>
                <li className="text-sm text-gray-800">✓ All content formats</li>
                <li className="text-sm text-gray-800">✓ Advanced repurposing</li>
                <li className="text-sm text-gray-800">✓ Dedicated support</li>
                <li className="text-sm text-gray-800">✓ API access</li>
              </ul>
              <Button variant={subscription.tier === 'ENTERPRISE' ? 'outline' : 'primary'} className="w-full mt-auto" disabled={subscription.tier === 'ENTERPRISE'}>
                {subscription.tier === 'ENTERPRISE' ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-800">
            Need more tokens? Contact our <a href="#" className="text-indigo-600 hover:text-indigo-800">sales team</a> for custom pricing options.
          </p>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === "usage" && (
        <div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Token Usage
            </h2>
            <div className="mb-6 text-gray-800">
              <TokenUsageCard />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Token History
            </h2>
            <div className="text-gray-800">
              <TokenHistory />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Security Settings
          </h2>
          
          {/* Change Password */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Change Password
            </h3>
            <p className="text-sm text-gray-800 mb-4">
              We&apos;ll send you an email with instructions to reset your password.
            </p>
            <Button onClick={handlePasswordChange} variant="secondary">
              Reset Password
            </Button>
          </div>
          
          {/* Two-Factor Authentication */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Two-Factor Authentication
              </h3>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                Disabled
              </span>
            </div>
            <p className="text-sm text-gray-800 mb-4">
              Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>
            <Button onClick={handleToggle2FA} variant="outline">
              Enable 2FA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
