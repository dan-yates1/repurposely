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
    console.log("Webhook received. Verifying signature...");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
    console.log(`Webhook signature verified. Event type: ${event.type}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    console.log(`Processing webhook event: ${event.id} (${event.type})`);
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
        console.log(`Webhook: Unhandled event type: ${event.type}`);
    }
    console.log(`Webhook event processed successfully: ${event.id}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook event ${event.id}:`, error);
    return NextResponse.json(
      { error: 'Error processing webhook event: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Helper function to upsert subscription data manually
async function upsertSubscriptionRecord(userId: string, data: Partial<SubscriptionRecord>): Promise<void> {
  console.log(`[Upsert Sub] Checking for existing subscription for user ${userId}`);
  const { data: existing, error: findError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) {
    console.error(`[Upsert Sub] Error checking for existing subscription for user ${userId}:`, findError);
    throw findError;
  }

  if (existing) {
    console.log(`[Upsert Sub] Updating existing subscription record for user ${userId}`);
    const { ...updateData } = data;
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update(updateData)
      .eq('user_id', userId);
    if (updateError) {
       console.error(`[Upsert Sub] Error updating subscription for user ${userId}:`, updateError);
       throw updateError;
    }
    console.log(`[Upsert Sub] Successfully updated subscription for user ${userId}`);
  } else {
    console.log(`[Upsert Sub] Inserting new subscription record for user ${userId}`);
    const { error: insertError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({ ...data, user_id: userId });
    if (insertError) {
       console.error(`[Upsert Sub] Error inserting subscription for user ${userId}:`, insertError);
       throw insertError;
    }
     console.log(`[Upsert Sub] Successfully inserted subscription for user ${userId}`);
  }
}


// Handler for checkout.session.completed event
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Handler: checkout.completed] Start processing session: ${session.id}`);
  if (!session.subscription || !session.customer) {
     console.error('[Handler: checkout.completed] Missing subscription or customer ID in session.');
     return;
  }

  console.log(`[Handler: checkout.completed] Subscription ID: ${session.subscription}, Customer ID: ${session.customer}`);

  let userId = session.metadata?.userId;
  let planName = session.metadata?.planName?.toUpperCase();

  if (!userId) {
    console.log("[Handler: checkout.completed] No userId in session metadata, fetching from customer");
    try {
      const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
      userId = customer.metadata?.userId;
      console.log(`[Handler: checkout.completed] Fetched userId from customer: ${userId}`);
    } catch (custError) {
       console.error(`[Handler: checkout.completed] Error fetching customer ${session.customer}:`, custError);
       return; // Cannot proceed without customer info
    }
  }

  if (!userId) {
    console.error('[Handler: checkout.completed] Missing userId in session and customer metadata after check.');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  console.log(`[Handler: checkout.completed] Retrieved subscription ${subscription.id}, Status: ${subscription.status}`);

  if (!planName) {
    console.log("[Handler: checkout.completed] No planName in session metadata, fetching from subscription product");
    if (subscription.items.data.length > 0 && subscription.items.data[0].price.product) {
      try {
        const productId = subscription.items.data[0].price.product as string;
        const product = await stripe.products.retrieve(productId);
        planName = product.metadata?.tier?.toUpperCase() || product.metadata?.plan_name?.toUpperCase();
        console.log(`[Handler: checkout.completed] Fetched planName from product ${productId}: ${planName}`);
      } catch (prodError) {
         console.error(`[Handler: checkout.completed] Error fetching product for price ${subscription.items.data[0].price.id}:`, prodError);
      }
    }
  }

  if (!planName) {
    console.warn(`[Handler: checkout.completed] Could not determine plan name for subscription ${subscription.id}. Defaulting to PRO.`);
    planName = 'PRO';
  }

  console.log(`[Handler: checkout.completed] Final details - User: ${userId}, Plan: ${planName}`);

  const subscriptionData: Partial<SubscriptionRecord> = {
    subscription_tier: planName,
    is_active: subscription.status === 'active' || subscription.status === 'trialing',
    stripe_subscription_id: subscription.id,
    subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
    subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("[Handler: checkout.completed] Attempting to upsert subscription record in DB...");
  await upsertSubscriptionRecord(userId, subscriptionData); // Errors handled by main catch
  console.log('[Handler: checkout.completed] Upsert subscription record successful.');

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    const tokenAmount = PLAN_TOKEN_AMOUNTS[planName as keyof typeof PLAN_TOKEN_AMOUNTS] || PLAN_TOKEN_AMOUNTS.FREE;
    console.log(`[Handler: checkout.completed] Subscription active/trialing. Upserting ${tokenAmount} tokens for user ${userId}.`);

    const { error: tokenError } = await supabaseAdmin
      .from('token_usage')
      .upsert({
        user_id: userId,
        tokens_used: 0,
        tokens_remaining: tokenAmount,
        reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (tokenError) {
      console.error('[Handler: checkout.completed] Error upserting token_usage:', tokenError);
    } else {
      console.log('[Handler: checkout.completed] Successfully upserted token_usage.');
    }

    console.log("[Handler: checkout.completed] Inserting token transaction record...");
    const { error: transactionError } = await supabaseAdmin
      .from('token_transactions')
      .insert({
        user_id: userId,
        tokens_used: tokenAmount,
        transaction_type: 'SUBSCRIPTION_GRANT',
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('[Handler: checkout.completed] Error creating token transaction:', transactionError);
    } else {
      console.log('[Handler: checkout.completed] Successfully created token transaction.');
    }
  } else {
     console.log(`[Handler: checkout.completed] Subscription status is ${subscription.status}, not granting tokens.`);
  }
  console.log(`[Handler: checkout.completed] Finished processing session: ${session.id}`);
}


// Handler for customer.subscription.updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Handler: sub.updated] Start processing subscription: ${subscription.id}, Status: ${subscription.status}`);
  const customerId = subscription.customer as string;

  let customer: Stripe.Customer | Stripe.DeletedCustomer | null = null;
  try {
     customer = await stripe.customers.retrieve(customerId);
  } catch (err) {
     console.error(`[Handler: sub.updated] Error retrieving customer ${customerId}:`, err);
     return; // Cannot proceed without customer
  }

  if (!customer || customer.deleted) {
    console.error(`[Handler: sub.updated] Customer ${customerId} not found or deleted.`);
    return;
  }

  const userId = customer.metadata.userId;
  if (!userId) {
    console.error(`[Handler: sub.updated] Missing userId in customer metadata for customer ${customerId}`);
    return;
  }

  let planName = subscription.metadata.planName?.toUpperCase();
  if (!planName && subscription.items.data.length > 0 && subscription.items.data[0].price.product) {
     try {
        const productId = subscription.items.data[0].price.product as string;
        const product = await stripe.products.retrieve(productId);
        planName = product.metadata?.tier?.toUpperCase() || product.metadata?.plan_name?.toUpperCase();
        console.log(`[Handler: sub.updated] Fetched planName from product ${productId}: ${planName}`);
     } catch (prodError) {
        console.error(`[Handler: sub.updated] Error fetching product for price ${subscription.items.data[0].price.id}:`, prodError);
     }
  }
  if (!planName) {
    console.warn(`[Handler: sub.updated] Could not determine plan name for updated subscription ${subscription.id}. Checking DB.`);
    try {
       const { data: existingSub } = await supabaseAdmin.from('user_subscriptions').select('subscription_tier').eq('stripe_subscription_id', subscription.id).single();
       planName = existingSub?.subscription_tier || 'FREE';
       console.log(`[Handler: sub.updated] Found planName in DB: ${planName}`);
    } catch (dbError) {
       console.error(`[Handler: sub.updated] Error fetching existing sub from DB:`, dbError);
       planName = 'FREE'; // Fallback if DB check fails
    }
  }

  const isActive = (subscription.status === 'active' || subscription.status === 'trialing') && !subscription.cancel_at_period_end;

  const subscriptionUpdateData: Partial<SubscriptionRecord> = {
      stripe_subscription_id: subscription.id,
      subscription_tier: planName,
      is_active: isActive,
      subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
  };

  console.log(`[Handler: sub.updated] Attempting to upsert subscription record for user ${userId}...`);
  await upsertSubscriptionRecord(userId, subscriptionUpdateData);
  console.log(`[Handler: sub.updated] Upsert subscription record successful for user ${userId}.`);

  // Update token usage if the subscription is active
  if (isActive) {
     console.log(`[Handler: sub.updated] Subscription ${subscription.id} is active. Updating token usage for user ${userId}.`);

     const tokenAmount = PLAN_TOKEN_AMOUNTS[planName as keyof typeof PLAN_TOKEN_AMOUNTS] || PLAN_TOKEN_AMOUNTS.FREE;
     const resetDate = new Date(subscription.current_period_end * 1000).toISOString();

     const { error: tokenError } = await supabaseAdmin
        .from('token_usage')
        .update({
          tokens_remaining: tokenAmount,
          tokens_used: 0,
          reset_date: resetDate,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (tokenError) {
        console.error(`[Handler: sub.updated] Error updating token_usage for user ${userId}:`, tokenError);
      } else {
        console.log(`[Handler: sub.updated] Successfully updated token_usage for user ${userId}.`);
      }
  } else if (subscription.cancel_at_period_end) {
      console.log(`[Handler: sub.updated] Subscription ${subscription.id} cancellation scheduled at period end.`);
  } else {
      console.log(`[Handler: sub.updated] Subscription ${subscription.id} updated but is not active (Status: ${subscription.status}).`);
  }
  console.log(`[Handler: sub.updated] Finished processing subscription: ${subscription.id}`);
}

// Handler for customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Handler: sub.deleted] Start processing subscription: ${subscription.id}, Status: ${subscription.status}`);

  const stripeSubscriptionId = subscription.id;

  const { data: subData, error: findError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle();

  if (findError || !subData?.user_id) {
     console.error(`[Handler: sub.deleted] Could not find user for deleted subscription ${stripeSubscriptionId}:`, findError);
     return;
  }
  const userId = subData.user_id;

  // Update subscription record to inactive
  const { error: updateSubError } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

   if (updateSubError) {
      console.error(`[Handler: sub.deleted] Error marking subscription inactive in DB for user ${userId}:`, updateSubError);
   } else {
      console.log(`[Handler: sub.deleted] Marked subscription as inactive for user ${userId}.`);
   }

  // Downgrade token plan to Free
  const freeTokenAmount = PLAN_TOKEN_AMOUNTS.FREE;
  console.log(`[Handler: sub.deleted] Downgrading user ${userId} to FREE token plan.`);

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
     console.error(`[Handler: sub.deleted] Error downgrading token_usage for user ${userId}:`, tokenError);
  } else {
     console.log(`[Handler: sub.deleted] Successfully downgraded token_usage for user ${userId}.`);
  }
  console.log(`[Handler: sub.deleted] Finished processing subscription: ${subscription.id}`);
}
