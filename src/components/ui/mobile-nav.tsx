"use client";

import { Home, Clock, PenSquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600' : 'text-gray-500';
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center px-3 py-2">
          <Home size={20} className={isActive('/dashboard')} />
          <span className={`text-xs mt-1 ${isActive('/dashboard')}`}>Home</span>
        </Link>
        
        <Link href="/history" className="flex flex-col items-center px-3 py-2">
          <Clock size={20} className={isActive('/history')} />
          <span className={`text-xs mt-1 ${isActive('/history')}`}>History</span>
        </Link>
        
        <Link href="/create" className="flex flex-col items-center px-3 py-2">
          <div className="bg-indigo-600 rounded-full p-3 -mt-5 mb-1 shadow-md">
            <PenSquare size={20} className="text-white" />
          </div>
          <span className="text-xs mt-1 text-indigo-600">Create</span>
        </Link>
        
        <Link href="/templates" className="flex flex-col items-center px-3 py-2">
          <PenSquare size={20} className={isActive('/templates')} />
          <span className={`text-xs mt-1 ${isActive('/templates')}`}>Templates</span>
        </Link>
        
        <Link href="/settings" className="flex flex-col items-center px-3 py-2">
          <User size={20} className={isActive('/settings')} />
          <span className={`text-xs mt-1 ${isActive('/settings')}`}>Profile</span>
        </Link>
      </div>
    </div>
  );
}
