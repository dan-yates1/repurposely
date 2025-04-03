import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/claude';
import { createAdminClient } from '@/lib/supabase-admin';
import { ImageGenerationService, ImageSize, ImageStyle } from '@/lib/image-generation-service'; // Import service and types

// Define constants for image generation
const IMAGE_GENERATION_COST = 10;
const ALLOWED_PLANS_FOR_IMAGE_GEN = ['Pro', 'Enterprise']; // Adjust plan names if necessary

// Define an interface for the user profile data we need
interface UserProfile {
  plan_name: string;
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
    let userProfile: UserProfile | null = null; // Use the defined interface
    if (userId) {
      try {
        const supabaseAdmin = createAdminClient();
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles') // Assuming your table is named 'profiles'
          .select('plan_name, tokens_remaining') // Fetch plan and tokens
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error(`Error fetching profile for user ${userId}:`, profileError);
          // Decide if this should be a fatal error or just prevent image gen
          // For now, let content gen proceed but log error
        } else if (!profileData) {
          console.warn(`No profile found for user ${userId}`);
          // Handle case where user exists in auth but not profiles table?
        } else {
          userProfile = profileData;
          console.log(`Fetched profile for user ${userId}: Plan=${userProfile.plan_name}, Tokens=${userProfile.tokens_remaining}`);
        }
      } catch (err) {
        console.error(`Unexpected error fetching profile for user ${userId}:`, err);
      }
    }


    // --- Image Generation (Conditional) ---
    if (generateImage && userId && userProfile) { // Check userProfile exists
      try {
        // 1. Check Subscription Plan
        if (!ALLOWED_PLANS_FOR_IMAGE_GEN.includes(userProfile.plan_name)) {
          console.log(`User ${userId} on plan ${userProfile.plan_name} attempted image generation. Required: ${ALLOWED_PLANS_FOR_IMAGE_GEN.join('/')}`);
          return NextResponse.json(
            { error: 'Image generation is only available for Pro and Enterprise plans. Please upgrade your subscription.' },
            { status: 403 } // Forbidden
          );
        }
        console.log(`User ${userId} plan check passed (${userProfile.plan_name}).`);

        // 2. Check Token Balance
        if (userProfile.tokens_remaining < IMAGE_GENERATION_COST) {
          console.log(`User ${userId} attempted image generation with insufficient tokens (${userProfile.tokens_remaining} < ${IMAGE_GENERATION_COST}).`);
          return NextResponse.json(
            { error: `Insufficient tokens for image generation. Requires ${IMAGE_GENERATION_COST}, you have ${userProfile.tokens_remaining}.` },
            { status: 402 } // Payment Required
          );
        }
         console.log(`User ${userId} token balance check passed (${userProfile.tokens_remaining} >= ${IMAGE_GENERATION_COST}).`);

        // 3. Deduct Tokens BEFORE generation
        const newBalance = userProfile.tokens_remaining - IMAGE_GENERATION_COST;
        const supabaseAdmin = createAdminClient(); // Re-init or reuse instance
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ tokens_remaining: newBalance })
          .eq('id', userId);

        if (updateError) {
          console.error(`Failed to deduct tokens for user ${userId}:`, updateError);
          return NextResponse.json(
            { error: 'Failed to update token balance. Please try again.' },
            { status: 500 } // Internal Server Error
          );
        }
        console.log(`Successfully deducted ${IMAGE_GENERATION_COST} tokens from user ${userId}. New balance: ${newBalance}`);
        // Update local state for logging consistency if needed later
        userProfile.tokens_remaining = newBalance; 

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
