"use client";

import { Button } from "./button";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser"; // Import the hook
import React from 'react'; // Ensure React is imported for ReactNode

// Restore the interface definition
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
  // Get user AND session from the hook
  const { user, session, loading: userLoading } = useUser(); 

  const handleCheckout = async () => {
    // Don't proceed if user state is still loading
    if (userLoading) {
      toast("Checking authentication status...");
      return; 
    }

    try {
      setIsLoading(true);
      
      // Check if user is logged in using the hook's state
      if (!user) {
        // User is not logged in, redirect to auth page
        toast.error("Please log in to subscribe");
        router.push(`/auth?checkout_price=${priceId}&checkout_plan=${planName}`);
        return;
      }
      
      // Continue with checkout - user is authenticated
      // Use the session object directly from the useUser hook state
      if (!session?.access_token) {
        toast.error("Authentication token not available. Please try logging out and back in.");
        setIsLoading(false);
        return;
      }
      const accessToken = session.access_token;

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Add Authorization header
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
