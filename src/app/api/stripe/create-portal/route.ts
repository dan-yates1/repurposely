import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe-server';

export async function POST() {
  try {
    // Get the user from Supabase auth
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access the customer portal' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get the customer's Stripe ID from the database
    const { data: userSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();
    
    if (!userSubscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found for this user' },
        { status: 404 }
      );
    }
    
    // Create a Stripe customer portal session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripe_customer_id,
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
