import { Search as SearchIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function Search({ placeholder = "Search content...", onSearch }: SearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
