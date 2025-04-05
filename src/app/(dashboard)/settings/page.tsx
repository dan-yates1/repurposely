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
  // Bell, // Removed unused icon
  // ShieldCheck, // Removed unused icon
  History,
  ChevronRight,
  LogOut,
  Loader2,
  ArrowRight,
  AlertTriangle, // Import AlertTriangle for Danger Zone
  ExternalLink // Import for invoice links
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";
// Removed unused Breadcrumbs import
import { useTokens } from "@/hooks/useTokens";
import { TokenHistoryCard } from "@/components/ui/token-history";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// Import modal/dialog components if you have them, otherwise use basic confirm
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]); // Use specific type
  const [historyLoading, setHistoryLoading] = useState(false);

  // Define type for payment history items fetched from API
  interface PaymentHistoryItem {
    id: string;
    date: number; // Expecting timestamp in milliseconds
    amount: number;
    currency: string;
    status: string | null;
    pdfUrl: string | null;
    hostedInvoiceUrl: string | null;
  }

  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error("Error fetching user or user not found:", userError);
          router.push("/auth");
          return;
        }
        setUser(userData.user);
      } catch (error) {
        console.error("Error fetching user data in Settings:", error);
        toast.error("Failed to load account data.");
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, [router]);

  // Fetch payment history when subscription tab is active
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (activeTab !== 'subscription') return; // Only fetch if tab is active

      setHistoryLoading(true);
      setPaymentHistory([]); // Clear previous history
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          // Don't show error toast here, might just be logged out
          console.log("No session found, cannot fetch payment history.");
          return;
        }
        const accessToken = sessionData.session.access_token;

        const response = await fetch('/api/stripe/payment-history', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch payment history');
        }

        const history = await response.json();
        setPaymentHistory(history);

      } catch (error) {
        console.error("Error fetching payment history:", error);
        toast.error(error instanceof Error ? error.message : 'Could not load payment history.');
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [activeTab]); // Re-fetch when tab changes to 'subscription'

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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error("Authentication failed. Please log in again.");
        router.push("/auth");
        return;
      }
      const token = sessionData.session.access_token;
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Cancellation scheduled. Your plan remains active until the period ends.");
        setShowCancelConfirm(false);
        if (setSubscriptionData) {
            setSubscriptionData(prev => prev ? ({ ...prev, is_active: false, subscription_end_date: result.cancelDate }) : null);
        }
      } else {
        throw new Error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setCancelingSubscription(false);
    }
  };

  // Handle redirecting to Stripe Customer Portal
  const handleManageBilling = async () => {
    setIsPortalLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error("Authentication error. Please log in again.");
        router.push("/auth");
        return;
      }
      const accessToken = sessionData.session.access_token;
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create portal session");
      window.location.href = result.url;
    } catch (error) {
      console.error("Error redirecting to billing portal:", error);
      toast.error(error instanceof Error ? error.message : "Could not open billing portal.");
      setIsPortalLoading(false);
    }
  };

  // Handle password reset request
  const handlePasswordResetRequest = async () => {
    if (!user?.email) {
      toast.error("Could not find user email.");
      return;
    }
    setIsSendingReset(true);
    try {
      const redirectUrl = window.location.origin + '/update-password';
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
       console.error("Error sending password reset email:", error);
       toast.error(error instanceof Error ? error.message : 'Failed to send reset email.');
    } finally {
       setIsSendingReset(false);
    }
  };

  // Handle account deletion confirmation
  const handleAccountDeletion = async () => {
     if (deleteConfirmationInput.toLowerCase() !== 'delete') {
       toast.error('Please type "DELETE" to confirm.');
       return;
     }
     setIsDeletingAccount(true);
     try {
       const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
       if (sessionError || !sessionData.session) {
         toast.error("Authentication error. Please log in again.");
         router.push("/auth");
         return;
       }
       const accessToken = sessionData.session.access_token;

       // Call the backend API to handle deletion
       const response = await fetch('/api/user/delete', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${accessToken}`
         },
       });

       const result = await response.json();
       if (!response.ok) {
         throw new Error(result.error || 'Failed to delete account');
       }

       toast.success('Account deleted successfully. Signing out...');
       await supabase.auth.signOut(); // Sign out locally
       router.push('/'); // Redirect to home page

     } catch (error) {
       console.error("Error deleting account:", error);
       toast.error(error instanceof Error ? error.message : 'Failed to delete account.');
       setIsDeletingAccount(false); // Re-enable button on error
     }
     // setLoading state is handled within the try/catch/finally
  };


  // Settings tabs definition
  const tabs = [
    { id: "account", label: "Account", icon: <User className="h-5 w-5" /> },
    { id: "tokens", label: "Token Usage", icon: <History className="h-5 w-5" /> },
    { id: "subscription", label: "Subscription", icon: <CreditCard className="h-5 w-5" /> },
    // { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> }, // Hidden for now
    // { id: "security", label: "Security", icon: <ShieldCheck className="h-5 w-5" /> }, // Hidden for now
  ];

  // User details for display
  const userEmail = user?.email || "";
  const userName = user?.user_metadata?.full_name || userEmail.split("@")[0] || "User";
  const userAvatar = user?.user_metadata?.avatar_url || null;
  const userProvider = user?.app_metadata?.provider || "email";

  // Derived subscription state from hook data
  const currentTier = (subscriptionData?.subscription_tier || "FREE").toUpperCase();
  const isActive = subscriptionData?.is_active ?? (currentTier !== "FREE");
  const isCancelled = !isActive && currentTier !== "FREE";
  const endDate = subscriptionData?.subscription_end_date;
  const startDate = subscriptionData?.subscription_start_date;

  const formatDate = (dateString: string | null | undefined) => {
     if (!dateString) return 'N/A';
     return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Main component render
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />

      {/* Breadcrumbs REMOVED */}
      {/* <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]} /> */}

      {/* Added Title/Description Block */}
      <div className="mb-8"> {/* Added mb-8 for spacing below */}
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account, subscription, and preferences.</p>
      </div>

      {loading ? (
        <div className="animate-pulse">
          {/* Tabs skeleton */}
          <div className="w-full md:w-64 space-y-2 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-full bg-gray-200 rounded"></div>
                <div className="h-8 w-full bg-gray-200 rounded"></div>
                <div className="h-8 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-gray-100 rounded"></div>
              <div className="h-10 w-full bg-gray-100 rounded"></div>
              <div className="h-10 w-full bg-gray-100 rounded"></div>
              <div className="h-10 w-1/3 bg-gray-200 rounded mt-4"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                {userAvatar ? (
                  <Image src={userAvatar} alt={userName} width={48} height={48} className="rounded-full object-cover"/>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">{userName.charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <h2 className="font-medium text-gray-900">{userName}</h2>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-2 flex items-center mb-4">
                <span>Signed in with <span className="font-medium">{userProvider}</span></span>
              </div>
              <Button variant="secondary" onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-sm" disabled={signingOut}>
                {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>Sign Out</span>
              </Button>
            </div>
            {/* Settings Menu */}
            <nav>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between w-full p-3 rounded-md text-left mb-1 ${activeTab === tab.id ? "bg-indigo-50 text-indigo-700 font-medium" : "hover:bg-gray-50 text-gray-700"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`${activeTab === tab.id ? "text-indigo-600" : "text-gray-500"}`}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
                 <div>
                   <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
                   <div className="space-y-4">
                     <div>
                       <Label htmlFor="email">Email</Label>
                       <Input
                         id="email"
                         type="email"
                         value={userEmail}
                         disabled
                         className="mt-1 bg-gray-100 cursor-not-allowed"
                        />
                     </div>
                     {/* Name input and button removed */}
                   </div>
                 </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Password</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      To change your password, we&apos;ll send a secure reset link to your email address.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={handlePasswordResetRequest}
                      disabled={isSendingReset}
                    >
                       {isSendingReset ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                       Send Password Reset Email
                    </Button>
                 </div>

                 {/* Delete Account Section */}
                 <div className="border-t border-red-200 pt-6 mt-6">
                    <h2 className="text-lg font-medium text-red-700 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" /> Danger Zone
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Deleting your account is irreversible. All your content history and subscription data will be permanently lost. This action cannot be undone.
                    </p>
                    <Button
                      variant="danger" // Assuming you have a 'danger' variant or will style it
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isDeletingAccount}
                    >
                       {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                       Delete My Account
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
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 text-indigo-600 animate-spin" /></div>
                  ) : (
                    <div>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
                         <div className="flex flex-col md:flex-row justify-between mb-2">
                           <h3 className="font-medium text-indigo-800">Current Plan Usage</h3>
                           <div className="text-sm text-indigo-700">
                             <span className="font-medium">{tokenUsage?.tokensRemaining ?? 0}</span> tokens remaining
                           </div>
                         </div>
                         <div className="w-full bg-indigo-200 rounded-full h-2.5">
                           <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${tokenUsage ? ((tokenUsage.tokensRemaining ?? 0) / ((tokenUsage.tokensUsed ?? 0) + (tokenUsage.tokensRemaining ?? 0)) * 100) : 0}%` }}></div>
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
                              <TokenHistoryCard key={transaction.id} operation={transaction.transaction_type} tokensUsed={transaction.tokens_used} date={new Date(transaction.created_at).toLocaleDateString()} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">No token usage history found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <Link href="/pricing"><Button variant="primary" className="flex items-center mx-auto"><span>Upgrade Your Plan</span><ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Details</h2>

                  <div className="border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Current Plan:</span>
                      <span className="text-sm font-semibold text-gray-900">
                         {currentTier === "PRO" ? "Pro Plan" : currentTier === "ENTERPRISE" ? "Enterprise Plan" : "Free Plan"}
                      </span>
                    </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-600">Status:</span>
                       <Badge variant={isActive ? 'secondary' : 'outline'} className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                          {isCancelled ? `Cancels on ${formatDate(endDate)}` : isActive ? 'Active' : 'Inactive'}
                       </Badge>
                     </div>
                     {currentTier !== 'FREE' && startDate && (
                       <div className="flex justify-between items-center">
                         <span className="text-sm font-medium text-gray-600">Current Period:</span>
                         <span className="text-sm text-gray-700">{formatDate(startDate)} - {formatDate(endDate)}</span>
                       </div>
                     )}
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-600">Monthly Tokens:</span>
                       <span className="text-sm text-gray-700">
                         {currentTier === "PRO" ? "500" : currentTier === "ENTERPRISE" ? "2000" : "50"}
                       </span>
                     </div>
                  </div>

                  {currentTier === "FREE" ? (
                     <Link href="/pricing"><Button variant="primary" className="w-full">Upgrade to Pro</Button></Link>
                  ) : (
                    <div className="space-y-4">
                      {currentTier !== 'ENTERPRISE' && (
                         <Link href="/pricing"><Button variant="primary" className="w-full">View Plans & Upgrade</Button></Link>
                      )}

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-md font-medium text-gray-900 mb-3">Manage Subscription</h3>
                        {!showCancelConfirm ? (
                          <div className="space-y-3">
                            <Button variant="secondary" className="w-full" onClick={handleManageBilling} disabled={isPortalLoading || isCancelled}>
                              {isPortalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Manage Billing & Invoices
                            </Button>
                            {!isCancelled && (
                              <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowCancelConfirm(true)}>Cancel Subscription</Button>
                            )}
                          </div>
                        ) : (
                          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                             <h4 className="font-medium text-gray-800 mb-2">Confirm Cancellation</h4>
                             <p className="text-sm text-gray-600 mb-4">Your subscription will remain active until {formatDate(endDate)}. After that, your account will be downgraded to the Free plan.</p>
                             <div className="flex flex-col sm:flex-row gap-3">
                               <Button variant="danger" className="sm:flex-1" disabled={cancelingSubscription} onClick={handleCancelSubscription}>
                                 {cancelingSubscription ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Confirm Cancellation
                               </Button>
                               <Button variant="secondary" className="sm:flex-1" onClick={() => setShowCancelConfirm(false)} disabled={cancelingSubscription}>Keep Subscription</Button>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 border-t border-gray-200 pt-6">
                     <h3 className="text-md font-medium text-gray-900 mb-4">Payment History</h3>
                     {historyLoading ? (
                       <div className="flex justify-center items-center py-4">
                         <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                       </div>
                     ) : paymentHistory.length > 0 ? (
                       <ul className="space-y-3">
                         {paymentHistory.map((invoice: PaymentHistoryItem) => ( // Add type to map parameter
                           <li key={invoice.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                             <div>
                               {/* Convert timestamp to Date before formatting */}
                               <span className="text-gray-700">{formatDate(new Date(invoice.date).toISOString())}</span>
                               <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                 invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                 invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-gray-100 text-gray-600'
                               }`}>
                                 {invoice.status}
                               </span>
                             </div>
                             <div className="flex items-center gap-3">
                               <span className="text-gray-900 font-medium">
                                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                               </span>
                               {/* Ensure href is string or undefined */}
                               {(invoice.hostedInvoiceUrl || invoice.pdfUrl) && (
                                 <a
                                   href={invoice.hostedInvoiceUrl ?? invoice.pdfUrl ?? undefined}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-indigo-600 hover:text-indigo-800"
                                   title={invoice.hostedInvoiceUrl ? "View Invoice" : "Download PDF"}
                                 >
                                   <ExternalLink className="h-4 w-4" />
                                 </a>
                               )}
                             </div>
                           </li>
                         ))}
                       </ul>
                     ) : (
                       <p className="text-sm text-gray-500 italic">No payment history found.</p>
                     )}
                  </div>
                </div>
              </div>
            )}

             {/* Notifications Tab */}
             {activeTab === "notifications" && (
               <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
                  <p className="text-gray-500 italic">Notification settings coming soon.</p>
               </div>
             )}

             {/* Security Tab */}
             {activeTab === "security" && (
               <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                  <p className="text-gray-500 italic">Security settings coming soon.</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal (Basic Example) */}
      {showDeleteModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full space-y-4">
               <h2 className="text-lg font-semibold text-red-700">Confirm Account Deletion</h2>
               <p className="text-sm text-gray-600">
                  This action is irreversible. Please type <strong className="text-red-600">DELETE</strong> below to confirm you want to permanently delete your account and all associated data.
               </p>
               <div>
                  <Label htmlFor="deleteConfirmInput" className="sr-only">Type DELETE to confirm</Label>
                  <Input
                     id="deleteConfirmInput"
                     type="text"
                     value={deleteConfirmationInput}
                     onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                     placeholder='Type "DELETE" here'
                     className="border-red-300 focus:border-red-500 focus:ring-red-500"
                  />
               </div>
               <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeletingAccount}>
                     Cancel
                  </Button>
                  <Button
                     variant="danger"
                     onClick={handleAccountDeletion}
                     disabled={isDeletingAccount || deleteConfirmationInput.toLowerCase() !== 'delete'}
                  >
                     {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                     Confirm Deletion
                  </Button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
