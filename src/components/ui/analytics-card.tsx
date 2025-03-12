import { FileText, Star, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  type?: 'content' | 'template' | 'time';
  trend?: string;
  trendUp?: boolean;
  description?: string;
}

export function AnalyticsCard({ 
  title, 
  value, 
  type, 
  trend, 
  trendUp, 
  description 
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
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
      
      {trend && (
        <div className="flex items-center mt-2">
          {trendUp ? 
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : 
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          }
          <span className={`text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </span>
        </div>
      )}
      
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
}
