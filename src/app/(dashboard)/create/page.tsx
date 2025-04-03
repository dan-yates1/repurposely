"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import toast, { Toaster } from "react-hot-toast";
import {
  Coins,
  Loader2,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useTokens } from "@/hooks/useTokens";
import { usePageTitle } from "@/hooks/usePageTitle";
import { OperationType } from "@/lib/token-service";
import { TEMPLATES, Template } from "@/lib/templates"; // Removed CATEGORIES import
import { supabase } from "@/lib/supabase"; // Added supabase import
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CreationSteps } from "@/components/ui/creation-steps";
import { TemplateSelectionStep } from "@/components/ui/template-selection-step";
import { ContentInputStep } from "@/components/ui/content-input-step";
import { OutputSettingsStep } from "@/components/ui/output-settings-step";
import { ImageGeneratorStep } from "@/components/ui/image-generator-step";
import { ResultsStep } from "@/components/ui/results-step";
import { TemplatePreviewModal } from "@/components/ui/template-preview-modal"; // Import modal
import React from 'react'; // Import React

export default function Create() {
  usePageTitle("Create New Content");
  const searchParams = useSearchParams();
  // Destructure fetch functions from useTokens
  const { 
    canPerformOperation, 
    recordTokenTransaction, 
    tokenUsage, 
    fetchTokenUsage, // Add this
    fetchTransactionHistory // Add this
  } = useTokens(); 
  const { user } = useUser();

  // Step management
  const [currentStep, setCurrentStep] = useState(0);

  // Content state
  const [originalContent, setOriginalContent] = useState("");
  const [repurposedContent, setRepurposedContent] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Image Generation State
  const [generateImage, setGenerateImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // *** State Lifted from Templates Page ***
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null); // Keep this for selection tracking
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(TEMPLATES); // Initialize with all templates
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  // Removed unused showPremium state
  const [userPlan, setUserPlan] = useState<string>("Free"); // Needed for premium check
  // *** End Lifted State ***

  // State for Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState<Template | null>(null);

  // Effect to get user plan (needed for premium template check)
  useEffect(() => {
    const getUserPlan = async () => {
      if (user?.id) {
        try {
          const { data: subscriptionData } = await supabase
            .from("user_subscriptions")
            .select("subscription_tier")
            .eq("user_id", user.id)
            .maybeSingle();
          const tier = subscriptionData?.subscription_tier || "FREE";
          setUserPlan(tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase());
        } catch (error) {
          console.error("Error fetching user plan:", error);
        }
      }
    };
    getUserPlan();
    loadCustomTemplates(); // Load custom templates on mount
  }, [user]);

  // Effect to handle pre-selection from query parameter
  useEffect(() => {
    const templateIdFromQuery = searchParams.get('template');
    if (templateIdFromQuery) {
      const allTemplates = [...TEMPLATES, ...customTemplates];
      const templateExists = allTemplates.some(t => t.id === templateIdFromQuery);
      if (templateExists) {
        console.log(`Pre-selecting template: ${templateIdFromQuery}`);
        setSelectedTemplate(templateIdFromQuery);
        setCurrentStep(1);
      } else {
        console.warn(`Template ID "${templateIdFromQuery}" from query param not found.`);
      }
    }
   
  }, [searchParams, customTemplates]); // Depend on customTemplates as well

  // Load custom templates from localStorage
  const loadCustomTemplates = () => {
    try {
      const savedTemplates = localStorage.getItem('customTemplates');
      if (savedTemplates) {
        setCustomTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  };

  // *** Filtering Logic Lifted from Templates Page ***
  useEffect(() => {
    const allAvailableTemplates = [...TEMPLATES, ...customTemplates];
    let filtered = allAvailableTemplates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
    }

    if (selectedCategory !== "all") {
       // Note: 'favorite' category might not apply here unless we fetch/manage favorites in this component too
       if (selectedCategory === "custom") {
         filtered = filtered.filter(t => t.type === "custom");
       } else {
         filtered = filtered.filter(t => t.type === selectedCategory);
       }
    }

    // Add premium filter logic if needed later
    // if (!showPremium) {
    //   filtered = filtered.filter(t => !t.premium);
    // }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, customTemplates]); // Removed showPremium and userTemplates dependencies for now
  // *** End Lifted Filtering Logic ***

  // Handle template selection (now just sets the ID)
  const handleTemplateSelect = (templateId: string) => {
    const template = [...TEMPLATES, ...customTemplates].find(t => t.id === templateId);
    if (!template) return;
    // Premium check (using lifted userPlan state)
    if (template.premium && userPlan === "Free") {
      toast.error("This template requires a Pro or Enterprise subscription");
      return;
    }
    setSelectedTemplate(templateId);
    // Optionally move to next step automatically upon selection?
    // setCurrentStep(1);
  };

  // Handlers for filter changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Handler for opening the preview modal
  const handlePreviewTemplate = (templateId: string) => {
    const template = [...TEMPLATES, ...customTemplates].find(t => t.id === templateId);
    if (template) {
      setTemplateToPreview(template);
      setIsPreviewModalOpen(true);
    }
  };

  // Handle file upload and transcription (remains the same)
  const handleFileUpload = async () => {
    if (!file) return;
    if (!canPerformOperation("VIDEO_PROCESSING" as OperationType)) {
      toast.error("You don't have enough tokens to process this file.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);
      const response = await fetch("/api/transcribe", { method: "POST", body: formData });
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      setOriginalContent(data.transcript);
      await recordTokenTransaction("VIDEO_PROCESSING" as OperationType);
      toast.success("File transcribed successfully");
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle content generation (remains mostly the same)
  const handleSubmit = async () => {
    if (!originalContent.trim() || !selectedTemplate) {
      toast.error("Please enter content and select a template");
      return;
    }
    if (!canPerformOperation("TEXT_REPURPOSE" as OperationType)) {
      toast.error("You don't have enough tokens.");
      return;
    }
    setLoading(true);
    setRepurposedContent("");
    setGeneratedImageUrl(null);
    setImageError(null);
    const userId = user?.id;
    const requestBody = {
      originalContent,
      outputFormat: selectedTemplate,
      tone,
      contentLength,
      targetAudience,
      userId: userId || null,
      generateImage: generateImage && !!userId,
      imagePrompt: generateImage ? imagePrompt : undefined,
    };
    try {
      const response = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `API request failed`);
      setRepurposedContent(data.repurposedContent);
      setGeneratedImageUrl(data.generatedImageUrl || null);
      setImageError(data.imageError || null);
       if (userId) {
          // Always record text repurpose cost
          await recordTokenTransaction("TEXT_REPURPOSE" as OperationType);
          // IMAGE_GENERATION cost is now handled by the backend API before generation occurs.
          // Explicitly refresh token usage state AFTER transactions to reflect backend changes
          await fetchTokenUsage(); // Now defined
         await fetchTransactionHistory(); // Now defined
      }
      toast.success("Content generated successfully!");
      if (data.imageError) toast.error(`Image generation failed: ${data.imageError}`, { duration: 5000 });
      else if (data.generatedImageUrl) toast.success("Image generated successfully!");
      setCurrentStep(4);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle copying content (remains the same)
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(repurposedContent);
    toast.success("Copied to clipboard");
  };

  // Handle resetting the form (remains the same)
  const handleReset = () => {
    setOriginalContent("");
    setRepurposedContent("");
    setSelectedTemplate(null);
    setFile(null);
    setCurrentStep(0);
    setGenerateImage(false);
    setImagePrompt("");
    setGeneratedImageUrl(null);
    setImageError(null);
    // Reset filters as well
    setSearchQuery("");
    setSelectedCategory("all");
  };

  // Define the steps, passing new props to TemplateSelectionStep
  const steps = [
    {
      id: "template",
      title: "Choose Template",
      content: (
        <TemplateSelectionStep
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          // Pass filtering state and handlers
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          filteredTemplates={filteredTemplates} // Pass the filtered list
          // Pass the preview handler down
          onPreviewTemplate={handlePreviewTemplate} 
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
      title: "Add Image (Optional)",
      content: (
        <ImageGeneratorStep
          generateImage={generateImage}
          setGenerateImage={setGenerateImage}
          imagePrompt={imagePrompt}
          setImagePrompt={setImagePrompt}
          currentImageUrl={generatedImageUrl}
          imageError={imageError}
          // Pass user plan and token balance
          userPlan={userPlan}
          tokensRemaining={tokenUsage?.tokensRemaining ?? 0}
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
            selectedTemplate={selectedTemplate}
            generatedImageUrl={generatedImageUrl}
            imageError={imageError}
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
    <div className="max-w-7xl mx-auto px-4 py-6 pb-12"> {/* Keep pb-12 */}
      <Toaster position="top-right" />

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "New Content" }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Content
        </h1>

        {/* Token usage indicator - Changed icon */}
        <div className="flex items-center bg-indigo-50 px-3 py-1.5 rounded-md">
          <Coins className="h-4 w-4 text-indigo-500 mr-1.5" /> {/* Changed Sparkles to Coins */}
          <span className="text-sm font-medium text-indigo-700">
            {tokenUsage?.tokensRemaining ?? 0} tokens remaining {/* Use nullish coalescing */}
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
          selectedTemplate={selectedTemplate}
        />
      </div>

      {/* Render Preview Modal */}
      {templateToPreview && isPreviewModalOpen && (
        <TemplatePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          template={templateToPreview}
        />
      )}
    </div>
  );
}
