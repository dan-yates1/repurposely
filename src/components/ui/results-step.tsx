"use client";

import { useState } from 'react'; // Keep useState for showPreview
import { Copy, Download, Trash2, Eye, EyeOff } from 'lucide-react'; // Removed Sparkles, Loader2
import toast from 'react-hot-toast';
// Removed ContentQualityCard import
// Removed ContentQualityMetrics import
// Removed useTokens import (no longer needed here)
import { PlatformPreviewTabs } from '@/components/ui/content-preview'; 
import Image from 'next/image'; 
import { AlertTriangle } from 'lucide-react'; // For error display

// Simplified props, removing analysis-related ones
interface ResultsStepProps {
  repurposedContent: string;
  handleCopyToClipboard: () => void;
  handleReset: () => void;
  selectedTemplate?: string | null;
  generatedImageUrl?: string | null; 
  imageError?: string | null; 
}

export function ResultsStep({
  repurposedContent,
  handleCopyToClipboard,
  handleReset,
  selectedTemplate,
  generatedImageUrl, 
  imageError,       
}: ResultsStepProps) {
  // Removed tokenUsage and showAnalysis state
  const [showPreview, setShowPreview] = useState(true);

  const handleDownload = () => { // No changes needed here
    const element = document.createElement('a');
    const file = new Blob([repurposedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'repurposed-content.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Content downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Platform Preview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Platform Preview
          </h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {showPreview && (
          <PlatformPreviewTabs
            content={repurposedContent}
            selectedTemplate={selectedTemplate || 'blog'}
            // Pass image URL to preview component if it accepts it
            imageUrl={generatedImageUrl || undefined} 
          />
        )}
      </div>

      {/* Display Generated Image (if successful) */}
      {generatedImageUrl && !imageError && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Generated Image
          </h2>
          <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-md border">
             <Image 
               src={generatedImageUrl} 
               alt="Generated AI Image" 
               layout="fill" 
               objectFit="contain" // Or 'cover' depending on desired look
             />
          </div>
        </div>
      )}
      
      {/* Display Image Error (if exists) */}
      {imageError && (
         <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-start space-x-3">
           <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
           <div>
             <p className="text-sm font-medium text-red-800">Image Generation Failed</p>
             <p className="text-sm text-red-700">{imageError}</p>
           </div>
         </div>
       )}


      {/* Generated Content */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Generated Content
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleCopyToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="Copy to clipboard"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="Download as text file"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="Clear"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-gray-700 rounded-md whitespace-pre-wrap max-h-[300px] overflow-y-auto">
          {repurposedContent}
        </div>
      </div>

      {/* Removed Content Quality Analysis Section */}
      
    </div>
  );
}
