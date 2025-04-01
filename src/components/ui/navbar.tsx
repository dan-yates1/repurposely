"use client";

import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// Removed unused createClientComponentClient import
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { supabase as supabaseClient } from "@/lib/supabase";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  // Removed unused loading state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (!mobileToggle || !mobileToggle.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auth check effect
  useEffect(() => {
    // Removed loading timeout logic

    const checkAuth = async () => {
      try {
        const { data: globalData } = await supabaseClient.auth.getSession();
        if (globalData.session) {
          const { data: userData } = await supabaseClient.auth.getUser();
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setUser(null);
      } // Removed finally block setting loading state
    };

    checkAuth(); // Initial check

    // Auth state change listener
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
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
        } // Removed finally block setting loading state
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  // Only run this effect once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut();
      setUser(null);
      router.push("/");
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // User profile menu (Desktop)
  const UserMenu = () => (
    <div className="relative px-3" ref={userMenuRef}> {/* Added padding */}
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="flex items-center focus:outline-none"
        aria-expanded={userMenuOpen}
        aria-haspopup="true"
        aria-controls="user-menu-items"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white overflow-hidden border-2 border-transparent hover:border-indigo-300 transition-colors">
          {user?.user_metadata?.avatar_url ? (
            <Image src={user.user_metadata.avatar_url} alt="User avatar" width={32} height={32} className="w-full h-full object-cover"/>
          ) : (
            <span className="text-sm font-semibold">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </div>
      </button>
      {userMenuOpen && (
        <div id="user-menu-items" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 origin-top-right animate-scale-in" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
          <div className="px-4 py-2 border-b border-gray-100"><p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p></div>
          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Dashboard</Link>
          <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Account Settings</Link>
          <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" role="menuitem">Sign Out</button>
        </div>
      )}
    </div>
  );

  // Mobile Menu Toggle Button
  const MobileMenuToggle = () => (
    <button id="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-expanded={mobileMenuOpen} aria-controls="mobile-menu-items">
      <span className="sr-only">Open main menu</span>
      <svg className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      <svg className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  );

  // Mobile Menu Items Container
  const MobileMenuItems = () => (
    <div id="mobile-menu-items" className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-40 transition-all duration-300 ease-out transform ${mobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`} ref={mobileMenuRef}>
      {/* Navigation Links */}
      <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/pricing" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}>Pricing</Link>
        <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === "/contact" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}>Contact</Link>
      </div>
      {/* User Info / Auth Actions */}
      <div className="border-t border-gray-200 pb-3 pt-4">
        {user ? (
          <>
            <div className="flex items-center px-4 sm:px-5">
              <div className="flex-shrink-0"><div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white overflow-hidden border border-indigo-700">{user.user_metadata?.avatar_url ? (<Image src={user.user_metadata.avatar_url} alt="User avatar" width={40} height={40} className="w-full h-full object-cover"/>) : (<span className="text-lg font-semibold">{user.email?.charAt(0).toUpperCase() || 'U'}</span>)}</div></div>
              <div className="ml-3 min-w-0"><div className="truncate text-sm font-medium text-gray-800">{user.email}</div></div>
            </div>
            <div className="mt-3 space-y-1 px-2 sm:px-3">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">Dashboard</Link>
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">Account Settings</Link>
              <button onClick={handleSignOut} className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700">Sign Out</button>
            </div>
          </>
        ) : (
          <div className="space-y-2 px-2 pt-2 sm:px-3">
            <Link href="/auth" onClick={() => setMobileMenuOpen(false)}><Button variant="primary" size="md" className="w-full">Sign Up</Button></Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Right side: Nav Links + Auth buttons/user profile (Desktop) */}
          <div className="hidden md:flex items-center"> {/* Removed space-x-4, padding applied to children */}
             {/* Pricing Link */}
             <div className="px-3"> {/* Added padding */}
               <Link
                 href="/pricing"
                 className={`text-sm font-medium rounded-md transition-colors duration-200 py-1.5 ${
                   pathname === "/pricing"
                     ? "text-indigo-700 font-semibold"
                     : "text-gray-600 hover:text-indigo-600"
                 }`}
               >
                 Pricing
               </Link>
             </div>
             {/* Contact Link */}
             <div className="px-3"> {/* Added padding */}
               <Link
                 href="/contact"
                 className={`text-sm font-medium rounded-md transition-colors duration-200 py-1.5 ${
                   pathname === "/contact"
                     ? "text-indigo-700 font-semibold"
                     : "text-gray-600 hover:text-indigo-600"
                 }`}
               >
                 Contact
               </Link>
             </div>

             {/* Separator (Optional) */}
             {/* <div className="h-6 w-px bg-gray-200 mx-3"></div> */}

             {/* Auth buttons or user profile - Rendered based on user state */}
             {user && (
               <>
                 <div className="px-3"> {/* Added padding */}
                   <Link href="/dashboard">
                     <Button variant="secondary" size="sm" className="text-sm font-medium">Dashboard</Button>
                   </Link>
                 </div>
                 {/* UserMenu already has px-3 */}
                 <UserMenu />
               </>
             )}
             {!user && (
               <div className="px-3"> {/* Added padding */}
                 <Link href="/auth">
                   <Button variant="primary" size="sm" className="text-sm">Sign Up</Button>
                 </Link>
               </div>
             )}
             {/* Removed the loading placeholder block entirely */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <MobileMenuToggle />
          </div>
        </div>
      </div>

      {/* Mobile menu container */}
      <MobileMenuItems />
    </nav>
  );
}
