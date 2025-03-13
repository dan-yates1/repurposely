import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Clock, PenSquare, Settings, LogOut, Coins, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTokens } from '@/hooks/useTokens';
import toast from 'react-hot-toast';
import { Logo } from './logo';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('U');
  const [userPlan, setUserPlan] = useState<string>('Free');
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
    return pathname === path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100';
  };

  useEffect(() => {
    // Get user info when component mounts
    const getUserInfo = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const email = data.user.email;
        setUserId(data.user.id);
        
        if (email) {
          setUserName(email.split('@')[0]);
          setUserInitial(email.charAt(0).toUpperCase());
        }
        
        // Fetch user subscription plan
        try {
          const { data: subscriptionData, error } = await supabase
            .from('user_subscriptions')
            .select('subscription_tier')
            .eq('user_id', data.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching subscription:', error);
          } else if (subscriptionData) {
            // Format the subscription tier for display
            const tier = subscriptionData.subscription_tier || 'FREE';
            setUserPlan(tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase());
          }
        } catch (error) {
          console.error('Error in subscription fetch:', error);
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
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col py-4">
      {/* Logo/Title */}
      <div className="px-4 mb-6">
        <Logo />
      </div>

      {/* Main Navigation */}
      <div className="px-3 space-y-1">
        <Link href="/dashboard" className={`flex items-center px-3 py-2 rounded-md ${isActive('/dashboard')}`}>
          <Home size={18} className="mr-3" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link href="/history" className={`flex items-center px-3 py-2 rounded-md ${isActive('/history')}`}>
          <Clock size={18} className="mr-3" />
          <span className="text-sm font-medium">History</span>
        </Link>
        <Link href="/templates" className={`flex items-center px-3 py-2 rounded-md ${isActive('/templates')}`}>
          <PenSquare size={18} className="mr-3" />
          <span className="text-sm font-medium">Templates</span>
        </Link>
        <Link href="/settings" className={`flex items-center px-3 py-2 rounded-md ${isActive('/settings')}`}>
          <Settings size={18} className="mr-3" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>

      {/* Recent Projects Section */}
      {/* <div className="mt-8 px-3">
        <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Projects</h2>
        <div className="space-y-1">
          <Link href="/projects/blog" className="flex items-center px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100">
            <FileText size={18} className="mr-3" />
            <span className="text-sm font-medium">Blog Series</span>
          </Link>
          <Link href="/projects/social" className="flex items-center px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100">
            <Megaphone size={18} className="mr-3" />
            <span className="text-sm font-medium">Social Campaign</span>
          </Link>
          <Link href="/projects/product" className="flex items-center px-3 py-2 rounded-md text-gray-500 hover:bg-gray-100">
            <Briefcase size={18} className="mr-3" />
            <span className="text-sm font-medium">Product Launch</span>
          </Link>
        </div>
      </div> */}

      {/* Token Display */}
      <div className="mt-auto px-3 mb-4">
        {tokensError ? (
          <button onClick={() => router.push('/token-fix')} className="w-full flex items-center px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
            <AlertCircle size={18} className="mr-3" />
            <span className="text-sm font-medium">Fix Token Issue</span>
          </button>
        ) : (
          <Link href="/dashboard" className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
            <div className="flex items-center">
              <Coins size={18} className="mr-3" />
              <span className="text-sm font-medium">Tokens</span>
            </div>
            <span className="text-sm font-medium">
              {tokensLoading ? (
                <span className="inline-block w-6 h-3 bg-indigo-200 animate-pulse rounded"></span>
              ) : tokenUsage ? (
                tokenUsage.tokensRemaining
              ) : (
                '0'
              )}
            </span>
          </Link>
        )}

        {/* Token initialization button - only shown when needed */}
        {!tokenUsage && !tokensLoading && !tokensError && (
          <div className="mt-2">
            <button
              onClick={handleInitializeTokens}
              className="w-full py-2 px-3 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
            >
              Initialize Tokens
            </button>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="px-3 pt-3 border-t border-gray-200" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
        >
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-3">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{userName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">
              <span className={userPlan !== 'Free' ? 'text-indigo-600 font-medium' : ''}>
                {userPlan}
              </span>
            </p>
          </div>
        </button>

        {isDropdownOpen && (
          <div className="mt-2 w-full bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
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
  );
}
