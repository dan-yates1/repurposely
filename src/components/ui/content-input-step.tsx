"use client";

// Removed unused import: useState
// Removed unused imports: FileAudio, Upload, Trash2, Link2, SourceTabs, toast
import { MessageSquare } from 'lucide-react'; // Only MessageSquare might be needed if we keep the header style

interface ContentInputStepProps {
  originalContent: string;
  setOriginalContent: (content: string) => void;
  file?: File | null;
  setFile?: (file: File | null) => void;
  handleFileUpload?: () => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function ContentInputStep({
  originalContent,
  setOriginalContent,
}: ContentInputStepProps) {
  // Removed all state and handlers related to tabs, URL fetching

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-gray-600" /> {/* Optional: Keep icon for style */}
        Paste Your Content
      </h2>

      {/* Removed SourceTabs */}

      <div className="mt-4">
        {/* Only the text area remains */}
        <div>
          <textarea
            value={originalContent}
            onChange={(e) => setOriginalContent(e.target.value)}
            placeholder="Type or paste your content here..."
            className="w-full h-48 p-3 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" // Increased height slightly
          ></textarea>
        </div>

        {/* Removed Upload Section */}
        {/* Removed URL Section */}
      </div>
    </div>
  );
}
