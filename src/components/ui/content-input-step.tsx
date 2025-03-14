"use client";

import { useState } from 'react';
import { FileAudio, MessageSquare, Link2, Upload, Trash2, Loader2 } from 'lucide-react';
import { SourceTabs } from '@/components/ui/source-tabs';
import toast from 'react-hot-toast';

interface ContentInputStepProps {
  originalContent: string;
  setOriginalContent: (content: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  handleFileUpload: () => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

export function ContentInputStep({
  originalContent,
  setOriginalContent,
  file,
  setFile,
  handleFileUpload,
  isUploading,
  uploadProgress
}: ContentInputStepProps) {
  const [contentSource, setContentSource] = useState("text");
  const [url, setUrl] = useState("");

  const sourceTabs = [
    { id: "text", label: "Text", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "upload", label: "Upload", icon: <FileAudio className="h-4 w-4" /> },
    { id: "url", label: "URL", icon: <Link2 className="h-4 w-4" /> },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFetchFromUrl = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      // Simulating URL content fetching
      toast.loading("Fetching content from URL...");
      
      // In a real app, you would fetch the content from the URL here
      setTimeout(() => {
        setOriginalContent(`This is content extracted from ${url}`);
        toast.dismiss();
        toast.success("Content extracted from URL");
      }, 2000);
    } catch (error) {
      toast.error("Failed to fetch content from URL");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Content Source
      </h2>

      <SourceTabs
        tabs={sourceTabs}
        defaultTabId={contentSource}
        onTabChange={setContentSource}
      />

      <div className="mt-4">
        {contentSource === "text" && (
          <div>
            <textarea
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              placeholder="Type or paste your content here..."
              className="w-full h-32 p-3 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
        )}

        {contentSource === "upload" && (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
            <FileAudio className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-4">
              Upload audio or video file for transcription
            </p>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="audio/*,video/*"
              onChange={handleFileChange}
            />

            {!file ? (
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
              >
                Select File
              </label>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {isUploading ? (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                ) : (
                  <button
                    onClick={handleFileUpload}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Transcribe
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {contentSource === "url" && (
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to import content..."
              className="w-full p-3 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            <button
              onClick={handleFetchFromUrl}
              disabled={!url.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              Extract Content
            </button>
            <p className="mt-2 text-xs text-gray-500">
              We'll extract the main content from the provided URL
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
