import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  FileText,
  MessageSquare,
  PenSquare,
  Video,
  LucideProps // Import LucideProps for icon type
} from "lucide-react";
import React from 'react'; 

// Define template data interface
export interface Template {
  id: string;
  title: string;
  description: string;
  type: "social" | "blog" | "email" | "video" | "marketing" | "custom"; 
  platform?: string;
  tokens: number;
  favorite?: boolean;
  new?: boolean;
  premium?: boolean;
  // Store the component type, not the rendered element
  icon?: React.ComponentType<LucideProps>; 
  prompt?: string; 
}

// Define template categories
export const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "social", label: "Social Media" },
  { id: "blog", label: "Blog & Articles" },
  { id: "email", label: "Email" },
  { id: "video", label: "Video" },
  { id: "marketing", label: "Marketing" },
  { id: "custom", label: "Custom" }, 
  { id: "favorite", label: "Favorites" },
];

// Define shared template data using component references for icons
export const TEMPLATES: Template[] = [
  // Social Media Templates
  { id: "twitter-thread", title: "Twitter Thread", description: "Transform your content into an engaging Twitter thread format", type: "social", platform: "twitter", tokens: 1, new: true, icon: Twitter },
  { id: "linkedin-post", title: "LinkedIn Article", description: "Create a professional LinkedIn post from your content", type: "social", platform: "linkedin", tokens: 1, icon: Linkedin },
  { id: "instagram-caption", title: "Instagram Caption", description: "Generate engaging captions for Instagram posts", type: "social", platform: "instagram", tokens: 1, icon: Instagram },
  { id: "facebook-post", title: "Facebook Post", description: "Craft engaging Facebook posts from your content", type: "social", platform: "facebook", tokens: 1, icon: Facebook },
  { id: "tiktok-script", title: "TikTok Script", description: "Create short-form video scripts for TikTok", type: "social", platform: "tiktok", tokens: 2, premium: true, icon: Video },

  // Blog & Article Templates
  { id: "blog-post", title: "Blog Post", description: "Transform your content into a full blog post with sections", type: "blog", tokens: 2, icon: FileText },
  { id: "listicle", title: "Listicle", description: "Create a numbered list article from your content", type: "blog", tokens: 2, icon: FileText },
  { id: "how-to-guide", title: "How-To Guide", description: "Generate a step-by-step guide from your content", type: "blog", tokens: 2, new: true, icon: FileText },
  { id: "content-summary", title: "Content Summary", description: "Create a concise summary of longer content", type: "blog", tokens: 1, icon: FileText },

  // Email Templates
  { id: "newsletter", title: "Email Newsletter", description: "Transform your content into an email newsletter format", type: "email", tokens: 2, icon: Mail },
  { id: "welcome-email", title: "Welcome Email", description: "Create a welcoming email for new subscribers", type: "email", tokens: 2, premium: true, icon: Mail },
  { id: "promotional-email", title: "Promotional Email", description: "Create a promotional email for products or services", type: "email", tokens: 2, icon: Mail },

  // Video Templates
  { id: "youtube-script", title: "YouTube Script", description: "Transform your content into a YouTube video script", type: "video", platform: "youtube", tokens: 3, icon: Youtube },
  { id: "video-description", title: "Video Description", description: "Create optimized descriptions for video content", type: "video", tokens: 1, icon: Video },
  { id: "podcast-outline", title: "Podcast Outline", description: "Generate a podcast episode outline from your content", type: "video", tokens: 2, premium: true, icon: Video },

  // Marketing Templates
  { id: "product-description", title: "Product Description", description: "Create compelling product descriptions", type: "marketing", tokens: 2, icon: MessageSquare },
  { id: "ad-copy", title: "Ad Copy", description: "Generate advertising copy for various platforms", type: "marketing", tokens: 1, new: true, icon: MessageSquare },
  { id: "press-release", title: "Press Release", description: "Transform announcements into press release format", type: "marketing", tokens: 3, premium: true, icon: PenSquare },
];
