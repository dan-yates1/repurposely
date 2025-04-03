"use client";

import Image from 'next/image';
import { Download, Info } from 'lucide-react';
// Removed incorrect import
import { Button } from './button'; 
import toast from 'react-hot-toast';

// Define a type matching the data structure from the DB / history page
// (Could potentially be moved to a shared types file later)
interface ImageHistoryItem {
  id: string; 
  image_url: string; // Use image_url from DB
  prompt: string;
  revised_prompt?: string | null; 
  size?: string | null; 
  style?: string | null; 
  created_at: string; 
}

interface ImageHistoryCardProps {
  image: ImageHistoryItem; // Use the correct type
}

export function ImageHistoryCard({ image }: ImageHistoryCardProps) {

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = image.image_url; // Use image_url
    // Suggest a filename based on prompt or ID
    const filename = image.prompt ? 
      `repurposely-${image.prompt.slice(0, 20).replace(/\s+/g, '_')}-${image.id.slice(0, 5)}.png` : 
      `repurposely-image-${image.id}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image download started');
  };

  // Basic tooltip for showing full prompt on hover (can be improved with a proper tooltip component)
  const promptTooltip = image.revised_prompt 
    ? `Original: ${image.prompt}\nRevised: ${image.revised_prompt}` 
    : image.prompt;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden group relative">
      <div className="aspect-square relative">
        <Image
          src={image.image_url} // Use image_url
          alt={image.revised_prompt || image.prompt}
          fill // Use fill to cover the aspect ratio container
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Adjust sizes based on your grid layout
          className="object-cover group-hover:opacity-80 transition-opacity"
        />
        {/* Overlay with actions on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="sm" // Use 'sm' size
            onClick={handleDownload}
            // Adjust padding and remove margin for icon-like appearance
            className="text-white bg-black/50 hover:bg-black/70 p-1.5 leading-none h-auto" 
            aria-label="Download image"
          >
            <Download className="h-5 w-5" />
          </Button>
          {/* Add more actions if needed, e.g., view details */}
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-700 truncate flex items-center" title={promptTooltip}>
          <Info size={12} className="mr-1 flex-shrink-0 text-gray-400" />
          {image.prompt}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(image.created_at).toLocaleDateString()} - {image.size} ({image.style})
        </p>
      </div>
    </div>
  );
}
