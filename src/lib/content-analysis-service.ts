import { supabase } from './supabase';

export interface ContentQualityMetrics {
  readabilityScore: number;
  engagementScore: number;
  seoScore: number;
  overallScore: number;
  suggestions: ContentSuggestion[];
}

export interface ContentSuggestion {
  type: 'readability' | 'engagement' | 'seo' | 'general';
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnalysisHistory {
  id: string;
  user_id: string;
  content_id: string;
  readability_score: number;
  engagement_score: number;
  seo_score: number;
  overall_score: number;
  suggestions: ContentSuggestion[];
  created_at: string;
}

export class ContentAnalysisService {
  /**
   * Analyze content and return quality metrics and suggestions
   */
  static async analyzeContent(content: string, contentType: string): Promise<ContentQualityMetrics> {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate the analysis with some logic based on content length and type
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate mock scores based on content characteristics
      const contentLength = content.length;
      const sentences = content.split(/[.!?]+/).filter(Boolean);
      const avgSentenceLength = contentLength / (sentences.length || 1);
      const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
      const words = content.split(/\s+/).filter(Boolean);
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / (words.length || 1);
      
      // Calculate readability score (simulated)
      let readabilityScore = 100;
      if (avgSentenceLength > 25) readabilityScore -= 20;
      if (avgWordLength > 6) readabilityScore -= 15;
      if (paragraphs.length < 2 && contentLength > 200) readabilityScore -= 10;
      readabilityScore = Math.max(0, Math.min(100, readabilityScore));
      
      // Calculate engagement score (simulated)
      let engagementScore = 70;
      const questionCount = (content.match(/\?/g) || []).length;
      const exclamationCount = (content.match(/!/g) || []).length;
      if (questionCount > 0) engagementScore += 10;
      if (exclamationCount > 0) engagementScore += 5;
      if (content.includes('you') || content.includes('your')) engagementScore += 10;
      engagementScore = Math.max(0, Math.min(100, engagementScore));
      
      // Calculate SEO score (simulated)
      let seoScore = 60;
      const keywordDensity = calculateKeywordDensity(content);
      if (keywordDensity > 0.02) seoScore += 20;
      if (contentLength > 300) seoScore += 15;
      if (paragraphs.length > 3) seoScore += 10;
      seoScore = Math.max(0, Math.min(100, seoScore));
      
      // Calculate overall score
      const overallScore = Math.round((readabilityScore + engagementScore + seoScore) / 3);
      
      // Generate suggestions based on scores and content type
      const suggestions = generateSuggestions(
        readabilityScore, 
        engagementScore, 
        seoScore, 
        contentType,
        {
          contentLength,
          avgSentenceLength,
          avgWordLength,
          paragraphs: paragraphs.length,
          questionCount,
          exclamationCount
        }
      );
      
      return {
        readabilityScore,
        engagementScore,
        seoScore,
        overallScore,
        suggestions
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  }
  
  /**
   * Save analysis results to the database
   */
  static async saveAnalysisResults(
    userId: string, 
    contentId: string, 
    metrics: ContentQualityMetrics
  ): Promise<void> {
    try {
      await supabase
        .from('content_analysis')
        .insert({
          user_id: userId,
          content_id: contentId,
          readability_score: metrics.readabilityScore,
          engagement_score: metrics.engagementScore,
          seo_score: metrics.seoScore,
          overall_score: metrics.overallScore,
          suggestions: metrics.suggestions
        });
    } catch (error) {
      console.error('Error saving analysis results:', error);
      throw error;
    }
  }
  
  /**
   * Get analysis history for a user
   */
  static async getAnalysisHistory(userId: string, limit = 5): Promise<AnalysisHistory[]> {
    try {
      const { data } = await supabase
        .from('content_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      throw error;
    }
  }
}

// Helper functions

function calculateKeywordDensity(content: string): number {
  // This is a simplified implementation
  // In a real app, this would identify keywords and calculate density
  const words = content.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  if (wordCount === 0) return 0;
  
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    if (word.length > 3) { // Only consider words longer than 3 chars
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Find the most frequent word
  let maxFrequency = 0;
  Object.values(wordFrequency).forEach(frequency => {
    if (frequency > maxFrequency) maxFrequency = frequency;
  });
  
  return maxFrequency / wordCount;
}

function generateSuggestions(
  readabilityScore: number,
  engagementScore: number,
  seoScore: number,
  contentType: string,
  metrics: {
    contentLength: number,
    avgSentenceLength: number,
    avgWordLength: number,
    paragraphs: number,
    questionCount: number,
    exclamationCount: number
  }
): ContentSuggestion[] {
  const suggestions: ContentSuggestion[] = [];
  
  // Readability suggestions
  if (readabilityScore < 70) {
    if (metrics.avgSentenceLength > 25) {
      suggestions.push({
        type: 'readability',
        suggestion: 'Try breaking long sentences into shorter ones to improve readability.',
        priority: 'high'
      });
    }
    
    if (metrics.avgWordLength > 6) {
      suggestions.push({
        type: 'readability',
        suggestion: 'Consider using simpler words to make your content more accessible.',
        priority: 'medium'
      });
    }
    
    if (metrics.paragraphs < 2 && metrics.contentLength > 200) {
      suggestions.push({
        type: 'readability',
        suggestion: 'Break your content into more paragraphs to improve scannability.',
        priority: 'high'
      });
    }
  }
  
  // Engagement suggestions
  if (engagementScore < 70) {
    if (metrics.questionCount === 0) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'Add a question to engage your audience and encourage responses.',
        priority: 'medium'
      });
    }
    
    if (!contentType.includes('linkedin') && metrics.exclamationCount === 0) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'Add some enthusiasm with an exclamation mark to engage readers!',
        priority: 'low'
      });
    }
    
    if (contentType === 'blog' && metrics.contentLength < 500) {
      suggestions.push({
        type: 'engagement',
        suggestion: 'Consider expanding your blog post to provide more value to readers.',
        priority: 'medium'
      });
    }
  }
  
  // SEO suggestions
  if (seoScore < 70) {
    if (contentType === 'blog' || contentType === 'youtube') {
      suggestions.push({
        type: 'seo',
        suggestion: 'Include relevant keywords in your first paragraph to improve SEO.',
        priority: 'high'
      });
    }
    
    if (metrics.contentLength < 300 && (contentType === 'blog' || contentType === 'youtube')) {
      suggestions.push({
        type: 'seo',
        suggestion: 'Longer content tends to rank better. Try to expand your content.',
        priority: 'medium'
      });
    }
  }
  
  // Content type specific suggestions
  switch (contentType) {
    case 'twitter':
      if (metrics.contentLength > 280) {
        suggestions.push({
          type: 'general',
          suggestion: 'Your tweet exceeds the 280 character limit. Consider shortening it.',
          priority: 'high'
        });
      }
      break;
    case 'linkedin':
      if (metrics.contentLength > 3000) {
        suggestions.push({
          type: 'general',
          suggestion: 'Your LinkedIn post is quite long. Consider shortening it for better engagement.',
          priority: 'medium'
        });
      }
      break;
    case 'blog':
      if (metrics.paragraphs < 5 && metrics.contentLength > 500) {
        suggestions.push({
          type: 'general',
          suggestion: 'Consider adding more paragraph breaks to improve readability.',
          priority: 'medium'
        });
      }
      break;
  }
  
  return suggestions;
}
