"use client";

import { TemplateSelectionCard } from '@/components/ui/template-selection-card';
import { Template, CATEGORIES } from '@/lib/templates'; // Import shared definitions
import React from 'react'; // Import React
import { Search as SearchIcon } from 'lucide-react'; // Import Search icon

// Define new props for filtering
interface TemplateSelectionStepProps {
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string) => void; // Pass template ID
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  filteredTemplates: Template[]; // Receive filtered templates
}

export function TemplateSelectionStep({ 
  selectedTemplate, 
  onTemplateSelect,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filteredTemplates // Use filtered templates from props
}: TemplateSelectionStepProps) {

  // Remove internal grouping logic - filtering is now done in parent

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Select Template
      </h2>

      {/* Add Filter UI */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
            placeholder="Search templates..." 
            value={searchQuery} 
            onChange={onSearchChange} 
          />
        </div>
        {/* Category Dropdown (Mobile) */}
        <div className="md:hidden">
          <label htmlFor="category-select-step" className="sr-only">Select Category</label>
          <select 
            id="category-select-step"
            value={selectedCategory} 
            onChange={(e) => onCategoryChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select> 
        </div>
      </div>
      
      {/* Category Tabs (Desktop) */}
      <div className="hidden md:flex flex-wrap gap-2 mb-8 pb-2"> 
        {CATEGORIES.map((category) => (
          <button 
            key={category.id} 
            className={`px-4 py-2 rounded-md text-sm font-medium ${selectedCategory === category.id ? "bg-indigo-100 text-indigo-700" : "bg-white text-gray-700 hover:bg-gray-50"}`} 
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Render filtered templates directly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates
            .filter(template => template.type !== 'custom') // Exclude custom templates here
            .map((template) => {
              const IconComponent = template.icon; 
              return (
                <TemplateSelectionCard
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  icon={IconComponent ? <IconComponent className="h-6 w-6 text-indigo-600" /> : undefined} 
                  onClick={() => onTemplateSelect(template.id)} 
                  isSelected={selectedTemplate === template.id}
                />
              );
            })
        ) : (
          <p className="col-span-1 md:col-span-3 text-center text-gray-500 py-4">No templates match your criteria.</p>
        )}
      </div>
      
      {/* Recommendation section removed */}
      
    </div>
  );
}
