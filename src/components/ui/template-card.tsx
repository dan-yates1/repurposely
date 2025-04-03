import { Twitter, Linkedin, Mail, Video, Eye, Star, StarOff } from 'lucide-react'; // Add Star icons
import React, { ReactNode } from 'react'; // Import React for MouseEvent

interface TemplateCardProps {
  title: string;
  description: string;
  type?: 'social' | 'blog' | 'email' | 'video';
  icon?: ReactNode;
  onClick?: () => void;
  onPreviewClick?: (e: React.MouseEvent) => void; 
  onFavoriteClick?: (e: React.MouseEvent) => void; // Add favorite click handler prop
  isFavorite?: boolean; // Add favorite state prop
  tokenCost?: number; // Add token cost prop
  isSelected?: boolean; 
}

export function TemplateCard({
  title,
  description,
  type,
  icon,
  onClick,
  onPreviewClick,
  onFavoriteClick, // Destructure new props
  isFavorite = false, // Default favorite state
  tokenCost, // Destructure new prop
  isSelected = false
}: TemplateCardProps) {
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

  // Define base and selected styles
  // Define base and selected styles. Add relative positioning and group for hover effect.
  const baseClasses = "relative group bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer h-full"; 
  const selectedClasses = "border-indigo-500 ring-2 ring-indigo-200"; // Style for selected state

  return (
    <div
      className={`${baseClasses} ${isSelected ? selectedClasses : ''}`}
      onClick={onClick}
    >
      {/* Icon container - adjust background based on selection */}
      <div className={`mb-4 inline-block p-3 rounded-lg ${isSelected ? 'bg-indigo-200' : 'bg-indigo-100'} transition-colors`}>
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {/* Removed flex-grow from description */}
      {/* Add margin-bottom to description to make space for hover actions */}
      <p className="text-gray-500 mb-12">{description}</p> 

      {/* Container for Hover Actions - appears at bottom */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Left side actions (Preview, Token Cost) */}
        <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-md"> {/* Removed shadow-sm */}
          {onPreviewClick && (
            <button 
              className="text-gray-600 hover:text-indigo-600 px-2 py-1 rounded-md text-xs font-medium flex items-center bg-gray-100 hover:bg-gray-200" 
              onClick={onPreviewClick} 
              aria-label="Preview template"
            >
              <Eye size={14} className="mr-1" /> Preview
            </button>
          )}
          {tokenCost !== undefined && (
             <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{tokenCost} token{tokenCost !== 1 ? "s" : ""}</span>
          )}
        </div>
        
        {/* Right side action (Favorite) */}
        {onFavoriteClick && (
          <button 
            className="text-gray-400 hover:text-yellow-500 focus:outline-none bg-white/80 backdrop-blur-sm p-1 rounded-full"  // Removed shadow-sm
            onClick={onFavoriteClick} 
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
