import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in token-debug API:', authError);
      return NextResponse.json({ 
        success: false,
        error: 'Authentication error', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.error('API: No user found in session');
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    console.log('API: User authenticated:', user.id);
    
    // Check for existing subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id);
      
    // Check for existing token usage
    const { data: tokenData, error: tokenError } = await supabase
      .from('token_usage')
      .select('*')
      .eq('user_id', user.id);
      
    // Return debug info
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      subscription: {
        data: subscriptionData,
        error: subscriptionError ? subscriptionError.message : null
      },
      tokenUsage: {
        data: tokenData,
        error: tokenError ? tokenError.message : null
      }
    });
  } catch (error) {
    console.error('API error in token-debug GET:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function POST() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in token-debug POST:', authError);
      return NextResponse.json({ 
        success: false,
        error: 'Authentication error', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.error('API: No user found in session for token initialization');
      return NextResponse.json({ 
        success: false,
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    console.log('API: User authenticated for token initialization:', user.id);
    
    // Initialize subscription if needed
    let subscriptionResult;
    const { data: existingSubscription, error: subQueryError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id);
      
    if (subQueryError) {
      console.error('Subscription query error:', subQueryError);
      return NextResponse.json({ 
        success: false,
        error: 'Database error', 
        details: subQueryError.message 
      }, { status: 500 });
    }
    
    if (!existingSubscription || existingSubscription.length === 0) {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_tier: 'free',
          subscription_start_date: new Date().toISOString(),
          is_active: true
        })
        .select();
        
      if (error) {
        console.error('Subscription creation error:', error);
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create subscription', 
          details: error.message 
        }, { status: 500 });
      }
      
      subscriptionResult = { created: true, data, error: null };
    } else {
      subscriptionResult = { created: false, data: existingSubscription, error: null };
    }
    
    // Initialize token usage if needed
    let tokenResult;
    const { data: existingTokens, error: tokenQueryError } = await supabase
      .from('token_usage')
      .select('*')
      .eq('user_id', user.id);
      
    if (tokenQueryError) {
      console.error('Token query error:', tokenQueryError);
      return NextResponse.json({ 
        success: false,
        error: 'Database error', 
        details: tokenQueryError.message 
      }, { status: 500 });
    }
    
    if (!existingTokens || existingTokens.length === 0) {
      // Calculate next month's reset date
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      resetDate.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('token_usage')
        .insert({
          user_id: user.id,
          tokens_used: 0,
          tokens_remaining: 50,
          reset_date: resetDate.toISOString()
        })
        .select();
        
      if (error) {
        console.error('Token creation error:', error);
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create token usage', 
          details: error.message 
        }, { status: 500 });
      }
      
      tokenResult = { created: true, data, error: null };
    } else {
      tokenResult = { created: false, data: existingTokens, error: null };
    }
    
    // Return results
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      subscription: subscriptionResult,
      tokenUsage: tokenResult
    });
  } catch (error) {
    console.error('API error in token-debug POST:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
