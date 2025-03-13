"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Filter,
  Star,
  StarOff,
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
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

// Define template categories
const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "social", label: "Social Media" },
  { id: "blog", label: "Blog & Articles" },
  { id: "email", label: "Email" },
  { id: "video", label: "Video" },
  { id: "marketing", label: "Marketing" },
  { id: "favorite", label: "Favorites" },
];

// Define template data
interface Template {
  id: string;
  title: string;
  description: string;
  type: "social" | "blog" | "email" | "video" | "marketing";
  platform?: string;
  tokens: number;
  favorite?: boolean;
  new?: boolean;
  premium?: boolean;
}

const TEMPLATES: Template[] = [
  // Social Media Templates
  {
    id: "twitter-thread",
    title: "Twitter Thread",
    description:
      "Transform your content into an engaging Twitter thread format",
    type: "social",
    platform: "twitter",
    tokens: 1,
    new: true,
  },
  {
    id: "linkedin-post",
    title: "LinkedIn Article",
    description: "Create a professional LinkedIn post from your content",
    type: "social",
    platform: "linkedin",
    tokens: 1,
  },
  {
    id: "instagram-caption",
    title: "Instagram Caption",
    description: "Generate engaging captions for Instagram posts",
    type: "social",
    platform: "instagram",
    tokens: 1,
  },
  {
    id: "facebook-post",
    title: "Facebook Post",
    description: "Craft engaging Facebook posts from your content",
    type: "social",
    platform: "facebook",
    tokens: 1,
  },
  {
    id: "tiktok-script",
    title: "TikTok Script",
    description: "Create short-form video scripts for TikTok",
    type: "social",
    platform: "tiktok",
    tokens: 2,
    premium: true,
  },

  // Blog & Article Templates
  {
    id: "blog-post",
    title: "Blog Post",
    description: "Transform your content into a full blog post with sections",
    type: "blog",
    tokens: 2,
  },
  {
    id: "listicle",
    title: "Listicle",
    description: "Create a numbered list article from your content",
    type: "blog",
    tokens: 2,
  },
  {
    id: "how-to-guide",
    title: "How-To Guide",
    description: "Generate a step-by-step guide from your content",
    type: "blog",
    tokens: 2,
    new: true,
  },
  {
    id: "content-summary",
    title: "Content Summary",
    description: "Create a concise summary of longer content",
    type: "blog",
    tokens: 1,
  },

  // Email Templates
  {
    id: "newsletter",
    title: "Email Newsletter",
    description: "Transform your content into an email newsletter format",
    type: "email",
    tokens: 2,
  },
  {
    id: "welcome-email",
    title: "Welcome Email",
    description: "Create a welcoming email for new subscribers",
    type: "email",
    tokens: 2,
    premium: true,
  },
  {
    id: "promotional-email",
    title: "Promotional Email",
    description: "Create a promotional email for products or services",
    type: "email",
    tokens: 2,
  },

  // Video Templates
  {
    id: "youtube-script",
    title: "YouTube Script",
    description: "Transform your content into a YouTube video script",
    type: "video",
    platform: "youtube",
    tokens: 3,
  },
  {
    id: "video-description",
    title: "Video Description",
    description: "Create optimized descriptions for video content",
    type: "video",
    tokens: 1,
  },
  {
    id: "podcast-outline",
    title: "Podcast Outline",
    description: "Generate a podcast episode outline from your content",
    type: "video",
    tokens: 2,
    premium: true,
  },

  // Marketing Templates
  {
    id: "product-description",
    title: "Product Description",
    description: "Create compelling product descriptions",
    type: "marketing",
    tokens: 2,
  },
  {
    id: "ad-copy",
    title: "Ad Copy",
    description: "Generate advertising copy for various platforms",
    type: "marketing",
    tokens: 1,
    new: true,
  },
  {
    id: "press-release",
    title: "Press Release",
    description: "Transform announcements into press release format",
    type: "marketing",
    tokens: 3,
    premium: true,
  },
];

export default function Templates() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredTemplates, setFilteredTemplates] =
    useState<Template[]>(TEMPLATES);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [showPremium, setShowPremium] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("Free");

  usePageTitle("Templates");

  useEffect(() => {
    // Check user and get their plan
    const getUserInfo = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          // Fetch user subscription plan
          const { data: subscriptionData } = await supabase
            .from("user_subscriptions")
            .select("subscription_tier")
            .eq("user_id", data.user.id)
            .single();

          if (subscriptionData) {
            const tier = subscriptionData.subscription_tier || "FREE";
            setUserPlan(
              tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()
            );
          }

          // Fetch user's favorite templates (in a real app)
          // For now, we'll just simulate this with local state
          const randomFavorites = TEMPLATES.filter(
            () => Math.random() > 0.7
          ).map((template) => ({ ...template, favorite: true }));

          setUserTemplates(randomFavorites);
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserInfo();
  }, [router]);

  // Filter templates based on search query and category
  useEffect(() => {
    let filtered = [...TEMPLATES];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      if (selectedCategory === "favorite") {
        // Show only favorite templates
        filtered = filtered.filter((template) =>
          userTemplates.some((ut) => ut.id === template.id && ut.favorite)
        );
      } else {
        // Show templates of the selected category
        filtered = filtered.filter(
          (template) => template.type === selectedCategory
        );
      }
    }

    // Filter premium templates if user doesn't want to see them
    if (!showPremium) {
      filtered = filtered.filter((template) => !template.premium);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, userTemplates, showPremium]);

  // Toggle favorite status for a template
  const toggleFavorite = (templateId: string) => {
    setUserTemplates((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === templateId);

      if (existingIndex >= 0) {
        // Template exists in user templates, toggle favorite status
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          favorite: !updated[existingIndex].favorite,
        };
        return updated;
      } else {
        // Template doesn't exist in user templates, add it as favorite
        const template = TEMPLATES.find((t) => t.id === templateId);
        if (template) {
          return [...prev, { ...template, favorite: true }];
        }
        return prev;
      }
    });

    toast.success("Template favorites updated");
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);

    if (template?.premium && userPlan === "Free") {
      toast.error("This template requires a Pro or Enterprise subscription");
      return;
    }

    // In a real app, you would store the selected template and redirect to the create page
    router.push(`/create?template=${templateId}`);
  };

  // Create custom template
  const handleCreateCustomTemplate = () => {
    if (userPlan === "Free") {
      toast.error("Custom templates require a Pro or Enterprise subscription");
      return;
    }

    router.push("/templates/custom");
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">
            Choose a template to repurpose your content
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Premium Filter */}
          <button
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${
              showPremium
                ? "bg-indigo-50 text-indigo-600"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setShowPremium(!showPremium)}
          >
            <Filter size={16} />
            <span>{showPremium ? "Showing All" : "Hide Premium"}</span>
          </button>

          {/* Create Custom Template Button */}
          <Button
            variant="primary"
            size="md"
            className="rounded-md px-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
            onClick={handleCreateCustomTemplate}
          >
            <Plus size={16} className="mr-2" />
            Custom Template
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              selectedCategory === category.id
                ? "bg-indigo-100 text-indigo-700"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            ))
        ) : filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => {
            const isFavorite = userTemplates.some(
              (ut) => ut.id === template.id && ut.favorite
            );

            // Determine the platform icon
            let PlatformIcon = null;
            if (template.platform) {
              switch (template.platform) {
                case "twitter":
                  PlatformIcon = Twitter;
                  break;
                case "linkedin":
                  PlatformIcon = Linkedin;
                  break;
                case "instagram":
                  PlatformIcon = Instagram;
                  break;
                case "facebook":
                  PlatformIcon = Facebook;
                  break;
                case "youtube":
                  PlatformIcon = Youtube;
                  break;
                default:
                  break;
              }
            } else {
              // Assign an icon based on type
              switch (template.type) {
                case "blog":
                  PlatformIcon = FileText;
                  break;
                case "email":
                  PlatformIcon = Mail;
                  break;
                case "video":
                  PlatformIcon = Video;
                  break;
                case "marketing":
                  PlatformIcon = MessageSquare;
                  break;
                default:
                  PlatformIcon = PenSquare;
                  break;
              }
            }

            return (
              <div
                key={template.id}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
              >
                {/* New Indicator */}
                {template.new && (
                  <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}

                {/* Premium Indicator */}
                {template.premium && (
                  <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}

                <div className="mb-4 flex items-center space-x-2">
                  {PlatformIcon && (
                    <PlatformIcon className="h-5 w-5 text-indigo-500" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900">
                    {template.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-6 min-h-[3rem]">
                  {template.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <button
                      className="mr-2 text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center border border-gray-200 hover:bg-gray-50"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      Use Template
                    </button>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {template.tokens} token{template.tokens > 1 ? "s" : ""}
                    </span>
                  </div>

                  <button
                    className="text-gray-400 hover:text-indigo-500 focus:outline-none"
                    onClick={() => toggleFavorite(template.id)}
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    {isFavorite ? (
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 py-12 text-center">
            <p className="text-gray-500 mb-2">No templates found.</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
