import Link from 'next/link';
import { FileText, Twitter, Linkedin, BookOpen, Mail, Video } from 'lucide-react';

interface ContentCardProps {
  id?: string;
  title: string;
  description: string;
  date?: string;
  timeAgo?: string;
  type: string;
  status?: 'published' | 'draft';
  onClick?: () => void;
}

export function ContentCard({ 
  id = '', 
  title, 
  description, 
  date, 
  timeAgo, 
  type, 
  status,
  onClick 
}: ContentCardProps) {
  const getIcon = () => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('twitter') || lowerType.includes('social media')) {
      return <Twitter className="text-indigo-500" size={24} />;
    } else if (lowerType.includes('linkedin')) {
      return <Linkedin className="text-indigo-500" size={24} />;
    } else if (lowerType.includes('blog') || lowerType.includes('post')) {
      return <BookOpen className="text-indigo-500" size={24} />;
    } else if (lowerType.includes('email')) {
      return <Mail className="text-indigo-500" size={24} />;
    } else if (lowerType.includes('video')) {
      return <Video className="text-indigo-500" size={24} />;
    } else {
      return <FileText className="text-indigo-500" size={24} />;
    }
  };

  const cardContent = (
    <>
      <div className="mb-4">
        {getIcon()}
      </div>
      <div className="flex justify-between items-center mb-2">
        {timeAgo && <div className="text-sm text-gray-500">{timeAgo}</div>}
        {date && <div className="text-sm text-gray-500">{date}</div>}
        {status && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </>
  );

  if (onClick) {
    return (
      <div 
        className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
        onClick={onClick}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/content/${id}`} className="block">
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {cardContent}
      </div>
    </Link>
  );
}
