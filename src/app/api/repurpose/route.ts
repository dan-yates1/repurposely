import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/claude';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { originalContent, outputFormat, tone, contentLength, targetAudience, userId } = await request.json();

    // Validate input
    if (!originalContent || !outputFormat || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate repurposed content using Claude
    const repurposedContent = await generateContent(
      originalContent,
      outputFormat,
      tone,
      contentLength || 'medium',
      targetAudience || 'general'
    );

    // If user is authenticated, save to history using the admin client
    if (userId) {
      try {
        // Create an admin client that bypasses RLS
        const supabaseAdmin = createAdminClient();
        
        // Insert the content history record
        const { error } = await supabaseAdmin.from('content_history').insert({
          user_id: userId,
          original_content: originalContent,
          repurposed_content: repurposedContent,
          output_format: outputFormat,
          tone: tone,
          // content_length: contentLength || 'medium', // Column does not exist in schema
          target_audience: targetAudience || 'general',
          created_at: new Date().toISOString(),
          // Add other existing columns from schema if needed (e.g., content_type, metadata)
          content_type: outputFormat, // Assuming outputFormat maps to content_type for now
          metadata: { // Example metadata
             tone_used: tone,
             length_setting: contentLength || 'medium',
              audience_setting: targetAudience || 'general'
           }
           // status: 'draft' // Column does not exist in schema
         });

        if (error) {
          console.error('Error saving to history:', error);
          // Continue without saving to history
        } else {
          console.log('Successfully saved to history for user:', userId);
        }
      } catch (err) {
        console.error('Error in Supabase operations:', err);
        // Continue without saving to history
      }
    }

    return NextResponse.json({ repurposedContent });
  } catch (error) {
    console.error('Error in repurpose API:', error);
    return NextResponse.json(
      { error: 'Failed to repurpose content' },
      { status: 500 }
    );
  }
}
