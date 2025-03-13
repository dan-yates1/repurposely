import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Clock, PenSquare, Settings, LogOut, Coins, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTokens } from '@/hooks/useTokens';
import toast from 'react-hot-toast';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('U');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    tokenUsage, 
    loading: tokensLoading, 
    error: tokensError, 
    initializeTokens,
    fetchTokenUsage
  } = useTokens();
  const [userId, setUserId] = useState<string | null>(null);

  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-600' : 'text-gray-500';
  };

  useEffect(() => {
    // Get user info when component mounts
    const getUserInfo = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const email = data.user.email;
        setUserId(data.user.id);
        
        if (email) {
          setUserName(email);
          setUserInitial(email.charAt(0).toUpperCase());
        }
      }
    };

    getUserInfo();

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
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Function to manually initialize tokens using the hook's initializeTokens
  const handleInitializeTokens = async () => {
    if (!userId) {
      toast.error('You must be logged in to initialize tokens');
      return;
    }

    try {
      await initializeTokens();
      await fetchTokenUsage();
      toast.success('Tokens initialized successfully!');
    } catch (error) {
      toast.error(`Failed to initialize tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="h-full w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6">
      <div className="flex flex-col items-center space-y-8">
        <Link href="/dashboard" className={`${isActive('/dashboard')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Home size={24} />
        </Link>
        <Link href="/history" className={`${isActive('/history')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Clock size={24} />
        </Link>
        <Link href="/create" className={`${isActive('/create')} p-2 rounded-lg hover:bg-indigo-50`}>
          <PenSquare size={24} />
        </Link>
        <Link href="/settings" className={`${isActive('/settings')} p-2 rounded-lg hover:bg-indigo-50`}>
          <Settings size={24} />
        </Link>
      </div>

      <div className="mt-auto relative" ref={dropdownRef}>
        {/* Token Display */}
        <div className="mt-auto">
          {/* Token initialization error */}
          {tokensError ? (
            <button onClick={() => router.push('/token-fix')} className="group">
              <div className="flex items-center justify-center bg-red-50 text-red-600 rounded-full p-2 mb-1 group-hover:bg-red-100 transition-colors">
                <AlertCircle size={16} />
              </div>
              <div className="text-xs font-medium text-red-600 group-hover:text-red-700 transition-colors">
                Fix
              </div>
            </button>
          ) : (
            <Link href="/dashboard" className="group">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full p-2 mb-1 group-hover:bg-indigo-100 transition-colors">
                  <Coins size={16} />
                </div>
                <div className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                  {tokensLoading ? (
                    <span className="inline-block w-6 h-3 bg-gray-200 animate-pulse rounded"></span>
                  ) : tokenUsage ? (
                    tokenUsage.tokensRemaining
                  ) : (
                    '0'
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Token initialization button - only shown when needed */}
        {!tokenUsage && !tokensLoading && !tokensError && (
          <div className="mt-4 px-2">
            <button
              onClick={handleInitializeTokens}
              className="w-full py-1 px-2 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
            >
              Init
            </button>
          </div>
        )}

        {/* User dropdown */}
        <div className="mt-8">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center bg-gray-100 text-gray-700 rounded-full h-10 w-10 hover:bg-gray-200 transition-colors"
          >
            {userInitial}
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700">{userName}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
