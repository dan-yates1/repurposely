'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, Send, Copy, Download, FileAudio, Upload, Trash2, Twitter, Linkedin, BookOpen } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { TemplateSelectionCard } from '@/components/ui/template-selection-card';
import { SourceTabs } from '@/components/ui/source-tabs';
import { OutputSettings } from '@/components/ui/output-settings';

export default function Create() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [repurposedContent, setRepurposedContent] = useState('');
  const [contentType, setContentType] = useState('twitter');
  const [tone, setTone] = useState('professional');
  const [targetAudience, setTargetAudience] = useState('general');
  const [contentLength, setContentLength] = useState('medium');
  const [includeKeywords, setIncludeKeywords] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [contentSource, setContentSource] = useState('text');

  const sourceTabs = [
    { id: 'text', label: 'Text Input' },
    { id: 'upload', label: 'Upload File' },
    { id: 'url', label: 'URL Import' },
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push('/auth');
      }
    };

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalContent.trim()) {
      toast.error('Please enter some content to repurpose');
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would call an API to process the content
      // For now, we'll simulate a delay and just transform the content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let processed = `Repurposed content for ${contentType}:\n\n`;
      
      switch (contentType) {
        case 'twitter':
          processed += `${originalContent.substring(0, 280)}`;
          if (originalContent.length > 280) processed += '...';
          break;
        case 'linkedin':
          processed += `Professional post: ${originalContent}`;
          break;
        case 'blog':
          processed += `Blog article:\n\n# Title\n\n${originalContent}\n\n## Conclusion\n\nThank you for reading!`;
          break;
        default:
          processed += originalContent;
      }
      
      setRepurposedContent(processed);
      
      // Save to history in Supabase
      if (user) {
        const { error } = await supabase.from('content_history').insert({
          user_id: user.id,
          original_content: originalContent,
          repurposed_content: processed,
          content_type: contentType,
          tone: tone,
          target_audience: targetAudience,
          content_length: contentLength
        });
        
        if (error) {
          console.error('Error saving to history:', error);
          toast.error('Failed to save to history');
        } else {
          toast.success('Content saved to history');
        }
      }
    } catch (error) {
      console.error('Error processing content:', error);
      toast.error('Failed to process content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      // Simulate transcription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcription result
      const transcription = `This is a transcription of the uploaded ${file.name} file. In a real application, this would be the actual transcribed content from your audio or video file.`;
      
      setOriginalContent(transcription);
      toast.success('File transcribed successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(repurposedContent);
    toast.success('Copied to clipboard');
  };

  const handleReset = () => {
    setOriginalContent('');
    setRepurposedContent('');
    setFile(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-700">
              Dashboard
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 text-sm font-medium">New Content</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Content</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TemplateSelectionCard 
                title="Twitter Thread" 
                description="Create engaging multi-tweet content" 
                icon={<Twitter className="h-6 w-6 text-indigo-600" />} 
              />
              <TemplateSelectionCard 
                title="LinkedIn Post" 
                description="Professional content for your network" 
                icon={<Linkedin className="h-6 w-6 text-indigo-600" />} 
              />
              <TemplateSelectionCard 
                title="Blog Article" 
                description="Long-form content with introduction" 
                icon={<BookOpen className="h-6 w-6 text-indigo-600" />} 
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Content Source</h2>
            
            <SourceTabs 
              tabs={sourceTabs} 
              defaultTabId="text" 
              onTabChange={setContentSource} 
            />
            
            {contentSource === 'text' && (
              <div>
                <textarea
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  placeholder="Type or paste your content here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            )}
            
            {contentSource === 'upload' && (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                <FileAudio className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">Upload audio or video file for transcription</p>
                
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                />
                
                {!file ? (
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
                  >
                    Select File
                  </label>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                      <button
                        onClick={() => setFile(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {isUploading ? (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    ) : (
                      <button
                        onClick={handleFileUpload}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Transcribe
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {contentSource === 'url' && (
              <div>
                <input
                  type="url"
                  placeholder="Enter URL to import content..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  We&apos;ll extract the main content from the provided URL
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <OutputSettings
                  tone={tone}
                  setTone={setTone}
                  contentLength={contentLength}
                  setContentLength={setContentLength}
                  includeKeywords={includeKeywords}
                  setIncludeKeywords={setIncludeKeywords}
                  keywords={keywords}
                  setKeywords={setKeywords}
                />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-full flex flex-col">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !originalContent.trim()}
                  className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center mb-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          
          {repurposedContent && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Generated Content</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                    title="Download as text file"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setRepurposedContent('')}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                    title="Clear"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {repurposedContent}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}
