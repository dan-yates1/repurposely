"use client";

import { useState } from 'react';
import { Copy, Download, Trash2, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { ContentQualityCard } from '@/components/ui/content-quality-card';
import { ContentQualityMetrics } from '@/lib/content-analysis-service';
import { useTokens } from '@/hooks/useTokens';
import { PlatformPreviewTabs } from '@/components/ui/content-preview'; // Assuming this handles preview rendering
import Image from 'next/image'; // For displaying the generated image
import { AlertTriangle } from 'lucide-react'; // For error display

interface ResultsStepProps {
  repurposedContent: string;
  handleCopyToClipboard: () => void;
  handleReset: () => void;
  qualityMetrics: ContentQualityMetrics | null;
  isAnalyzing: boolean;
  analyzeContentQuality: () => Promise<void>;
  analysisTarget: "original" | "repurposed";
  setAnalysisTarget: (target: "original" | "repurposed") => void;
  originalContent: string;
  selectedTemplate?: string | null;
  generatedImageUrl?: string | null; // Add prop for image URL
  imageError?: string | null; // Add prop for image error
}

export function ResultsStep({
  repurposedContent,
  handleCopyToClipboard,
  handleReset,
  qualityMetrics,
  isAnalyzing,
  analyzeContentQuality,
  analysisTarget,
  setAnalysisTarget,
  originalContent,
  selectedTemplate,
  generatedImageUrl, // Destructure new props
  imageError,       // Destructure new props
}: ResultsStepProps) {
  const { tokenUsage } = useTokens();
  const [showAnalysis, setShowAnalysis] = useState(Boolean(qualityMetrics));
  const [showPreview, setShowPreview] = useState(true);

  const handleDownload = () => {
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

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Content Quality</h2>
        <button
          onClick={() => {
            if (!qualityMetrics) {
              analyzeContentQuality();
            }
            setShowAnalysis(!showAnalysis);
          }}
          className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 flex items-center"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {showAnalysis ? 'Hide Analysis' : qualityMetrics ? 'Show Analysis' : 'Analyze Content'}
        </button>
      </div>

      {showAnalysis && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-900">Content Quality Analysis</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Analyzing:</span>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setAnalysisTarget("original")}
                  disabled={!originalContent || isAnalyzing}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    analysisTarget === "original"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  } ${(!originalContent || isAnalyzing) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Original
                </button>
                <button
                  onClick={() => setAnalysisTarget("repurposed")}
                  disabled={!repurposedContent || isAnalyzing}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    analysisTarget === "repurposed"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  } ${(!repurposedContent || isAnalyzing) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Repurposed
                </button>
              </div>
              <button
                onClick={analyzeContentQuality}
                disabled={isAnalyzing || 
                  (analysisTarget === "original" && !originalContent) || 
                  (analysisTarget === "repurposed" && !repurposedContent)}
                className="flex items-center justify-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              {analysisTarget === "original" ? (
                <>
                  <span className="font-medium">Analyzing original content:</span> This analysis provides insights on your source content before repurposing.
                </>
              ) : (
                <>
                  <span className="font-medium">Analyzing repurposed content:</span> This analysis provides insights on how your content performs after being repurposed.
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Each analysis costs 2 tokens. You have {tokenUsage?.tokensRemaining || 0} tokens remaining.
            </p>
          </div>
          
          {qualityMetrics ? (
            <ContentQualityCard metrics={qualityMetrics} isLoading={isAnalyzing} />
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
