import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/claude';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { originalContent, outputFormat, tone, userId } = await request.json();

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
      tone
    );

    // If user is authenticated, save to history
    if (userId) {
      const { error } = await supabase.from('content_history').insert({
        user_id: userId,
        original_content: originalContent,
        repurposed_content: repurposedContent,
        output_format: outputFormat,
        tone: tone,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error saving to history:', error);
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
