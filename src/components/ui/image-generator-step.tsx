"use client";

import { useState } from 'react';
import { ImageGenerator } from '@/components/ui/image-generator';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageGeneratorStepProps {
  contentId?: string;
}

export function ImageGeneratorStep({ contentId }: ImageGeneratorStepProps) {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        AI Image Generator
      </h2>
      
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">Optional step:</span> Generate images to accompany your content. Each image costs 5 tokens.
        </p>
      </div>
      
      <ImageGenerator 
        contentId={contentId}
        onImageGenerated={(imageUrl) => setGeneratedImageUrl(imageUrl)}
      />
      
      {generatedImageUrl && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Use this image in your content:</span> Copy the URL below to include it
          </p>
          <div className="flex items-center bg-white p-2 rounded border border-gray-200">
            <input 
              type="text" 
              value={generatedImageUrl} 
              readOnly 
              className="flex-1 text-sm border-none focus:outline-none text-gray-600"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedImageUrl);
                toast.success("Image URL copied to clipboard");
              }}
              className="p-1 ml-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
