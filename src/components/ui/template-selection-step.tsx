"use client";

import { ReactNode } from 'react';
import { Twitter, Linkedin, BookOpen } from 'lucide-react';
import { TemplateSelectionCard } from '@/components/ui/template-selection-card';

interface TemplateSelectionStepProps {
  selectedTemplate: string | null;
  onTemplateSelect: (template: string) => void;
}

export function TemplateSelectionStep({ 
  selectedTemplate, 
  onTemplateSelect 
}: TemplateSelectionStepProps) {
  // Templates organized by category for better UX
  const templateCategories = [
    {
      name: "Social Media",
      templates: [
        {
          id: "twitter",
          title: "Twitter Thread",
          description: "Create engaging multi-tweet content",
          icon: <Twitter className="h-6 w-6 text-indigo-600" />,
        },
        {
          id: "linkedin",
          title: "LinkedIn Post",
          description: "Professional content for your network",
          icon: <Linkedin className="h-6 w-6 text-indigo-600" />,
        },
        {
          id: "instagram",
          title: "Instagram Caption",
          description: "Visual content with engaging captions",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          ),
        },
        {
          id: "facebook",
          title: "Facebook Post",
          description: "Shareable content for your audience",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          ),
        },
      ],
    },
    {
      name: "Long-form Content",
      templates: [
        {
          id: "blog",
          title: "Blog Article",
          description: "Long-form content with introduction",
          icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
        },
        {
          id: "youtube",
          title: "YouTube Description",
          description: "SEO-friendly video descriptions",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          ),
        },
      ],
    },
  ];

  // Template information to show details for the selected template
  const templateInfo = {
    twitter: {
      title: "Twitter Thread Template",
      description: "Create an engaging Twitter thread with multiple tweets. Optimal length is 2-5 tweets.",
      recommendation: "Recommended: 280 characters per tweet, use emojis and hashtags",
    },
    linkedin: {
      title: "LinkedIn Post Template",
      description: "Create a professional LinkedIn post to share with your network. Focus on industry insights and professional achievements.",
      recommendation: "Recommended: 1300-2000 characters, professional tone, include a call to action",
    },
    blog: {
      title: "Blog Article Template",
      description: "Create a comprehensive blog article with introduction, body, and conclusion. Include headings and subheadings for better readability.",
      recommendation: "Recommended: 1500+ words, include images, use subheadings every 300 words",
    },
    instagram: {
      title: "Instagram Post Template",
      description: "Create a captivating Instagram caption that complements your visual content. Focus on storytelling and engagement.",
      recommendation: "Recommended: 125-150 characters, 5-10 relevant hashtags, include emojis",
    },
    facebook: {
      title: "Facebook Post Template",
      description: "Create a Facebook post that encourages sharing and comments. Include questions or calls to action to boost engagement.",
      recommendation: "Recommended: 40-80 characters, include an image or link, ask a question",
    },
    youtube: {
      title: "YouTube Description Template",
      description: "Create an SEO-friendly YouTube video description with timestamps, links, and keywords to improve discoverability.",
      recommendation: "Recommended: 200-300 words, include timestamps, links to related content, and relevant keywords",
    },
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Select Template
      </h2>
      
      {/* Templates by category */}
      {templateCategories.map((category) => (
        <div key={category.name} className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            {category.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {category.templates.map((template) => (
              <TemplateSelectionCard
                key={template.id}
                title={template.title}
                description={template.description}
                icon={template.icon}
                onClick={() => onTemplateSelect(template.id)}
                isSelected={selectedTemplate === template.id}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Show template information if selected */}
      {selectedTemplate && templateInfo[selectedTemplate as keyof typeof templateInfo] && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <h3 className="text-sm font-medium text-indigo-800 mb-2">
            {templateInfo[selectedTemplate as keyof typeof templateInfo].title}
          </h3>
          <p className="text-xs text-indigo-700 mb-2">
            {templateInfo[selectedTemplate as keyof typeof templateInfo].description}
          </p>
          <div className="text-xs text-indigo-600">
            {templateInfo[selectedTemplate as keyof typeof templateInfo].recommendation}
          </div>
        </div>
      )}
    </div>
  );
}
