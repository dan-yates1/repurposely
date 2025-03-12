import { ChevronDown, Type, BarChart2, Tag, Users } from 'lucide-react';

interface OutputSettingsProps {
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

export function OutputSettings({
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
}: OutputSettingsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Output Settings</h2>
      
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <Type className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Tone
            </label>
            <span className="text-xs text-gray-500">Select →</span>
          </div>
          <div className="relative">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-gray-700 font-medium shadow-sm"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="humorous">Humorous</option>
              <option value="formal">Formal</option>
              <option value="inspirational">Inspirational</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <BarChart2 className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Length
            </label>
            <span className="text-xs text-gray-500">Select →</span>
          </div>
          <div className="relative">
            <select
              value={contentLength}
              onChange={(e) => setContentLength(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-gray-700 font-medium shadow-sm"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <Users className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Target Audience
            </label>
            <span className="text-xs text-gray-500">Select →</span>
          </div>
          <div className="relative">
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-400 bg-gray-50 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-gray-700 font-medium shadow-sm"
            >
              <option value="general">General</option>
              <option value="professionals">Professionals</option>
              <option value="readers">Readers</option>
              <option value="followers">Followers</option>
              <option value="friends">Friends</option>
              <option value="viewers">Viewers</option>
              <option value="customers">Customers</option>
              <option value="students">Students</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <Tag className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={includeKeywords}
                onChange={(e) => setIncludeKeywords(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
              />
              Include Keywords
            </label>
          </div>
          {includeKeywords && (
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Separate key terms with commas"
              className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          )}
        </div>
      </div>
    </div>
  );
}
