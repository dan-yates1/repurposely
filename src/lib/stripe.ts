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
  FREE: "price_free", // You won't charge for this, but good to have for reference
  PRO: "price_1R3LHk05YRh3Yy7Qwuz1EPQ4", // Test mode price ID for Pro plan
  ENTERPRISE: "price_1R3LHk05YRh3Yy7QsFeTh0Ae", // Test mode price ID for Enterprise plan
  // PRO: "price_1R3IoI05YRh3Yy7QB0GdwRrt", // Live mode price ID
  // ENTERPRISE: "price_1R3IrE05YRh3Yy7QEF10Pprs", // Live mode price ID
};
