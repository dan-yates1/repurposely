import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Clock, PenSquare, Settings, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('U');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600' : 'text-gray-500';
  };

  useEffect(() => {
    // Get user info when component mounts
    const getUserInfo = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const email = data.user.email;
        const name = data.user.user_metadata?.full_name || email;
        setUserName(name);
        
        // Set initial based on name or email
        if (name) {
          setUserInitial(name.charAt(0).toUpperCase());
        } else if (email) {
          setUserInitial(email.charAt(0).toUpperCase());
        }
      }
    };
    
    getUserInfo();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };
  
  return (
    <div className="h-full w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6">
      <div className="flex flex-col items-center space-y-8">
        <Link href="/dashboard" className={`${isActive('/dashboard')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Home size={24} />
        </Link>
        <Link href="/create" className={`${isActive('/create')} p-2 rounded-lg hover:bg-indigo-50`}>
          <PenSquare size={24} />
        </Link>
        <Link href="/history" className={`${isActive('/history')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Clock size={24} />
        </Link>
        <Link href="/settings" className={`${isActive('/settings')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Settings size={24} />
        </Link>
      </div>
      <div className="mt-auto relative" ref={dropdownRef}>
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="fixed bottom-24 left-4 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100 animate-fadeIn z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{userName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">My Account</p>
            </div>
            
            <div className="py-1">
              <Link 
                href="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
              
              <button 
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
            
            {/* Dropdown arrow */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 rotate-45 bg-white border-r border-b border-gray-100"></div>
          </div>
        )}
        
        <button 
          className={`w-10 h-10 rounded-full ${isDropdownOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'} flex items-center justify-center transition-colors hover:bg-indigo-50`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-label="User menu"
        >
          {userInitial ? (
            <span className="font-medium">{userInitial}</span>
          ) : (
            <User size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
