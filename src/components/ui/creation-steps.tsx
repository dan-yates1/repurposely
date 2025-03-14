"use client";

import { ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';

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
}

export function CreationSteps({ steps, currentStep, setCurrentStep, onComplete }: CreationStepsProps) {
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
              
              {/* Step title */}
              <span 
                className={`
                  mt-2 text-xs font-medium
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
      
      {/* Current step content */}
      <div className="mb-6">
        {steps[currentStep].content}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
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
              // Otherwise, go to the next step
              setCurrentStep(currentStep + 1);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex items-center"
        >
          {currentStep === steps.length - 1 ? 'Generate Content' : (
            <>
              Next
              <ChevronRight className="ml-1 h-3 w-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
