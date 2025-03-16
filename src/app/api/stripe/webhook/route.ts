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

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
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

// Handler for checkout.session.completed event
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.subscription && session.customer) {
    console.log("Processing checkout.session.completed event:", session.id);
    
    // Get customer to find userId if not in metadata
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
    
    // If planName not in metadata, try to determine from the subscription
    if (!planName && session.subscription) {
      console.log("No planName in session metadata, fetching from subscription");
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      // Try to get plan from subscription metadata
      planName = subscription.metadata?.planName?.toUpperCase();
      
      // If still no plan, try to get from product
      if (!planName && subscription.items.data.length > 0) {
        const productId = subscription.items.data[0].price.product as string;
        const product = await stripe.products.retrieve(productId);
        planName = product.metadata?.tier?.toUpperCase() || product.metadata?.plan_name?.toUpperCase();
      }
    }
    
    if (!planName) {
      console.error('Could not determine plan name from session or subscription');
      // Default to PRO if we can't determine the plan
      planName = 'PRO';
    }
    
    console.log(`Checkout completed for user ${userId} with plan ${planName}`);

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Update user_subscriptions table
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_tier: planName,
        status: subscription.status,
        is_active: subscription.status === 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .select();
      
    if (subscriptionError) {
      console.error('Error updating user_subscriptions:', subscriptionError);
    } else {
      console.log('Successfully updated user_subscriptions:', subscriptionData);
    }

    // Reset token usage for the new subscription period
    const tokenAmount = PLAN_TOKEN_AMOUNTS[planName as keyof typeof PLAN_TOKEN_AMOUNTS] || 0;
    
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('token_usage')
      .upsert({
        user_id: userId,
        tokens_used: 0,
        tokens_remaining: tokenAmount,
        reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();
      
    if (tokenError) {
      console.error('Error updating token_usage:', tokenError);
    } else {
      console.log('Successfully updated token_usage:', tokenData);
    }

    // Record this as a token transaction (subscription renewal)
    const { data: transactionData, error: transactionError } = await supabaseAdmin
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: tokenAmount,
        operation_type: 'SUBSCRIPTION_RENEWAL',
        operation_details: { 
          plan: planName, 
          subscription_id: session.subscription 
        },
        created_at: new Date().toISOString(),
      })
      .select();
      
    if (transactionError) {
      console.error('Error creating token transaction:', transactionError);
    } else {
      console.log('Successfully created token transaction:', transactionData);
    }
  } else {
    console.error('Missing subscription or customer in checkout session');
  }
}

// Handler for invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription && invoice.customer) {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    // Get customer metadata to find user ID
    const customer = await stripe.customers.retrieve(invoice.customer as string);
    
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted');
      return;
    }
    
    const userId = customer.metadata.userId;
    if (!userId) {
      console.error('Missing userId in customer metadata');
      return;
    }

    // Get plan information
    const planName = subscription.metadata.planName?.toUpperCase();
    if (!planName) {
      console.error('Missing planName in subscription metadata');
      return;
    }

    // Reset token usage for the new billing period
    const tokenAmount = PLAN_TOKEN_AMOUNTS[planName as keyof typeof PLAN_TOKEN_AMOUNTS] || 0;
    
    await supabaseAdmin
      .from('token_usage')
      .upsert({
        user_id: userId,
        tokens_used: 0,
        tokens_remaining: tokenAmount,
        updated_at: new Date().toISOString(),
      });

    // Record this as a token transaction (subscription renewal)
    await supabaseAdmin
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: tokenAmount,
        operation_type: 'SUBSCRIPTION_RENEWAL',
        operation_details: { 
          plan: planName, 
          invoice_id: invoice.id,
          subscription_id: invoice.subscription 
        },
        created_at: new Date().toISOString(),
      });
  }
}

// Handler for customer.subscription.updated event
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get customer to get userId
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer || customer.deleted) {
    console.error('Customer not found or deleted');
    return;
  }
  
  const userId = customer.metadata.userId;
  if (!userId) {
    console.error('Missing userId in customer metadata');
    return;
  }

  // Get plan information
  let planName = subscription.metadata.planName?.toUpperCase();
  
  // If not in metadata, try to determine from the product
  if (!planName && subscription.items.data.length > 0) {
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);
    planName = product.metadata.plan_name?.toUpperCase();
  }

  if (!planName) {
    console.error('Could not determine plan name');
    return;
  }

  // Update user subscription in database
  await supabaseAdmin
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_tier: planName,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    });

  // If the subscription was changed to a different plan, update token allocation
  if (subscription.status === 'active') {
    const tokenAmount = PLAN_TOKEN_AMOUNTS[planName as keyof typeof PLAN_TOKEN_AMOUNTS] || 0;
    
    // Get current token usage
    const { data: tokenUsage } = await supabaseAdmin
      .from('token_usage')
      .select('tokens_used')
      .eq('user_id', userId)
      .single();
    
    const tokensUsed = tokenUsage?.tokens_used || 0;
    
    // Update token balance
    await supabaseAdmin
      .from('token_usage')
      .upsert({
        user_id: userId,
        tokens_used: tokensUsed,
        tokens_remaining: Math.max(0, tokenAmount - tokensUsed),
        updated_at: new Date().toISOString(),
      });

    // Record plan change as a token transaction
    await supabaseAdmin
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: tokenAmount,
        operation_type: 'PLAN_CHANGED',
        operation_details: { 
          plan: planName,
          subscription_id: subscription.id 
        },
        created_at: new Date().toISOString(),
      });
  }
}

// Handler for customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get customer to get userId
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer || customer.deleted) {
    console.error('Customer not found or deleted');
    return;
  }
  
  const userId = customer.metadata.userId;
  if (!userId) {
    console.error('Missing userId in customer metadata');
    return;
  }

  // Update subscription status in database
  await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .match({ user_id: userId, stripe_subscription_id: subscription.id });

  // Downgrade to free plan
  const freeTokenAmount = PLAN_TOKEN_AMOUNTS.FREE;
  
  // Get current token usage
  const { data: tokenUsage } = await supabaseAdmin
    .from('token_usage')
    .select('tokens_used')
    .eq('user_id', userId)
    .single();
  
  const tokensUsed = tokenUsage?.tokens_used || 0;
  
  // Update token balance to free tier
  await supabaseAdmin
    .from('token_usage')
    .upsert({
      user_id: userId,
      tokens_used: tokensUsed,
      tokens_remaining: Math.max(0, freeTokenAmount - tokensUsed),
      updated_at: new Date().toISOString(),
    });

  // Record subscription cancellation
  await supabaseAdmin
    .from('token_transactions')
    .insert({
      user_id: userId,
      amount: -1, // Negative amount to indicate removal
      operation_type: 'SUBSCRIPTION_CANCELED',
      operation_details: { 
        subscription_id: subscription.id 
      },
      created_at: new Date().toISOString(),
    });
}
