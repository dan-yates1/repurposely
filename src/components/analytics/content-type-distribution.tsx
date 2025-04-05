"use client";

import { useEffect, useRef, useState } from 'react';

interface ContentTypeDistributionProps {
  data: Record<string, number>;
}

// Define colors for the chart bars
const CHART_COLORS = [
  '#4f46e5', // indigo-600
  '#7c3aed', // violet-600
  '#2563eb', // blue-600
  '#0891b2', // cyan-600
  '#059669', // emerald-600
  '#65a30d', // lime-600
  '#d97706', // amber-600
  '#dc2626', // red-600
];

export function ContentTypeDistribution({ data }: ContentTypeDistributionProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    if (!chartRef.current || Object.keys(data).length === 0) return;

    // Clear previous chart
    chartRef.current.innerHTML = '';

    // Calculate total for percentages
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    // Sort data by count (descending)
    const sortedData = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // Limit to top 6 for readability

    // Create container for the chart
    const chartContainer = document.createElement('div');
    chartContainer.className = 'flex flex-col space-y-4';

    // Create title
    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex justify-between items-center mb-2';

    const title = document.createElement('div');
    title.className = 'text-sm font-medium text-gray-700';
    title.textContent = 'Content Distribution';

    const totalItems = document.createElement('div');
    totalItems.className = 'text-xs text-gray-500';
    totalItems.textContent = `${total} total items`;

    titleContainer.appendChild(title);
    titleContainer.appendChild(totalItems);
    chartContainer.appendChild(titleContainer);

    // Create bars container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'flex flex-col space-y-3';
    chartContainer.appendChild(barsContainer);

    // Create bars for each content type
    sortedData.forEach(([type, count], index) => {
      const percentage = (count / total) * 100;
      const color = CHART_COLORS[index % CHART_COLORS.length];

      // Create row container
      const row = document.createElement('div');
      row.className = 'flex items-center';
      row.dataset.type = type;

      // Add hover effect
      row.addEventListener('mouseenter', () => {
        setHoveredItem(type);
        row.classList.add('bg-gray-50');
      });

      row.addEventListener('mouseleave', () => {
        setHoveredItem(null);
        row.classList.remove('bg-gray-50');
      });

      // Create color indicator
      const colorIndicator = document.createElement('div');
      colorIndicator.className = 'w-3 h-3 rounded-full mr-2 flex-shrink-0';
      colorIndicator.style.backgroundColor = color;

      // Create label
      const label = document.createElement('div');
      label.className = 'w-1/3 text-sm text-gray-700 font-medium truncate pr-2';
      label.textContent = type;
      label.title = type; // Show full name on hover

      // Create bar container
      const barContainer = document.createElement('div');
      barContainer.className = 'w-2/3 flex items-center';

      // Create progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'h-3 bg-gray-100 rounded-full flex-grow';

      // Create progress indicator
      const progress = document.createElement('div');
      progress.className = 'h-full rounded-full transition-all duration-200';
      progress.style.width = `${percentage}%`;
      progress.style.backgroundColor = color;

      // Create count and percentage label
      const countLabel = document.createElement('div');
      countLabel.className = 'text-xs text-gray-700 font-medium ml-2 w-16 text-right';
      countLabel.textContent = `${count} (${Math.round(percentage)}%)`;

      // Assemble the components
      progressBar.appendChild(progress);
      barContainer.appendChild(progressBar);
      barContainer.appendChild(countLabel);

      row.appendChild(colorIndicator);
      row.appendChild(label);
      row.appendChild(barContainer);

      barsContainer.appendChild(row);
    });

    // Add "Other" category if there are more than 6 types
    if (Object.keys(data).length > 6) {
      const otherTypes = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(6);

      const otherCount = otherTypes.reduce((sum, [, count]) => sum + count, 0);
      const otherPercentage = (otherCount / total) * 100;

      // Create row for "Other"
      const otherRow = document.createElement('div');
      otherRow.className = 'flex items-center';
      otherRow.dataset.type = 'Other';

      // Add hover effect
      otherRow.addEventListener('mouseenter', () => {
        setHoveredItem('Other');
        otherRow.classList.add('bg-gray-50');
      });

      otherRow.addEventListener('mouseleave', () => {
        setHoveredItem(null);
        otherRow.classList.remove('bg-gray-50');
      });

      // Create color indicator
      const colorIndicator = document.createElement('div');
      colorIndicator.className = 'w-3 h-3 rounded-full mr-2 flex-shrink-0';
      colorIndicator.style.backgroundColor = '#9ca3af'; // gray-400

      // Create label
      const otherLabel = document.createElement('div');
      otherLabel.className = 'w-1/3 text-sm text-gray-700 font-medium';
      otherLabel.textContent = 'Other';

      // Create bar container
      const otherBarContainer = document.createElement('div');
      otherBarContainer.className = 'w-2/3 flex items-center';

      // Create progress bar
      const otherProgressBar = document.createElement('div');
      otherProgressBar.className = 'h-3 bg-gray-100 rounded-full flex-grow';

      // Create progress indicator
      const otherProgress = document.createElement('div');
      otherProgress.className = 'h-full bg-gray-400 rounded-full transition-all duration-200';
      otherProgress.style.width = `${otherPercentage}%`;

      // Create count and percentage label
      const otherCountLabel = document.createElement('div');
      otherCountLabel.className = 'text-xs text-gray-700 font-medium ml-2 w-16 text-right';
      otherCountLabel.textContent = `${otherCount} (${Math.round(otherPercentage)}%)`;

      // Assemble the components
      otherProgressBar.appendChild(otherProgress);
      otherBarContainer.appendChild(otherProgressBar);
      otherBarContainer.appendChild(otherCountLabel);

      otherRow.appendChild(colorIndicator);
      otherRow.appendChild(otherLabel);
      otherRow.appendChild(otherBarContainer);

      barsContainer.appendChild(otherRow);
    }

    // Add the chart to the container
    chartRef.current.appendChild(chartContainer);

    // Add pie chart visualization
    const pieChartContainer = document.createElement('div');
    pieChartContainer.className = 'mt-6';

    // Create SVG for pie chart
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '150');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.overflow = 'visible';

    // Calculate pie chart segments
    let cumulativePercentage = 0;
    const allData = [...sortedData];

    // Add other category if needed
    if (Object.keys(data).length > 6) {
      const otherTypes = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(6);

      const otherCount = otherTypes.reduce((sum, [, count]) => sum + count, 0);
      allData.push(['Other', otherCount]);
    }

    // Create pie segments
    allData.forEach(([type, count], index) => {
      const percentage = (count / total) * 100;
      const color = index < CHART_COLORS.length ? CHART_COLORS[index] : '#9ca3af';

      // Calculate segment angles
      const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;
      cumulativePercentage += percentage;
      const endAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;

      // Calculate path coordinates
      const radius = 40;
      const centerX = 50;
      const centerY = 50;

      const startX = centerX + radius * Math.cos(startAngle);
      const startY = centerY + radius * Math.sin(startAngle);
      const endX = centerX + radius * Math.cos(endAngle);
      const endY = centerY + radius * Math.sin(endAngle);

      // Create path element
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      // Determine if the arc should be drawn as a large arc (more than 180 degrees)
      const largeArcFlag = percentage > 50 ? 1 : 0;

      // Create path data
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        'Z'
      ].join(' ');

      path.setAttribute('d', pathData);
      path.setAttribute('fill', color);
      path.setAttribute('stroke', 'white');
      path.setAttribute('stroke-width', '1');
      path.dataset.type = type;

      // Add hover effect
      path.addEventListener('mouseenter', () => {
        setHoveredItem(type);
        path.setAttribute('opacity', '0.8');

        // Highlight corresponding bar
        const correspondingRow = Array.from(barsContainer.children).find(
          (row) => (row as HTMLElement).dataset.type === type
        ) as HTMLElement | undefined;

        if (correspondingRow) {
          correspondingRow.classList.add('bg-gray-50');
        }
      });

      path.addEventListener('mouseleave', () => {
        setHoveredItem(null);
        path.setAttribute('opacity', '1');

        // Remove highlight from corresponding bar
        const correspondingRow = Array.from(barsContainer.children).find(
          (row) => (row as HTMLElement).dataset.type === type
        ) as HTMLElement | undefined;

        if (correspondingRow) {
          correspondingRow.classList.remove('bg-gray-50');
        }
      });

      svg.appendChild(path);
    });

    pieChartContainer.appendChild(svg);
    chartRef.current.appendChild(pieChartContainer);

  }, [data, hoveredItem]);

  if (Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
        <p className="text-gray-500">No content type data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 overflow-auto" ref={chartRef}></div>
  );
}
