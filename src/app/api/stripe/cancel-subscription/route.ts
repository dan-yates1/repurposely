import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Prevent Next.js from caching the response
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Extract the auth token from the request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No valid auth header found");
      return NextResponse.json(
        { error: "Unauthorized - Please provide a valid authentication token" },
        { status: 401 }
      );
    }
    
    // Get the token from the Authorization header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log("No token found in auth header");
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }
    
    console.log("Token received, creating Supabase client");
    
    // Create a Supabase client with the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    // Get user data from the token
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("Invalid token:", userError);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }
    
    const userId = userData.user.id;
    console.log("User authenticated:", userId);
    
    // Get the user's subscription data
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (subscriptionError) {
      console.error("Error fetching subscription:", subscriptionError);
      return NextResponse.json(
        { error: "Failed to fetch subscription data" },
        { status: 500 }
      );
    }

    if (!subscriptionData) {
      console.error("No subscription found for user:", userId);
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    console.log("Current subscription:", subscriptionData);
    
    // Set the end date to the end of the current billing period (one month from now)
    const currentDate = new Date();
    // If subscription_end_date is already set and in the future, use that
    // Otherwise calculate a new date one month from now
    let endDate = subscriptionData.subscription_end_date 
      ? new Date(subscriptionData.subscription_end_date) 
      : new Date(currentDate);
      
    // If end date is in the past or not set, set it to one month from now
    if (!endDate || endDate <= currentDate) {
      endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    console.log("Setting subscription to end at:", endDate.toISOString());
    
    // Update the subscription status in the database - mark as not active at the end of billing period
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: false,  // Mark as inactive
        subscription_end_date: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
      
    if (updateError) {
      console.error("Error updating subscription in database:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription status" },
        { status: 500 }
      );
    }

    console.log("Subscription cancellation completed successfully");
    
    return NextResponse.json({
      success: true,
      message: "Your subscription will be canceled at the end of the current billing period",
      cancelDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
