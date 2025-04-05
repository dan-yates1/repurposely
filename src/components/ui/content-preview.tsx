"use client";

import { useState } from 'react';
import { Twitter, Linkedin, FileText, Instagram, Youtube, Facebook } from 'lucide-react';
import Image from 'next/image'; // Import Next Image

interface ContentPreviewProps {
  content: string;
  platform: string;
  imageUrl?: string | null; // Add imageUrl prop
}

// Simple avatar component (no changes needed)
const Avatar = ({ initials = "U", size = 40 }: { initials?: string; size?: number }) => {
  const colors = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-red-500", "bg-purple-500", "bg-indigo-500"
  ];

  // Use a stable color based on the initials
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`${bgColor} text-white flex items-center justify-center rounded-full`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <span className="text-sm font-medium">{initials}</span>
    </div>
  );
};

export function ContentPreview({ content, platform, imageUrl }: ContentPreviewProps) { // Add imageUrl to props
  // Format content based on platform (no changes needed)
  const formatContent = (content: string, platform: string) => {
    switch (platform) {
      case 'twitter':
        // Split content into lines for Twitter thread
        return content.split('\n\n').filter(line => line.trim() !== '');
      case 'linkedin':
      case 'facebook':
        // Replace hashtags with styled versions
        return content.replace(/#(\w+)/g, '<span class="text-blue-500">#$1</span>');
      default:
        return content;
    }
  };

  const formattedContent = formatContent(content, platform);

  // Render platform-specific preview
  const renderPreview = () => {
    switch (platform) {
      case 'twitter':
        return (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden text-gray-800">
            <div className="p-4 space-y-4">
              {Array.isArray(formattedContent) ? (
                formattedContent.map((tweet, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start mb-2">
                      <div className="h-10 w-10 rounded-full overflow-hidden mr-2">
                        <Avatar initials="YN" size={40} />
                      </div>
                      <div>
                        <div className="font-bold">Your Name</div>
                        <div className="text-gray-500 text-sm">@yourhandle</div>
                      </div>
                    </div>
                    <div className="ml-12">
                      <p className="text-gray-800 whitespace-pre-line">{tweet}</p>
                      <div className="flex mt-2 text-gray-500 text-sm space-x-4">
                        <span>0 Comments</span>
                        <span>0 Retweets</span>
                        <span>0 Likes</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <div className="flex items-start mb-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-2">
                      <Avatar initials="YN" size={40} />
                    </div>
                    <div>
                      <div className="font-bold">Your Name</div>
                      <div className="text-gray-500 text-sm">@yourhandle</div>
                    </div>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-800 whitespace-pre-line">{content}</p>
                    <div className="flex mt-2 text-gray-500 text-sm space-x-4">
                      <span>0 Comments</span>
                      <span>0 Retweets</span>
                      <span>0 Likes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'linkedin':
        return (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md text-gray-800 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start mb-3">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                  <Avatar initials="YN" size={48} />
                </div>
                <div>
                  <div className="font-bold">Your Name</div>
                  <div className="text-gray-500 text-sm">Your Title • 1h</div>
                </div>
              </div>
              <div>
                <div
                  className="text-gray-800 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: typeof formattedContent === 'string' ? formattedContent : content }}
                />
                <div className="border-t border-gray-200 mt-4 pt-2">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>0 Reactions</span>
                    <span>0 Comments</span>
                    <span>0 Shares</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="max-w-md mx-auto bg-white rounded-xl text-gray-800 shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex items-start mb-3">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-2">
                  <Avatar initials="YN" size={40} />
                </div>
                <div>
                  <div className="font-bold">Your Name</div>
                  <div className="text-gray-500 text-xs">1h • <span className="text-xs">🌎</span></div>
                </div>
              </div>
              <div>
                <div
                  className="text-gray-800 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: typeof formattedContent === 'string' ? formattedContent : content }}
                />
                <div className="border-t border-gray-200 mt-4 pt-2">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>👍 0</span>
                    <span>💬 0</span>
                    <span>↪️ 0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden text-gray-700">
            <div className="border-b border-gray-200 p-3">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                  <Avatar initials="YH" size={32} />
                </div>
                <div className="text-gray-800 font-semibold">your_handle</div>
              </div>
            </div>
            {/* Display actual image if URL exists, otherwise placeholder */}
            <div className="bg-gray-100 aspect-square flex items-center justify-center relative overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Generated content image"
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="text-gray-400 text-sm">
                  [No Image Generated]
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center space-x-4 mb-2">
                <span>❤️</span>
                <span>💬</span>
                <span>↪️</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold">your_handle</span>{' '}
                <span className="whitespace-pre-line">{content}</span>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md text-gray-700 overflow-hidden">
            <div className="p-6 border border-gray-200">
              {/* Email Header */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-2">
                      <Avatar initials="YC" size={40} />
                    </div>
                    <div>
                      <div className="font-bold">Your Company</div>
                      <div className="text-gray-500 text-xs">yourcompany@example.com</div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">To: <span className="text-gray-700">recipient@example.com</span></div>
                    <div className="text-sm text-gray-500">Subject: <span className="font-medium text-gray-800">{content.split('\n')[0].replace(/^#\s*/, '') || "Email Subject"}</span></div>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="email-body">
                {/* Add image to email preview if available */}
                {imageUrl && (
                  <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-md border">
                    <Image
                      src={imageUrl}
                      alt="Email header image"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line">{content}</div>
                </div>

                {/* Email Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-gray-500 text-xs">
                  <p>Your Company, Inc.</p>
                  <p>123 Main Street, Anytown, USA</p>
                  <p className="mt-2">To unsubscribe from these emails, <a href="#" className="text-blue-500 hover:underline">click here</a>.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'blog':
      default:
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md text-gray-700 overflow-hidden">
            {/* Blog Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div className="font-bold text-indigo-600">Your Blog</div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Home</span>
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Articles</span>
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">About</span>
                  <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Contact</span>
                </div>
              </div>
            </div>

            {/* Blog Content */}
            <div className="p-6">
              {/* Add image to blog preview if available */}
              {imageUrl && (
                <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-md border">
                  <Image
                    src={imageUrl}
                    alt="Blog post image"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}

              {/* Author info and date */}
              <div className="flex items-center mb-4 text-sm text-gray-500">
                <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                  <Avatar initials="YN" size={32} />
                </div>
                <span className="font-medium text-gray-700 mr-2">Your Name</span>
                <span className="mr-2">•</span>
                <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span>5 min read</span>
              </div>

              <h1 className="text-3xl font-bold mb-4 text-gray-900">
                {content.split('\n')[0].replace(/^#\s*/, '') || "Blog Post Title"}
              </h1>

              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-line">{content}</div>
              </div>

              {/* Tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">#writing</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">#content</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">#blog</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="content-preview">
      {renderPreview()}
    </div>
  );
}

// Update PlatformPreviewTabs props to accept imageUrl
export function PlatformPreviewTabs({
  content,
  selectedTemplate,
  imageUrl
}: {
  content: string;
  selectedTemplate: string | null;
  imageUrl?: string | null; // Add imageUrl prop
}) {
  // Determine the platform from the template ID
  const getPlatformFromTemplate = (templateId: string | null): string => {
    if (!templateId) return 'blog';

    // Extract platform from template ID (e.g., "twitter-thread" -> "twitter")
    const platformMatches = templateId.match(/^(twitter|linkedin|facebook|instagram|blog|email)/i);
    if (platformMatches) {
      return platformMatches[0].toLowerCase();
    }

    // Default mappings for other template types
    if (templateId.includes('email')) return 'email';
    if (templateId.includes('blog')) return 'blog';
    if (templateId.includes('youtube')) return 'youtube';

    return 'blog';
  };

  const defaultPlatform = getPlatformFromTemplate(selectedTemplate);
  const [activeTab, setActiveTab] = useState(defaultPlatform);

  const getPlatformIcon = (platform: string) => { // No changes needed here
    switch (platform) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'blog':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <div className="mb-4 border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {['twitter', 'linkedin', 'facebook', 'instagram', 'blog', 'email'].map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className={`
                flex items-center px-4 py-2 border-b-2 font-medium text-sm
                ${activeTab === platform
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <span className="mr-2">{getPlatformIcon(platform)}</span>
              <span className="capitalize">{platform}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <ContentPreview
          content={content}
          platform={activeTab}
          imageUrl={imageUrl} // Pass imageUrl down
        />
      </div>
    </div>
  );
}
