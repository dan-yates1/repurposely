import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SUBSCRIPTION_TIERS } from '@/lib/token-service';

export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error in init-tokens API:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const userId = user.id;
    console.log('Initializing tokens for user:', userId);

    // Check for existing token usage
    const { data: existingTokens, error: tokenQueryError } = await supabase
      .from('token_usage')
      .select('*')
      .eq('user_id', userId);

    if (tokenQueryError) {
      console.error('Token query error:', tokenQueryError);
      return NextResponse.json({
        success: false,
        error: 'Database error while checking token usage',
      }, { status: 500 });
    }

    // If tokens already exist, just return them
    if (existingTokens && existingTokens.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Tokens already initialized',
        data: existingTokens[0]
      });
    }

    // Get the user's subscription tier
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Subscription query error:', subscriptionError);
      return NextResponse.json({
        success: false,
        error: 'Database error while checking subscription',
      }, { status: 500 });
    }

    // Default to FREE tier if no subscription found
    const subscriptionTier = (subscriptionData?.subscription_tier || 'FREE').toUpperCase();
    const tokenAmount = SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS]?.monthlyTokens || 50;

    // Calculate reset date (1st of next month)
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    // Create token usage record
    const { data: newTokens, error: tokenCreateError } = await supabase
      .from('token_usage')
      .insert({
        user_id: userId,
        tokens_used: 0,
        tokens_remaining: tokenAmount,
        reset_date: resetDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (tokenCreateError) {
      console.error('Token creation error:', tokenCreateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize tokens',
      }, { status: 500 });
    }

    // Create a token transaction record for initialization
    await supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        tokens_used: tokenAmount,
        transaction_type: 'ACCOUNT_INITIALIZATION',
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: 'Tokens initialized successfully',
      data: newTokens[0]
    });
  } catch (error) {
    console.error('Error in init-tokens API:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
