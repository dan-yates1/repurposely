"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import { Image as ImageIcon, Clock } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
// Removed GeneratedImageData import as we'll define a specific type here
import { ImageHistoryCard } from "@/components/ui/image-history-card"; 

// Define type for image history items fetched from DB
interface ImageHistoryItem {
  id: string; // Assuming 'id' column exists
  image_url: string; // Assuming 'image_url' column exists
  prompt: string;
  revised_prompt?: string | null; // Allow null if DB column is nullable
  size?: string | null; // Allow null if DB column is nullable
  style?: string | null; // Allow null if DB column is nullable
  created_at: string; // Assuming timestamp string
  // Add other relevant columns from your 'generated_images' table if needed
}

export default function ImageHistory() {
  usePageTitle("Image History");
  const router = useRouter();
  const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]); // Use the new type
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch image history
  const fetchImageHistory = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from("generated_images") // Query the correct table
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: sortOrder === "asc" });

      // Add search filter if query exists (searching the prompt)
      if (searchQuery.trim()) {
        query = query.ilike('prompt', `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        // Map data to ImageHistoryItem type 
        // Ensure the properties match your actual table columns
        const formattedData: ImageHistoryItem[] = data.map(item => ({
          id: item.id, // Make sure 'id' exists
          image_url: item.image_url, // Make sure 'image_url' exists
          prompt: item.prompt,
          revised_prompt: item.revised_prompt,
          size: item.size,
          style: item.style,
          created_at: item.created_at,
        }));
        setImageHistory(formattedData);
      }
    } catch (error) {
      console.error("Error fetching image history:", error);
      toast.error("Failed to load image history");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOrder]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await fetchImageHistory(userData.user.id);
        } else {
           router.push('/auth'); 
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUserData();
  }, [fetchImageHistory, router]); 

  // Use the correctly typed state
  const filteredImages = imageHistory; 

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />

      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Image History" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Image History</h1>
         <Button onClick={() => router.push("/create")} variant="secondary" className="w-full sm:w-auto">
           Generate New Image
         </Button>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Search 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..." 
              onClear={() => setSearchQuery("")}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
             <Button variant="secondary" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} className="flex items-center gap-2">
               <Clock className="h-4 w-4" />
               <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
             </Button>
          </div>
        </div>
      </div>

      {/* Image History Grid */}
      {loading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm animate-pulse">
              <div className="aspect-square bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Pass item which should now match ImageHistoryItem */}
          {filteredImages.map((item) => ( 
            <ImageHistoryCard key={item.id} image={item} /> 
           ))}
        </div>
      ) : (
        // No Content Message
        <div className="bg-white p-10 rounded-lg border border-gray-200 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "Try adjusting your search query."
              : "You haven't generated any images yet."}
          </p>
          <Button onClick={() => router.push("/create")} variant="primary">
            Generate Your First Image
          </Button>
        </div>
      )}
    </div>
  );
}
