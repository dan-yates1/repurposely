"use client";

import { ReactNode, useEffect } from "react";
import { Check, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast"; // Import toast
import { Button } from "@/components/ui/button"; // Import the custom Button component

interface Step {
  id: string;
  title: string;
  content: ReactNode;
}

interface CreationStepsProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onComplete?: () => void;
  // Add state needed for validation
  selectedTemplate?: string | null;
  originalContent?: string; // Add back for content validation
}

export function CreationSteps({
  steps,
  currentStep,
  setCurrentStep,
  onComplete,
  selectedTemplate, // Destructure new props
  originalContent, // Add back for content validation
}: CreationStepsProps) {
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Right arrow or Tab to go forward
      if (
        (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) &&
        currentStep < steps.length - 1
      ) {
        e.preventDefault();
        // Check validation before proceeding
        let canProceed = true;
        if (currentStep === 0 && !selectedTemplate) {
          toast.error("Please select a template first.");
          canProceed = false;
        } else if (
          currentStep === 1 &&
          (!originalContent || originalContent.trim() === "")
        ) {
          toast.error("Please add some content before proceeding.");
          canProceed = false;
        }

        if (canProceed) {
          setCurrentStep(currentStep + 1);
        }
      }

      // Left arrow or Shift+Tab to go back
      if (
        (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) &&
        currentStep > 0
      ) {
        e.preventDefault();
        setCurrentStep(currentStep - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentStep,
    setCurrentStep,
    steps.length,
    selectedTemplate,
    originalContent,
  ]);
  return (
    <div className="w-full">
      {/* Navigation buttons with improved styling */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          {/* Back button with icon */}
          <Button
            variant="outline"
            size="md" // Larger size for better clickability
            className="flex items-center transition-all hover:bg-gray-100 hover:border-gray-400"
            onClick={() => {
              // Add confirmation if content has been entered
              if (
                currentStep === 1 &&
                originalContent &&
                originalContent.trim() !== ""
              ) {
                if (
                  window.confirm(
                    "Going back will reset your content. Continue?"
                  )
                ) {
                  setCurrentStep(currentStep - 1);
                }
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Keyboard shortcut hint */}
          <span className="text-xs text-gray-400 hidden md:inline-block">
            Use arrow keys to navigate
          </span>

          {/* Next/Generate button with improved styling */}
          <Button
            variant="primary"
            size="md" // Larger size
            className={`flex items-center transition-all ${
              currentStep === steps.length - 1
                ? "bg-green-600 hover:bg-green-700"
                : ""
            }`}
            onClick={() => {
              if (currentStep === steps.length - 1) {
                // If it's the last step, call onComplete
                if (onComplete) onComplete();
              } else {
                // Add validation before going to the next step
                let canProceed = true;
                if (currentStep === 0 && !selectedTemplate) {
                  // Step 0: Template Selection
                  toast.error("Please select a template first.");
                  canProceed = false;
                } else if (
                  currentStep === 1 &&
                  (!originalContent || originalContent.trim() === "")
                ) {
                  toast.error("Please add some content before proceeding.");
                  canProceed = false;
                }

                if (canProceed) {
                  setCurrentStep(currentStep + 1);
                }
              }
            }}
            // Disable Next button based on validation
            disabled={
              (currentStep === 0 && !selectedTemplate) ||
              (currentStep === 1 &&
                (!originalContent || originalContent.trim() === ""))
            }
          >
            {currentStep === steps.length - 1 ? (
              <div className="flex items-center">
                Generate Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            ) : (
              <div className="flex items-center">
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connector lines - rendered first so they appear behind the step indicators */}
          <div className="absolute top-5 left-0 right-0 flex items-center z-0">
            <div className="h-1 bg-gray-200 w-full mx-auto">
              {/* Colored progress overlay */}
              <div
                className="h-1 bg-indigo-600 transition-all duration-300 ease-in-out"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Step indicators */}
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
            >
              {/* Step indicator */}
              <button
                onClick={() => {
                  // Only allow going back to previous steps, not skipping ahead
                  if (index <= currentStep) {
                    setCurrentStep(index);
                  }
                }}
                disabled={index > currentStep}
                className={`
                  flex items-center justify-center rounded-full w-10 h-10
                  ${
                    index < currentStep
                      ? "bg-indigo-600 text-white"
                      : index === currentStep
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : "bg-gray-200 text-gray-500"
                  }
                  ${
                    index > currentStep
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>

              {/* Step title - Added min-height and text-center for alignment */}
              <span
                className={`
                  mt-2 text-xs font-medium text-center min-h-[2.5rem] w-full flex items-center justify-center px-1 {/* Added text-center, min-height, w-full, flex items-center justify-center, px-1 */}
                  ${index <= currentStep ? "text-indigo-600" : "text-gray-500"}
                `}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current step content - Removed bottom padding */}
      <div className="mb-6">
        {" "}
        {/* Removed pb-24 */}
        {steps[currentStep].content}
      </div>
    </div>
  );
}
