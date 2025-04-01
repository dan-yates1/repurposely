import { loadStripe } from "@stripe/stripe-js";
import type { Stripe as StripeClient } from "@stripe/stripe-js";

// Load Stripe client-side instance
let stripePromise: Promise<StripeClient | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Price IDs for each subscription tier
export const STRIPE_PRICE_IDS = {
  FREE: "price_free", // Placeholder for free tier reference
  PRO: "price_1R8kax05YRh3Yy7QhfHgWCQu", // CORRECT Test mode price ID for Pro plan
  ENTERPRISE: "price_1R8kax05YRh3Yy7Qu1wyV6BG", // CORRECT Test mode price ID for Enterprise plan
  // Add Live mode IDs when ready
  // PRO_LIVE: "price_...", 
  // ENTERPRISE_LIVE: "price_...", 
};
