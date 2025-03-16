"use client";

import { Button } from "./button";
import { useState } from "react";
import toast from "react-hot-toast";

interface CustomerPortalButtonProps {
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  children: React.ReactNode;
}

export function CustomerPortalButton({
  variant = "secondary",
  className = "",
  children,
}: CustomerPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to access customer portal");
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast.error("Failed to access subscription management. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={`${className} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      onClick={handleManageSubscription}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  );
}
