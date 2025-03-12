import { useState } from 'react';

interface SourceTab {
  id: string;
  label: string;
}

interface SourceTabsProps {
  tabs: SourceTab[];
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
}

export function SourceTabs({ tabs, defaultTabId, onTabChange }: SourceTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="flex border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === tab.id
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
