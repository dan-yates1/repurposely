"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { Sparkles, CreditCard } from "lucide-react"; // Keep used icons
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { ContentCard } from "@/components/ui/content-card";
import { TemplateCard } from "@/components/ui/template-card";
import { usePageTitle } from "@/hooks/usePageTitle";
import { TokenUsageCard } from "@/components/ui/token-usage-card";
import Link from "next/link";
import { TEMPLATES, Template } from "@/lib/templates"; // Import TEMPLATES and Template type

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
  const [loading, setLoading] = useState(true); // For content history
  const [activeTab, setActiveTab] = useState("all");
  const [isFreeTier, setIsFreeTier] = useState(true);
  const [frequentTemplates, setFrequentTemplates] = useState<Template[]>([]); // State for frequent templates
  const [frequentTemplatesLoading, setFrequentTemplatesLoading] = useState(true); // Loading state

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
        .limit(6); // Limit to 6 for dashboard display

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
    // Get user data and related info
    const getUserDataAndRelated = async () => {
      setLoading(true); // Combined loading state initially
      setFrequentTemplatesLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const userId = userData.user.id;
          
          // Fetch history and subscription/tokens in parallel
          await Promise.all([
            fetchContentHistory(userId),
            (async () => {
              // Fetch subscription data
              const { data: subData, error: subError } = await supabase
                .from("user_subscriptions")
                .select("subscription_tier, is_active")
                .eq("user_id", userId)
                .maybeSingle(); // Use maybeSingle to handle no subscription case gracefully
                
              if (subError) {
                console.error("Error fetching subscription:", subError);
                // Assume free tier if error occurs
                setIsFreeTier(true); 
              } else if (subData) {
                const tier = (subData.subscription_tier || 'FREE').toUpperCase();
                const isPaidTier = tier === 'PRO' || tier === 'ENTERPRISE';
                setIsFreeTier(!isPaidTier);
                console.log(`Dashboard - User has ${tier} plan, isFreeTier: ${!isPaidTier}`);
              } else {
                console.log("Dashboard - No subscription data found, assuming free tier");
                setIsFreeTier(true);
              }
            })(),
            (async () => {
               // Fetch frequent templates
               try {
                  console.log("Attempting to fetch frequent templates..."); // Log start
                  // Get session token for auth header
                  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                  if (sessionError || !sessionData.session) {
                     throw new Error('User session not found for frequent templates fetch.');
                  }
                  const accessToken = sessionData.session.access_token;

                  const freqResponse = await fetch('/api/templates/frequent', {
                     headers: { 'Authorization': `Bearer ${accessToken}` } 
                  });
                  console.log(`Frequent templates API response status: ${freqResponse.status}`); // Log status
                  if (!freqResponse.ok) {
                     const errorData = await freqResponse.json().catch(() => ({ error: 'Failed to parse error JSON' })); // Catch JSON parse error
                     throw new Error(errorData.error || `Failed to fetch frequent templates (${freqResponse.status})`);
                  }
                  const frequentData: { template_id: string }[] = await freqResponse.json();
                  console.log("Fetched frequent data:", frequentData); // Log fetched data
                  const frequentTemplateIds = frequentData.map(item => item.template_id);
                  console.log("Extracted frequent IDs:", frequentTemplateIds); // Log extracted IDs
                  
                  const mappedTemplates = frequentTemplateIds
                    .map(id => TEMPLATES.find(t => t.id === id))
                    .filter((t): t is Template => t !== undefined); 
                  console.log("Mapped frequent templates:", mappedTemplates.map(t => t.id)); // Log mapped IDs

                  if (mappedTemplates.length > 0) {
                     console.log("Setting frequent templates state with mapped templates."); // Log state set
                     setFrequentTemplates(mappedTemplates);
                  } else {
                     console.log("No frequent templates found or mapped, using fallback."); // Log fallback reason
                     setFrequentTemplates(TEMPLATES.slice(0, 4)); 
                  }
               } catch (freqError) {
                  console.error("Error fetching/processing frequent templates:", freqError); // Log error
                  console.log("Error occurred, using fallback templates."); // Log fallback reason
                  setFrequentTemplates(TEMPLATES.slice(0, 4)); 
               } finally {
                  setFrequentTemplatesLoading(false);
                  console.log("Finished fetching frequent templates."); // Log end
               }
            })()
          ]);

        } else {
           // Handle case where user is not logged in
           console.log("Dashboard: No user session found.");
           setLoading(false);
           setFrequentTemplatesLoading(false);
           setFrequentTemplates(TEMPLATES.slice(0, 4)); // Show defaults
        }
      } catch (error) {
        console.error("Error getting user data:", error);
        setLoading(false); 
        setFrequentTemplatesLoading(false);
        setFrequentTemplates(TEMPLATES.slice(0, 4)); // Show defaults on error
      }
    };

    getUserDataAndRelated();
  }, []); // Empty dependency array ensures this runs once on mount

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

      {/* Upgrade Section - only show for free tier users */}
      {isFreeTier ? (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-indigo-800 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-indigo-500" />
                Upgrade to Pro
              </h2>
              <p className="text-gray-700 mt-2 max-w-xl">
                Get 500 tokens/month and unlock advanced features like image generation and video processing. 
                No more interruptions in your content creation workflow.
              </p>
              <ul className="mt-3 space-y-1">
                <li className="flex items-center text-gray-700">
                  <CreditCard className="h-4 w-4 mr-2 text-green-500" />
                  <span>One-click checkout directly from your dashboard</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <CreditCard className="h-4 w-4 mr-2 text-green-500" />
                  <span>10x more tokens than the free plan</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/pricing">
              <Button
                variant="primary"
                size="lg"
              >
                Upgrade to Pro
              </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-gradient-to-r from-green-50 via-teal-50 to-green-50 rounded-xl p-6 border border-green-100 shadow-sm">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-green-500" />
            <h2 className="text-xl font-bold text-green-800">Pro Subscription Active</h2>
          </div>
          <p className="text-gray-700 mt-2">
            You&apos;re enjoying all the benefits of our Pro plan with 500 tokens per month.
          </p>
        </div>
      )}

      {/* Dashboard Tabs - Remove Analytics */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { id: "all", label: "All Content" },
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
              contentHistory.map((item) => (
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
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  You haven&apos;t created any content yet. Click the button above to get started.
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

          {/* Frequent Templates Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recently Used Templates 
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {frequentTemplatesLoading ? (
                 // Skeletons for frequent templates
                 Array(4).fill(0).map((_, i) => (
                   <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-pulse">
                     <div className="h-6 w-6 bg-gray-200 rounded mb-3"></div>
                     <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                     <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                     <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                   </div>
                 ))
              ) : (
                frequentTemplates.map((template: Template) => ( // Add type
                  <TemplateCard
                    key={template.id}
                    title={template.title}
                    description={template.description}
                    // Render the icon component
                    icon={template.icon ? <template.icon className="h-5 w-5" /> : null} 
                    onClick={() => handleTemplateClick(template.id)}
                  />
                )) 
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Use imported TEMPLATES array and add type */}
            {TEMPLATES.map((template: Template) => ( 
              <TemplateCard
                key={template.id}
                title={template.title}
                description={template.description}
                 // Render the icon component
                icon={template.icon ? <template.icon className="h-5 w-5" /> : null}
                onClick={() => handleTemplateClick(template.id)}
              /> 
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
