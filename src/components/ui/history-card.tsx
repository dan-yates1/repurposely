import { Copy, Edit, Trash2 } from 'lucide-react';
import React from 'react';

interface HistoryCardProps {
  id?: string;
  title: string;
  description: string;
  date: string;
  status: 'published' | 'draft';
  icon?: React.ReactNode;
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function HistoryCard({
  title,
  description,
  date,
  status,
  icon,
  onCopy,
  onEdit,
  onDelete
}: HistoryCardProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-900 truncate mr-2">{title}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{description}</p>
          <div className="flex space-x-2">
            {onCopy && (
              <button
                onClick={onCopy}
                className="inline-flex items-center p-1 text-xs font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center p-1 text-xs font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
                title="Edit content"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center p-1 text-xs font-medium text-red-700 bg-white rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-red-500"
                title="Delete content"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
