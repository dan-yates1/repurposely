"use client";

import { Button } from "./button";
import { useState } from "react";
import toast from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  priceId,
  planName,
  variant = "primary",
  className = "",
  children,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Authentication error. Please try again.");
        return;
      }
      
      if (!sessionData.session) {
        // Directly redirect to auth page with query params for price and plan
        toast.error("Please log in to subscribe");
        router.push(`/auth?checkout_price=${priceId}&checkout_plan=${planName}`);
        return;
      }
      
      // Continue with checkout - user is authenticated
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          planName,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If the error is due to authentication but we thought we were logged in
        if (response.status === 401 && responseData.needsAuth) {
          toast.error("Your session has expired. Please log in again.");
          router.push(`/auth?checkout_price=${priceId}&checkout_plan=${planName}`);
          return;
        }
        
        throw new Error(responseData.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = responseData.checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={`${className} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : children}
    </Button>
  );
}
