import { NextResponse } from 'next/server'; // Removed unused NextRequest
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase-admin';
import { stripe } from '@/lib/stripe-server';
import { type NextRequest } from 'next/server'; // Import NextRequest

export async function POST(request: NextRequest) { // Add request parameter back
  const supabase = createRouteHandlerClient({ cookies });
  const supabaseAdmin = createAdminClient();
  let session = null; // Initialize session variable

  try {
    // 1. Try getting session from cookies first
    // Removed unused cookieSessionError from destructuring
    const { data: cookieSessionData } = await supabase.auth.getSession(); 

    if (cookieSessionData.session) {
      session = cookieSessionData.session;
      console.log("Authenticated via cookie session.");
    } else {
      // 2. If no cookie session, try Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const { data: tokenUserData, error: tokenUserError } = await supabase.auth.getUser(token);
        
        if (tokenUserError || !tokenUserData.user) {
          console.error("Invalid auth token provided:", tokenUserError);
          return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
        }
        // Construct a session-like object (or just use the user object)
        session = { user: tokenUserData.user, access_token: token }; 
        console.log("Authenticated via Authorization header.");
      }
    }

    // 3. Final check if session is valid
    if (!session) {
      console.log("No valid session found via cookie or header.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const stripeCustomerId = session.user.user_metadata?.stripe_customer_id;

    console.log(`Account deletion request received for user: ${userId}`);

    // --- Safety Check: Add extra verification if needed (e.g., password re-auth) ---
    // For simplicity, we're relying on the frontend confirmation for now.
    // In a real production app, consider requiring password re-entry via a separate API call first.

    // 2. Cancel active Stripe subscriptions (if customer ID exists)
    if (stripeCustomerId) {
      console.log(`Checking Stripe subscriptions for customer: ${stripeCustomerId}`);
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active', // Only cancel active ones
          limit: 10, // Limit just in case, though usually only 1 active
        });

        for (const subscription of subscriptions.data) {
          console.log(`Canceling Stripe subscription: ${subscription.id}`);
          await stripe.subscriptions.cancel(subscription.id); 
          // Consider stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true }); 
          // if you want them to keep access until the period ends, but immediate cancel is safer for deletion.
        }
        console.log(`Finished canceling subscriptions for customer: ${stripeCustomerId}`);
      } catch (stripeError) {
        console.error(`Error canceling Stripe subscriptions for customer ${stripeCustomerId}:`, stripeError);
        // Decide if this should be a fatal error. For now, log and continue with Supabase deletion.
        // You might want to prevent deletion if Stripe cancellation fails.
        // return NextResponse.json({ error: 'Failed to cancel Stripe subscription.' }, { status: 500 });
      }
    } else {
      console.log(`No Stripe customer ID found for user: ${userId}, skipping subscription cancellation.`);
    }

    // 3. Delete user data from custom tables (adjust table names and cascade if needed)
    // IMPORTANT: Order matters if you have foreign key constraints without CASCADE DELETE.
    // Delete from tables referencing user_id first.
    console.log(`Deleting data from content_history for user: ${userId}`);
    const { error: contentError } = await supabaseAdmin
      .from('content_history')
      .delete()
      .eq('user_id', userId);

    if (contentError) {
      console.error(`Error deleting content_history for user ${userId}:`, contentError);
      // Decide if this is fatal. Log and continue for now.
    }
    
    console.log(`Deleting data from user_subscriptions for user: ${userId}`);
    const { error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subError) {
      console.error(`Error deleting user_subscriptions for user ${userId}:`, subError);
      // Log and continue.
    }
    
    // Add deletions for any other tables referencing user_id here...
    // e.g., token_usage, token_transactions (if they exist and need cleanup)

    // 4. Delete user from Supabase Auth
    console.log(`Deleting user from Supabase Auth: ${userId}`);
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error(`Error deleting user ${userId} from Supabase Auth:`, authError);
      // This is a critical failure.
      throw new Error(`Failed to delete user account: ${authError.message}`);
    }

    console.log(`Successfully deleted account for user: ${userId}`);

    // 5. Return success response
    // Note: Cookies might be cleared automatically by Supabase on user deletion, 
    // but explicitly signing out on the client after this call is recommended.
    return NextResponse.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Error in /api/user/delete:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during account deletion.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
