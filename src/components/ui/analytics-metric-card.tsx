"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface AnalyticsMetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  description?: string;
}

export function AnalyticsMetricCard({
  title,
  value,
  change,
  isPositive = true,
  description,
}: AnalyticsMetricCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {change && (
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            <span className="text-xs font-medium">{change}</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}
