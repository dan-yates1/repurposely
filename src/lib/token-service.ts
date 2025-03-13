import { supabase } from './supabase';

// Subscription tiers and their token limits
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'free',
    monthlyTokens: 50,
    features: ['Basic content repurposing', 'Up to 50 tokens per month', 'Standard templates']
  },
  PRO: {
    name: 'pro',
    monthlyTokens: 500,
    features: ['Advanced content repurposing', 'Up to 500 tokens per month', 'All templates', 'Priority support']
  },
  ENTERPRISE: {
    name: 'enterprise',
    monthlyTokens: 2000,
    features: ['Unlimited content repurposing', 'Up to 2000 tokens per month', 'Custom templates', 'Dedicated support']
  }
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Token costs for different operations
export const TOKEN_COSTS = {
  TEXT_REPURPOSE: 1,
  IMAGE_GENERATION: 5,
  VIDEO_PROCESSING: 10,
  ADVANCED_FORMATTING: 2
};

export type OperationType = keyof typeof TOKEN_COSTS;

export interface TokenUsage {
  tokensUsed: number;
  tokensRemaining: number;
  resetDate: string;
  subscriptionTier: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  tokens_used: number;
  transaction_type: string;
  content_id?: string;
  created_at: string;
}

export class TokenService {
  /**
   * Initialize a user's token usage when they first sign up
   */
  static async initializeUserTokens(userId: string): Promise<void> {
    try {
      // Check if user already has token usage
      const { data: existingTokens } = await supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', userId);
        
      if (existingTokens && existingTokens.length > 0) {
        console.log('User already has token usage record');
        return;
      }
      
      // Check if user has a subscription
      await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId);
      
      // Calculate reset date (1st of next month)
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      resetDate.setHours(0, 0, 0, 0);
      
      // Use the API endpoint instead of direct Supabase call
      const response = await fetch('/api/token-debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token API error:', errorData);
        throw new Error(`Failed to initialize tokens via API: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Token initialization result:', result);
    } catch (error) {
      console.error('Error initializing tokens:', error);
      throw error;
    }
  }

  /**
   * Check if a user has enough tokens for an operation
   */
  static async hasEnoughTokens(userId: string, operationType: OperationType): Promise<boolean> {
    try {
      const tokenUsage = await this.getUserTokenUsage(userId);
      const requiredTokens = TOKEN_COSTS[operationType];
      
      return tokenUsage.tokensRemaining >= requiredTokens;
    } catch (error) {
      console.error('Error checking token availability:', error);
      return false;
    }
  }

  /**
   * Use tokens for an operation
   */
  static async consumeTokens(
    userId: string, 
    operationType: OperationType, 
    contentId?: string
  ): Promise<{ success: boolean; tokensRemaining: number }> {
    try {
      // Check if user has enough tokens
      const hasTokens = await this.hasEnoughTokens(userId, operationType);
      
      if (!hasTokens) {
        return { success: false, tokensRemaining: 0 };
      }
      
      const tokenCost = TOKEN_COSTS[operationType];
      const tokenUsage = await this.getUserTokenUsage(userId);
      
      // Update token usage
      const { error: updateError } = await supabase
        .from('token_usage')
        .update({
          tokens_used: tokenUsage.tokensUsed + tokenCost,
          tokens_remaining: tokenUsage.tokensRemaining - tokenCost
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error updating token usage:', updateError);
        return { success: false, tokensRemaining: tokenUsage.tokensRemaining };
      }
      
      // Record the transaction
      await supabase.from('token_transactions').insert({
        user_id: userId,
        tokens_used: tokenCost,
        transaction_type: operationType,
        content_id: contentId || null
      });

      return {
        success: true,
        tokensRemaining: tokenUsage.tokensRemaining - tokenCost
      };
    } catch (error) {
      console.error('Error consuming tokens:', error);
      return { success: false, tokensRemaining: 0 };
    }
  }

  /**
   * Get the token usage for a user
   * @param userId The user ID
   * @returns The user's token usage data
   */
  static async getUserTokenUsage(userId: string) {
    if (!userId) {
      console.error('No user ID provided to getUserTokenUsage');
      throw new Error('User ID is required');
    }
    
    try {
      // Try direct database access first as it's more reliable
      try {
        console.log('Fetching token usage directly from database for user:', userId);
        return await this.getTokenUsageFromDatabase(userId);
      } catch (dbError) {
        console.error('Database access failed, trying API fallback:', dbError);
        
        // Fall back to API if direct database access fails
        try {
          console.log('Attempting to fetch token usage via API for user:', userId);
          const response = await fetch('/api/token-debug', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include' // Include cookies for authentication
          });
          
          if (!response.ok) {
            const status = response.status;
            const statusText = response.statusText;
            console.error('API error:', status, statusText);
            throw new Error(`Failed to fetch token usage via API: ${status} ${statusText}`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            console.error('API returned failure:', data.error);
            throw new Error(data.error || 'Unknown API error');
          }
          
          // Extract token usage data from the API response
          if (data.tokenUsage && data.tokenUsage.data && data.tokenUsage.data.length > 0) {
            return data.tokenUsage.data[0];
          } else {
            // No token usage found, initialize it
            console.log('No token usage found via API, initializing...');
            return await this.initializeTokenUsage(userId);
          }
        } catch (apiError) {
          // Both database and API failed
          console.error('Both database and API access failed:', apiError);
          throw new Error(`Failed to get token usage: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        }
      }
    } catch (error) {
      console.error('Error in getUserTokenUsage:', error);
      throw error;
    }
  }
  
  /**
   * Get token usage directly from the database
   * @param userId The user ID to get token usage for
   * @returns The user's token usage data
   */
  private static async getTokenUsageFromDatabase(userId: string): Promise<TokenUsage | null> {
    try {
      console.log(`Fetching token usage directly from database for user: ${userId}`);
      
      // Query for all token_usage records for this user, ordered by creation date
      const { data, error } = await supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // If no data or empty array, return null
      if (!data || data.length === 0) {
        return null;
      }
      
      // Use the most recent record (first in the array since we sorted descending by created_at)
      const mostRecentUsage = data[0];
      
      // Check if reset date has passed
      const resetDate = new Date(mostRecentUsage.resetDate);
      const now = new Date();
      
      if (now > resetDate) {
        // If reset date has passed, update the record with new reset date and reset tokens
        const subscriptionTier = await this.getUserSubscriptionTier(userId);
        const monthlyTokens = SUBSCRIPTION_TIERS[subscriptionTier as SubscriptionTier].monthlyTokens;
        
        // Calculate next month's reset date
        const nextResetDate = new Date();
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
        nextResetDate.setDate(1);
        nextResetDate.setHours(0, 0, 0, 0);
        
        // Update token usage record
        const { error: updateError } = await supabase
          .from('token_usage')
          .update({
            tokens_used: 0,
            tokens_remaining: monthlyTokens,
            resetDate: nextResetDate.toISOString()
          })
          .eq('id', mostRecentUsage.id);
        
        if (updateError) {
          console.error('Error updating token usage after reset:', updateError);
        }
        
        // Return updated token usage
        return {
          tokensUsed: 0,
          tokensRemaining: monthlyTokens,
          resetDate: nextResetDate.toISOString(),
          subscriptionTier
        };
      }
      
      // Map database record to TokenUsage interface
      return {
        tokensUsed: mostRecentUsage.tokens_used,
        tokensRemaining: mostRecentUsage.tokens_remaining,
        resetDate: mostRecentUsage.resetDate,
        subscriptionTier: await this.getUserSubscriptionTier(userId)
      };
    } catch (error) {
      console.error('Database error when fetching token usage:', error);
      console.error('Error in getTokenUsageFromDatabase:', error);
      return null;
    }
  }

  /**
   * Initialize token usage for a user
   * @param userId The user ID to initialize token usage for
   * @returns The initialized token usage data
   */
  private static async initializeTokenUsage(userId: string) {
    console.log('Initializing token usage for user:', userId);
    
    try {
      // Check if the user has a subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      let subscriptionTier = 'free';  
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking subscription:', subscriptionError);
        
        // Create a subscription if none exists
        const { error: createSubError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            subscription_tier: subscriptionTier,
            subscription_start_date: new Date().toISOString(),
            is_active: true
          });
          
        if (createSubError) {
          console.error('Error creating subscription:', createSubError);
          throw new Error(`Failed to create subscription: ${createSubError.message}`);
        }
      } else if (subscription) {
        // Use the existing subscription tier
        subscriptionTier = subscription.subscription_tier;
        console.log(`Using existing subscription tier: ${subscriptionTier}`);
      }
      
      // Calculate next month's reset date
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
      resetDate.setHours(0, 0, 0, 0);
      
      // Determine token amount based on subscription tier
      let tokenAmount = 50; // Default for free tier
      if (subscriptionTier === 'pro') {
        tokenAmount = 500;
      } else if (subscriptionTier === 'enterprise') {
        tokenAmount = 2000;
      }
      
      // Create token usage record
      const { data, error } = await supabase
        .from('token_usage')
        .insert({
          user_id: userId,
          tokens_used: 0,
          tokens_remaining: tokenAmount,
          reset_date: resetDate.toISOString()
        })
        .select();
        
      if (error) {
        console.error('Error creating token usage:', error);
        throw new Error(`Failed to create token usage: ${error.message}`);
      }
      
      console.log(`Token usage initialized with ${tokenAmount} tokens for ${subscriptionTier} tier`);
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create token usage record');
      }
      
      return data[0];
    } catch (error) {
      console.error('Error in initializeTokenUsage:', error);
      throw error;
    }
  }

  /**
   * Check if tokens need to be reset and reset them if necessary
   */
  private static async checkAndResetTokens(userId: string): Promise<void> {
    const { data: tokenUsage } = await supabase
      .from('token_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!tokenUsage) {
      await this.initializeUserTokens(userId);
      return;
    }

    const resetDate = new Date(tokenUsage.resetDate);
    const now = new Date();

    if (now >= resetDate) {
      // Get the user's subscription tier
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single();

      const tierString = (subscription?.subscription_tier || 'free').toUpperCase();
      const tier = tierString as SubscriptionTier;
      const monthlyTokens = SUBSCRIPTION_TIERS[tier].monthlyTokens;

      // Calculate next month's reset date
      const nextResetDate = new Date(resetDate);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);

      // Reset tokens
      await supabase
        .from('token_usage')
        .update({
          tokens_used: 0,
          tokens_remaining: monthlyTokens,
          reset_date: nextResetDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', userId);
    }
  }

  /**
   * Get token transaction history for a user
   */
  static async getTokenTransactionHistory(userId: string, limit = 10): Promise<TokenTransaction[]> {
    const { data } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  /**
   * Gets the cost of a specific operation
   * @param operationType The type of operation
   * @returns The token cost for the operation
   */
  static getOperationCost(operationType: OperationType): number {
    return TOKEN_COSTS[operationType] || 0;
  }

  /**
   * Records a token transaction for a user
   * @param userId The user ID
   * @param operationType The type of operation
   * @param contentId Optional content ID associated with the transaction
   * @returns True if successful
   */
  static async recordTokenTransaction(userId: string, operationType: OperationType, contentId?: string): Promise<boolean> {
    try {
      // First, check if the user has enough tokens
      const tokenUsage = await this.getUserTokenUsage(userId);
      
      if (!tokenUsage) {
        throw new Error('Token usage data not found');
      }
      
      const cost = this.getOperationCost(operationType);
      
      if (tokenUsage.tokensRemaining < cost) {
        throw new Error('Insufficient tokens for this operation');
      }
      
      // Update token usage
      const { error: updateError } = await supabase
        .from('token_usage')
        .update({
          tokens_used: tokenUsage.tokensUsed + cost,
          tokens_remaining: tokenUsage.tokensRemaining - cost
        })
        .eq('user_id', userId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Record transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          tokens_used: cost,
          transaction_type: operationType,
          content_id: contentId || null
        });
        
      if (transactionError) {
        throw transactionError;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording token transaction:', error);
      throw error;
    }
  }

  /**
   * Gets the user's subscription tier from the database
   * @param userId The user ID
   * @returns The user's subscription tier (defaults to FREE if not found)
   */
  static async getUserSubscriptionTier(userId: string): Promise<string> {
    try {
      // Query user_subscriptions table for the user's subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If error is "no rows returned", default to FREE tier
        if (error.code === 'PGRST116') {
          console.log(`No subscription found for user ${userId}, defaulting to FREE tier`);
          return 'FREE';
        }
        
        // Log other errors but still default to FREE tier
        console.error('Error fetching subscription tier:', error);
        return 'FREE';
      }
      
      // If data exists, return the subscription tier in uppercase (to match the SUBSCRIPTION_TIERS keys)
      if (data && data.subscription_tier) {
        return data.subscription_tier.toUpperCase();
      }
      
      // Default to FREE if no data or no subscription_tier
      return 'FREE';
    } catch (error) {
      console.error('Error in getUserSubscriptionTier:', error);
      return 'FREE'; // Default to FREE tier in case of any error
    }
  }
}
