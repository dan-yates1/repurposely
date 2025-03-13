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
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

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
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
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
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => {
                const isFavorite = userTemplates.some(
                  (ut) => ut.id === template.id && ut.favorite
                );

                // Determine which icon to use based on template type and platform
                let icon;
                if (template.platform) {
                  switch (template.platform) {
                    case "twitter":
                      icon = <Twitter className="text-indigo-500" size={24} />;
                      break;
                    case "linkedin":
                      icon = <Linkedin className="text-indigo-500" size={24} />;
                      break;
                    case "instagram":
                      icon = (
                        <Instagram className="text-indigo-500" size={24} />
                      );
                      break;
                    case "facebook":
                      icon = <Facebook className="text-indigo-500" size={24} />;
                      break;
                    case "youtube":
                      icon = <Youtube className="text-indigo-500" size={24} />;
                      break;
                    default:
                      icon = null;
                  }
                } else {
                  switch (template.type) {
                    case "blog":
                      icon = <FileText className="text-indigo-500" size={24} />;
                      break;
                    case "email":
                      icon = <Mail className="text-indigo-500" size={24} />;
                      break;
                    case "video":
                      icon = <Video className="text-indigo-500" size={24} />;
                      break;
                    case "marketing":
                      icon = (
                        <MessageSquare className="text-indigo-500" size={24} />
                      );
                      break;
                    default:
                      icon = (
                        <PenSquare className="text-indigo-500" size={24} />
                      );
                  }
                }

                return (
                  <div
                    key={template.id}
                    className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Favorite Button */}
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-yellow-500"
                      onClick={() => toggleFavorite(template.id)}
                    >
                      {isFavorite ? (
                        <Star
                          className="fill-yellow-400 text-yellow-400"
                          size={20}
                        />
                      ) : (
                        <StarOff size={20} />
                      )}
                    </button>

                    {/* New Badge */}
                    {template.new && (
                      <span className="absolute top-4 left-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}

                    {/* Premium Badge */}
                    {template.premium && (
                      <span className="absolute top-4 left-4 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}

                    <div className="mb-4 mt-2">{icon}</div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {template.tokens} token{template.tokens > 1 ? "s" : ""}
                      </span>

                      <button
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          template.premium && userPlan === "Free"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                        disabled={template.premium && userPlan === "Free"}
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No templates found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
