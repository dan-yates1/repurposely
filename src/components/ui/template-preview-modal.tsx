import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { ContentPreview } from './content-preview'; // Import ContentPreview

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    title: string;
    description: string;
    type: string;
    platform?: string;
    content?: string;
  };
}

export function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
  if (!isOpen) return null;

  // Sample preview content based on template type
  const getPreviewContent = () => {
    const sampleContent = template.content || getSampleContent(template.type, template.platform);
    return sampleContent;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900">{template.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
            <p className="text-gray-700">{template.description}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Type</h4>
            <p className="text-gray-700 capitalize">{template.type}{template.platform ? ` - ${template.platform}` : ''}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Preview</h4>
            {/* Use ContentPreview component */}
            <ContentPreview 
              content={getPreviewContent()} 
              platform={template.platform || template.type} // Pass platform or type
              imageUrl={null} // No image for template preview
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              onClose();
              // This would be handled by the parent component
            }}
          >
            Use Template
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate sample content based on template type
function getSampleContent(type: string, platform?: string): string {
  switch (type) {
    case 'social':
      if (platform === 'twitter') {
        return "Just published a new article on [Topic]! 🚀\n\nHere are the 3 key takeaways:\n\n1. [Key Point 1]\n2. [Key Point 2]\n3. [Key Point 3]\n\nCheck out the full article here: [Link] #hashtag";
      } else if (platform === 'linkedin') {
        return "I'm excited to share my thoughts on [Topic]!\n\nIn this post, I'll cover:\n\n✅ [Point 1]\n✅ [Point 2]\n✅ [Point 3]\n\nWhat's your experience with [Topic]? Let me know in the comments below!";
      }
      return "Here's a sample social media post that would be created using this template. The actual content would be personalized based on your input.";
    
    case 'blog':
      return "# [Your Catchy Title Here]\n\n## Introduction\nEngage your readers with a compelling introduction about [Topic].\n\n## Main Point 1\nExpand on your first key point with supporting evidence and examples.\n\n## Main Point 2\nDevelop your second argument with relevant information.\n\n## Conclusion\nSummarize your main points and provide a call to action.";
    
    case 'email':
      return "Subject: [Compelling Subject Line]\n\nHi [Name],\n\nI hope this email finds you well. I wanted to reach out about [Topic].\n\n[Main content with key points]\n\nLet me know if you have any questions. I'm looking forward to your response.\n\nBest regards,\n[Your Name]";
    
    case 'video':
      return "INTRO:\n\"Welcome back to the channel! Today we're talking about [Topic].\"\n\nHOOK:\n\"Did you know that [Interesting Fact]? That's right, and today we're going to explore...\"\n\nMAIN CONTENT:\n- Point 1: [Details]\n- Point 2: [Details]\n- Point 3: [Details]\n\nCALL TO ACTION:\n\"If you found this helpful, make sure to like and subscribe for more content like this!\"";
    
    case 'marketing':
      return "HEADLINE: [Attention-Grabbing Headline]\n\nPROBLEM: [Describe the pain point]\n\nSOLUTION: [Introduce your product/service]\n\nBENEFITS:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nSOCIAL PROOF: \"[Customer testimonial]\"\n\nCTA: [Clear call to action]";
    
    default:
      return "This is a preview of how your content would look when using this template. The actual output will be customized based on your input.";
  }
}
