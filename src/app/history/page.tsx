'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Sidebar } from '@/components/ui/sidebar';
import { HistoryCard } from '@/components/ui/history-card';
import { AnalyticsMetricCard } from '@/components/ui/analytics-metric-card';
import { CategoryCard } from '@/components/ui/category-card';
import { Twitter, Linkedin, BookOpen, FileText, Mail, Video, BarChart2, Edit, TrendingUp } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Define types for content history items
interface ContentHistoryItem {
  id: string;
  user_id: string;
  original_content: string;
  repurposed_content: string;
  created_at: string;
  content_type: string;
  tone: string;
  target_audience: string;
  content_length: string;
  status?: 'published' | 'draft';
}

export default function History() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('all-history');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchContentHistory(session.user.id);
      } else {
        router.push('/auth');
      }
    };

    checkUser();
  }, [router]);

  const fetchContentHistory = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Add status field for UI purposes
      const historyWithStatus = data?.map(item => ({
        ...item,
        status: Math.random() > 0.3 ? 'published' as const : 'draft' as const
      })) || [];

      setContentHistory(historyWithStatus);
    } catch (error) {
      console.error('Error fetching content history:', error);
      toast.error('Failed to load content history');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_history')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setContentHistory(contentHistory.filter(item => item.id !== id));
      toast.success('Content deleted');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const filteredHistory = contentHistory.filter(item => {
    // Filter by search query
    if (searchQuery && !item.repurposed_content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by tab
    if (activeTab === 'this-week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(item.created_at) >= oneWeekAgo;
    } else if (activeTab === 'this-month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(item.created_at) >= oneMonthAgo;
    } else if (activeTab === 'archived') {
      return item.status === 'draft';
    }

    return true;
  });

  // Calculate analytics
  const twitterCount = contentHistory.filter(item => item.content_type === 'twitter').length;
  const linkedinCount = contentHistory.filter(item => item.content_type === 'linkedin').length;
  const blogCount = contentHistory.filter(item => item.content_type === 'blog').length;
  const emailCount = contentHistory.filter(item => item.content_type === 'email').length;
  const videoCount = contentHistory.filter(item => item.content_type === 'video').length;

  const totalCount = contentHistory.length;
  
  const getPercentage = (count: number) => {
    if (totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-500" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'blog':
        return <BookOpen className="h-5 w-5 text-green-600" />;
      case 'email':
        return <Mail className="h-5 w-5 text-orange-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Content History</h1>
          
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-white bg-indigo-600 rounded-r-md hover:bg-indigo-700">
                Filter
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('all-history')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all-history'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All History
                </button>
                <button
                  onClick={() => setActiveTab('this-week')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'this-week'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setActiveTab('this-month')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'this-month'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'archived'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Archived
                </button>
              </nav>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No content history found</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {filteredHistory.slice(0, 5).map((item) => (
                  <HistoryCard
                    key={item.id}
                    icon={getContentIcon(item.content_type)}
                    title={`${item.content_type ? (item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)) : 'Content'} ${item.content_type === 'twitter' ? 'Thread' : item.content_type === 'linkedin' ? 'Post' : 'Article'}`}
                    description={item.repurposed_content.substring(0, 60) + (item.repurposed_content.length > 60 ? '...' : '')}
                    date={formatDate(item.created_at)}
                    status={item.status || 'published'}
                    onCopy={() => handleCopy(item.repurposed_content)}
                    onEdit={() => handleEdit(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Content Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <AnalyticsMetricCard
                icon={<BarChart2 className="h-5 w-5 text-indigo-600" />}
                title="Most Created"
                value={`${twitterCount > linkedinCount && twitterCount > blogCount ? 'Twitter Threads' : linkedinCount > blogCount ? 'LinkedIn Posts' : 'Blog Articles'} (${Math.max(twitterCount, linkedinCount, blogCount)})`}
              />
              <AnalyticsMetricCard
                icon={<Edit className="h-5 w-5 text-indigo-600" />}
                title="Most Edited"
                value="Blog Articles (8)"
              />
              <AnalyticsMetricCard
                icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
                title="Content Growth"
                value="+25% from last month"
                trend="15%"
                trendUp={true}
              />
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Content Categories</h2>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <CategoryCard
                icon={<Twitter className="h-5 w-5 text-blue-500" />}
                title="Social Media"
                percentage={getPercentage(twitterCount + linkedinCount)}
                onClick={() => setActiveTab('social-media')}
              />
              <CategoryCard
                icon={<BookOpen className="h-5 w-5 text-green-600" />}
                title="Blog Content"
                percentage={getPercentage(blogCount)}
                onClick={() => setActiveTab('blog-content')}
              />
              <CategoryCard
                icon={<Mail className="h-5 w-5 text-orange-500" />}
                title="Email Marketing"
                percentage={getPercentage(emailCount)}
                onClick={() => setActiveTab('email-marketing')}
              />
              <CategoryCard
                icon={<Video className="h-5 w-5 text-red-500" />}
                title="Video Scripts"
                percentage={getPercentage(videoCount)}
                onClick={() => setActiveTab('video-scripts')}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}
