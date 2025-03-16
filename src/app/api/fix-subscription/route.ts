import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    
    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Create or update subscription record
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        subscription_tier: 'PRO',
        is_active: true,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();
    
    if (subscriptionError) {
      return NextResponse.json({ error: "Failed to update subscription", details: subscriptionError }, { status: 500 });
    }
    
    // Ensure token usage is correct
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('token_usage')
      .upsert({
        user_id: userId,
        tokens_used: 0,
        tokens_remaining: 500, // PRO tier tokens
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();
    
    if (tokenError) {
      return NextResponse.json({ error: "Failed to update token usage", details: tokenError }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Subscription and token usage updated successfully",
      subscription: subscriptionData,
      tokenUsage: tokenData
    });
  } catch (error) {
    console.error("Error fixing subscription:", error);
    return NextResponse.json(
      { error: "Failed to fix subscription", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
