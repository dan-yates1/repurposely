import { useState } from 'react';
import { Twitter, Linkedin, BookOpen, FileText, Mail, Video, BarChart2, Edit, TrendingUp } from 'lucide-react';
import { HistoryCard } from '@/components/ui/history-card';
import { AnalyticsMetricCard } from '@/components/ui/analytics-metric-card';
import { CategoryCard } from '@/components/ui/category-card';

interface ContentHistoryItem {
  id: string;
  user_id: string;
  original_content: string;
  repurposed_content: string;
  output_format?: string;
  content_type?: string;
  tone: string;
  content_length: string;
  target_audience: string;
  created_at: string;
  status?: 'published' | 'draft';
}

interface HistoryViewProps {
  contentHistory: ContentHistoryItem[];
  loading: boolean;
  searchQuery: string;
  onCopy: (content: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryView({
  contentHistory,
  loading,
  searchQuery,
  onCopy,
  onEdit,
  onDelete
}: HistoryViewProps) {
  const [historyTab, setHistoryTab] = useState('all-history');

  const filteredHistory = contentHistory.filter(item => {
    // Filter by search query
    if (searchQuery && !item.repurposed_content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by tab
    if (historyTab === 'this-week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(item.created_at) >= oneWeekAgo;
    } else if (historyTab === 'this-month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(item.created_at) >= oneMonthAgo;
    } else if (historyTab === 'archived') {
      return item.status === 'draft';
    }

    return true;
  });

  // Calculate analytics
  const twitterCount = contentHistory.filter(item => (item.content_type === 'twitter' || item.output_format === 'twitter-thread')).length;
  const linkedinCount = contentHistory.filter(item => (item.content_type === 'linkedin' || item.output_format === 'linkedin-post')).length;
  const blogCount = contentHistory.filter(item => (item.content_type === 'blog' || item.output_format === 'blog-post')).length;
  const emailCount = contentHistory.filter(item => (item.content_type === 'email' || item.output_format === 'email-newsletter')).length;
  const videoCount = contentHistory.filter(item => (item.content_type === 'video' || item.output_format === 'youtube-script')).length;

  // This function is no longer used since we're using count directly
  // const getPercentage = (count: number) => {
  //   if (contentHistory.length === 0) return 0;
  //   return Math.round((count / contentHistory.length) * 100);
  // };

  const getContentIcon = (item: ContentHistoryItem) => {
    const type = item.content_type || item.output_format?.split('-')[0] || 'other';
    
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
      case 'youtube':
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

  const getContentTitle = (item: ContentHistoryItem) => {
    let type = item.content_type || '';
    if (!type && item.output_format) {
      type = item.output_format.split('-')[0];
    }
    
    if (!type) return 'Content';
    
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    
    let suffix = 'Article';
    if (type === 'twitter') suffix = 'Thread';
    else if (type === 'linkedin') suffix = 'Post';
    else if (type === 'email') suffix = 'Newsletter';
    else if (type === 'video' || type === 'youtube') suffix = 'Script';
    
    return `${capitalizedType} ${suffix}`;
  };

  return (
    <>
      {/* History Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setHistoryTab('all-history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                historyTab === 'all-history'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All History
            </button>
            <button
              onClick={() => setHistoryTab('this-week')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                historyTab === 'this-week'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setHistoryTab('this-month')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                historyTab === 'this-month'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setHistoryTab('archived')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                historyTab === 'archived'
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
                icon={getContentIcon(item)}
                title={getContentTitle(item)}
                description={item.repurposed_content.substring(0, 60) + (item.repurposed_content.length > 60 ? '...' : '')}
                date={formatDate(item.created_at)}
                status={item.status || 'published'}
                onCopy={() => onCopy(item.repurposed_content)}
                onEdit={() => onEdit(item.id)}
                onDelete={() => onDelete(item.id)}
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
            change="15%"
            isPositive={true}
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Content Categories</h2>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <CategoryCard
            icon={<Twitter className="h-5 w-5 text-blue-500" />}
            name="Social Media"
            count={twitterCount + linkedinCount}
            onClick={() => setHistoryTab('social-media')}
          />
          <CategoryCard
            icon={<BookOpen className="h-5 w-5 text-green-600" />}
            name="Blog Content"
            count={blogCount}
            onClick={() => setHistoryTab('blog-content')}
          />
          <CategoryCard
            icon={<Mail className="h-5 w-5 text-orange-500" />}
            name="Email Marketing"
            count={emailCount}
            onClick={() => setHistoryTab('email-marketing')}
          />
          <CategoryCard
            icon={<Video className="h-5 w-5 text-red-500" />}
            name="Video Scripts"
            count={videoCount}
            onClick={() => setHistoryTab('video-scripts')}
          />
        </div>
      </div>
    </>
  );
}
