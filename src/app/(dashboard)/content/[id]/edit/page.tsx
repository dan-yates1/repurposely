"use client";

import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-new";
import { useState, useEffect, useCallback } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlatformPreviewTabs } from "@/components/ui/content-preview";

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
  image_url?: string | null;
  generated_image_url?: string | null;
}

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id as string;
  usePageTitle(
    `Edit Content - ${contentId ? contentId.substring(0, 8) : ""}...`
  );

  const [contentItem, setContentItem] = useState<ContentHistoryItem | null>(
    null
  );
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

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
    } catch (err: unknown) {
      // Use unknown type for caught error
      console.error("Error fetching content for edit:", err);
      setError(
        `Failed to load content: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
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

      const response = await fetch("/api/content/update", {
        // Call the update API
        method: "POST", // Or PUT/PATCH
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: contentId,
          repurposed_content: editedContent,
          // Add other fields to update if needed (e.g., tone, audience)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update content.");
      }

      toast.success("Content updated successfully!");
      router.push(`/content/${contentId}`); // Redirect back to view page
    } catch (err: unknown) {
      // Use unknown type for caught error
      console.error("Error updating content:", err);
      setError(
        `Update failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      toast.error(
        `Update failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Header skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Editor skeleton */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 w-full bg-gray-100 rounded mb-4"></div>
            <div className="flex justify-end space-x-3">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-md text-center">
        {error}
      </div>
    );
  }

  if (!contentItem) {
    return <div className="text-center p-4">Content not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "My Content", href: "/my-content" },
          { label: "View", href: `/content/${contentId}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Content</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "edit" | "preview")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
            {/* Display Original Content (Read-only) */}
            <div>
              <Label
                htmlFor="originalContent"
                className="text-sm font-medium text-gray-700"
              >
                Original Content
              </Label>
              <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 max-h-40 overflow-y-auto">
                {contentItem.original_content}
              </div>
            </div>

            {/* Edit Repurposed Content */}
            <div>
              <Label
                htmlFor="repurposedContent"
                className="text-sm font-medium text-gray-700"
              >
                Repurposed Content
              </Label>
              <Textarea
                id="repurposedContent"
                value={editedContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditedContent(e.target.value)
                }
                rows={15}
                className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Edit your repurposed content here..."
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push(`/content/${contentId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={saving}
                className="flex items-center"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Update Content
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Platform Preview
              </h2>
            </div>

            {showPreview && (
              <PlatformPreviewTabs
                content={editedContent}
                selectedTemplate={
                  contentItem.content_type || contentItem.output_format || null
                }
                imageUrl={
                  contentItem.image_url ||
                  contentItem.generated_image_url ||
                  null
                }
              />
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setActiveTab("edit")}>
                Back to Editing
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={saving}
                className="flex items-center"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Update Content
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
