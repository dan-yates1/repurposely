"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, Calendar, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubscriptionData {
  id?: string;
  user_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_tier?: string;
  status?: string;
  is_active?: boolean;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  subscription_start_date?: string;
  subscription_end_date?: string;
  updated_at?: string;
  created_at?: string;
}

export function SubscriptionInfo() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchSubscriptionData() {
      try {
        setLoading(true);
        
        // Get the user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("User not found. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Get subscription data
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching subscription:', error);
          setError("Failed to load subscription information.");
        } else {
          setSubscriptionData(data);
        }
      } catch (err) {
        console.error('Error in fetchSubscriptionData:', err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubscriptionData();
  }, [supabase]);

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || "Failed to cancel subscription.");
        return;
      }
      
      // Update local subscription data
      setSubscriptionData({
        ...subscriptionData,
        cancel_at_period_end: true,
      });
      
      setSuccess("Your subscription has been canceled and will end at the current billing period.");
      
      // Refresh the page data
      router.refresh();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError("An unexpected error occurred while canceling your subscription.");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>No subscription information found.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push('/pricing')}>
            View Pricing Options
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const isActive = subscriptionData.is_active !== false;
  const tier = (subscriptionData.subscription_tier || '').toUpperCase();
  const isPaidTier = tier === 'PRO' || tier === 'ENTERPRISE';
  const isCanceled = subscriptionData.cancel_at_period_end === true;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </div>
          {isPaidTier && isActive && (
            <Badge variant={isCanceled ? "outline" : "default"} className={isCanceled ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-green-100 text-green-800 border-green-200"}>
              {isCanceled ? "Canceling" : "Active"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Plan</div>
            <div className="flex items-center">
              {isPaidTier && <Sparkles className="h-4 w-4 mr-1.5 text-indigo-600" />}
              <span className="font-semibold">{tier || "FREE"}</span>
            </div>
          </div>
          
          {isPaidTier && (
            <>
              <div className="flex items-center justify-between">
                <div className="font-medium">Status</div>
                <div className="flex items-center">
                  {isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />
                      <span>{isCanceled ? "Active until end of billing period" : "Active"}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1.5 text-red-600" />
                      <span>Inactive</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Next billing date:</p>
                <p className="text-sm">
                  {subscriptionData?.current_period_end 
                    ? formatDate(subscriptionData.current_period_end)
                    : 'N/A'}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="font-medium">Current Period Ends</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-600" />
                  <span>{formatDate(subscriptionData.subscription_end_date || subscriptionData.current_period_end)}</span>
                </div>
              </div>
            </>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm">
              {success}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isPaidTier && isActive && !isCanceled ? (
          <Button 
            variant="danger" 
            onClick={handleCancelSubscription}
            disabled={cancelling}
          >
            {cancelling ? "Canceling..." : "Cancel Subscription"}
          </Button>
        ) : isPaidTier && isCanceled ? (
          <div className="text-sm text-gray-600">
            Your subscription will end on {formatDate(subscriptionData.subscription_end_date || subscriptionData.current_period_end)}
          </div>
        ) : (
          <Button variant="outline" onClick={() => router.push('/pricing')}>
            Upgrade Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
