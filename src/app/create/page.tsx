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
import { useTokens } from '@/hooks/useTokens';
import { OperationType } from '@/lib/token-service';

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
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { canPerformOperation, recordTokenTransaction, tokenUsage } = useTokens();

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('template');
    
    if (templateId) {
      const templateMap: Record<string, string> = {
        // Social Media Templates
        'twitter-thread': 'twitter',
        'linkedin-post': 'linkedin',
        'instagram-caption': 'instagram',
        'facebook-post': 'facebook',
        'tiktok-script': 'tiktok',
        
        // Blog & Article Templates
        'blog-post': 'blog',
        'listicle': 'listicle',
        'how-to-guide': 'how-to-guide',
        'content-summary': 'content-summary',
        
        // Email Templates
        'newsletter': 'newsletter',
        'welcome-email': 'welcome-email',
        'promotional-email': 'promotional-email',
        
        // Video Templates
        'youtube-script': 'youtube',
        'video-description': 'video-description',
        'podcast-outline': 'podcast-outline',
        
        // Marketing Templates
        'product-description': 'product-description',
        'ad-copy': 'ad-copy',
        'press-release': 'press-release'
      };
      
      const contentType = templateMap[templateId] || templateId;
      
      handleTemplateSelect(contentType);
      
      // Scroll to the content input section after template selection
      setTimeout(() => {
        const contentSection = document.getElementById('content-input-section');
        if (contentSection) {
          contentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setContentType(template);
    
    switch (template) {
      case 'twitter':
        setTone('conversational');
        setContentLength('short');
        setTargetAudience('general');
        break;
      case 'linkedin':
        setTone('professional');
        setContentLength('medium');
        setTargetAudience('professionals');
        break;
      case 'blog':
        setTone('informative');
        setContentLength('long');
        setTargetAudience('readers');
        break;
      case 'instagram':
        setTone('casual');
        setContentLength('medium');
        setTargetAudience('followers');
        break;
      case 'facebook':
        setTone('friendly');
        setContentLength('medium');
        setTargetAudience('friends');
        break;
      case 'youtube':
        setTone('engaging');
        setContentLength('long');
        setTargetAudience('viewers');
        break;
    }
    
    toast.success(`${template.charAt(0).toUpperCase() + template.slice(1)} template selected`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalContent.trim()) {
      toast.error('Please enter some content to repurpose');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    const operationType: OperationType = 'TEXT_REPURPOSE';

    if (!canPerformOperation(operationType)) {
      toast.error('You do not have enough tokens for this operation. Please upgrade your plan or wait for your tokens to reset.');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let processed = `Repurposed content for ${contentType}:\n\n`;
      
      switch (contentType) {
        case 'twitter':
          const tweetMaxLength = 280;
          let remainingContent = originalContent;
          let tweetCount = 1;
          
          while (remainingContent.length > 0 && tweetCount <= 10) {
            let tweetContent = '';
            
            if (remainingContent.length <= tweetMaxLength) {
              tweetContent = remainingContent;
              remainingContent = '';
            } else {
              let breakPoint = -1;
              for (let i = tweetMaxLength; i > tweetMaxLength * 0.7; i--) {
                if (i < remainingContent.length && ['.', '!', '?', '\n'].includes(remainingContent[i])) {
                  breakPoint = i + 1; 
                  break;
                }
              }
              
              if (breakPoint === -1) {
                const lastSpace = remainingContent.lastIndexOf(' ', tweetMaxLength);
                if (lastSpace > tweetMaxLength * 0.5) { 
                  breakPoint = lastSpace + 1; 
                } else {
                  breakPoint = tweetMaxLength;
                }
              }
              
              tweetContent = remainingContent.substring(0, breakPoint).trim();
              remainingContent = remainingContent.substring(breakPoint).trim();
            }
            
            processed += `Tweet ${tweetCount}: ${tweetContent}`;
            
            if (remainingContent.length > 0) {
              processed += '\n\n';
            }
            
            tweetCount++;
          }
          
          if (remainingContent.length > 0) {
            processed += '\n\n(Additional content truncated due to Twitter character limits)';
          }
          break;
        case 'linkedin':
          processed += `# Professional LinkedIn Post\n\n${originalContent}\n\n#thoughtleadership #professional #networking`;
          break;
        case 'blog':
          processed += `# Blog Title\n\n## Introduction\n\n${originalContent.substring(0, originalContent.length / 3)}\n\n## Main Content\n\n${originalContent.substring(originalContent.length / 3, originalContent.length * 2 / 3)}\n\n## Conclusion\n\n${originalContent.substring(originalContent.length * 2 / 3)}\n\nThank you for reading!`;
          break;
        case 'instagram':
          processed += `${originalContent.substring(0, 150)}\n\n`;
          processed += '#instagram #content #socialmedia #trending #follow';
          break;
        case 'facebook':
          processed += `${originalContent}\n\nWhat do you think? Let me know in the comments below! 👇`;
          break;
        case 'youtube':
          processed += `📺 VIDEO DESCRIPTION\n\n${originalContent}\n\n⏱️ TIMESTAMPS:\n0:00 Introduction\n1:30 Main Topic\n5:45 Summary\n\n🔗 LINKS:\n- Website: https://example.com\n- Follow me on Twitter: @username\n\n#youtube #video #content`;
          break;
        default:
          processed += originalContent;
      }
      
      setRepurposedContent(processed);
      
      if (user) {
        try {
          const historyData = {
            user_id: user.id,
            original_content: originalContent,
            repurposed_content: processed,
            content_type: contentType,
            tone: tone,
            target_audience: targetAudience,
            metadata: JSON.stringify({ content_length: contentLength })
          };
          
          console.log('Saving to history:', historyData);
          
          const { error } = await supabase.from('content_history').insert(historyData);
          
          if (error) {
            console.error('Error saving to history:', JSON.stringify(error));
            toast.error(`Failed to save to history: ${error.message || 'Unknown error'}`);
          } else {
            toast.success('Content saved to history');
            
            try {
              const { data: contentData } = await supabase
                .from('content_history')
                .select('id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);
                
              const contentId = contentData && contentData.length > 0 ? contentData[0].id : undefined;
              
              await recordTokenTransaction(operationType, contentId);
              toast.success(`Used ${tokenUsage ? '1' : '1'} token for content generation`);
            } catch (tokenError) {
              console.error('Error recording token transaction:', tokenError);
            }
          }
        } catch (err) {
          console.error('Exception saving to history:', err);
          toast.error('Failed to save to history due to an unexpected error');
        }
      }
    } catch (error) {
      console.error('Error processing content:', error);
      toast.error('Failed to process content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    const operationType: OperationType = 'VIDEO_PROCESSING';
    
    if (!canPerformOperation(operationType)) {
      toast.error('You do not have enough tokens for video processing. Please upgrade your plan or wait for your tokens to reset.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transcription = `This is a transcription of the uploaded ${file.name} file. In a real application, this would be the actual transcribed content from your audio or video file.`;
      
      setOriginalContent(transcription);
      
      if (user?.id) {
        try {
          await recordTokenTransaction(operationType);
          toast.success(`Used ${tokenUsage ? '10' : '10'} tokens for video processing`);
        } catch (tokenError) {
          console.error('Error recording token transaction:', tokenError);
        }
      }
      
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
              {/* Social Media Templates */}
              <TemplateSelectionCard 
                title="Twitter Thread" 
                description="Create engaging multi-tweet content" 
                icon={<Twitter className="h-6 w-6 text-indigo-600" />} 
                onClick={() => handleTemplateSelect('twitter')}
                isSelected={selectedTemplate === 'twitter'}
              />
              <TemplateSelectionCard 
                title="LinkedIn Post" 
                description="Professional content for your network" 
                icon={<Linkedin className="h-6 w-6 text-indigo-600" />} 
                onClick={() => handleTemplateSelect('linkedin')}
                isSelected={selectedTemplate === 'linkedin'}
              />
              <TemplateSelectionCard 
                title="Instagram Caption" 
                description="Visual content with engaging captions" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>} 
                onClick={() => handleTemplateSelect('instagram')}
                isSelected={selectedTemplate === 'instagram'}
              />
              <TemplateSelectionCard 
                title="Facebook Post" 
                description="Shareable content for your audience" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>} 
                onClick={() => handleTemplateSelect('facebook')}
                isSelected={selectedTemplate === 'facebook'}
              />
              <TemplateSelectionCard 
                title="Blog Article" 
                description="Long-form content with introduction" 
                icon={<BookOpen className="h-6 w-6 text-indigo-600" />} 
                onClick={() => handleTemplateSelect('blog')}
                isSelected={selectedTemplate === 'blog'}
              />
              <TemplateSelectionCard 
                title="YouTube Description" 
                description="SEO-friendly video descriptions" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>} 
                onClick={() => handleTemplateSelect('youtube')}
                isSelected={selectedTemplate === 'youtube'}
              />
            </div>
            <div className="mt-4 text-center">
              <Link href="/templates" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View all templates in the library →
              </Link>
            </div>
          </div>
          
          {selectedTemplate && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Template Information</h2>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h3 className="text-sm font-medium text-indigo-800 mb-2">
                  {selectedTemplate === 'twitter' && 'Twitter Thread Template'}
                  {selectedTemplate === 'linkedin' && 'LinkedIn Post Template'}
                  {selectedTemplate === 'blog' && 'Blog Article Template'}
                  {selectedTemplate === 'instagram' && 'Instagram Post Template'}
                  {selectedTemplate === 'facebook' && 'Facebook Post Template'}
                  {selectedTemplate === 'youtube' && 'YouTube Description Template'}
                </h3>
                <p className="text-xs text-indigo-700 mb-2">
                  {selectedTemplate === 'twitter' && 'Create an engaging Twitter thread with multiple tweets. Optimal length is 2-5 tweets.'}
                  {selectedTemplate === 'linkedin' && 'Create a professional LinkedIn post to share with your network. Focus on industry insights and professional achievements.'}
                  {selectedTemplate === 'blog' && 'Create a comprehensive blog article with introduction, body, and conclusion. Include headings and subheadings for better readability.'}
                  {selectedTemplate === 'instagram' && 'Create a captivating Instagram caption that complements your visual content. Focus on storytelling and engagement.'}
                  {selectedTemplate === 'facebook' && 'Create a Facebook post that encourages sharing and comments. Include questions or calls to action to boost engagement.'}
                  {selectedTemplate === 'youtube' && 'Create an SEO-friendly YouTube video description with timestamps, links, and keywords to improve discoverability.'}
                </p>
                {selectedTemplate === 'twitter' && (
                  <div className="text-xs text-indigo-600">Recommended: 280 characters per tweet, use emojis and hashtags</div>
                )}
                {selectedTemplate === 'linkedin' && (
                  <div className="text-xs text-indigo-600">Recommended: 1300-2000 characters, professional tone, include a call to action</div>
                )}
                {selectedTemplate === 'blog' && (
                  <div className="text-xs text-indigo-600">Recommended: 1500+ words, include images, use subheadings every 300 words</div>
                )}
                {selectedTemplate === 'instagram' && (
                  <div className="text-xs text-indigo-600">Recommended: 125-150 characters, 5-10 relevant hashtags, include emojis</div>
                )}
                {selectedTemplate === 'facebook' && (
                  <div className="text-xs text-indigo-600">Recommended: 40-80 characters, include an image or link, ask a question</div>
                )}
                {selectedTemplate === 'youtube' && (
                  <div className="text-xs text-indigo-600">Recommended: 200-300 words, include timestamps, links to related content, and relevant keywords</div>
                )}
              </div>
            </div>
          )}
          
          <div id="content-input-section" className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
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
                  className="w-full h-32 p-3 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-3 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  targetAudience={targetAudience}
                  setTargetAudience={setTargetAudience}
                />
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-full flex flex-col">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !originalContent.trim() || !selectedTemplate}
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
              
              <div className="bg-gray-50 p-4 text-gray-700 rounded-md whitespace-pre-wrap max-h-[500px] overflow-y-auto">
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
