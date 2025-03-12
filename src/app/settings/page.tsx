'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import toast, { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setEmail(session.user.email || '');
        // In a real app, you would fetch user profile data here
        // For now, we'll just set some placeholder data
        setFullName('Alex Johnson');
        setCompany('ContentRemix Inc.');
      } else {
        router.push('/auth');
      }
    };

    checkUser();
  }, [router]);

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // In a real app, you would update the user profile here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-700">
              Dashboard
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 text-sm font-medium">Settings</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Alex Johnson" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="alex.johnson@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Company</label>
              <input 
                type="text" 
                className="text-gray-900 block w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="ContentRemix Inc." 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Preferences</h2>
            <div className="flex items-center mb-4">
              <span className="text-gray-700 mr-4">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={() => setDarkMode(!darkMode)} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveChanges} 
            className="px-6"
            variant="primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
