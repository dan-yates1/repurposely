import React from 'react';
import { AlertCircle, CheckCircle, Info, ArrowUp } from 'lucide-react';
import { ContentQualityMetrics } from '@/lib/content-analysis-service';

interface ContentQualityCardProps {
  metrics: ContentQualityMetrics;
  isLoading?: boolean;
}

export function ContentQualityCard({ metrics, isLoading = false }: ContentQualityCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Content Quality Analysis</h2>
          <div className="text-sm text-gray-500">Analyzing...</div>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSuggestionIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-gray-500 flex-shrink-0" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'readability':
        return 'Readability';
      case 'engagement':
        return 'Engagement';
      case 'seo':
        return 'SEO';
      case 'general':
        return 'General';
      default:
        return 'Tip';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Content Quality Analysis</h2>
        <div className={`text-sm font-medium ${getScoreColor(metrics.overallScore)}`}>
          Overall Score: {metrics.overallScore}/100
        </div>
      </div>

      {/* Score Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Readability</div>
            <div className={`text-sm font-medium ${getScoreColor(metrics.readabilityScore)}`}>
              {metrics.readabilityScore}/100
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getScoreBgColor(metrics.readabilityScore)} h-2 rounded-full`} 
              style={{ width: `${metrics.readabilityScore}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Engagement</div>
            <div className={`text-sm font-medium ${getScoreColor(metrics.engagementScore)}`}>
              {metrics.engagementScore}/100
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getScoreBgColor(metrics.engagementScore)} h-2 rounded-full`} 
              style={{ width: `${metrics.engagementScore}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">SEO</div>
            <div className={`text-sm font-medium ${getScoreColor(metrics.seoScore)}`}>
              {metrics.seoScore}/100
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getScoreBgColor(metrics.seoScore)} h-2 rounded-full`} 
              style={{ width: `${metrics.seoScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Improvement Suggestions</h3>
        
        {metrics.suggestions.length === 0 ? (
          <div className="flex items-center p-4 bg-green-50 text-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Great job! Your content looks excellent.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mr-3 mt-0.5">
                  {getSuggestionIcon(suggestion.priority)}
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium bg-gray-200 text-gray-800 px-2 py-0.5 rounded mr-2">
                      {getSuggestionTypeLabel(suggestion.type)}
                    </span>
                    {suggestion.priority === 'high' && (
                      <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{suggestion.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
