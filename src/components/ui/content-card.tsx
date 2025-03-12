import Link from 'next/link';
import { FileText, Twitter, Linkedin, BookOpen } from 'lucide-react';

interface ContentCardProps {
  title: string;
  description: string;
  timeAgo: string;
  type: 'twitter' | 'linkedin' | 'blog';
}

export function ContentCard({ title, description, timeAgo, type }: ContentCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'twitter':
        return <Twitter className="text-indigo-500" size={24} />;
      case 'linkedin':
        return <Linkedin className="text-indigo-500" size={24} />;
      case 'blog':
        return <BookOpen className="text-indigo-500" size={24} />;
      default:
        return <FileText className="text-indigo-500" size={24} />;
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        {getIcon()}
      </div>
      <div className="text-sm text-gray-500 mb-2">{timeAgo}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex space-x-2">
        <Link href="#" className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-md text-sm font-medium">
          View
        </Link>
        <Link href="#" className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-md text-sm font-medium">
          Edit
        </Link>
      </div>
    </div>
  );
}
