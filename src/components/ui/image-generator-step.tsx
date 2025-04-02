"use client";

import React from 'react'; // Import React for JSX
import { AlertTriangle } from 'lucide-react'; // Removed unused Copy
// Removed unused toast import
import { Label } from '@/components/ui/label'; 
import { Textarea } from '@/components/ui/textarea'; 
import { Checkbox } from './checkbox';

// Define the props based on the parent component (create/page.tsx)
interface ImageGeneratorStepProps {
  generateImage: boolean;
  setGenerateImage: React.Dispatch<React.SetStateAction<boolean>>;
  imagePrompt: string;
  setImagePrompt: React.Dispatch<React.SetStateAction<string>>;
  currentImageUrl: string | null; // URL received *after* generation
  imageError: string | null; // Error message received *after* generation attempt
}

export function ImageGeneratorStep({
  generateImage,
  setGenerateImage,
  imagePrompt,
  setImagePrompt,
  currentImageUrl,
  imageError,
}: ImageGeneratorStepProps) {

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Generate Image (Optional)
      </h2>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Tip:</span> An image will be generated alongside your content if you check the box below. You can provide specific instructions, otherwise an image relevant to your original content will be attempted. (Costs 5 tokens)
        </p>
      </div>

      {/* Checkbox to enable/disable image generation */}
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="generate-image-checkbox"
          checked={generateImage}
          // Add explicit type for 'checked' parameter
          onCheckedChange={(checked: boolean | 'indeterminate') => setGenerateImage(Boolean(checked))} 
        />
        <Label htmlFor="generate-image-checkbox" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Generate an image with this content
        </Label>
      </div>

      {/* Prompt input - only show if checkbox is checked */}
      {generateImage && (
        <div className="space-y-2 mb-4">
          <Label htmlFor="image-prompt">Image Instructions (Optional)</Label>
          <Textarea
            id="image-prompt"
            placeholder="e.g., 'A vibrant illustration in a flat design style', 'Make it a photorealistic image of...'"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            className="min-h-[80px]"
          />
          <p className="text-xs text-gray-500">
            Leave blank to automatically generate a prompt based on your content.
          </p>
        </div>
      )}

      {/* Display generated image URL if successful */}
      {currentImageUrl && !imageError && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
           <p className="text-sm font-medium text-green-800 mb-2">
             Image generated successfully! (View in Results step)
           </p>
           {/* Optionally show the URL here too, or just in ResultsStep */}
           {/* <div className="flex items-center bg-white p-2 rounded border border-gray-200"> ... copy button ... </div> */}
        </div>
      )}

      {/* Display error if generation failed */}
      {imageError && (
         <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start space-x-2">
           <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
           <div>
             <p className="text-sm font-medium text-red-800">Image Generation Failed</p>
             <p className="text-sm text-red-700">{imageError}</p>
           </div>
         </div>
       )}
    </div>
  );
}
