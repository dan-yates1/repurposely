import { ReactNode } from 'react';

interface TemplateSelectionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  isSelected?: boolean;
}

export function TemplateSelectionCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  isSelected = false 
}: TemplateSelectionCardProps) {
  return (
    <div 
      className={`bg-white p-6 rounded-lg border ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} flex flex-col items-center transition-all cursor-pointer hover:shadow-md`}
      onClick={onClick}
    >
      <div className={`mb-4 ${isSelected ? 'bg-indigo-200' : 'bg-indigo-100'} p-3 rounded-lg transition-colors`}>
        {icon}
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 text-center mb-4">{description}</p>
      <button 
        className={`px-4 py-1.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'} rounded-md text-sm font-medium transition-colors`}
        type="button"
      >
        {isSelected ? 'Selected' : 'Select'}
      </button>
    </div>
  );
}
