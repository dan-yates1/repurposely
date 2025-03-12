import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'No YouTube URL provided' },
        { status: 400 }
      );
    }

    // Extract video ID from the YouTube URL
    const videoId = extractVideoId(youtubeUrl);
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    try {
      // Use OpenAI to transcribe the video from the URL
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const transcription = await transcribeYouTubeWithOpenAI(videoUrl);
      
      return NextResponse.json({ transcription });
    } catch (error) {
      console.error('Error processing YouTube video:', error);
      return NextResponse.json(
        { error: 'Failed to process YouTube video', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in YouTube transcript API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  // Regular YouTube URL format
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[7].length === 11) {
    return match[7];
  }
  
  // Short URL format
  const shortRegExp = /^.*(youtu.be\/)(.*)/;
  const shortMatch = url.match(shortRegExp);
  
  if (shortMatch && shortMatch[2].length === 11) {
    return shortMatch[2];
  }
  
  return null;
}

// Function to transcribe YouTube videos with OpenAI
async function transcribeYouTubeWithOpenAI(videoUrl: string): Promise<string> {
  try {
    // Use the ChatGPT API to extract the transcript
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that transcribes YouTube videos. Given a YouTube URL, provide only the transcript of the video content. Do not include any introduction, explanation, or commentary."
        },
        {
          role: "user",
          content: `Please provide a transcript of this YouTube video: ${videoUrl}`
        }
      ],
      temperature: 0,
      max_tokens: 4000
    });

    return completion.choices[0].message.content || "No transcript available";
  } catch (error) {
    console.error('Error transcribing with OpenAI:', error);
    throw new Error('Failed to transcribe with OpenAI');
  }
}
