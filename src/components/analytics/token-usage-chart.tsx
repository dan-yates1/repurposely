"use client";

import { useEffect, useRef, useState } from 'react';

interface TokenUsageChartProps {
  data: { date: string; count: number }[];
  timeFilter: '7d' | '30d' | '90d' | 'all';
}

export function TokenUsageChart({ data, timeFilter }: TokenUsageChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  });

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Clear previous chart
    chartRef.current.innerHTML = '';

    // Create chart container with proper layout
    const chartContainer = document.createElement('div');
    chartContainer.className = 'flex h-full';

    // Create y-axis container
    const yAxisContainer = document.createElement('div');
    yAxisContainer.className = 'flex flex-col justify-between pr-2 text-xs text-gray-500';
    chartContainer.appendChild(yAxisContainer);

    // Create chart area container
    const chartAreaContainer = document.createElement('div');
    chartAreaContainer.className = 'flex-1 relative flex flex-col';
    chartAreaContainer.style.height = 'calc(100% - 20px)'; // Reserve space for x-axis labels
    chartContainer.appendChild(chartAreaContainer);

    // Find max value for scaling (ensure it's at least 1 to avoid division by zero)
    const maxValue = Math.max(1, ...data.map(d => d.count));

    // Calculate bar width based on data length and time filter
    // Ensure bars have reasonable width regardless of data points
    let minBarWidth = 15; // Minimum width in pixels
    const maxBarWidth = 50; // Maximum width in pixels

    // Adjust bar width based on time filter
    if (timeFilter === '7d') {
      minBarWidth = 30;
    } else if (timeFilter === '30d') {
      minBarWidth = 15;
    } else if (timeFilter === '90d') {
      minBarWidth = 8;
    } else {
      minBarWidth = 5;
    }

    // Calculate bar width as percentage
    const barWidth = Math.min(maxBarWidth, Math.max(minBarWidth, 100 / Math.max(data.length, 1)));
    const barGap = Math.min(barWidth * 0.2, 4);
    const adjustedBarWidth = barWidth - barGap;

    // Add y-axis labels
    const yLabels = [0, Math.ceil(maxValue / 2), maxValue];
    yLabels.forEach(label => {
      const yLabel = document.createElement('div');
      yLabel.className = 'text-right w-8';
      yLabel.textContent = label.toString();
      yAxisContainer.appendChild(yLabel);
    });

    // Create SVG for grid lines
    const gridSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    gridSvg.setAttribute('width', '100%');
    gridSvg.setAttribute('height', '100%');
    gridSvg.setAttribute('preserveAspectRatio', 'none');
    gridSvg.style.position = 'absolute';
    gridSvg.style.top = '0';
    gridSvg.style.left = '0';
    gridSvg.style.right = '0';
    gridSvg.style.bottom = '0';
    gridSvg.style.zIndex = '0';
    chartAreaContainer.appendChild(gridSvg);

    // Add horizontal grid lines
    yLabels.forEach((label, index) => {
      const y = index === 0 ? '100%' : (index === yLabels.length - 1 ? '0%' : '50%');
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y);
      line.setAttribute('x2', '100%');
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#e5e7eb');
      line.setAttribute('stroke-dasharray', '2,2');
      gridSvg.appendChild(line);
    });

    // Create SVG for bars
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.position = 'relative';
    svg.style.zIndex = '1';
    chartAreaContainer.appendChild(svg);

    // Create bars group
    const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(barsGroup);

    // Add bars
    data.forEach((item, index) => {
      const barHeight = (item.count / maxValue) * 100 || 0; // Use percentage height
      const x = index * barWidth;

      // Create bar group
      const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      barsGroup.appendChild(barGroup);

      // Create bar
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', `${x + barGap / 2}%`);
      rect.setAttribute('y', `${100 - barHeight}%`);
      rect.setAttribute('width', `${adjustedBarWidth}%`);
      rect.setAttribute('height', `${barHeight}%`);
      rect.setAttribute('rx', '2');
      rect.setAttribute('fill', '#4f46e5');
      rect.setAttribute('opacity', '0.8');
      barGroup.appendChild(rect);

      // Format date for tooltip
      const date = new Date(item.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Add hover effect using React state for tooltip
      rect.addEventListener('mouseenter', (e) => {
        rect.setAttribute('opacity', '1');

        // Get mouse position relative to chart container
        if (chartRef.current) {
          const rect = chartRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Update tooltip state
          setTooltip({
            visible: true,
            x: mouseX,
            y: mouseY - 30, // Position above cursor
            content: `${formattedDate}: ${item.count} tokens`
          });
        }
      });

      rect.addEventListener('mousemove', (e) => {
        if (chartRef.current) {
          const rect = chartRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Update tooltip position
          setTooltip(prev => ({
            ...prev,
            x: mouseX,
            y: mouseY - 30
          }));
        }
      });

      rect.addEventListener('mouseleave', () => {
        rect.setAttribute('opacity', '0.8');
        setTooltip(prev => ({ ...prev, visible: false }));
      });
    });

    // Create x-axis container - add it inside the chart container for proper containment
    const xAxisContainer = document.createElement('div');
    xAxisContainer.className = 'flex justify-between text-xs text-gray-500 pt-1';
    xAxisContainer.style.height = '20px'; // Fixed height for x-axis labels

    // Add x-axis labels (only show first, middle and last for clarity)
    if (data.length > 0) {
      // First date
      const firstDate = new Date(data[0].date);
      const firstLabel = document.createElement('div');
      firstLabel.textContent = firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      xAxisContainer.appendChild(firstLabel);

      // Middle date if there are more than 2 data points
      if (data.length > 2) {
        const middleIndex = Math.floor(data.length / 2);
        const middleDate = new Date(data[middleIndex].date);
        const middleLabel = document.createElement('div');
        middleLabel.textContent = middleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        xAxisContainer.appendChild(middleLabel);
      }

      // Last date
      const lastDate = new Date(data[data.length - 1].date);
      const lastLabel = document.createElement('div');
      lastLabel.textContent = lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      xAxisContainer.appendChild(lastLabel);
    }

    // Add chart container to the ref
    chartRef.current.appendChild(chartContainer);

    // Add x-axis container to the chart area container instead of outside
    chartAreaContainer.appendChild(xAxisContainer);

  }, [data, timeFilter]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
        <p className="text-gray-500">No token usage data available</p>
      </div>
    );
  }

  return (
    <div className="relative h-60"> {/* Reduced height to ensure everything fits */}
      <div className="h-full" ref={chartRef}></div>
      {tooltip.visible && (
        <div
          className="absolute bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
