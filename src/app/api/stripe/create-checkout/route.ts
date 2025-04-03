import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe-server'; // Uses server-side keys (should be LIVE in prod)
import { createAdminClient } from '@/lib/supabase-admin'; // For updating user metadata
import Stripe from 'stripe'; // Import Stripe namespace
import type { NextRequest } from 'next/server'; // Import NextRequest

export async function POST(request: NextRequest) { // Use NextRequest
  const supabase = createRouteHandlerClient({ cookies: cookies });
  const supabaseAdmin = createAdminClient(); // Needed to update user metadata
  let session = null; // Initialize session variable
  let userId : string | null = null; // Initialize userId

  try {
    // 1. Authenticate user (Prioritize Header, then Cookie)
    const authHeader = request.headers.get('authorization');
    console.log("Create Checkout: Auth Header Received:", authHeader ? 'Present' : 'Missing'); // Log header presence
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log("Create Checkout: Attempting validation with Bearer token:", token ? token.substring(0, 10) + '...' : 'null'); 
      const { data: { user: tokenUser }, error: userError } = await supabase.auth.getUser(token);
      if (userError) {
         console.error("Create Checkout: Error validating token:", userError.message);
      } else if (tokenUser) {
         userId = tokenUser.id;
         // Reconstruct a basic session object if needed later
         session = { user: tokenUser, access_token: token }; 
         console.log("Create Checkout: Authenticated via Authorization header.");
      }
    }

    // If no user ID from header, try cookie session
    if (!userId) {
       console.log("Create Checkout: No valid token in header, trying cookie session...");
       const { data: cookieSessionData } = await supabase.auth.getSession();
       if (cookieSessionData?.session?.user) {
          session = cookieSessionData.session; // Store full session if found via cookie
          userId = session.user.id;
          console.log("Create Checkout: Authenticated via cookie session.");
       }
    }
    
    // Final check if user ID was obtained
    if (!userId || !session) { // Also check if session object exists
      console.log("Create Checkout: No valid session or token found.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Now we have userId and session object
    const user = session.user;
    const userEmail = user.email;
    let stripeCustomerId = user.user_metadata?.stripe_customer_id;

    console.log(`Checkout request for user: ${user.id}, Email: ${userEmail}, Existing Stripe ID: ${stripeCustomerId}`);

    // 2. Validate or Create Stripe Customer ID for the current mode (Live/Test)
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
        console.log(`Existing Stripe customer ${stripeCustomerId} found in current mode.`);
      } catch (error: unknown) { 
        const stripeError = error as Stripe.StripeRawError; 
        if (stripeError?.code === 'resource_missing') {
          console.warn(`Stripe customer ${stripeCustomerId} not found in current mode (likely a Test ID in Live mode). Creating a new customer.`);
          stripeCustomerId = null; 
        } else {
          throw error;
        }
      }
    }

    // If no valid customer ID exists for the current mode, create one
    if (!stripeCustomerId) {
      console.log(`Creating new Stripe customer for email: ${userEmail}`);
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      console.log(`Created new Stripe customer: ${stripeCustomerId}`);

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, stripe_customer_id: stripeCustomerId } }
      );

      if (updateError) {
        console.error('Error updating user metadata with Stripe customer ID:', updateError);
      } else {
         console.log(`Successfully updated user metadata with Stripe customer ID: ${stripeCustomerId}`);
      }
    }

    // 3. Get Price ID and Plan Name from request body
    const { priceId, planName } = await request.json();
    if (!priceId || !planName) {
      return NextResponse.json({ error: 'Missing priceId or planName' }, { status: 400 });
    }

    // 4. Create Stripe Checkout Session
    const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancelled`;

    console.log(`Creating checkout session for Price ID: ${priceId}, Customer: ${stripeCustomerId}`);

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription', 
      customer: stripeCustomerId, 
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: user.id, planName: planName },
    });

    if (!checkoutSession.url) {
      throw new Error('Could not create Stripe Checkout session.');
    }

    // 5. Return the Checkout Session URL
    return NextResponse.json({ checkoutUrl: checkoutSession.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'; 
    return NextResponse.json({ error: `Failed to create checkout session: ${errorMessage}` }, { status: 500 });
  }
}
