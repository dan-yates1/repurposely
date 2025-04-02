"use client";

import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { useParams, useRouter } from "next/navigation";
// import Link from "next/link"; // Removed unused import
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Twitter, Linkedin, BookOpen, Copy, Share2, Edit, CheckCircle, Loader2 } from "lucide-react"; // Add CheckCircle, Loader2
import toast, { Toaster } from "react-hot-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs"; // Import Breadcrumbs
import React from 'react'; // Import React
import Image from 'next/image'; // Import Next Image

// Define types for content item
interface ContentItem {
  id: string;
  user_id: string;
  content_type: string;
  original_content: string;
  repurposed_content: string;
  // content_length: string; // Column doesn't exist
  target_audience: string;
  created_at: string;
  status?: "published" | "draft" | "completed"; // Add completed status
  metadata?: Record<string, unknown>;
  generated_image_url?: string | null; // Add generated image URL field
}

export default function ContentView() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;

  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  usePageTitle("View Content");

  // Use useCallback for fetchContent to stabilize dependencies
  const fetchContent = useCallback(async () => { 
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/auth");
        return;
      }
      const userId = sessionData.session.user.id;

      const { data, error: fetchError } = await supabase
        .from("content_history")
        .select("*")
        .eq("id", contentId)
        .eq("user_id", userId) 
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') { 
           setError("Content not found or you don't have permission.");
        } else {
           throw fetchError;
        }
        setContent(null);
        return;
      }

      if (data) {
        setContent(data);
        setError(null);
      } else {
        setError("Content not found"); // Should be caught by PGRST116 above, but keep as fallback
        setContent(null);
      }
    } catch (err: unknown) { // Use unknown type
      console.error("Unexpected error fetching content:", err);
      setError(`An error occurred: ${(err instanceof Error) ? err.message : 'Unknown error'}`);
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [contentId, router]);

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId, fetchContent]);

  const getIcon = () => {
    if (!content?.content_type) return null;
    const type = content.content_type.toLowerCase();
    if (type.includes("twitter")) return <Twitter className="text-indigo-500" size={24} />;
    if (type.includes("linkedin")) return <Linkedin className="text-indigo-500" size={24} />;
    // Add other icons based on content_type/output_format if needed
    return <BookOpen className="text-indigo-500" size={24} />;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  // Handler for marking content as complete
  const handleMarkAsComplete = async () => {
    if (!content) return;
    setUpdatingStatus(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Authentication required.");
      const accessToken = sessionData.session.access_token;

      const response = await fetch('/api/content/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ id: contentId, status: 'completed' }) // Set status to 'completed'
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update status.');

      toast.success("Content marked as complete!");
      // Update local state to reflect the change immediately
      setContent(prev => prev ? { ...prev, status: 'completed' } : null); 
      // Optionally refetch data: await fetchContent();

    } catch (err: unknown) {
      console.error("Error marking as complete:", err);
      toast.error(`Update failed: ${(err instanceof Error) ? err.message : 'Unknown error'}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Render logic
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }
  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-md text-center">{error}</div>;
  }
  if (!content) {
     return <div className="text-center p-4">Content not found.</div>;
  }

  // Determine badge variant based on status using available variants
  const getBadgeVariant = (status?: string): "secondary" | "outline" | "default" | "destructive" | null | undefined => {
     switch (status) {
        case 'published':
        case 'completed':
           return 'secondary'; // Use secondary for completed/published (adjust color via className if needed)
        case 'draft':
           return 'outline'; // Use outline for draft
        default:
           return 'outline'; // Default to outline if status is null/undefined
     }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" }, 
          { label: "History", href: "/history" }, 
          { label: content?.content_type || "View Content" }
      ]} />

      {/* Content Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center mb-2">
            {getIcon()}
            <h1 className="text-2xl font-bold text-gray-900 ml-2">{content.content_type || "Content"}</h1>
          </div>
          <p className="text-sm text-gray-500">Created on {formatDate(content.created_at)}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" className="flex items-center" onClick={() => copyToClipboard(content.repurposed_content || content.original_content)}>
            <Copy size={16} className="mr-1" /> Copy
          </Button>
          <Button variant="secondary" size="sm" className="flex items-center">
            <Share2 size={16} className="mr-1" /> Share
          </Button>
          <Button variant="primary" size="sm" className="flex items-center" onClick={() => router.push(`/content/${content.id}/edit`)}>
            <Edit size={16} className="mr-1" /> Edit
          </Button>
          {/* Mark as Complete Button */}
          {content.status !== 'completed' && ( // Show if not already completed
             <Button
               variant="secondary"
               size="sm"
               className="flex items-center bg-green-100 text-green-700 hover:bg-green-200"
               onClick={handleMarkAsComplete}
               disabled={updatingStatus}
             >
               {updatingStatus ? <Loader2 size={16} className="mr-1 animate-spin"/> : <CheckCircle size={16} className="mr-1" />}
               Mark as Complete
             </Button>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
            Audience: {content.target_audience || "N/A"}
          </div>
          {/* Display Status using Badge */}
          <Badge 
             variant={getBadgeVariant(content.status)}
             className="capitalize"
          >
             {content.status || 'Draft'} 
          </Badge>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Display Generated Image */}
        {content.generated_image_url && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Image</h2>
            <div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-md border">
              <Image 
                src={content.generated_image_url} 
                alt="Generated AI Image for content" 
                layout="fill" 
                objectFit="contain" // Use 'contain' to see the whole image
              />
            </div>
          </div>
        )}

        {/* Original Content */}
        {content.original_content && (
          <div className="bg-white p-6 text-gray-700 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Original Content</h2>
              <Button variant="secondary" size="sm" className="text-gray-500 hover:text-indigo-600 p-1" onClick={() => copyToClipboard(content.original_content)}>
                <Copy size={16} />
              </Button>
            </div>
            <div className="prose max-w-none">
              {content.original_content.split("\n").map((line, index) => (
                <p key={index} className="mb-4">{line}</p>
              ))}
            </div>
          </div>
        )}
        {/* Repurposed Content */}
        {content.repurposed_content && (
          <div className="bg-white p-6 rounded-lg text-gray-700 shadow-sm border-2 border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-indigo-900">Repurposed Content</h2>
              <Button variant="secondary" size="sm" className="text-gray-500 hover:text-indigo-600 p-1" onClick={() => copyToClipboard(content.repurposed_content)}>
                <Copy size={16} />
              </Button>
            </div>
            <div className="prose max-w-none">
              {content.repurposed_content.split("\n").map((line, index) => (
                <p key={index} className="mb-4">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
