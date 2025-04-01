import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe-server";
import { createAdminClient } from "@/lib/supabase-admin"; // Import admin client

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
    const userEmail = session.user.email;
    const userMetadata = session.user.user_metadata;

    // Get Stripe customer ID from user metadata
    let customerId = userMetadata?.stripe_customer_id;
    console.log("Retrieved stripe_customer_id from metadata:", customerId);

    // If no customer exists in metadata, create one in Stripe and update metadata
    if (!customerId) {
      if (!userEmail) {
        console.error("User email not found for creating Stripe customer. User ID:", userId);
        return NextResponse.json(
          { error: "User email not found, cannot create Stripe customer." },
          { status: 400 }
        );
      }
      
      console.log("No Stripe customer ID found in metadata, creating new Stripe customer for email:", userEmail);
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId, // Link Stripe customer to Supabase user ID
        },
      });
      customerId = customer.id;
      console.log("Created new Stripe customer:", customerId);

      // Update user metadata in Supabase Auth using Admin client
      const supabaseAdmin = createAdminClient();
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: { ...userMetadata, stripe_customer_id: customerId } }
      );

      if (updateError) {
        console.error("Failed to update user metadata with Stripe customer ID:", updateError);
        // Proceeding anyway, but log the error. Checkout might still work.
        // Consider if this should be a hard failure depending on requirements.
      } else {
        console.log("Successfully updated user metadata with Stripe customer ID:", customerId);
      }
      
      // --- Removed incorrect upsert to user_subscriptions here ---
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
