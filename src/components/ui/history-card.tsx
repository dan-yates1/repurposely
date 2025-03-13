import { Copy, Edit, Trash2, FileText, Twitter, Linkedin, BookOpen, Mail, Video } from 'lucide-react';

interface HistoryCardProps {
  id?: string;
  title: string;
  content: string;
  date: string;
  type: string;
  status: 'published' | 'draft';
  onClick?: () => void;
  onAction?: (action: 'edit' | 'delete') => void;
}

export function HistoryCard({
  // id is used by the parent component but not directly in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  title,
  content,
  date,
  type,
  status,
  onClick,
  onAction
}: HistoryCardProps) {
  const getIcon = () => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('twitter') || lowerType.includes('social media')) {
      return <Twitter className="text-indigo-500" size={20} />;
    } else if (lowerType.includes('linkedin')) {
      return <Linkedin className="text-indigo-500" size={20} />;
    } else if (lowerType.includes('blog') || lowerType.includes('post')) {
      return <BookOpen className="text-indigo-500" size={20} />;
    } else if (lowerType.includes('email')) {
      return <Mail className="text-indigo-500" size={20} />;
    } else if (lowerType.includes('video')) {
      return <Video className="text-indigo-500" size={20} />;
    } else {
      return <FileText className="text-indigo-500" size={20} />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center">
              <h3 className="text-base font-medium text-gray-900 mr-2">{title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-500">{date}</div>
          </div>
          <p className="text-sm text-gray-600 mb-3">{content}</p>
          <div className="flex space-x-2">
            {onClick && (
              <button 
                onClick={onClick}
                className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded flex items-center"
              >
                <Copy className="w-3 h-3 mr-1" />
                View
              </button>
            )}
            {onAction && (
              <>
                <button 
                  onClick={() => onAction('edit')}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded flex items-center"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => onAction('delete')}
                  className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
