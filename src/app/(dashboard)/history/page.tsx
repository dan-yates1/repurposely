"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link"; // Removed unused import
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { 
  Calendar, 
  Filter, 
  Search as SearchIcon, 
  ChevronDown,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/ui/content-card";
import { Search } from "@/components/ui/search";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs"; // Import Breadcrumbs

interface ContentHistoryItem {
  id: string;
  user_id: string;
  original_content: string;
  repurposed_content: string;
  output_format?: string;
  content_type?: string;
  tone: string;
  target_audience: string;
  created_at: string;
  status?: "published" | "draft"; 
  metadata?: Record<string, unknown>; 
}

export default function History() {
  usePageTitle("Content History");
  const router = useRouter();
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch content history
  const fetchContentHistory = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from("content_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: sortOrder === "asc" });

      if (selectedFormat) {
        query = query.eq("output_format", selectedFormat);
      }
      if (selectedTimeframe) {
        const now = new Date();
        const startDate = new Date();
        switch (selectedTimeframe) {
          case "today": startDate.setHours(0, 0, 0, 0); break;
          case "week": startDate.setDate(now.getDate() - 7); break;
          case "month": startDate.setMonth(now.getMonth() - 1); break;
          case "year": startDate.setFullYear(now.getFullYear() - 1); break;
        }
        query = query.gte("created_at", startDate.toISOString());
      }

      const { data, error } = await query;

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
  }, [selectedFormat, selectedTimeframe, sortOrder]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await fetchContentHistory(userData.user.id);
        } else {
           router.push('/auth'); 
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUserData();
  }, [fetchContentHistory, router]); 

  // Filter content by search query
  const filteredContent = contentHistory.filter((item) => {
    return (
      item.original_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.repurposed_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.output_format && item.output_format.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Output format options
  const formatOptions = [
    { id: null, label: "All Formats" },
    { id: "twitter-thread", label: "Twitter Thread" },
    { id: "linkedin-post", label: "LinkedIn Post" },
    { id: "blog-post", label: "Blog Article" },
    { id: "instagram-caption", label: "Instagram Caption" },
    { id: "facebook-post", label: "Facebook Post" },
    { id: "youtube-script", label: "YouTube Script" },
  ];

  // Timeframe options
  const timeframeOptions = [
    { id: null, label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "Last 7 Days" },
    { id: "month", label: "Last 30 Days" },
    { id: "year", label: "Last Year" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Content History" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Content History</h1>
        <Button onClick={() => router.push("/create")} variant="primary" className="w-full sm:w-auto">
          Create New Content
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Search 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..." 
              onClear={() => setSearchQuery("")}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Format Filter Dropdown */}
            <div className="relative">
              <div className="flex items-center bg-white border border-gray-200 rounded-md p-2 min-w-[160px]">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <select 
                  className="text-sm text-gray-700 bg-transparent outline-none appearance-none w-full pr-8 cursor-pointer"
                  value={selectedFormat || ""}
                  onChange={(e) => setSelectedFormat(e.target.value || null)}
                >
                  {formatOptions.map(format => (
                    <option key={`format-${format.id || 'all'}`} value={format.id || ""}>{format.label}</option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-gray-500 absolute right-2 pointer-events-none" />
              </div>
            </div>
            {/* Timeframe Filter Dropdown */}
            <div className="relative">
              <div className="flex items-center bg-white border border-gray-200 rounded-md p-2 min-w-[160px]">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <select 
                  className="text-sm text-gray-700 bg-transparent outline-none appearance-none w-full pr-8 cursor-pointer"
                  value={selectedTimeframe || ""}
                  onChange={(e) => setSelectedTimeframe(e.target.value || null)}
                >
                  {timeframeOptions.map(timeframe => (
                    <option key={`timeframe-${timeframe.id || 'all'}`} value={timeframe.id || ""}>{timeframe.label}</option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-gray-500 absolute right-2 pointer-events-none" />
              </div>
            </div>
            {/* Sort Order Toggle */}
            <Button variant="secondary" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content History Grid */}
      {loading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.original_content.slice(0, 40) + "..."}
              description={item.repurposed_content.slice(0, 100) + "..."}
              date={new Date(item.created_at).toLocaleDateString()}
              type={item.output_format || "Text"}
              status={item.status || "draft"}
              // Default behavior links card to /content/[id]
            />
          ))}
        </div>
      ) : (
        // No Content Message
        <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
          <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedFormat || selectedTimeframe
              ? "Try adjusting your filters to find your content."
              : "You haven't created any content yet."}
          </p>
          <Button onClick={() => router.push("/create")} variant="primary">
            Create Your First Content
          </Button>
        </div>
      )}
    </div>
  );
}
