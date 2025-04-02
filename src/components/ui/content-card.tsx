import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { FileText, Twitter, Linkedin, BookOpen, Mail, Video } from 'lucide-react';
import React from 'react'; 

interface ContentCardProps {
  id?: string;
  title: string;
  description: string;
  date?: string;
  timeAgo?: string;
  type: string;
  status?: 'published' | 'draft';
  imageUrl?: string | null; // Add optional imageUrl prop
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
  imageUrl, // Destructure imageUrl
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
      {/* Conditionally render image thumbnail */}
      {imageUrl && (
        <div className="relative w-full h-32 mb-4 rounded overflow-hidden">
          <Image 
            src={imageUrl} 
            alt={title || 'Content image'} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover" 
          />
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        {/* Icon moved below image if image exists */}
        {!imageUrl && <div className="mb-2">{getIcon()}</div>} 
        <div className="flex items-center gap-2">
          {imageUrl && getIcon()} {/* Show icon next to date/status if image exists */}
          {timeAgo && <div className="text-sm text-gray-500">{timeAgo}</div>}
          {date && <div className="text-sm text-gray-500">{date}</div>}
        </div>
        {status && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${ // Adjusted padding
            status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p> 
      {/* Removed Actions Footer */}
    </>
  );

  // If onClick is provided, use it for the whole card
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

  // Otherwise, wrap in a Link to the content detail page
  return (
    <Link href={`/content/${id}`} className="block">
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {cardContent}
      </div>
    </Link>
  );
}
