import { Twitter, Linkedin, Mail, Video } from 'lucide-react';
import { ReactNode } from 'react';

interface TemplateCardProps {
  title: string;
  description: string;
  type?: 'social' | 'blog' | 'email' | 'video';
  icon?: ReactNode;
}

export function TemplateCard({ title, description, type, icon }: TemplateCardProps) {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'social':
        return <Twitter className="text-indigo-500" size={24} />;
      case 'blog':
        return <Linkedin className="text-indigo-500" size={24} />;
      case 'email':
        return <Mail className="text-indigo-500" size={24} />;
      case 'video':
        return <Video className="text-indigo-500" size={24} />;
      default:
        return <Twitter className="text-indigo-500" size={24} />;
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-md text-sm font-medium">
        Use
      </button>
    </div>
  );
}
