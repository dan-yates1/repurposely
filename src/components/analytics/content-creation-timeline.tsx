"use client";

import { useEffect, useRef } from 'react';

// Define content history item type
interface ContentHistoryItem {
  id: string;
  user_id: string;
  original_content: string;
  repurposed_content: string;
  output_format: string | null;
  created_at: string;
  image_url?: string;
  [key: string]: unknown; // For any other properties
}

interface ContentCreationTimelineProps {
  contentHistory: ContentHistoryItem[];
  timeFilter: '7d' | '30d' | '90d' | 'all';
}

export function ContentCreationTimeline({ contentHistory, timeFilter }: ContentCreationTimelineProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !contentHistory.length) return;

    // Clear previous chart
    chartRef.current.innerHTML = '';

    // Filter content based on time period
    const now = new Date();
    let cutoffDate = new Date(now);

    switch (timeFilter) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0); // Beginning of time
    }

    const filteredContent = contentHistory.filter(item =>
      new Date(item.created_at) >= cutoffDate
    );

    // Group content by day
    const contentByDay: Record<string, ContentHistoryItem[]> = {};

    filteredContent.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!contentByDay[date]) {
        contentByDay[date] = [];
      }
      contentByDay[date].push(item);
    });

    // Convert to array and sort by date
    const dailyContent = Object.entries(contentByDay)
      .map(([date, items]) => ({
        date,
        count: items.length,
        items
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Create timeline
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'relative';

    // Create timeline line
    const timelineLine = document.createElement('div');
    timelineLine.className = 'absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200';
    timelineContainer.appendChild(timelineLine);

    // Create timeline items
    dailyContent.forEach(({ date, count, items }) => {
      // Create day container
      const dayContainer = document.createElement('div');
      dayContainer.className = 'relative pl-10 pb-6';

      // Create date marker
      const dateMarker = document.createElement('div');
      dateMarker.className = 'absolute left-0 w-8 h-8 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center shadow-sm z-10';
      dateMarker.style.top = '0';
      dateMarker.style.left = '0';

      // Create date marker text
      const dateMarkerText = document.createElement('span');
      dateMarkerText.className = 'text-xs font-bold text-indigo-800';
      dateMarkerText.textContent = count.toString();
      dateMarker.appendChild(dateMarkerText);

      // Create date header
      const dateHeader = document.createElement('div');
      dateHeader.className = 'flex items-center mb-2';

      // Format date for display
      const displayDate = new Date(date);
      const formattedDate = displayDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      // Create date text
      const dateText = document.createElement('h4');
      dateText.className = 'text-sm font-semibold text-gray-900';
      dateText.textContent = formattedDate;

      // Create count badge
      const countBadge = document.createElement('span');
      countBadge.className = 'ml-2 text-xs font-medium text-white bg-indigo-600 rounded-full px-2 py-0.5';
      countBadge.textContent = `${count} item${count !== 1 ? 's' : ''}`;

      // Assemble date header
      dateHeader.appendChild(dateText);
      dateHeader.appendChild(countBadge);

      // Create content items list
      const contentList = document.createElement('div');
      contentList.className = 'space-y-2';

      // Add content items (limit to 3 per day for readability)
      const displayItems = items.slice(0, 3);
      displayItems.forEach(item => {
        const contentItem = document.createElement('div');
        contentItem.className = 'bg-gray-50 rounded-md p-2 text-sm text-gray-700 border border-gray-200';

        // Create content type badge
        const typeBadge = document.createElement('span');
        typeBadge.className = 'inline-block text-xs font-medium text-indigo-800 bg-indigo-100 rounded px-1.5 py-0.5 mr-1';
        typeBadge.textContent = item.output_format || 'Text';

        // Create content preview
        const contentPreview = document.createElement('a');
        contentPreview.href = `/content/${item.id}`;
        contentPreview.className = 'hover:text-indigo-600';
        contentPreview.textContent = item.original_content.substring(0, 50) + (item.original_content.length > 50 ? '...' : '');

        // Assemble content item
        contentItem.appendChild(typeBadge);
        contentItem.appendChild(document.createTextNode(' '));
        contentItem.appendChild(contentPreview);

        contentList.appendChild(contentItem);
      });

      // Add "show more" link if there are more than 3 items
      if (items.length > 3) {
        const showMoreLink = document.createElement('div');
        showMoreLink.className = 'text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer mt-1';
        showMoreLink.textContent = `+ ${items.length - 3} more items`;
        contentList.appendChild(showMoreLink);
      }

      // Assemble day container
      dayContainer.appendChild(dateMarker);
      dayContainer.appendChild(dateHeader);
      dayContainer.appendChild(contentList);

      // Add day container to timeline
      timelineContainer.appendChild(dayContainer);
    });

    // Add the timeline to the container
    chartRef.current.appendChild(timelineContainer);

    // Add empty state if no content
    if (dailyContent.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'flex items-center justify-center h-32 bg-gray-50 rounded-md';

      const emptyText = document.createElement('p');
      emptyText.className = 'text-gray-500';
      emptyText.textContent = 'No content created during this period';

      emptyState.appendChild(emptyText);
      chartRef.current.appendChild(emptyState);
    }

  }, [contentHistory, timeFilter]);

  return (
    <div className="h-96 overflow-auto pr-2" ref={chartRef}></div>
  );
}
