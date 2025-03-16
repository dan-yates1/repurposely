"use client";

import { useState } from "react";
import { Button } from "./button";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface UpgradeButtonProps {
  priceId: string;
  planName: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function UpgradeButton({
  priceId,
  planName,
  variant = "primary",
  size = "md",
  children,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      
      // First, check if the user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // If not authenticated, redirect to auth page with checkout parameters
        toast.error("Please log in to upgrade your plan");
        router.push(`/auth?checkout_price=${priceId}&checkout_plan=${planName}`);
        return;
      }
      
      // User is authenticated, proceed with checkout
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add the Supabase session token to ensure authentication works
          "Authorization": `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({
          priceId,
          planName,
        }),
        credentials: "include", // Include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", data);
        
        // If unauthorized, try to refresh the session
        if (response.status === 401) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            // If refresh fails, redirect to auth
            toast.error("Your session has expired. Please log in again.");
            router.push(`/auth?checkout_price=${priceId}&checkout_plan=${planName}`);
            return;
          }
          
          // Try again after refresh
          toast.error("Please try again");
          setIsLoading(false);
          return;
        }
        
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
      
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleUpgrade}
      disabled={isLoading}
      className={isLoading ? "opacity-70 cursor-not-allowed" : ""}
    >
      {isLoading ? "Processing..." : children}
    </Button>
  );
}
