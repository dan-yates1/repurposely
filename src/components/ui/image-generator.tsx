"use client";

import { useState } from 'react';
import { Loader2, Image as ImageIcon, Download, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ImageGenerationService, ImageSize, ImageStyle, GeneratedImage } from '@/lib/image-generation-service';
import { useTokens } from '@/hooks/useTokens';

interface ImageGeneratorProps {
  contentId?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

export function ImageGenerator({ contentId, onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>('512x512');
  const [imageStyle, setImageStyle] = useState<ImageStyle>('natural');
  const { canPerformOperation, recordTokenTransaction, tokenUsage } = useTokens();
  
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
    
    try {
      const generatedImg = await ImageGenerationService.generateImage({
        prompt: prompt,
        size: imageSize,
        style: imageStyle,
        contentId
      });
      
      setGeneratedImage(generatedImg);
      
      // Record token usage
      await recordTokenTransaction('IMAGE_GENERATION', contentId);
      
      // Call the callback if provided
      if (onImageGenerated) {
        onImageGenerated(generatedImg.url);
      }
      
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
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
            <option value="256x256">Small (256x256)</option>
            <option value="512x512">Medium (512x512)</option>
            <option value="1024x1024">Large (1024x1024)</option>
            <option value="1024x1792">Portrait (1024x1792)</option>
            <option value="1792x1024">Landscape (1792x1024)</option>
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
            <option value="natural">Natural</option>
            <option value="vivid">Vivid</option>
            <option value="abstract">Abstract</option>
            <option value="artistic">Artistic</option>
            <option value="professional">Professional</option>
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
                alt={generatedImage.prompt}
                width={imageSize.split('x')[0] === '256' ? 256 : imageSize.split('x')[0] === '512' ? 512 : 1024}
                height={imageSize.split('x')[1] === '256' ? 256 : imageSize.split('x')[1] === '512' ? 512 : 1024}
                className="w-full h-auto object-cover rounded-lg"
              />
            )}
          </div>
          
          <p className="mt-2 text-xs text-gray-500 truncate">
            {generatedImage.prompt}
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
