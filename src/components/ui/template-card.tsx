import { Twitter, Linkedin, Mail, Video } from 'lucide-react';
import { ReactNode } from 'react';

interface TemplateCardProps {
  title: string;
  description: string;
  type?: 'social' | 'blog' | 'email' | 'video';
  icon?: ReactNode;
  onClick?: () => void;
}

export function TemplateCard({ title, description, type, icon, onClick }: TemplateCardProps) {
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
    <div 
      className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
