import Stripe from "stripe";

// Verify Stripe environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is missing. Stripe functionality will not work properly.");
  // In production, we might want to throw an error here or use a default behavior
}

// Server-side Stripe client - only import this in server components or API routes
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2025-02-24.acacia", // Using the correct API version
  appInfo: {
    name: 'Repurposely',
    version: '1.0.0',
  },
});
