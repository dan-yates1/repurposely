import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if the request is a multipart form
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be audio or video' },
        { status: 400 }
      );
    }

    // Create a temporary file path
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename with appropriate extension
    const fileExt = file.name.split('.').pop() || 'mp3';
    const tempDir = process.env.TEMP || '/tmp';
    const tempFilePath = join(tempDir, `${uuidv4()}.${fileExt}`);
    
    // Write the file to disk
    await writeFile(tempFilePath, buffer);
    
    // Call OpenAI Whisper API for transcription using the file path
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
    });

    // Clean up the temporary file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error in transcribe API:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
