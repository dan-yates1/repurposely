import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; 
import { stripe } from '@/lib/stripe-server';
import Stripe from 'stripe';

// Initialize Supabase with admin privileges for webhook handler
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Token amounts for each plan
const PLAN_TOKEN_AMOUNTS = {
  FREE: 50,
  PRO: 500,
  ENTERPRISE: 2000,
};

// Define an interface for the subscription data we expect to update/insert
interface SubscriptionRecord {
  user_id?: string; // Optional because it's added on insert
  subscription_tier: string;
  is_active: boolean;
  stripe_subscription_id: string;
  subscription_start_date: string;
  subscription_end_date: string;
  updated_at: string;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Helper function to upsert subscription data manually
// FIX: Type the 'data' parameter
async function upsertSubscriptionRecord(userId: string, data: Partial<SubscriptionRecord>) { 
  // Check if a record exists for the user
  const { data: existing, error: findError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id') 
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) {
    console.error(`Error checking for existing subscription for user ${userId}:`, findError);
    return { data: null, error: findError };
  }

  if (existing) {
    console.log(`Updating existing subscription record for user ${userId}`);
    // Ensure user_id is not part of the update payload itself
    const { user_id, ...updateData } = data; 
    return supabaseAdmin
      .from('user_subscriptions')
      .update(updateData)
      .eq('user_id', userId) 
      .select()
      .single();
  } else {
    console.log(`Inserting new subscription record for user ${userId}`);
    // Ensure user_id is included for insert
    return supabaseAdmin
      .from('user_subscriptions')
      .insert({ ...data, user_id: userId }) 
      .select()
      .single();
  }
}


// Handler for checkout.session.completed event
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.subscription && session.customer) {
    console.log("Processing checkout.session.completed event:", session.id);
    
    let userId = session.metadata?.userId;
    let planName = session.metadata?.planName?.toUpperCase();
    
    if (!userId) {
      console.log("No userId in session metadata, fetching from customer");
      const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
      userId = customer.metadata?.userId;
    }
    
    if (!userId) {
      console.error('Missing userId in session and customer metadata');
      return; 
    }
    
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    if (!planName) {
      console.log("No planName in session metadata, fetching from subscription product");
      if (subscription.items.data.length > 0) {
        const productId = subscription.items.data[0].price.product as string;
        const product = await stripe.products.retrieve(productId);
        planName = product.metadata?.tier?.toUpperCase() || product.metadata?.plan_name?.toUpperCase(); 
      }
    }
    
    if (!planName) {
      console.error(`Could not determine plan name for subscription ${subscription.id}`);
      planName = 'PRO'; // Default fallback
    }
    
    console.log(`Checkout completed for user ${userId} with plan ${planName}`);

    const subscriptionData: Partial<SubscriptionRecord> = {
      subscription_tier: planName, 
      is_active: subscription.status === 'active' || subscription.status === 'trialing', 
      stripe_subscription_id: subscription.id, 
      subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(), 
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(), 
      updated_at: new Date().toISOString(), 
    };

    const { data: updatedSubscriptionData, error: subscriptionError } = await upsertSubscriptionRecord(userId, subscriptionData);

    if (subscriptionError) {
      console.error('Error upserting user_subscriptions:', subscriptionError);
    } else {
      console.log('Successfully upserted user_subscriptions:', updatedSubscriptionData);
    }

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      const tokenAmount = PLAN_TOKEN_AMOUNTS[planName as keyof typeof PLAN_TOKEN_AMOUNTS] || PLAN_TOKEN_AMOUNTS.FREE;
      
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('token_usage')
        .upsert({ 
          user_id: userId,
          tokens_used: 0, 
          tokens_remaining: tokenAmount, 
          reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'token_usage_user_id_key' }) 
        .select();
        
      if (tokenError) {
        console.error('Error upserting token_usage:', tokenError);
      } else {
        console.log('Successfully upserted token_usage:', tokenData);
      }

      const { data: transactionData, error: transactionError } = await supabaseAdmin
        .from('token_transactions')
        .insert({
          user_id: userId,
          tokens_used: -tokenAmount, 
          transaction_type: 'SUBSCRIPTION_GRANT', 
        })
        .select();
        
      if (transactionError) {
        console.error('Error creating token transaction:', transactionError); 
      } else {
        console.log('Successfully created token transaction:', transactionData);
      }
    } else {
       console.log(`Subscription status is ${subscription.status}, not granting tokens.`);
    }

  } else {
    console.error('Missing subscription or customer in checkout session:', session.id);
  }
}


// Handler for customer.subscription.updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Processing customer.subscription.updated: ${subscription.id}, Status: ${subscription.status}`);
  const customerId = subscription.customer as string;
  
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  if (!customer || customer.deleted) {
    console.error(`Customer ${customerId} not found or deleted for subscription update.`);
    return;
  }
  
  const userId = customer.metadata.userId;
  if (!userId) {
    console.error(`Missing userId in customer metadata for customer ${customerId}`);
    return;
  }

  let planName = subscription.metadata.planName?.toUpperCase();
  if (!planName && subscription.items.data.length > 0) {
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);
    planName = product.metadata?.tier?.toUpperCase() || product.metadata?.plan_name?.toUpperCase();
  }
  if (!planName) {
    console.error(`Could not determine plan name for updated subscription ${subscription.id}`);
    const { data: existingSub } = await supabaseAdmin.from('user_subscriptions').select('subscription_tier').eq('stripe_subscription_id', subscription.id).single();
    planName = existingSub?.subscription_tier || 'FREE'; 
  }

  // Determine active status based on Stripe status and cancellation flag
  const isActive = (subscription.status === 'active' || subscription.status === 'trialing') && !subscription.cancel_at_period_end;

  const subscriptionUpdateData: Partial<SubscriptionRecord> = {
      stripe_subscription_id: subscription.id, 
      subscription_tier: planName,
      is_active: isActive, // Use calculated boolean
      subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await upsertSubscriptionRecord(userId, subscriptionUpdateData);

  if (updateError) {
     console.error(`Error upserting subscription ${subscription.id} on update event:`, updateError);
  } else {
     console.log(`Successfully upserted subscription ${subscription.id} on update event.`);
  }

  // Check if active and not scheduled for cancellation
  if (isActive) { // Use the calculated boolean directly
     console.log(`Subscription ${subscription.id} updated and is active/trialing.`);
  }

  if (subscription.cancel_at_period_end) {
      console.log(`Subscription ${subscription.id} cancellation scheduled at period end.`);
  }
}

// Handler for customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Processing customer.subscription.deleted: ${subscription.id}, Status: ${subscription.status}`);
  
  const stripeSubscriptionId = subscription.id;

  const { data: subData, error: findError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle();

  if (findError || !subData?.user_id) {
     console.error(`Could not find user for deleted subscription ${stripeSubscriptionId}:`, findError);
     return; 
  }
  const userId = subData.user_id;

  const { error: updateError } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      is_active: false, 
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId); 

   if (updateError) {
      console.error(`Error marking subscription inactive in DB for user ${userId}:`, updateError);
   } else {
      console.log(`Marked subscription as inactive for user ${userId}.`);
   }

  const freeTokenAmount = PLAN_TOKEN_AMOUNTS.FREE;
  console.log(`Downgrading user ${userId} to FREE token plan due to subscription deletion.`);
  
  const { error: tokenError } = await supabaseAdmin
    .from('token_usage')
    .update({ 
      tokens_remaining: freeTokenAmount, 
      tokens_used: 0, 
      reset_date: null, 
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (tokenError) {
     console.error(`Error downgrading token_usage for user ${userId} on subscription deletion:`, tokenError);
  } else {
     console.log(`Successfully downgraded token_usage for user ${userId} on subscription deletion.`);
  }
}
