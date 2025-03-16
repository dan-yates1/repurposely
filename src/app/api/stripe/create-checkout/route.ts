import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const { priceId, planName } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    // Get the user session from Supabase
    // Fix the cookies issue by using the correct method
    const supabase = createRouteHandlerClient({ cookies });
    
    let session;
    
    // Try to get session from cookies first
    const { data: cookieSession } = await supabase.auth.getSession();
    
    if (cookieSession.session) {
      session = cookieSession.session;
    } 
    // If no cookie session but we have an auth header, try to use that
    else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: tokenData, error: tokenError } = await supabase.auth.getUser(token);
      
      if (tokenError || !tokenData.user) {
        return NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 }
        );
      }
      
      // We have a valid user from the token
      session = {
        user: tokenData.user,
        access_token: token
      };
    }

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check for existing subscription data - using correct column name for your database schema
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")  // Use * to see what columns are available
      .eq("user_id", userId)
      .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subscriptionError);
      return NextResponse.json(
        { error: "Failed to fetch subscription data" },
        { status: 500 }
      );
    }

    // Log the available columns for debugging
    console.log("Subscription data columns:", subscriptionData ? Object.keys(subscriptionData) : "No data found");

    // Get or create Stripe customer ID
    let customerId = subscriptionData?.stripe_customer_id;

    // If we don't have a stripe_customer_id column, look for customer_id instead
    if (!customerId && subscriptionData?.customer_id) {
      customerId = subscriptionData.customer_id;
      console.log("Using customer_id instead of stripe_customer_id:", customerId);
    }

    // If no customer exists, create one
    if (!customerId) {
      const userEmail = session.user.email;
      
      if (!userEmail) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 400 }
        );
      }
      
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });

      customerId = customer.id;

      // Store the customer ID in the user_subscriptions table using the correct column name
      // Check which column name exists in your database schema
      const columnToUse = subscriptionData && 'customer_id' in subscriptionData ? 'customer_id' : 'stripe_customer_id';
      
      const updateData: Record<string, unknown> = {
        user_id: userId,
        subscription_tier: 'FREE', // Default to free plan
        status: 'active',
        updated_at: new Date().toISOString(),
      };
      
      // Set the correct column name
      updateData[columnToUse] = customerId;
      
      await supabase.from("user_subscriptions").upsert(updateData);
      
      console.log(`Stored customer ID in ${columnToUse} column:`, customerId);
    }

    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=canceled`,
      subscription_data: {
        metadata: {
          userId: userId,
          planName: planName || "pro", // Default to pro if not specified
        },
      },
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
