import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  percentage: number;
  onClick?: () => void;
}

export function CategoryCard({
  icon,
  title,
  percentage,
  onClick
}: CategoryCardProps) {
  return (
    <div 
      className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 px-2 rounded-md"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{percentage}% of all content</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400" />
    </div>
  );
}
