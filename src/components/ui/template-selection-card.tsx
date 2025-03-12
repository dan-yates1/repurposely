import { ReactNode } from 'react';

interface TemplateSelectionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function TemplateSelectionCard({ title, description, icon }: TemplateSelectionCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col items-center">
      <div className="mb-4 bg-indigo-100 p-3 rounded-lg">
        {icon}
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 text-center mb-4">{description}</p>
      <button className="px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-md text-sm font-medium">
        Select
      </button>
    </div>
  );
}
