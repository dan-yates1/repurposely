import { FileText, Star, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  type?: 'content' | 'template' | 'time';
  trend?: string;
  trendUp?: boolean;
  description?: string;
  change?: string;
  isPositive?: boolean;
}

export function AnalyticsCard({ 
  title, 
  value, 
  type, 
  trend, 
  trendUp, 
  description,
  change,
  isPositive
}: AnalyticsCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'content':
        return <FileText className="text-indigo-500" size={24} />;
      case 'template':
        return <Star className="text-indigo-500" size={24} />;
      case 'time':
        return <Clock className="text-indigo-500" size={24} />;
      default:
        return <FileText className="text-indigo-500" size={24} />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        <div className="p-2 bg-indigo-50 rounded-md">
          {getIcon()}
        </div>
      </div>
      
      {(trend || change) && (
        <div className="flex items-center mt-2">
          {trend && (
            <>
              {trendUp ? (
                <TrendingUp className="text-green-500 mr-1" size={16} />
              ) : (
                <TrendingDown className="text-red-500 mr-1" size={16} />
              )}
              <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trend}
              </span>
            </>
          )}
          
          {change && (
            <div className="flex items-center">
              {isPositive ? (
                <TrendingUp className="text-green-500 mr-1" size={16} />
              ) : (
                <TrendingDown className="text-red-500 mr-1" size={16} />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
            </div>
          )}
        </div>
      )}
      
      {description && (
        <div className="mt-2 text-sm text-gray-500">{description}</div>
      )}
    </div>
  );
}
