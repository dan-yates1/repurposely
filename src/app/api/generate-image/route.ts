import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { ImageGenerationService, ImageSize, ImageStyle } from '@/lib/image-generation-service';

// Define constants for image generation
const IMAGE_GENERATION_COST = 10;
const ALLOWED_PLANS_FOR_IMAGE_GEN = ['PRO', 'ENTERPRISE']; // Using uppercase for consistency

export async function POST(request: NextRequest) {
  try {
    const { prompt, size, style, userId, contentId } = await request.json();

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Image prompt is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required for image generation' },
        { status: 400 }
      );
    }

    // Get user subscription to check plan
    const supabaseAdmin = createAdminClient();
    const { data: userSubscription, error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('subscription_tier, is_active')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error(`Failed to fetch user subscription for ${userId}:`, subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch user subscription' },
        { status: 500 }
      );
    }

    // Get user token usage
    const { data: tokenUsage, error: tokenError } = await supabaseAdmin
      .from('token_usage')
      .select('tokens_remaining')
      .eq('user_id', userId)
      .single();

    if (tokenError) {
      console.error(`Failed to fetch token usage for ${userId}:`, tokenError);
      return NextResponse.json(
        { error: 'Failed to fetch token balance' },
        { status: 500 }
      );
    }

    // Check subscription plan
    const userPlan = userSubscription?.subscription_tier || 'FREE';
    const isActive = userSubscription?.is_active || false;

    if (!isActive || !ALLOWED_PLANS_FOR_IMAGE_GEN.includes(userPlan.toUpperCase())) {
      console.log(`User ${userId} on plan ${userPlan} (active: ${isActive}) attempted image generation. Required: ${ALLOWED_PLANS_FOR_IMAGE_GEN.join('/')}`);
      return NextResponse.json(
        { error: 'Image generation is only available for Pro and Enterprise plans. Please upgrade your subscription.' },
        { status: 403 } // Forbidden
      );
    }

    // Check token balance
    if (!tokenUsage || tokenUsage.tokens_remaining < IMAGE_GENERATION_COST) {
      const remainingTokens = tokenUsage?.tokens_remaining || 0;
      console.log(`User ${userId} attempted image generation with insufficient tokens (${remainingTokens} < ${IMAGE_GENERATION_COST}).`);
      return NextResponse.json(
        { error: `Insufficient tokens for image generation. Requires ${IMAGE_GENERATION_COST}, you have ${remainingTokens}.` },
        { status: 402 } // Payment Required
      );
    }

    // Deduct tokens BEFORE generation
    const newBalance = tokenUsage.tokens_remaining - IMAGE_GENERATION_COST;
    const { error: updateError } = await supabaseAdmin
      .from('token_usage')
      .update({ tokens_remaining: newBalance })
      .eq('user_id', userId);

    if (updateError) {
      console.error(`Failed to deduct tokens for user ${userId}:`, updateError);
      return NextResponse.json(
        { error: 'Failed to update token balance. Please try again.' },
        { status: 500 } // Internal Server Error
      );
    }

    console.log(`Successfully deducted ${IMAGE_GENERATION_COST} tokens from user ${userId}. New balance: ${newBalance}`);

    // Generate image
    console.log(`Generating image with prompt: "${prompt}" for user ${userId}`);
    const imageData = await ImageGenerationService.generateImageData({
      prompt,
      size: size as ImageSize | undefined,
      style: style as ImageStyle | undefined,
      userId,
    });

    // Upload image to Supabase
    console.log(`Image data received, attempting upload for user ${userId}`);
    const imageUrl = await ImageGenerationService.uploadImageToSupabase(
      userId,
      imageData.b64_json
    );
    console.log(`Image uploaded for user ${userId}, URL: ${imageUrl}`);

    // Record transaction in token_transactions table
    if (contentId) {
      const { error: transactionError } = await supabaseAdmin
        .from('token_transactions')
        .insert({
          user_id: userId,
          tokens_used: IMAGE_GENERATION_COST,
          transaction_type: 'IMAGE_GENERATION',
          content_id: contentId,
          created_at: new Date().toISOString()
          // Removed 'amount' field as it doesn't exist in the schema
        });

      if (transactionError) {
        console.error(`Failed to record token transaction for user ${userId}:`, transactionError);
        // Don't return error here, just log it
      }
    }

    // Return the image URL and other relevant data
    return NextResponse.json({
      url: imageUrl,
      prompt: imageData.prompt,
      revised_prompt: imageData.revised_prompt,
      size: imageData.size,
      style: imageData.style,
    });

  } catch (error) {
    console.error('Error in generate-image API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
