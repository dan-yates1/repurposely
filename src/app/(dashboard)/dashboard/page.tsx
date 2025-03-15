"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { Twitter, BookOpen, Mail, Video } from "lucide-react";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { ContentCard } from "@/components/ui/content-card";
import { TemplateCard } from "@/components/ui/template-card";
import { AnalyticsCard } from "@/components/ui/analytics-card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTokens } from "@/hooks/useTokens";
import { AnalyticsMetricCard } from "@/components/ui/analytics-metric-card";
import { TokenUsageCard } from "@/components/ui/token-usage-card";

// Define types for content history items
interface ContentHistoryItem {
  id: string;
  user_id: string;
  original_content: string;
  repurposed_content: string;
  output_format?: string;
  content_type?: string;
  tone: string;
  content_length: string;
  target_audience: string;
  created_at: string;
  status?: "published" | "draft";
}

export default function Dashboard() {
  const router = useRouter();
  usePageTitle("Dashboard");
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { tokenUsage } = useTokens();

  // Define the fetchContentHistory function before useEffect
  const fetchContentHistory = async (userId: string) => {
    if (!userId) {
      console.error("Cannot fetch content history: No user ID provided");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      if (data) {
        setContentHistory(data);
      }
    } catch (error) {
      console.error("Error fetching content history:", error);
      toast.error("Failed to load content history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user data
    const getUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await fetchContentHistory(userData.user.id);
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUserData();
  }, []);

  // Sample analytics data
  const analyticsData = {
    contentCreated: 12,
    totalViews: 1428,
    totalEngagements: 244,
    conversionRate: 3.7,
  };

  // Mock templates data
  const templates = [
    {
      id: "twitter-post",
      title: "Twitter Thread",
      description: "Create engaging Twitter threads",
      icon: <Twitter className="h-5 w-5" />,
    },
    {
      id: "blog-post",
      title: "Blog Article",
      description: "Create SEO-optimized blog content",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      id: "email-newsletter",
      title: "Email Newsletter",
      description: "Create compelling email content",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: "video-script",
      title: "Video Script",
      description: "Create scripts for video content",
      icon: <Video className="h-5 w-5" />,
    },
  ];

  // Function to redirect to content creation with template
  const handleTemplateClick = (templateId: string) => {
    router.push(`/create?template=${templateId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back to your content workspace</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
          <Search className="w-full sm:w-64" />
          <Button onClick={() => router.push("/create")} variant="primary" className="w-full sm:w-auto">
            Create New
          </Button>
        </div>
      </div>

      {/* Token Usage Summary */}
      <div className="mb-8">
        <TokenUsageCard />
      </div>

      {/* Dashboard Tabs */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: "all", label: "All Content" },
            { id: "analytics", label: "Analytics" },
            { id: "templates", label: "Templates" },
          ]}
          defaultTabId="all"
          onTabChange={setActiveTab}
        />
      </div>

      {/* Content Tab */}
      {activeTab === "all" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {loading ? (
              // Loading skeletons
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))
            ) : contentHistory.length > 0 ? (
              contentHistory.slice(0, 6).map((item) => (
                <ContentCard
                  key={item.id}
                  id={item.id}
                  title={item.original_content.slice(0, 40) + "..."}
                  description={item.repurposed_content.slice(0, 100) + "..."}
                  date={new Date(item.created_at).toLocaleDateString()}
                  type={item.content_type || "Text"}
                  status={item.status || "draft"}
                  onClick={() => router.push(`/content/${item.id}`)}
                />
              ))
            ) : (
              <div className="col-span-3 py-10 text-center">
                <p className="text-gray-500 mb-4">
                  You haven&apos;t created any content yet.
                </p>
                <Button
                  onClick={() => router.push("/create")}
                  variant="primary"
                >
                  Create Your First Content
                </Button>
              </div>
            )}
          </div>

          {contentHistory.length > 0 && (
            <div className="text-center mb-12">
              <Button
                onClick={() => router.push("/history")}
                variant="secondary"
              >
                View All Content
              </Button>
            </div>
          )}

          {/* Quick Templates Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Create
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  icon={template.icon}
                  onClick={() => handleTemplateClick(template.id)}
                />
              ))}
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Performance Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard
                title="Content Created"
                value={analyticsData.contentCreated.toString()}
                change="+3"
                isPositive={true}
              />
              <AnalyticsCard
                title="Total Views"
                value={analyticsData.totalViews.toLocaleString()}
                change="+12%"
                isPositive={true}
              />
              <AnalyticsCard
                title="Engagements"
                value={analyticsData.totalEngagements.toLocaleString()}
                change="+8%"
                isPositive={true}
              />
              <AnalyticsCard
                title="Conversion Rate"
                value={`${analyticsData.conversionRate}%`}
                change="-0.5%"
                isPositive={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Content Analytics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <AnalyticsMetricCard
              title="Content Created"
              value={analyticsData.contentCreated.toString()}
              change="+3"
              isPositive={true}
              description="Total content pieces created this month"
            />
            <AnalyticsMetricCard
              title="Total Views"
              value={analyticsData.totalViews.toLocaleString()}
              change="+12%"
              isPositive={true}
              description="Combined views across all platforms"
            />
            <AnalyticsMetricCard
              title="Engagements"
              value={analyticsData.totalEngagements.toLocaleString()}
              change="+8%"
              isPositive={true}
              description="Likes, comments, and shares"
            />
            <AnalyticsMetricCard
              title="Conversion Rate"
              value={`${analyticsData.conversionRate}%`}
              change="-0.5%"
              isPositive={false}
              description="Traffic that results in conversions"
            />
          </div>
          <div className="h-60 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Content Analytics Charts Coming Soon</p>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.title}
                description={template.description}
                icon={template.icon}
                onClick={() => handleTemplateClick(template.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
