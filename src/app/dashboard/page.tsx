"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { Twitter, BookOpen, Mail, Video } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { ContentCard } from "@/components/ui/content-card";
import { TemplateCard } from "@/components/ui/template-card";
import { AnalyticsCard } from "@/components/ui/analytics-card";
import { TokenUsageCard } from "@/components/ui/token-usage-card";
import { TokenHistory } from "@/components/ui/token-history";

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
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>(
    []
  );
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(false);

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
        .limit(10);

      if (error) {
        console.error("Error fetching content history:", error);
        toast.error("Failed to load content history");
        setContentHistory([]);
        return;
      }

      if (data) {
        console.log("Content history loaded:", data.length, "items");
        // Add status field for UI purposes
        const historyWithStatus = data.map((item) => ({
          ...item,
          status:
            Math.random() > 0.3 ? ("published" as const) : ("draft" as const),
        }));
        setContentHistory(historyWithStatus);
      } else {
        setContentHistory([]);
      }
    } catch (err) {
      console.error("Unexpected error fetching content history:", err);
      toast.error("An error occurred while loading history");
      // Set empty array to prevent UI from waiting for data
      setContentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Function to check auth status
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          console.log("User is authenticated:", session.user.email);
          fetchContentHistory(session.user.id);
        } else if (isMounted) {
          console.log("No active session found");
          router.push("/auth");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        if (isMounted) {
          router.push("/auth");
        }
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    };

    checkUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session?.user && isMounted) {
          fetchContentHistory(session.user.id);
        } else if (event === "SIGNED_OUT" && isMounted) {
          router.push("/auth");
        }
      }
    );

    // Cleanup function
    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleNewContent = () => {
    router.push("/create");
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Implement search functionality here
  };

  // If still checking auth, show loading
  if (authChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="w-64">
                <Search onSearch={handleSearch} />
              </div>
              <Button
                variant="primary"
                size="md"
                className="rounded-full px-6 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={handleNewContent}
              >
                New Content
              </Button>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="mb-8">
            <Tabs
              tabs={[
                { id: "all", label: "All Content" },
                { id: "recent", label: "Recent" },
                { id: "favorites", label: "Favorites" },
                { id: "drafts", label: "Drafts" },
              ]}
              defaultTabId="all"
            />
          </div>

          {/* Recent Content */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Content
              </h2>
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="mr-2 h-4 w-4 rounded-full border-2 border-t-indigo-600 animate-spin"></div>
                  Loading content...
                </div>
              )}
            </div>
            {contentHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contentHistory.slice(0, 3).map((item) => {
                  // Determine content type based on content_type field
                  const getType = () => {
                    const type = item.content_type?.toLowerCase() || '';
                    if (type.includes('twitter')) return 'twitter';
                    if (type.includes('linkedin')) return 'linkedin';
                    return 'blog';
                  };
                  
                  // Format the time ago
                  const getTimeAgo = () => {
                    const date = new Date(item.created_at);
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) {
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      if (diffHours === 0) {
                        const diffMinutes = Math.floor(diffMs / (1000 * 60));
                        return `${diffMinutes} minutes ago`;
                      }
                      return `${diffHours} hours ago`;
                    } else if (diffDays === 1) {
                      return 'Yesterday';
                    } else {
                      return `${diffDays} days ago`;
                    }
                  };
                  
                  // Create a title from content if none exists
                  const getTitle = () => {
                    // Use content_type as title or extract from original content
                    return item.content_type || 
                      (item.original_content?.split('\n')[0]?.substring(0, 30) + '...') || 
                      'Untitled Content';
                  };
                  
                  // Get a short description from the content
                  const getDescription = () => {
                    const content = item.repurposed_content || item.original_content;
                    if (!content) return 'No content available';
                    
                    // Get first 80 chars after the first line
                    const firstLineEnd = content.indexOf('\n');
                    const startPos = firstLineEnd > -1 ? firstLineEnd + 1 : 0;
                    const excerpt = content.substring(startPos, startPos + 80);
                    return excerpt + (excerpt.length >= 80 ? '...' : '');
                  };
                  
                  return (
                    <ContentCard
                      key={item.id}
                      id={item.id}
                      title={getTitle()}
                      description={getDescription()}
                      timeAgo={getTimeAgo()}
                      type={getType()}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">No content history found</p>
                <Button 
                  variant="primary"
                  onClick={handleNewContent}
                  className="rounded-full px-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Create Your First Content
                </Button>
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <TemplateCard
                title="Social Media"
                description="Twitter, LinkedIn, Instagram"
                icon={<Twitter className="h-6 w-6 text-indigo-600" />}
              />
              <TemplateCard
                title="Blog"
                description="Long-form content with SEO"
                icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
              />
              <TemplateCard
                title="Email"
                description="Newsletters and campaigns"
                icon={<Mail className="h-6 w-6 text-indigo-600" />}
              />
              <TemplateCard
                title="Video"
                description="Scripts and descriptions"
                icon={<Video className="h-6 w-6 text-indigo-600" />}
              />
            </div>
          </div>

          {/* Analytics */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="mr-2 h-4 w-4 rounded-full border-2 border-t-indigo-600 animate-spin"></div>
                  Updating analytics...
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnalyticsCard
                title="Content Created"
                value={contentHistory.length.toString()}
                trend={contentHistory.length > 0 ? "+" + Math.floor(contentHistory.length / 2) + "%" : "0%"}
                trendUp={contentHistory.length > 0}
              />
              <AnalyticsCard
                title="Most Used Template"
                value={(() => {
                  // Count content types
                  const typeCounts = contentHistory.reduce((acc, item) => {
                    const type = item.content_type || 'Other';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  // Find the most frequent type
                  let mostUsedType = 'None';
                  let maxCount = 0;
                  
                  Object.entries(typeCounts).forEach(([type, count]) => {
                    if (count > maxCount) {
                      mostUsedType = type;
                      maxCount = count;
                    }
                  });
                  
                  return mostUsedType === 'None' ? 'None yet' : mostUsedType;
                })()}
                description={(() => {
                  // Count content types
                  const typeCounts = contentHistory.reduce((acc, item) => {
                    const type = item.content_type || 'Other';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  // Find the most frequent type count
                  let maxCount = 0;
                  
                  Object.values(typeCounts).forEach(count => {
                    if (count > maxCount) {
                      maxCount = count;
                    }
                  });
                  
                  return maxCount === 0 ? '' : `${maxCount} items`;
                })()}
              />
              <AnalyticsCard
                title="Time Saved"
                value={`${contentHistory.length * 2} hours`}
                trend={contentHistory.length > 0 ? "+" + (contentHistory.length * 5) + "%" : "0%"}
                trendUp={contentHistory.length > 0}
              />
            </div>
          </div>

          {/* Token Usage */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Token Usage
            </h2>
            <TokenUsageCard />
            <div className="mt-4">
              <TokenHistory />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
