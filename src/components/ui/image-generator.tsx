"use client";

import { useState } from 'react';
import { Loader2, Image as ImageIcon, Download, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
// Remove direct service import, reuse types
import { ImageSize, ImageStyle, GeneratedImage } from '@/lib/image-generation-service'; 
import { useTokens } from '@/hooks/useTokens';
import { useUser } from '@/hooks/useUser'; // Import useUser hook

interface ImageGeneratorProps {
  contentId?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

export function ImageGenerator({ contentId, onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  // Update default size to a valid DALL-E 3 option
  const [imageSize, setImageSize] = useState<ImageSize>('1024x1024'); 
  const [imageStyle, setImageStyle] = useState<ImageStyle>('natural'); // Default style is fine
  const { canPerformOperation, recordTokenTransaction, tokenUsage } = useTokens();
  const { user } = useUser(); // Get user info
  
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter an image description');
      return;
    }
    
    // Check if user has enough tokens
    if (!canPerformOperation('IMAGE_GENERATION')) {
      toast.error('You do not have enough tokens for image generation. Please upgrade your plan or wait for your tokens to reset.');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null); // Clear previous image while generating

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          size: imageSize,
          style: imageStyle,
          userId: user?.id, // Pass the user ID
          contentId: contentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image');
      }
      
      // Assuming the API returns the GeneratedImage structure
      setGeneratedImage(result as GeneratedImage); 
      
      // Record token usage *after* successful generation
      await recordTokenTransaction('IMAGE_GENERATION', contentId);
      
      // Call the callback if provided
      if (onImageGenerated && result.url) {
        onImageGenerated(result.url);
      }
      
      toast.success('Image generated successfully!');
      
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadImage = () => {
    if (!generatedImage) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = generatedImage.url;
    link.download = `repurposely-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image download started');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          AI Image Generator
        </h2>
        <div className="flex items-center text-sm text-indigo-600">
          <Sparkles className="h-4 w-4 mr-1" />
          <span>{tokenUsage?.tokensRemaining || 0} tokens left</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Image Description
        </label>
        <textarea
          id="image-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full h-20 p-3 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          disabled={isGenerating}
        ></textarea>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="image-size" className="block text-sm font-medium text-gray-700 mb-1">
            Image Size
          </label>
          <select
            id="image-size"
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value as ImageSize)}
            className="w-full p-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isGenerating}
          >
            {/* DALL-E 3 Sizes */}
            <option value="1024x1024">Standard Square (1024x1024)</option>
            <option value="1024x1792">Tall Portrait (1024x1792)</option>
            <option value="1792x1024">Wide Landscape (1792x1024)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="image-style" className="block text-sm font-medium text-gray-700 mb-1">
            Style
          </label>
          <select
            id="image-style"
            value={imageStyle}
            onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-gray-700 focus:ring-2 focus:ring-indigo-500"
            disabled={isGenerating}
          >
            {/* DALL-E 3 Styles */}
            <option value="natural">Natural</option>
            <option value="vivid">Vivid</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Image...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              Generate Image (5 tokens)
            </>
          )}
        </button>
      </div>
      
      {generatedImage && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Generated Image</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadImage}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Download image"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            {isGenerating ? (
              <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
                <span className="text-sm text-gray-500">Generating image...</span>
              </div>
            ) : (
              <Image 
                src={generatedImage.url} 
                alt={generatedImage.revised_prompt || generatedImage.prompt} // Use revised prompt for alt if available
                // Use fixed dimensions based on DALL-E 3 sizes for layout consistency
                width={1024} 
                height={1024} // Default to square aspect ratio for layout
                className="w-full h-auto object-contain rounded-lg" // Use object-contain to see full image
              />
            )}
          </div>
          
          <p className="mt-2 text-xs text-gray-500">
            Prompt: {generatedImage.prompt}
            {generatedImage.revised_prompt && (
              <span className="block text-gray-400 italic">Revised: {generatedImage.revised_prompt}</span>
            )}
          </p>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Each image generation costs 5 tokens. Generated images are saved to your account and can be accessed from your content history.
        </p>
      </div>
    </div>
  );
}
