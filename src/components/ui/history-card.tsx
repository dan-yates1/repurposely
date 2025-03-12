import { Copy, Edit, Trash2 } from 'lucide-react';

interface HistoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
  status: 'published' | 'draft';
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function HistoryCard({
  icon,
  title,
  description,
  date,
  status,
  onCopy,
  onEdit,
  onDelete
}: HistoryCardProps) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500">{date}</span>
              <span className={`text-xs mt-1 ${
                status === 'published' 
                  ? 'text-green-600' 
                  : 'text-gray-500'
              }`}>
                {status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center ml-4 space-x-1">
          <button 
            onClick={onCopy}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button 
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
