"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HistoryCard } from "@/components/ui/history-card";
import { AnalyticsMetricCard } from "@/components/ui/analytics-metric-card";
import { CategoryCard } from "@/components/ui/category-card";
import {
  Twitter,
  BookOpen,
  FileText,
  Mail,
  Edit,
  TrendingUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

// Define types for content history items
interface ContentHistoryItem {
  id: string;
  user_id: string;
  original_content: string;
  repurposed_content: string;
  created_at: string;
  content_type: string;
  tone: string;
  target_audience: string;
  content_length: string;
  status?: "published" | "draft";
}

export default function History() {
  const router = useRouter();
  usePageTitle("Content History");
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("all-history");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchContentHistory(session.user.id);
      } else {
        router.push("/auth");
      }
    };

    checkUser();
  }, [router]);

  const fetchContentHistory = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleCardClick = (id: string) => {
    router.push(`/content/${id}`);
  };

  const handleCardAction = (id: string, action: "edit" | "delete") => {
    if (action === "edit") {
      router.push(`/create?edit=${id}`);
    } else if (action === "delete") {
      deleteContent(id);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("content_history")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Remove the deleted item from the state
      setContentHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success("Content deleted successfully");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  // Filter content history based on active tab and search query
  const filteredHistory = contentHistory.filter((item) => {
    // Tab filtering
    if (activeTab === "blog-posts" && item.content_type !== "Blog Post") {
      return false;
    }
    if (activeTab === "social-posts" && !item.content_type.includes("Social Media")) {
      return false;
    }
    if (activeTab === "emails" && !item.content_type.includes("Email")) {
      return false;
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.original_content.toLowerCase().includes(query) ||
        item.repurposed_content.toLowerCase().includes(query) ||
        item.content_type.toLowerCase().includes(query) ||
        item.tone.toLowerCase().includes(query) ||
        item.target_audience.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate metrics
  const metrics = {
    totalContent: contentHistory.length,
    blogPosts: contentHistory.filter((item) => item.content_type === "Blog Post").length,
    socialPosts: contentHistory.filter((item) => item.content_type.includes("Social Media")).length,
    emails: contentHistory.filter((item) => item.content_type.includes("Email")).length,
    thisMonth: contentHistory.filter((item) => {
      const itemDate = new Date(item.created_at);
      const now = new Date();
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  // Get content category distribution
  const categoryDistribution = [
    { name: "Blog Posts", count: metrics.blogPosts, icon: <BookOpen className="text-blue-500" /> },
    { name: "Social Media", count: metrics.socialPosts, icon: <Twitter className="text-indigo-500" /> },
    { name: "Emails", count: metrics.emails, icon: <Mail className="text-purple-500" /> },
    { 
      name: "Other", 
      count: metrics.totalContent - metrics.blogPosts - metrics.socialPosts - metrics.emails,
      icon: <FileText className="text-green-500" />
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content History</h1>
        <p className="text-gray-500">View and manage all your generated content</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnalyticsMetricCard
          title="Total Content"
          value={metrics.totalContent.toString()}
          icon={<FileText className="text-blue-500" />}
        />
        <AnalyticsMetricCard
          title="Blog Posts"
          value={metrics.blogPosts.toString()}
          icon={<BookOpen className="text-indigo-500" />}
        />
        <AnalyticsMetricCard
          title="Social Media Posts"
          value={metrics.socialPosts.toString()}
          icon={<Twitter className="text-purple-500" />}
        />
        <AnalyticsMetricCard
          title="Created This Month"
          value={metrics.thisMonth.toString()}
          icon={<TrendingUp className="text-green-500" />}
        />
      </div>

      {/* Search and Tabs */}
      <div className="bg-white shadow-sm rounded-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 p-4">
          <div className="mb-4 md:mb-0">
            <div className="flex space-x-4">
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "all-history"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("all-history")}
              >
                All History
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "blog-posts"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("blog-posts")}
              >
                Blog Posts
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "social-posts"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("social-posts")}
              >
                Social Posts
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "emails"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("emails")}
              >
                Emails
              </button>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search content..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Content Listing */}
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <HistoryCard
                  key={item.id}
                  id={item.id}
                  title={
                    item.original_content.length > 50
                      ? item.original_content.substring(0, 50) + "..."
                      : item.original_content
                  }
                  content={
                    item.repurposed_content.length > 100
                      ? item.repurposed_content.substring(0, 100) + "..."
                      : item.repurposed_content
                  }
                  date={new Date(item.created_at).toLocaleDateString()}
                  type={item.content_type}
                  status={item.status || "draft"}
                  onClick={() => handleCardClick(item.id)}
                  onAction={(action) => handleCardAction(item.id, action)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No content found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search or filters."
                  : "Get started by creating a new piece of content."}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => router.push("/create")}
                  >
                    <Edit className="-ml-1 mr-2 h-4 w-4" />
                    Create New Content
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Categories Section - Only show if there's content */}
      {contentHistory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Content Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryDistribution.map((category) => (
              <CategoryCard
                key={category.name}
                name={category.name}
                count={category.count}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
