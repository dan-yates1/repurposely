"use client";

import { TemplateSelectionCard } from '@/components/ui/template-selection-card';
import { TEMPLATES, Template } from '@/lib/templates'; // Import shared definitions
import React from 'react'; // Import React

interface TemplateSelectionStepProps {
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string) => void; // Pass template ID
}

export function TemplateSelectionStep({ 
  selectedTemplate, 
  onTemplateSelect 
}: TemplateSelectionStepProps) {

  // Group templates by type for display
  const templatesByType: { [key: string]: Template[] } = {};
  TEMPLATES.forEach(template => {
    if (!templatesByType[template.type]) {
      templatesByType[template.type] = [];
    }
    // Exclude custom templates from this step
    if (template.type !== 'custom') {
       templatesByType[template.type].push(template);
    }
  });

  // Define display order and names for categories
  const categoryOrder = ["social", "blog", "email", "video", "marketing"];
  const categoryDisplayNames: { [key: string]: string } = {
    social: "Social Media",
    blog: "Blog & Articles",
    email: "Email",
    video: "Video",
    marketing: "Marketing",
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Select Template
      </h2>
      
      {/* Render templates by category */}
      {categoryOrder.map((categoryType) => {
        const templatesInCategory = templatesByType[categoryType];
        if (!templatesInCategory || templatesInCategory.length === 0) {
          return null; // Skip empty categories
        }
        return (
          <div key={categoryType} className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">
              {categoryDisplayNames[categoryType] || categoryType}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templatesInCategory.map((template) => {
                const IconComponent = template.icon; // Get icon component reference
                return (
                  <TemplateSelectionCard
                    key={template.id}
                    title={template.title}
                    description={template.description}
                    // Render the icon component if it exists
                    icon={IconComponent ? <IconComponent className="h-6 w-6 text-indigo-600" /> : undefined} 
                    onClick={() => onTemplateSelect(template.id)} // Pass ID on select
                    isSelected={selectedTemplate === template.id}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Show template recommendation if selected */}
      {selectedTemplate && (
         // Find the full template object based on the selected ID
         (() => {
            const template = TEMPLATES.find(t => t.id === selectedTemplate);
            // Simple recommendation based on description for now
            const recommendation = `Use this for: ${template?.description}`; 
            return (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h3 className="text-sm font-medium text-indigo-800 mb-2">
                  {template?.title || 'Selected Template'}
                </h3>
                <div className="text-xs text-indigo-600">
                  {recommendation}
                </div>
              </div>
            );
         })()
      )}
    </div>
  );
}
