import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/claude';
import { createAdminClient } from '@/lib/supabase-admin';
import { ImageGenerationService, ImageSize, ImageStyle } from '@/lib/image-generation-service'; // Import service and types

// Define constants for image generation
const IMAGE_GENERATION_COST = 10;
const ALLOWED_PLANS_FOR_IMAGE_GEN = ['PRO', 'ENTERPRISE']; // Using uppercase for consistency

// Define interfaces for the user data we need
interface UserSubscription {
  subscription_tier: string;
  is_active: boolean;
}

interface TokenUsage {
  tokens_remaining: number;
}

export async function POST(request: NextRequest) {
  let uploadedImageUrl: string | null = null; // Variable to hold the final image URL
  let imageGenError: string | null = null; // Variable to hold image generation errors
  let finalImagePrompt: string | null = null; // Declare prompt variable in outer scope

  try {
    // Updated request body structure
    const {
      originalContent,
      outputFormat,
      tone,
      contentLength,
      targetAudience,
      userId,
      generateImage, // boolean flag
      imagePrompt,   // optional user prompt
      imageSize,     // optional size
      imageStyle     // optional style
    } = await request.json();

    // Validate core input
    if (!originalContent || !outputFormat || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields for content generation' },
        { status: 400 }
      );
    }

    // Validate userId if image generation is requested
    if (generateImage && !userId) {
       return NextResponse.json(
         { error: 'User ID is required for image generation' },
         { status: 400 }
       );
    }

    // --- Fetch User Data (Needed for potential image generation) ---
    let userSubscription: UserSubscription | null = null;
    let tokenUsage: TokenUsage | null = null;

    if (userId) {
      try {
        const supabaseAdmin = createAdminClient();

        // Get user subscription
        const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('subscription_tier, is_active')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error(`Error fetching subscription for user ${userId}:`, subscriptionError);
        } else if (subscriptionData) {
          userSubscription = subscriptionData;
          console.log(`Fetched subscription for user ${userId}: Plan=${userSubscription.subscription_tier}, Active=${userSubscription.is_active}`);
        }

        // Get token usage
        const { data: tokenData, error: tokenError } = await supabaseAdmin
          .from('token_usage')
          .select('tokens_remaining')
          .eq('user_id', userId)
          .single();

        if (tokenError) {
          console.error(`Error fetching token usage for user ${userId}:`, tokenError);
        } else if (tokenData) {
          tokenUsage = tokenData;
          console.log(`Fetched token usage for user ${userId}: Tokens=${tokenUsage.tokens_remaining}`);
        }
      } catch (err) {
        console.error(`Unexpected error fetching data for user ${userId}:`, err);
      }
    }


    // --- Image Generation (Conditional) ---
    if (generateImage && userId && userSubscription && tokenUsage) {
      try {
        // 1. Check Subscription Plan
        const userPlan = userSubscription.subscription_tier.toUpperCase();
        const isActive = userSubscription.is_active;

        if (!isActive || !ALLOWED_PLANS_FOR_IMAGE_GEN.includes(userPlan)) {
          console.log(`User ${userId} on plan ${userPlan} (active: ${isActive}) attempted image generation. Required: ${ALLOWED_PLANS_FOR_IMAGE_GEN.join('/')}`);
          return NextResponse.json(
            { error: 'Image generation is only available for Pro and Enterprise plans. Please upgrade your subscription.' },
            { status: 403 } // Forbidden
          );
        }
        console.log(`User ${userId} plan check passed (${userPlan}).`);

        // 2. Check Token Balance
        if (tokenUsage.tokens_remaining < IMAGE_GENERATION_COST) {
          console.log(`User ${userId} attempted image generation with insufficient tokens (${tokenUsage.tokens_remaining} < ${IMAGE_GENERATION_COST}).`);
          return NextResponse.json(
            { error: `Insufficient tokens for image generation. Requires ${IMAGE_GENERATION_COST}, you have ${tokenUsage.tokens_remaining}.` },
            { status: 402 } // Payment Required
          );
        }
        console.log(`User ${userId} token balance check passed (${tokenUsage.tokens_remaining} >= ${IMAGE_GENERATION_COST}).`);

        // 3. Deduct Tokens BEFORE generation
        const newBalance = tokenUsage.tokens_remaining - IMAGE_GENERATION_COST;
        const supabaseAdmin = createAdminClient(); // Re-init or reuse instance
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
        // Update local state for logging consistency if needed later
        tokenUsage.tokens_remaining = newBalance;

        // 4. Proceed with Image Generation
        // Improved default prompt generation
        finalImagePrompt = imagePrompt; // Assign to outer scope variable
        if (!finalImagePrompt) {
          // Generate a default prompt based on the original content
          const contentSnippet = originalContent.substring(0, 150).trim(); // Take first 150 chars
          finalImagePrompt = `A visual representation related to the following content: "${contentSnippet}..."`;
          console.log(`No user prompt provided. Generated default prompt: "${finalImagePrompt}"`);
        } else {
           console.log(`Using user-provided image prompt: "${finalImagePrompt}"`);
        }

        console.log(`Requesting image generation for user ${userId}`);
        const imageData = await ImageGenerationService.generateImageData({
          prompt: finalImagePrompt,
          size: imageSize as ImageSize | undefined, // Cast to type or undefined
          style: imageStyle as ImageStyle | undefined, // Cast to type or undefined
          userId: userId,
        });

        console.log(`Image data received, attempting upload for user ${userId}`);
        uploadedImageUrl = await ImageGenerationService.uploadImageToSupabase(
          userId,
          imageData.b64_json
        );
        console.log(`Image uploaded for user ${userId}, URL: ${uploadedImageUrl}`);

        // Record token transaction for image generation
        const { error: transactionError } = await supabaseAdmin
          .from('token_transactions')
          .insert({
            user_id: userId,
            tokens_used: IMAGE_GENERATION_COST,
            transaction_type: 'IMAGE_GENERATION',
            created_at: new Date().toISOString()
            // Removed 'amount' field as it doesn't exist in the schema
          });

        if (transactionError) {
          console.error(`Failed to record token transaction for user ${userId}:`, transactionError);
          // Don't return error here, just log it
        }

      } catch (err) {
        console.error(`Image generation/upload failed for user ${userId}:`, err);
        imageGenError = err instanceof Error ? err.message : 'Unknown image generation error';
        // Do not throw here, allow content generation to proceed
      }
    }

    // --- Content Generation ---
    console.log(`Generating content for user ${userId || 'anonymous'}`);
    const repurposedContent = await generateContent(
      originalContent,
      outputFormat,
      tone,
      contentLength || 'medium',
      targetAudience || 'general'
    );
    console.log(`Content generated successfully for user ${userId || 'anonymous'}`);

    // --- Save to History (if user is authenticated) ---
    if (userId) {
      try {
        const supabaseAdmin = createAdminClient();

        // Prepare data for insertion, including the new generated_image_url
        const historyData = {
          user_id: userId,
          original_content: originalContent,
          repurposed_content: repurposedContent,
          output_format: outputFormat,
          tone: tone,
          target_audience: targetAudience || 'general',
          created_at: new Date().toISOString(),
          content_type: outputFormat, // Assuming outputFormat maps to content_type
          generated_image_url: uploadedImageUrl, // Use the Supabase URL
          metadata: { // Updated metadata
             tone_used: tone,
             length_setting: contentLength || 'medium',
             audience_setting: targetAudience || 'general',
             image_prompt_used: generateImage ? finalImagePrompt : null, // Log the actual prompt used
             image_generated: !!uploadedImageUrl, // Boolean flag if image was successfully generated and uploaded
             image_error: imageGenError // Log any image generation error
           }
         };

        console.log(`Saving content history for user ${userId} with image URL: ${uploadedImageUrl}`);
        const { error: dbError } = await supabaseAdmin.from('content_history').insert(historyData);

        if (dbError) {
          console.error('Error saving content history to Supabase:', dbError);
          // Log but don't fail the request just because history saving failed
        } else {
          console.log('Successfully saved content history for user:', userId);
        }
      } catch (err) {
        console.error('Error during Supabase history save operation:', err);
        // Log but don't fail the request
      }
    }

    // Return content and potentially the image URL (and maybe error)
    return NextResponse.json({
      repurposedContent,
      generatedImageUrl: uploadedImageUrl, // Send back the URL
      imageError: imageGenError // Send back any image error message
    });

  } catch (error) {
    // Catch errors from content generation or unexpected issues
    console.error('Error in repurpose API:', error);
    return NextResponse.json(
      { error: 'Failed to repurpose content' },
      { status: 500 }
    );
  }
}
