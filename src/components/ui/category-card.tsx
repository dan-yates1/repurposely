import { ReactNode } from 'react';

interface CategoryCardProps {
  icon: ReactNode;
  name: string;
  count: number;
  onClick?: () => void;
}

export function CategoryCard({
  icon,
  name,
  count,
  onClick
}: CategoryCardProps) {
  return (
    <div 
      className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-indigo-50 rounded-md">
          {icon}
        </div>
        <span className="text-2xl font-semibold text-gray-900">{count}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-700">{name}</h3>
    </div>
  );
}
