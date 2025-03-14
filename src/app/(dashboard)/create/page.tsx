"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  Loader2,
  Sparkles,
} from "lucide-react";
import { useTokens } from "@/hooks/useTokens";
import { usePageTitle } from "@/hooks/usePageTitle";
import { OperationType } from "@/lib/token-service";
import { ContentAnalysisService, ContentQualityMetrics } from "@/lib/content-analysis-service";
import { CreationSteps } from "@/components/ui/creation-steps";
import { TemplateSelectionStep } from "@/components/ui/template-selection-step";
import { ContentInputStep } from "@/components/ui/content-input-step";
import { OutputSettingsStep } from "@/components/ui/output-settings-step";
import { ImageGeneratorStep } from "@/components/ui/image-generator-step";
import { ResultsStep } from "@/components/ui/results-step";

export default function Create() {
  // Page title
  usePageTitle("Create New Content");
  
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
  
  // Quality analysis
  const [qualityMetrics, setQualityMetrics] = useState<ContentQualityMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState<"original" | "repurposed">("repurposed");
  
  // Token management
  const { canPerformOperation, recordTokenTransaction, tokenUsage } = useTokens();

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

    try {
      // Call repurpose API (simulated for now)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate placeholder content based on template
      let placeholderContent = "";
      switch (selectedTemplate) {
        case "twitter":
          placeholderContent = `🧵 Thread on ${originalContent.substring(0, 30)}...\n\n1/ ${originalContent.substring(0, 200)}...\n\n2/ [Rest of thread]\n\n3/ Key takeaways: [Summary]\n\n4/ If you found this valuable, please RT & follow for more insights on ${targetAudience ? targetAudience : "this topic"}!\n\n#ContentCreation`;
          break;
        case "linkedin":
          placeholderContent = `🔍 ${originalContent.substring(0, 30)}...\n\nI've been thinking about this topic recently and wanted to share some insights.\n\n${originalContent.substring(0, 300)}...\n\nWhat are your thoughts on this? Share in the comments below!\n\n#${selectedTemplate} #ProfessionalDevelopment`;
          break;
        default:
          placeholderContent = `# ${originalContent.substring(0, 30)}...\n\n${originalContent.substring(0, 400)}...\n\n## Key Points\n\n- Point 1\n- Point 2\n- Point 3\n\n## Conclusion\n\nThank you for reading! Let me know your thoughts in the comments.`;
      }

      setRepurposedContent(placeholderContent);

      // Record token transaction
      await recordTokenTransaction("TEXT_REPURPOSE" as OperationType);

      toast.success("Content repurposed successfully");
      
      // Automatically move to the final step
      setCurrentStep(4);
    } catch (error) {
      console.error("Error repurposing content:", error);
      toast.error("Failed to repurpose content. Please try again.");
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
    setQualityMetrics(null);
  };

  // Handle content quality analysis
  const analyzeContentQuality = useCallback(async () => {
    // Don't analyze if no content to analyze
    if (!originalContent && !repurposedContent) {
      toast.error("Please enter or generate content to analyze");
      return;
    }

    // Use repurposed content if available, otherwise use original content
    const contentToAnalyze = analysisTarget === "repurposed" ? repurposedContent : originalContent;
    
    // If the selected content type is not available, show an error
    if (!contentToAnalyze) {
      toast.error(`No ${analysisTarget} content available to analyze`);
      return;
    }
    
    // Check if user has enough tokens
    if (!canPerformOperation("CONTENT_ANALYSIS" as OperationType)) {
      toast.error("You don't have enough tokens. Please upgrade your subscription.");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Get the content type based on selected template
      const contentType = selectedTemplate || 'general';
      
      // Call the content analysis service
      const metrics = await ContentAnalysisService.analyzeContent(contentToAnalyze, contentType);
      
      // Update state with the analysis results
      setQualityMetrics(metrics);
      
      // Record token usage
      await recordTokenTransaction("CONTENT_ANALYSIS" as OperationType);
      
      toast.success("Content analyzed successfully!");
    } catch (error) {
      console.error("Error analyzing content:", error);
      toast.error("Failed to analyze content. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    originalContent, 
    repurposedContent, 
    analysisTarget, 
    canPerformOperation, 
    selectedTemplate, 
    recordTokenTransaction
  ]);

  // Effect to re-analyze content when analysis target changes
  useEffect(() => {
    // Only re-analyze if we already have metrics and we're not currently analyzing
    if (qualityMetrics && !isAnalyzing && 
        ((analysisTarget === "original" && originalContent) || 
        (analysisTarget === "repurposed" && repurposedContent))) {
      analyzeContentQuality();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisTarget]);

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
      title: "Add Images",
      content: (
        <ImageGeneratorStep contentId={undefined} />
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
            qualityMetrics={qualityMetrics}
            isAnalyzing={isAnalyzing}
            analyzeContentQuality={analyzeContentQuality}
            analysisTarget={analysisTarget}
            setAnalysisTarget={setAnalysisTarget}
            originalContent={originalContent}
            selectedTemplate={selectedTemplate}
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
      
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard"
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          Dashboard
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-700 text-sm font-medium">New Content</span>
      </div>

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
        />
      </div>
    </div>
  );
}
