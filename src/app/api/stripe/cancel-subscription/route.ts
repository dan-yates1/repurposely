import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe-server'; // Import stripe server instance
import { createAdminClient } from "@/lib/supabase-admin"; // Use admin client for reliable db access

// Prevent Next.js from caching the response
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Extract the auth token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // --- Use Supabase client with provided token for auth check ---
    const supabaseUserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !userData.user) {
      console.error("Invalid token during cancellation:", userError);
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }
    const userId = userData.user.id;
    console.log("User authenticated for cancellation:", userId);
    // --- Auth check complete ---

    // --- Use Supabase Admin client to fetch subscription ID ---
    const supabaseAdmin = createAdminClient();
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_subscription_id, subscription_tier, is_active") // Select needed fields
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle to handle null case gracefully

    if (subscriptionError) {
      console.error("Error fetching subscription for cancellation:", subscriptionError);
      return NextResponse.json({ error: "Failed to fetch subscription data" }, { status: 500 });
    }

    // Check if there's an active subscription with a Stripe ID
    if (!subscriptionData?.stripe_subscription_id || !subscriptionData.is_active) {
      console.log("No active subscription found or missing Stripe ID for user:", userId);
      return NextResponse.json(
        { error: "No active subscription found to cancel." },
        { status: 400 } // Bad request - nothing to cancel
      );
    }

    const stripeSubscriptionId = subscriptionData.stripe_subscription_id;
    console.log("Found active subscription to cancel:", stripeSubscriptionId);

    // --- Call Stripe API to cancel at period end ---
    const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    console.log("Stripe subscription updated to cancel at period end:", updatedSubscription.id);

    // --- IMPORTANT: Do NOT update the database here ---
    // The webhook handler for 'customer.subscription.updated' will receive
    // the event from Stripe (triggered by the update above) and update the 
    // database record accordingly (setting is_active based on status, etc.).
    // This keeps our database in sync with Stripe as the source of truth.

    // Return the date when the subscription will actually end
    const cancelDate = new Date(updatedSubscription.current_period_end * 1000).toISOString();

    return NextResponse.json({
      success: true,
      message: "Your subscription cancellation has been scheduled with Stripe.",
      cancelDate: cancelDate, // Send back the actual end date from Stripe
    });

  } catch (error) {
    console.error("Error canceling subscription via Stripe API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to cancel subscription: ${errorMessage}` },
      { status: 500 }
    );
  }
}
