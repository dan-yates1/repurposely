"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { useSearchParams } from 'next/navigation'; // Added useSearchParams
import toast, { Toaster } from "react-hot-toast";
import {
  Loader2,
  Sparkles,
} from "lucide-react";
import { useUser } from "@/hooks/useUser"; // Import useUser
import { useTokens } from "@/hooks/useTokens";
import { usePageTitle } from "@/hooks/usePageTitle";
import { OperationType } from "@/lib/token-service";
import { TEMPLATES } from "@/lib/templates"; // Added TEMPLATES import
import { Breadcrumbs } from "@/components/ui/breadcrumbs"; 
import { CreationSteps } from "@/components/ui/creation-steps";
import { TemplateSelectionStep } from "@/components/ui/template-selection-step";
import { ContentInputStep } from "@/components/ui/content-input-step";
import { OutputSettingsStep } from "@/components/ui/output-settings-step";
import { ImageGeneratorStep } from "@/components/ui/image-generator-step";
import { ResultsStep } from "@/components/ui/results-step";


export default function Create() {
  // Page title
  usePageTitle("Create New Content");
  const searchParams = useSearchParams(); // Initialize searchParams
  
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  
  // Content state
  const [originalContent, setOriginalContent] = useState("");
  const [repurposedContent, setRepurposedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // File handling
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Output settings
  const [tone, setTone] = useState("professional");
  const [contentLength, setContentLength] = useState("medium");
  const [includeKeywords, setIncludeKeywords] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  
  // Removed Quality analysis state
  // const [qualityMetrics, setQualityMetrics] = useState<ContentQualityMetrics | null>(null);
  // const [isAnalyzing, setIsAnalyzing] = useState(false);
  // const [analysisTarget, setAnalysisTarget] = useState<"original" | "repurposed">("repurposed");
  
  // Token management
  const { canPerformOperation, recordTokenTransaction, tokenUsage } = useTokens();
  const { user } = useUser(); 

  // Effect to handle pre-selection from query parameter
  useEffect(() => {
    const templateIdFromQuery = searchParams.get('template');
    if (templateIdFromQuery) {
      // Check if the template ID exists in our TEMPLATES array
      const templateExists = TEMPLATES.some(t => t.id === templateIdFromQuery);
      if (templateExists) {
        console.log(`Pre-selecting template: ${templateIdFromQuery}`);
        setSelectedTemplate(templateIdFromQuery);
        setCurrentStep(1); // Skip to the next step (Content Input)
      } else {
        console.warn(`Template ID "${templateIdFromQuery}" from query param not found.`);
        // Optional: Show a toast message?
        // toast.error(`Invalid template specified.`);
      }
    }
  }, [searchParams]); // Run only when searchParams changes (usually on initial load)

  // Image Generation State
  const [generateImage, setGenerateImage] = useState(false); // Flag to control image generation
  const [imagePrompt, setImagePrompt] = useState(""); // User's custom prompt
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null); // Stores the URL *after* API call
  const [imageError, setImageError] = useState<string | null>(null); // Stores any image error from API

  // Handle template selection
  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
  };

  // Handle file upload and transcription
  const handleFileUpload = async () => {
    if (!file) return;

    // Check if user has enough tokens for transcription
    if (!canPerformOperation("VIDEO_PROCESSING" as OperationType)) {
      toast.error("You don't have enough tokens to process this file. Please upgrade your subscription.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);

      // Call transcription API
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setOriginalContent(data.transcript);

      // Record token transaction
      await recordTokenTransaction("VIDEO_PROCESSING" as OperationType);

      toast.success("File transcribed successfully");
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle content generation
  const handleSubmit = async () => {
    if (!originalContent.trim() || !selectedTemplate) {
      toast.error("Please enter content and select a template");
      return;
    }

    // Check if user has enough tokens
    if (!canPerformOperation("TEXT_REPURPOSE" as OperationType)) {
      toast.error("You don't have enough tokens. Please upgrade your subscription.");
      return;
    }

    setLoading(true);
    setRepurposedContent(""); // Clear previous results
    setGeneratedImageUrl(null); // Clear previous image URL
    setImageError(null); // Clear previous image error

    // Get user ID from useUser hook
    const userId = user?.id;

    // Prepare data for API call
    const requestBody = {
      originalContent,
      outputFormat: selectedTemplate, // Use template ID as format
      tone,
      contentLength,
      targetAudience,
      userId: userId || null, // Send userId if available
      generateImage: generateImage && !!userId, // Only generate if flag is true AND user is logged in
      imagePrompt: generateImage ? imagePrompt : undefined, // Send prompt only if generating
      // Add imageSize and imageStyle if needed later
    };

    console.log("Sending request to /api/repurpose:", requestBody);

    try {
      // Call the actual repurpose API endpoint
      const response = await fetch("/api/repurpose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth token if your API requires it (recommended)
          // Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Received response from /api/repurpose:", data);

      if (!response.ok) {
        // Handle API errors (content or general)
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      // Update state with results
      setRepurposedContent(data.repurposedContent);
      setGeneratedImageUrl(data.generatedImageUrl || null); // Update with URL from API response
      setImageError(data.imageError || null); // Update with error from API response

      // Record token transaction only if content generation part was successful
      // Note: Token deduction for image generation should ideally happen within the API route
      // or be triggered based on the response. For now, just record text repurpose.
      if (userId) { // Only record if user is logged in
         await recordTokenTransaction("TEXT_REPURPOSE" as OperationType);
         // TODO: Consider adding separate token transaction for image generation based on response
      }

      // Show appropriate success/error messages
      toast.success("Content generated successfully!");
      if (data.imageError) {
        toast.error(`Image generation failed: ${data.imageError}`, { duration: 5000 });
      } else if (data.generatedImageUrl) {
        toast.success("Image generated successfully!");
      }

      // Automatically move to the final step
      setCurrentStep(4);
    } catch (error) {
      console.error("Error during content generation process:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to generate content: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle copying content to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(repurposedContent);
    toast.success("Copied to clipboard");
  };

  // Handle resetting the form
  const handleReset = () => {
    setOriginalContent("");
    setRepurposedContent("");
    setSelectedTemplate(null);
    setFile(null);
    setCurrentStep(0);
    // Removed qualityMetrics reset
    // Reset image state as well
    setGenerateImage(false);
    setImagePrompt("");
    setGeneratedImageUrl(null);
    setImageError(null);
  };

  // Removed analyzeContentQuality function and related useEffect hook

  // Define the steps for our creation workflow
  const steps = [
    {
      id: "template",
      title: "Choose Template",
      content: (
        <TemplateSelectionStep
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
        />
      ),
    },
    {
      id: "content",
      title: "Add Content",
      content: (
        <ContentInputStep
          originalContent={originalContent}
          setOriginalContent={setOriginalContent}
          file={file}
          setFile={setFile}
          handleFileUpload={handleFileUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      ),
    },
    {
      id: "settings",
      title: "Output Settings",
      content: (
        <OutputSettingsStep
          tone={tone}
          setTone={setTone}
          contentLength={contentLength}
          setContentLength={setContentLength}
          includeKeywords={includeKeywords}
          setIncludeKeywords={setIncludeKeywords}
          keywords={keywords}
          setKeywords={setKeywords}
          targetAudience={targetAudience}
          setTargetAudience={setTargetAudience}
        />
      ),
    },
    {
      id: "images",
      title: "Add Image (Optional)", // Update title
      content: (
        <ImageGeneratorStep
          generateImage={generateImage}
          setGenerateImage={setGenerateImage}
          imagePrompt={imagePrompt}
          setImagePrompt={setImagePrompt}
          // Pass the final URL from state to display if generation was successful
          currentImageUrl={generatedImageUrl}
          // Pass any error message
          imageError={imageError}
        />
      ),
    },
    {
      id: "results",
      title: "Results",
      content: (
        loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generating your content...</h3>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        ) : repurposedContent ? (
          <ResultsStep
            repurposedContent={repurposedContent}
            handleCopyToClipboard={handleCopyToClipboard}
            handleReset={handleReset}
            // Removed quality analysis props
            // qualityMetrics={qualityMetrics}
            // isAnalyzing={isAnalyzing}
            // analyzeContentQuality={analyzeContentQuality}
            // analysisTarget={analysisTarget}
            // setAnalysisTarget={setAnalysisTarget}
            // originalContent={originalContent} // Not needed by simplified ResultsStep
            selectedTemplate={selectedTemplate}
            // Pass the generated image URL to the results step
            generatedImageUrl={generatedImageUrl}
            imageError={imageError} // Pass image error as well
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Click &quot;Generate&quot; to create your content</h3>
            <p className="text-sm text-gray-500">Make sure you&apos;ve filled in all the required fields</p>
          </div>
        )
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "New Content" }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Content
        </h1>
        
        {/* Token usage indicator */}
        <div className="flex items-center bg-indigo-50 px-3 py-1.5 rounded-md">
          <Sparkles className="h-4 w-4 text-indigo-500 mr-1.5" />
          <span className="text-sm font-medium text-indigo-700">
            {tokenUsage?.tokensRemaining || 0} tokens remaining
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <CreationSteps 
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onComplete={handleSubmit}
          // Pass state needed for validation
          selectedTemplate={selectedTemplate} 
          // Pass generated image URL to potentially show in final step or save
          // generatedImageUrl={generatedImageUrl} // We'll add this to handleSubmit instead
        />
      </div>
    </div>
  );
}
