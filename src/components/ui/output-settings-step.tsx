"use client";

import { useState, useEffect } from 'react';
import { useTokens } from '@/hooks/useTokens';
import { Sparkles } from 'lucide-react';

interface OutputSettingsStepProps {
  tone: string;
  setTone: (tone: string) => void;
  contentLength: string;
  setContentLength: (length: string) => void;
  includeKeywords: boolean;
  setIncludeKeywords: (include: boolean) => void;
  keywords: string;
  setKeywords: (keywords: string) => void;
  targetAudience: string;
  setTargetAudience: (audience: string) => void;
}

export function OutputSettingsStep({
  tone,
  setTone,
  contentLength,
  setContentLength,
  includeKeywords,
  setIncludeKeywords,
  keywords,
  setKeywords,
  targetAudience,
  setTargetAudience
}: OutputSettingsStepProps) {
  const { tokenUsage } = useTokens();
  
  // Tone options
  const toneOptions = [
    { id: "professional", label: "Professional" },
    { id: "casual", label: "Casual" },
    { id: "enthusiastic", label: "Enthusiastic" },
    { id: "informative", label: "Informative" },
    { id: "humorous", label: "Humorous" }
  ];
  
  // Content length options
  const lengthOptions = [
    { id: "short", label: "Short" },
    { id: "medium", label: "Medium" },
    { id: "long", label: "Long" }
  ];
  
  // Common audience types
  const audienceSuggestions = [
    "Professionals", 
    "Students", 
    "General public", 
    "Executives", 
    "Technical audience",
    "Beginners",
    "Experts"
  ];
  
  const [audienceSuggestion, setAudienceSuggestion] = useState("");

  const handleAudienceSuggestionClick = (suggestion: string) => {
    setTargetAudience(suggestion);
    setAudienceSuggestion("");
  };
  
  // Filter audience suggestions based on current input
  const filteredSuggestions = audienceSuggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(targetAudience.toLowerCase()) && 
      suggestion.toLowerCase() !== targetAudience.toLowerCase()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Output Settings
        </h2>
        <div className="flex items-center text-sm text-indigo-600">
          <Sparkles className="h-4 w-4 mr-1" />
          <span className="text-sm">{tokenUsage?.tokensRemaining || 0} tokens left</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tone selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {toneOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setTone(option.id)}
                className={`
                  py-2 px-3 rounded-md text-sm font-medium
                  ${
                    tone === option.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content length */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {lengthOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setContentLength(option.id)}
                className={`
                  py-2 px-3 rounded-md text-sm font-medium
                  ${
                    contentLength === option.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {contentLength === "short" && "Around 100-150 words"}
            {contentLength === "medium" && "Around 250-350 words"}
            {contentLength === "long" && "Around 500-800 words"}
          </p>
        </div>
        
        {/* Target audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          <div className="relative">
            <input
              type="text"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="e.g., Professionals, Students, etc."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            {/* Show suggestions when typing */}
            {targetAudience && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleAudienceSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Keywords */}
        <div>
          <div className="flex items-center">
            <input
              id="include-keywords"
              type="checkbox"
              checked={includeKeywords}
              onChange={e => setIncludeKeywords(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="include-keywords" className="ml-2 block text-sm font-medium text-gray-700">
              Include specific keywords
            </label>
          </div>
          
          {includeKeywords && (
            <div className="mt-2">
              <textarea
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="Enter keywords separated by commas..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={2}
              ></textarea>
            </div>
          )}
          
          <p className="mt-1 text-xs text-gray-500">
            Adding keywords helps ensure your content includes important terms
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700">
          <span className="font-medium">Token usage: </span> 
          Content generation uses 1 token. Image generation costs 5 tokens. Content analysis costs 2 tokens.
        </p>
      </div>
    </div>
  );
}
