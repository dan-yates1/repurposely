"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/ui/sidebar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, BookOpen, Copy, Share2, Edit } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Define types for content item
interface ContentItem {
  id: string;
  user_id: string;
  content_type: string;
  original_content: string;
  repurposed_content: string;
  content_length: string;
  target_audience: string;
  created_at: string;
  status?: "published" | "draft";
}

export default function ContentView() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;
  
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Check authentication
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          router.push("/auth");
          return;
        }

        // Fetch content data
        const { data, error } = await supabase
          .from("content_history")
          .select("*")
          .eq("id", contentId)
          .single();

        if (error) {
          console.error("Error fetching content:", error);
          setError("Failed to load content");
          setContent(null);
          return;
        }

        if (data) {
          setContent(data);
          setError(null);
        } else {
          setError("Content not found");
          setContent(null);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An error occurred");
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId, router]);

  const getIcon = () => {
    if (!content?.content_type) return null;
    
    const type = content.content_type.toLowerCase();
    if (type.includes("twitter")) {
      return <Twitter className="text-indigo-500" size={24} />;
    } else if (type.includes("linkedin")) {
      return <Linkedin className="text-indigo-500" size={24} />;
    } else {
      return <BookOpen className="text-indigo-500" size={24} />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Content" },
              { label: content?.content_type || "View Content" },
            ]}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          ) : content ? (
            <div>
              {/* Content Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    {getIcon()}
                    <h1 className="text-2xl font-bold text-gray-900 ml-2">
                      {content.content_type || "Content"}
                    </h1>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created on {formatDate(content.created_at)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center"
                    onClick={() => copyToClipboard(content.repurposed_content || content.original_content)}
                  >
                    <Copy size={16} className="mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center"
                  >
                    <Share2 size={16} className="mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center"
                    onClick={() => router.push(`/content/${content.id}/edit`)}
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Content Details */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                    Length: {content.content_length || "N/A"}
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                    Audience: {content.target_audience || "N/A"}
                  </div>
                  {content.status && (
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      content.status === "published" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                    </div>
                  )}
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-8">
                {/* Original Content */}
                {content.original_content && (
                  <div className="bg-white p-6 text-gray-700 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Original Content</h2>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-gray-500 hover:text-indigo-600 p-1"
                        onClick={() => copyToClipboard(content.original_content)}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                    <div className="prose max-w-none">
                      {content.original_content.split("\n").map((line, index) => (
                        <p key={index} className="mb-4">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repurposed Content */}
                {content.repurposed_content && (
                  <div className="bg-white p-6 rounded-lg text-gray-700 shadow-sm border-2 border-indigo-100">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-indigo-900">Repurposed Content</h2>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-gray-500 hover:text-indigo-600 p-1"
                        onClick={() => copyToClipboard(content.repurposed_content)}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                    <div className="prose max-w-none">
                      {content.repurposed_content.split("\n").map((line, index) => (
                        <p key={index} className="mb-4">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
