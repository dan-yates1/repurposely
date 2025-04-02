// Image Generation Service
// This service handles the generation of AI images based on text prompts using OpenAI DALL-E

// Removed unused 'supabase' import
import OpenAI, { APIError } from 'openai';
import { createAdminClient } from './supabase-admin'; // Import admin client for uploading
import { v4 as uuidv4 } from 'uuid'; // For generating unique filenames

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure OPENAI_API_KEY is in your .env file
});

// DALL-E 3 supported sizes
export type ImageSize = '1024x1024' | '1024x1792' | '1792x1024'; 
// Note: DALL-E 2 sizes ('256x256', '512x512') are removed as we target DALL-E 3
export type ImageStyle = 'natural' | 'vivid'; // DALL-E 3 API supports only 'natural' or 'vivid'

export interface ImageGenerationOptions {
  prompt: string;
  size?: ImageSize;
  style?: ImageStyle;
  userId: string; // Make userId mandatory for associating uploads
}

// Simplified return type focusing on data needed for upload
export interface GeneratedImageData {
  b64_json: string;
  revised_prompt?: string;
  prompt: string; // Keep original prompt for context
  size: ImageSize;
  style: ImageStyle;
}

export class ImageGenerationService {

  // Returns base64 image data instead of URL
  static async generateImageData(options: ImageGenerationOptions): Promise<GeneratedImageData> {
    // Set default size to a valid DALL-E 3 size for cost-effectiveness
    // Removed unused 'userId' from destructuring here
    const { prompt, size = '1024x1024', style = 'natural' } = options;

    // Validate the prompt
    if (!prompt || prompt.trim().length < 3) {
      throw new Error('Please provide a more detailed image prompt (at least 3 characters).');
    }

    if (!openai.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
    }

    try {
      console.log(`Generating image with prompt: "${prompt}", size: ${size}, style: ${style}`);
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1, // Generate one image
        size: size,
        quality: "standard", // Use standard quality for lower cost
        style: style, // 'natural' or 'vivid'
        response_format: "b64_json", // Request base64 encoded image data
      });

      const b64Json = response.data[0]?.b64_json;
      const revisedPrompt = response.data[0]?.revised_prompt;

      if (!b64Json) {
        throw new Error('Image generation failed, no base64 data returned.');
      }
      
      console.log(`Image generated successfully as base64 data.`);
      if (revisedPrompt) {
        console.log(`Prompt revised by DALL-E: "${revisedPrompt}"`);
      }

      // Return the raw data needed for upload and context
      return {
        b64_json: b64Json,
        revised_prompt: revisedPrompt,
        prompt: prompt, // Return original prompt
        size,
        style,
      };

    } catch (error: unknown) {
      console.error('Error calling OpenAI Image API:', error); // Keep detailed logging
      let errorMessage = 'An unknown error occurred during image generation.';
      
      if (error instanceof APIError) {
        // Handle OpenAI specific API errors
        errorMessage = `OpenAI API Error (${error.status}): ${error.message}`;
        console.error('OpenAI API Error Status:', error.status);
        // error.error might contain more detailed structured error info from OpenAI
        console.error('OpenAI API Error Details:', error.error); 
      } else if (error instanceof Error) {
        // Handle generic JavaScript errors
        errorMessage = error.message;
      } else if (typeof error === 'string') {
         // Handle plain string errors (less common)
         errorMessage = error;
      }
      
      throw new Error(`Failed to generate image: ${errorMessage}`);
    }
  }

  // This function will likely be deprecated in Step 3
  // static async getImageHistory(userId: string, limit = 10): Promise<GeneratedImage[]> {
  //   // ... existing implementation ...
  // }

  // Helper function to upload image data to Supabase Storage
  static async uploadImageToSupabase(userId: string, b64Json: string): Promise<string> {
    if (!userId || !b64Json) {
      throw new Error('User ID and base64 image data are required for upload.');
    }

    const supabaseAdmin = createAdminClient();
    const bucketName = 'generated-images'; // As confirmed
    const fileName = `${uuidv4()}.png`; // Generate unique filename
    const filePath = `public/${userId}/${fileName}`; // Organize by user ID in a public folder

    try {
      // Decode base64 string to Buffer
      const imageBuffer = Buffer.from(b64Json, 'base64');

      console.log(`Uploading image to Supabase Storage: ${bucketName}/${filePath}`);

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(filePath, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600', // Cache for 1 hour
          upsert: false, // Don't overwrite existing files (should be unique anyway)
        });

      if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        throw new Error(`Failed to upload image to Supabase Storage: ${uploadError.message}`);
      }

      if (!uploadData?.path) {
         throw new Error('Supabase Storage upload succeeded but did not return a path.');
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error('Could not get public URL for uploaded file:', filePath);
        throw new Error('Failed to get public URL for uploaded image.');
      }

      console.log(`Image uploaded successfully. Public URL: ${urlData.publicUrl}`);
      return urlData.publicUrl;

    } catch (error) {
      console.error('Error during image upload process:', error);
      // Re-throw the error to be handled by the calling function (/api/repurpose)
      throw error; 
    }
  }
}
