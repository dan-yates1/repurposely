"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { supabase as supabaseClient } from "@/lib/supabase";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClientComponentClient();
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    // Set a timeout to ensure loading state resolves even if there are issues
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Navbar auth check timeout - forcing loading to complete");
        setLoading(false);
      }
    }, 3000); // 3 second timeout as fallback
    
    // First check with the pre-initialized client to ensure we're using the same instance
    // This helps with persistence across different pages
    const checkAuth = async () => {
      try {
        // First try with the global supabase client
        const { data: globalData } = await supabaseClient.auth.getSession();
        
        if (globalData.session) {
          const { data: userData } = await supabaseClient.auth.getUser();
          console.log("User authenticated (global client):", userData.user?.email);
          setUser(userData.user);
          setLoading(false);
          return;
        }
        
        // Fallback to the component client if needed
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const { data: userData } = await supabase.auth.getUser();
          console.log("User authenticated (component client):", userData.user?.email);
          setUser(userData.user);
        } else {
          console.log("No user authenticated");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth().catch(err => {
      console.error("Unhandled error in checkAuth:", err);
      setLoading(false); // Ensure loading state is resolved even on unhandled errors
    });
    
    // Set up subscription to auth changes
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    try {
      const { data: listener } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, !!session);
          try {
            if (session) {
              const { data: userData } = await supabaseClient.auth.getUser();
              setUser(userData.user);
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            setUser(null);
          } finally {
            setLoading(false);
          }
        }
      );
      
      authListener = listener;
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
    }
    
    return () => {
      clearTimeout(loadingTimeout);
      if (authListener?.subscription) {
        try {
          authListener.subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing from auth listener:", error);
        }
      }
    };
  }, [supabase.auth, loading]);

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      console.log("User signed out");
      setUser(null);
      router.push("/");
      setMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // User profile menu
  const UserMenu = () => (
    <div className="relative">
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center space-x-1 focus:outline-none"
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <Image 
              src={user.user_metadata.avatar_url} 
              alt="User avatar" 
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          </div>
          <Link 
            href="/dashboard" 
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link 
            href="/account" 
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Account Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

  // Don't show anything while loading to prevent layout shift
  if (loading) {
    return (
      <nav className="bg-white py-4 border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[40px]">
            <div className="flex items-center">
              <Logo />
              <div className="ml-8 h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white py-4 border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Left side: Logo and nav items */}
          <div className="flex items-center space-x-8">
            {/* Don't wrap Logo in Link since Logo already contains a Link */}
            <Logo />
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/pricing" 
                className={`text-sm font-medium ${
                  pathname === "/pricing" 
                    ? "text-indigo-600" 
                    : "text-gray-700 hover:text-indigo-600"
                } transition-colors duration-200`}
              >
                Pricing
              </Link>
              {/* Add more navigation items here as needed */}
            </div>
          </div>
          
          {/* Right side: Auth buttons or user profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    size="md"
                    className="text-sm hidden cursor-pointer sm:inline-flex"
                  >
                    Dashboard
                  </Button>
                </Link>
                <UserMenu />
              </>
            ) : (
              <>
                {/* <Link href="/auth" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200">
                  Login
                </Link> */}
                <Link href="/auth">
                  <Button
                    variant="primary"
                    size="md"
                    className="text-sm cursor-pointer sm:inline-flex"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
