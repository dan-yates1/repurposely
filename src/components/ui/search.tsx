import { Search as SearchIcon, X } from 'lucide-react';
import { useState, useEffect, ChangeEvent } from 'react';

export interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

export function Search({ 
  placeholder = "Search content...", 
  onSearch, 
  className = "",
  value,
  onChange,
  onClear
}: SearchProps) {
  const [query, setQuery] = useState('');
  const isControlled = value !== undefined && onChange !== undefined;

  // For uncontrolled component
  useEffect(() => {
    if (!isControlled) {
      const debounceTimer = setTimeout(() => {
        if (onSearch) {
          onSearch(query);
        }
      }, 300);
  
      return () => clearTimeout(debounceTimer);
    }
  }, [query, onSearch, isControlled]);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isControlled) {
      onChange?.(e);
    } else {
      setQuery(e.target.value);
    }
  };

  // Handle clear action
  const handleClear = () => {
    if (isControlled) {
      onClear?.();
    } else {
      setQuery('');
      onSearch?.('');
    }
  };

  const displayValue = isControlled ? value : query;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 p-2.5"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
      />
      {displayValue && (
        <button 
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          onClick={handleClear}
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
