import { NextRequest, NextResponse } from 'next/server'; // Import NextRequest
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe-server';

export async function POST(req: NextRequest) { // Add req parameter
  try {
    // Get the user session from Supabase (try cookies first, then token)
    const supabase = createRouteHandlerClient({ cookies });
    let session;
    const authHeader = req.headers.get('authorization'); // Get auth header

    // Try cookie session
    const { data: cookieSession } = await supabase.auth.getSession();
    if (cookieSession.session) {
      session = cookieSession.session;
    } 
    // Try token session
    else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: tokenData, error: tokenError } = await supabase.auth.getUser(token);
      if (tokenError || !tokenData.user) {
        return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
      }
      session = { user: tokenData.user, access_token: token };
    }

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access the customer portal' },
        { status: 401 }
      );
    }
    
    // Get Stripe Customer ID from user metadata
    const customerId = session.user.user_metadata?.stripe_customer_id;
    
    if (!customerId) {
       console.error(`Stripe customer ID not found in metadata for user: ${session.user.id}`);
       // Optionally, try to retrieve from user_subscriptions as a fallback if schema changed?
       // For now, assume it MUST be in metadata.
      return NextResponse.json(
        { error: 'Stripe customer ID not found for this user.' },
        { status: 404 } // Or 500 if this indicates an internal error
      );
    }
    
    // Create a Stripe customer portal session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId, // Use customerId from metadata
      return_url: `${baseUrl}/dashboard`,
    });
    
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json(
      { error: 'Error creating customer portal session' },
      { status: 500 }
    );
  }
}
