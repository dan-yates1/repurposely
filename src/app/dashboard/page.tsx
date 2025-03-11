'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Send, Copy, Download, History } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';

// Define types for content history items
interface ContentHistoryItem {
  id: string;
  user_id: string;
  original_content: string;
  repurposed_content: string;
  output_format: string;
  tone: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [repurposedContent, setRepurposedContent] = useState('');
  const [outputFormat, setOutputFormat] = useState('twitter-thread');
  const [tone, setTone] = useState('professional');
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Define the fetchContentHistory function before useEffect
  const fetchContentHistory = async (userId: string) => {
    if (!userId) {
      console.error('Cannot fetch content history: No user ID provided');
      return;
    }
    
    try {
      // Skip content history fetching for now - we'll implement this properly later
      // Just set an empty array to avoid errors
      setContentHistory([]);
      
      // Log that we're skipping this for debugging purposes
      console.log('Content history fetching temporarily disabled');
      
      /* Original code commented out to prevent errors
      const { data, error } = await supabase
        .from('content_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching content history:', error);
        return;
      }

      if (data) {
        setContentHistory(data as ContentHistoryItem[]);
      } else {
        setContentHistory([]);
      }
      */
    } catch (err) {
      console.error('Unexpected error fetching content history:', err);
      // Set empty array to prevent UI from waiting for data
      setContentHistory([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        setAuthChecking(true);
        
        // First try to get the session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError.message);
        }
        
        if (sessionData?.session) {
          console.log('User authenticated via session:', sessionData.session.user.email);
          setUser(sessionData.session.user);
          if (isMounted && sessionData.session.user.id) {
            await fetchContentHistory(sessionData.session.user.id);
          }
          return;
        }
        
        // If no session, try to get the user directly
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error checking user:', userError.message);
        }
        
        if (userData?.user) {
          console.log('User authenticated via getUser:', userData.user.email);
          setUser(userData.user);
          if (isMounted && userData.user.id) {
            await fetchContentHistory(userData.user.id);
          }
        } else {
          console.log('No authenticated user found, redirecting to auth page');
          router.push('/auth');
        }
      } catch (err) {
        console.error('Unexpected error checking authentication:', err);
        router.push('/auth');
      } finally {
        if (isMounted) {
          setAuthChecking(false);
        }
      }
    };

    checkUser();

    // Set up auth state listener
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed in dashboard:', event, !!session);
          
          if (event === 'SIGNED_IN' && session) {
            console.log('User signed in, updating user state');
            setUser(session.user);
            if (isMounted && session.user.id) {
              await fetchContentHistory(session.user.id);
            }
          }
          
          if (event === 'SIGNED_OUT' || !session) {
            console.log('User signed out, redirecting to auth page');
            router.push('/auth');
          }
        }
      );
      
      subscription = data.subscription;
    } catch (err) {
      console.error('Error setting up auth state listener:', err);
    }

    // Safe cleanup function
    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
    };
  }, [router]);

  const handleRepurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalContent.trim()) {
      toast.error('Please enter some content to repurpose');
      return;
    }
    
    setLoading(true);
    setRepurposedContent('');
    
    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent,
          outputFormat,
          tone,
          userId: user?.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to repurpose content');
      }
      
      setRepurposedContent(data.repurposedContent);
      toast.success('Content repurposed successfully!');
      
      // Refresh history
      if (user?.id) {
        fetchContentHistory(user.id);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(repurposedContent);
    toast.success('Copied to clipboard!');
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([repurposedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${outputFormat}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const loadHistoryItem = (item: ContentHistoryItem) => {
    setOriginalContent(item.original_content);
    setRepurposedContent(item.repurposed_content);
    setOutputFormat(item.output_format);
    setTone(item.tone);
    setShowHistory(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#0066FF" />
              <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="text-xl font-semibold text-gray-900">ContentRemix</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-2">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <form onSubmit={handleRepurpose}>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Original Content</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Content to Repurpose
                </label>
                <textarea
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="Paste your blog post, article, or transcript here..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Output Format
                  </label>
                  <div className="relative">
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full p-2 pl-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                    >
                      <option value="twitter-thread">Twitter Thread</option>
                      <option value="linkedin-post">LinkedIn Post</option>
                      <option value="facebook-post">Facebook Post</option>
                      <option value="instagram-caption">Instagram Caption</option>
                      <option value="email-newsletter">Email Newsletter</option>
                      <option value="youtube-script">YouTube Script</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Tone
                  </label>
                  <div className="relative">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-2 pl-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                      <option value="humorous">Humorous</option>
                      <option value="formal">Formal</option>
                      <option value="inspirational">Inspirational</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <History className="h-4 w-4 mr-2" />
                  History
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0066FF] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Repurpose
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {/* History Panel */}
            {showHistory && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Recent Content</h3>
                {contentHistory.length === 0 ? (
                  <p className="text-gray-600">No history found</p>
                ) : (
                  <ul className="space-y-3">
                    {contentHistory.map((item) => (
                      <li 
                        key={item.id} 
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">{item.output_format}</span>
                          <span className="text-sm text-gray-600">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 truncate">
                          {item.original_content.substring(0, 100)}...
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          {/* Output Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Repurposed Content</h2>
              
              {repurposedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    title="Download as text file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-700">Generating content...</span>
              </div>
            ) : repurposedContent ? (
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-900">
                {repurposedContent}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center text-gray-600">
                Repurposed content will appear here
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
