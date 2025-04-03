"use client";

import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
// import Link from "next/link"; // Removed unused import
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs"; // Import Breadcrumbs
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import React from 'react'; // Import React for event types
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Define type for the content item (matching history schema)
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
  metadata?: Record<string, unknown>; 
}

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;
  usePageTitle(`Edit Content - ${contentId ? contentId.substring(0, 8) : ''}...`); 

  const [contentItem, setContentItem] = useState<ContentHistoryItem | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch content data
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
        .eq("user_id", userId) // Ensure user owns the content
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setContentItem(data);
        setEditedContent(data.repurposed_content || ""); // Initialize editor state
      } else {
        setError("Content not found or you don't have permission to edit it.");
      }
    } catch (err: unknown) { // Use unknown type for caught error
      console.error("Error fetching content for edit:", err);
      setError(`Failed to load content: ${(err instanceof Error) ? err.message : 'Unknown error'}`);
      setContentItem(null);
    } finally {
      setLoading(false);
    }
   
  }, [contentId, router]); // Removed fetchContent from dependencies

  useEffect(() => {
    if (contentId) {
      fetchContent();
    }
  }, [contentId, fetchContent]);

  // Handle Update Action
  const handleUpdate = async () => {
     if (!contentItem) return;
     setSaving(true);
     setError(null);

     try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
           throw new Error("Authentication required.");
        }
        const accessToken = sessionData.session.access_token;

        const response = await fetch('/api/content/update', { // Call the update API
           method: 'POST', // Or PUT/PATCH
           headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
           },
           body: JSON.stringify({
              id: contentId,
              repurposed_content: editedContent,
              // Add other fields to update if needed (e.g., tone, audience)
           })
        });

        const result = await response.json();

        if (!response.ok) {
           throw new Error(result.error || 'Failed to update content.');
        }

        toast.success("Content updated successfully!");
        router.push(`/content/${contentId}`); // Redirect back to view page

     } catch (err: unknown) { // Use unknown type for caught error
        console.error("Error updating content:", err);
        setError(`Update failed: ${(err instanceof Error) ? err.message : 'Unknown error'}`);
        toast.error(`Update failed: ${(err instanceof Error) ? err.message : 'Unknown error'}`);
     } finally {
        setSaving(false);
     }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-md text-center">{error}</div>;
  }

  if (!contentItem) {
     return <div className="text-center p-4">Content not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
       <Toaster position="top-right" />
       
       {/* Breadcrumbs */}
       <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" }, 
          { label: "My Content", href: "/my-content" }, 
          { label: "View", href: `/content/${contentId}` },
          { label: "Edit" }
       ]} />

       <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Content</h1>

       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          {/* Display Original Content (Read-only) */}
          <div>
             <Label htmlFor="originalContent" className="text-sm font-medium text-gray-700">Original Content</Label>
             <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 max-h-40 overflow-y-auto">
                {contentItem.original_content}
             </div>
          </div>

          {/* Edit Repurposed Content */}
          <div>
             <Label htmlFor="repurposedContent" className="text-sm font-medium text-gray-700">Repurposed Content</Label>
             <Textarea
                id="repurposedContent"
                value={editedContent}
                // Add type for event parameter
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedContent(e.target.value)} 
                rows={15}
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Edit your repurposed content here..."
             />
          </div>
          
          {/* TODO: Add fields to edit other parameters like tone, audience if needed */}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
             <Button variant="secondary" onClick={() => router.push(`/content/${contentId}`)} disabled={saving}>
                Cancel
             </Button>
             <Button variant="primary" onClick={handleUpdate} disabled={saving} className="flex items-center">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Content
             </Button>
          </div>
       </div>
    </div>
  );
}
