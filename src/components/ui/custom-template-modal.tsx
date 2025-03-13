import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import toast from 'react-hot-toast';

interface CustomTemplate {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content: string;
  type: "social" | "blog" | "email" | "video" | "marketing";
  platform?: string;
  tokens: number;
  custom: boolean;
  created_at: string;
  favorite?: boolean;
  new?: boolean;
  premium?: boolean;
}

interface CustomTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: CustomTemplate) => void;
  userId: string;
}

export function CustomTemplateModal({ isOpen, onClose, onSave, userId }: CustomTemplateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<"social" | "blog" | "email" | "video" | "marketing">('social');
  const [platform, setPlatform] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Create a custom template object
      const customTemplate: CustomTemplate = {
        id: `custom-${Date.now()}`,
        user_id: userId,
        title,
        description,
        content,
        type,
        platform: platform || undefined,
        tokens: 1,
        custom: true,
        created_at: new Date().toISOString()
      };

      // Store in localStorage as a fallback since we don't have write access to the database
      const existingTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      existingTemplates.push(customTemplate);
      localStorage.setItem('customTemplates', JSON.stringify(existingTemplates));

      // Call the onSave callback with the new template
      onSave(customTemplate);
      
      toast.success('Custom template saved successfully');
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setContent('');
      setType('social');
      setPlatform('');
    } catch (error) {
      console.error('Error saving custom template:', error);
      toast.error('Failed to save custom template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900">Create Custom Template</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Template Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="E.g., Weekly Newsletter Template"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="A brief description of your template"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Template Type *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as "social" | "blog" | "email" | "video" | "marketing")}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="social">Social Media</option>
                <option value="blog">Blog & Articles</option>
                <option value="email">Email</option>
                <option value="video">Video</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            {/* Platform (conditional) */}
            {type === 'social' && (
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a platform</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
            )}

            {/* Template Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Template Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px]"
                placeholder="Enter your template content here. Use placeholders like [Topic], [Name], etc. for dynamic content."
                required
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              const event = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
              handleSubmit(event);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  );
}
