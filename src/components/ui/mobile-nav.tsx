"use client";

import { useState, useEffect } from 'react';
import { Home, Clock, PenSquare, User, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function MobileNav() {
  const pathname = usePathname();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600' : 'text-gray-500';
  };

  useEffect(() => {
    // Get user info when component mounts
    const getUserInfo = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user && data.user.user_metadata?.avatar_url) {
        setProfileImageUrl(data.user.user_metadata.avatar_url);
      }
    };

    getUserInfo();
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around items-center py-2">
        <Link href="/dashboard" className="flex flex-col items-center px-2 py-2">
          <Home size={20} className={isActive('/dashboard')} />
          <span className={`text-xs mt-1 ${isActive('/dashboard')}`}>Home</span>
        </Link>

        <Link href="/my-content" className="flex flex-col items-center px-2 py-2">
          <Clock size={20} className={isActive('/my-content')} />
          <span className={`text-xs mt-1 ${isActive('/my-content')}`}>Content</span>
        </Link>

        <Link href="/create" className="flex flex-col items-center px-2 py-2">
          <div className="bg-indigo-600 rounded-full p-3 -mt-5 mb-1 shadow-md">
            <PenSquare size={20} className="text-white" />
          </div>
          <span className="text-xs mt-1 text-indigo-600">Create</span>
        </Link>

        <Link href="/analytics" className="flex flex-col items-center px-2 py-2">
          <BarChart2 size={20} className={isActive('/analytics')} />
          <span className={`text-xs mt-1 ${isActive('/analytics')}`}>Analytics</span>
        </Link>

        <Link href="/settings" className="flex flex-col items-center px-2 py-2">
          {profileImageUrl ? (
            <div className="relative w-5 h-5 rounded-full overflow-hidden">
              <Image
                src={profileImageUrl}
                alt="Profile"
                width={20}
                height={20}
                className="object-cover"
              />
            </div>
          ) : (
            <User size={20} className={isActive('/settings')} />
          )}
          <span className={`text-xs mt-1 ${isActive('/settings')}`}>Profile</span>
        </Link>
      </div>
    </div>
  );
}
