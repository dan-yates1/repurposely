"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { 
  User, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  History,
  ChevronRight,
  LogOut,
  Loader2,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTokens } from "@/hooks/useTokens";
import { TokenHistoryCard } from "@/components/ui/token-history";

export default function Settings() {
  usePageTitle("Account Settings");
  const router = useRouter();
  const { 
    tokenUsage, 
    transactionHistory, 
    loading: tokensLoading, 
    subscriptionData, 
    setSubscriptionData 
  } = useTokens();
  const [user, setUser] = useState<{
    id?: string;
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
    app_metadata?: { provider?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");
  const [signingOut, setSigningOut] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState("FREE");
  
  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setUser(userData.user);
          
          // Check if subscription is already set to cancel
          const { data: subscriptionData } = await supabase
            .from("user_subscriptions")
            .select("cancel_at_period_end, subscription_end_date")
            .eq("user_id", userData.user.id)
            .single();
            
          if (subscriptionData) {
            setSubscriptionCancelled(subscriptionData.cancel_at_period_end || false);
            if (subscriptionData.subscription_end_date) {
              setSubscriptionEndDate(subscriptionData.subscription_end_date);
            }
          }
        } else {
          // Redirect to login if not authenticated
          router.push("/auth");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
      setSigningOut(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setCancelingSubscription(true);
      
      // Get the current auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Authentication error:", sessionError);
        toast.error("Authentication failed. Please try logging in again.");
        router.push("/auth");
        return;
      }
      
      // Get a fresh access token to ensure it's not expired
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error("Session refresh error:", refreshError);
        toast.error("Your session has expired. Please log in again.");
        router.push("/auth");
        return;
      }
      
      // Use the fresh token
      const token = refreshData.session.access_token;
      
      console.log("Sending cancellation request with auth token");
      
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success("Your subscription will be canceled at the end of the billing period");
        setSubscriptionCancelled(true);
        setSubscriptionEndDate(result.cancelDate);
        setShowCancelConfirm(false);
        
        // Update local subscription data to reflect cancellation
        setSubscriptionData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            is_active: false,
            subscription_end_date: result.cancelDate
          };
        });
        
        // Force refresh the UI
        setTimeout(() => {
          router.refresh();
        }, 500);
      } else {
        console.error("Cancel subscription response:", response.status, result);
        throw new Error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setCancelingSubscription(false);
    }
  };

  // Display current subscription status
  useEffect(() => {
    if (subscriptionData) {
      // If we have subscription data, use it to set the component state
      setSubscriptionTier(subscriptionData.subscription_tier || "FREE");
      setSubscriptionCancelled(!subscriptionData.is_active);
      if (subscriptionData.subscription_end_date) {
        setSubscriptionEndDate(subscriptionData.subscription_end_date);
      }
    }
  }, [subscriptionData]);

  // Settings tabs
  const tabs = [
    { id: "account", label: "Account", icon: <User className="h-5 w-5" /> },
    { id: "tokens", label: "Token Usage", icon: <History className="h-5 w-5" /> },
    { id: "subscription", label: "Subscription", icon: <CreditCard className="h-5 w-5" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { id: "security", label: "Security", icon: <ShieldCheck className="h-5 w-5" /> },
  ];

  // Get user metadata
  const userEmail = user?.email || "";
  const userName = user?.user_metadata?.full_name || userEmail.split("@")[0];
  const userAvatar = user?.user_metadata?.avatar_url || null;
  const userProvider = user?.app_metadata?.provider || "email";

  // Format end date for display
  const formattedEndDate = subscriptionEndDate 
    ? new Date(subscriptionEndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard"
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          Dashboard
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-700 text-sm font-medium">Settings</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                {userAvatar ? (
                  <Image 
                    src={userAvatar} 
                    alt={userName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-medium text-gray-900">{userName}</h2>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-2 flex items-center mb-4">
                <span>Signed in with <span className="font-medium">{userProvider}</span></span>
              </div>
              <Button 
                variant="secondary" 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 text-sm"
                disabled={signingOut}
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>Sign Out</span>
              </Button>
            </div>
            
            {/* Settings Menu */}
            <nav>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between w-full p-3 rounded-md text-left mb-1 ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${activeTab === tab.id ? "text-indigo-600" : "text-gray-500"}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your email is used to log in to your account
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={userName}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authentication Provider
                    </label>
                    <input
                      type="text"
                      value={userProvider.charAt(0).toUpperCase() + userProvider.slice(1)}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <Button variant="primary" className="mt-4">
                    Update Profile
                  </Button>
                </div>
              </div>
            )}

            {/* Token Usage Tab */}
            {activeTab === "tokens" && (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Token Usage History</h2>
                  
                  {tokensLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                    </div>
                  ) : (
                    <div>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                        <div className="flex flex-col md:flex-row justify-between mb-2">
                          <h3 className="font-medium text-indigo-800">Current Plan Usage</h3>
                          <div className="text-sm text-indigo-700">
                            <span className="font-medium">{tokenUsage?.tokensRemaining || 0}</span> of {(tokenUsage?.tokensUsed || 0) + (tokenUsage?.tokensRemaining || 0)} tokens remaining
                          </div>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${tokenUsage ? (tokenUsage.tokensRemaining / (tokenUsage.tokensUsed + tokenUsage.tokensRemaining)) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {transactionHistory && transactionHistory.length > 0 ? (
                          <div>
                            <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                              <span>Operation</span>
                              <span>Date</span>
                            </div>
                            {transactionHistory.map((transaction) => (
                              <TokenHistoryCard
                                key={transaction.id}
                                operation={transaction.transaction_type}
                                tokensUsed={transaction.tokens_used}
                                date={new Date(transaction.created_at).toLocaleDateString()}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No token usage history found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <Link href="/pricing">
                    <Button variant="primary" className="flex items-center mx-auto">
                      <span>Upgrade Your Plan</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Plan</h2>
                  
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-indigo-800">Current Plan</h3>
                        <p className="text-sm text-indigo-600">
                          {subscriptionTier === "PRO" 
                            ? "Pro Plan" 
                            : subscriptionTier === "ENTERPRISE" 
                              ? "Enterprise Plan" 
                              : "Free Plan"}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {subscriptionTier === "PRO" 
                          ? "500 tokens/month" 
                          : subscriptionTier === "ENTERPRISE" 
                            ? "2000 tokens/month" 
                            : "50 tokens/month"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Subscription Status */}
                  {subscriptionCancelled && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                        <div>
                          <h3 className="font-medium text-amber-800">Subscription Cancellation Scheduled</h3>
                          <p className="text-sm text-amber-700 mt-1">
                            Your subscription will be downgraded to the Free plan on {formattedEndDate}.
                            You&apos;ll continue to have access to all features until then.
                          </p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="mt-3 text-xs"
                            onClick={() => {
                              // Future enhancement: Add API to reactivate subscription
                              toast.error("This feature is coming soon. Please contact support to reactivate your subscription.");
                            }}
                          >
                            Keep My Subscription
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Subscription Actions */}
                  {subscriptionTier !== "FREE" && !subscriptionCancelled ? (
                    <div className="space-y-4">
                      <Link href="/pricing">
                        <Button variant="primary" className="w-full">
                          View Plans & Upgrade
                        </Button>
                      </Link>
                      
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-md font-medium text-gray-900 mb-3">Manage Subscription</h3>
                        
                        {!showCancelConfirm ? (
                          <div className="space-y-3">
                            <Button 
                              variant="secondary" 
                              className="w-full"
                              onClick={() => setShowCancelConfirm(true)}
                            >
                              Cancel or Downgrade Subscription
                            </Button>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium text-gray-800 mb-2">Confirm Cancellation</h4>
                            <p className="text-sm text-gray-600 mb-4">
                              Your subscription will be active until the end of the current billing period. 
                              After that, your account will be downgraded to the Free plan with 50 tokens/month.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button 
                                variant="danger" 
                                className="sm:flex-1"
                                disabled={cancelingSubscription}
                                onClick={handleCancelSubscription}
                              >
                                {cancelingSubscription ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Cancel Subscription
                              </Button>
                              <Button 
                                variant="secondary" 
                                className="sm:flex-1"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={cancelingSubscription}
                              >
                                Keep Subscription
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : !subscriptionCancelled ? (
                    <Link href="/pricing">
                      <Button variant="primary" className="w-full">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  ) : null}
                  
                  {/* Payment History */}
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Payment History</h3>
                    <p className="text-sm text-gray-500 italic">
                      No payment history available
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">Email Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Receive emails about account activity and system updates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">Token Usage Alerts</h3>
                      <p className="text-sm text-gray-500">
                        Get notified when you&apos;re running low on tokens
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">Marketing Emails</h3>
                      <p className="text-sm text-gray-500">
                        Receive emails about new features, tips, and offers
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
                
                <Button variant="primary" className="mt-6">
                  Save Preferences
                </Button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-800">Change Password</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Update your password for added security
                    </p>
                    
                    {userProvider !== "email" ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-sm text-amber-800">
                        You are signed in with {userProvider}. Password management is handled by your authentication provider.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <Button variant="primary">
                          Update Password
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    
                    <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 text-sm text-indigo-700 mb-4">
                      Two-factor authentication is not currently enabled.
                    </div>
                    
                    <Button variant="secondary">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
