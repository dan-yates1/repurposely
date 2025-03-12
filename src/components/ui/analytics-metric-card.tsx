import { ReactNode } from 'react';

interface AnalyticsMetricCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

export function AnalyticsMetricCard({
  icon,
  title,
  value,
  trend,
  trendUp
}: AnalyticsMetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center mb-2">
        <div className="mr-3 bg-indigo-100 p-2 rounded-lg">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>
      <div className="flex items-baseline">
        <span className="text-xl font-semibold text-gray-900">{value}</span>
        {trend && (
          <span className={`ml-2 text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? '+' : '-'}{trend}
          </span>
        )}
      </div>
    </div>
  );
}
