"use client";

import { ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast

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
  // originalContent?: string; // Remove unused prop for now
}

export function CreationSteps({ 
  steps, 
  currentStep, 
  setCurrentStep, 
  onComplete,
  selectedTemplate // Destructure new props
  // originalContent // Remove unused prop
}: CreationStepsProps) {
  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connector lines - rendered first so they appear behind the step indicators */}
          <div className="absolute top-5 left-0 right-0 flex items-center z-0">
            <div className="h-1 bg-gray-200 w-full mx-auto">
              {/* Colored progress overlay */}
              <div 
                className="h-1 bg-indigo-600 transition-all duration-300 ease-in-out"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step indicators */}
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
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
                      ? 'bg-indigo-600 text-white'
                      : index === currentStep
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-gray-200 text-gray-500'
                  }
                  ${index > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'}
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
                  ${
                    index <= currentStep ? 'text-indigo-600' : 'text-gray-500'
                  }
                `}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons - Moved to top, removed sticky classes */}
      <div className="flex justify-between px-6 mb-8"> {/* Removed sticky, added mb-8 */}
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
          className={`
            px-4 py-2 text-sm 
            ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900'
            }
          `}
        >
          Back
        </button>
        
        <button
          onClick={() => {
            if (currentStep === steps.length - 1) {
              // If it's the last step, call onComplete
              if (onComplete) onComplete();
            } else {
              // Add validation before going to the next step
              let canProceed = true;
              if (currentStep === 0 && !selectedTemplate) { // Step 0: Template Selection
                 toast.error("Please select a template first.");
                 canProceed = false;
              }
              // Add validation for Step 1 (Add Content) if needed later
              // if (currentStep === 1 && (!originalContent || originalContent.trim() === '')) {
              //    toast.error("Please add content first.");
              //    canProceed = false;
              // }
              
              if (canProceed) {
                 setCurrentStep(currentStep + 1);
              }
            }
          }}
          // Disable Next button on step 0 if no template selected
          disabled={currentStep === 0 && !selectedTemplate} 
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center ${ (currentStep === 0 && !selectedTemplate) ? 'opacity-50 cursor-not-allowed' : '' }`}
        >
          {currentStep === steps.length - 1 ? 'Generate Content' : (
            <>
              Next
              <ChevronRight className="ml-1 h-3 w-3" />
            </>
          )}
          </button>
      </div>
      
      {/* Current step content - Removed bottom padding */}
      <div className="mb-6"> {/* Removed pb-24 */}
        {steps[currentStep].content}
      </div>
      
      {/* Sticky Navigation buttons Container - REMOVED */}
      
    </div>
  );
}
