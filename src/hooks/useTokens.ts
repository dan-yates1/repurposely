import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { TokenService, TokenUsage, TokenTransaction, OperationType } from '@/lib/token-service';
import { supabase } from '@/lib/supabase';

// Define a type for subscription data
export interface SubscriptionData {
  id: string;
  user_id: string;
  subscription_tier: string;
  subscription_start_date: string;
  subscription_end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTokens() {
  const { user, loading: userLoading } = useUser();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TokenTransaction[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch subscription data
  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      console.log('fetchSubscriptionData: No user ID available');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()

      // Add detailed logging
      if (error) {
        // Log the specific error code and message if available
        console.error(`Error fetching subscription data for user ${user.id}:`, JSON.stringify(error, null, 2));
        // Don't set data if there's an error
        setSubscriptionData(null); 
        return; 
      }

      // Log success and the data received
      console.log(`Successfully fetched subscription data for user ${user.id}:`, data);
      setSubscriptionData(data);

    } catch (err) {
      console.error(`Caught exception fetching subscription data for user ${user?.id}:`, err);
      setSubscriptionData(null); // Clear data on exception
    }
  }, [user?.id]);

  // Fetch token usage data
  const fetchTokenUsage = useCallback(async () => {
    if (!user?.id) {
      console.log('fetchTokenUsage: No user ID available');
      return;
    }

    try {
      setLoading(true);
      const usage = await TokenService.getUserTokenUsage(user.id);
      
      if (usage) {
        setTokenUsage(usage);
        setInitialized(true);
      } else {
        // If no usage data, we might need to initialize tokens
        console.log('No token usage data found, may need initialization');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching token usage:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(async (limit = 5) => {
    if (!user?.id) {
      console.log('fetchTransactionHistory: No user ID available');
      return;
    }

    try {
      const history = await TokenService.getTokenTransactionHistory(user.id, limit);
      setTransactionHistory(history);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
    }
  }, [user?.id]);

  // Initialize tokens for a new user or if tokens are not set up
  const initializeTokens = useCallback(async () => {
    if (!user?.id) {
      throw new Error('Cannot initialize tokens: No user ID available');
    }

    try {
      setLoading(true);
      
      // Try to use the API endpoint first
      const response = await fetch('/api/init-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error initializing tokens');
      }

      console.log('Token initialization successful via API');
      
      // Refresh token data
      await fetchTokenUsage();
      await fetchTransactionHistory();
      
      setInitialized(true);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Token initialization failed:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchTokenUsage, fetchTransactionHistory]);

  // Check if a specific operation can be performed with current token balance
  const canPerformOperation = useCallback((operation: OperationType): boolean => {
    if (!tokenUsage) return false;
    
    const cost = TokenService.getOperationCost(operation);
    return tokenUsage.tokensRemaining >= cost;
  }, [tokenUsage]);

  // Record a token transaction
  const recordTokenTransaction = useCallback(async (operation: OperationType, contentId?: string) => {
    if (!user?.id) {
      console.error('Cannot record transaction: No user ID available');
      throw new Error('User not authenticated');
    }

    if (!canPerformOperation(operation)) {
      throw new Error('Insufficient tokens for this operation');
    }

    try {
      await TokenService.recordTokenTransaction(user.id, operation, contentId);
      
      // Refresh token data after recording a transaction
      await fetchTokenUsage();
      await fetchTransactionHistory();
      
      return true;
    } catch (err) {
      console.error('Error recording token transaction:', err);
      throw err;
    }
  }, [user?.id, canPerformOperation, fetchTokenUsage, fetchTransactionHistory]);

  // Fetch token data when user changes
  useEffect(() => {
    // Only proceed if user loading is complete
    if (userLoading) {
      return;
    }
    
    if (user?.id) {
      console.log(`User ID changed, fetching token data for: ${user.id}`);
      fetchTokenUsage();
      fetchTransactionHistory();
      fetchSubscriptionData();
    } else {
      console.log('No user ID available, clearing token data');
      setTokenUsage(null);
      setTransactionHistory([]);
      setSubscriptionData(null);
      setLoading(false);
      setInitialized(false);
    }
  }, [user?.id, userLoading, fetchTokenUsage, fetchTransactionHistory, fetchSubscriptionData]);

  // Refresh token data periodically (every 5 minutes)
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      console.log('Refreshing token data (periodic update)');
      fetchTokenUsage();
      fetchTransactionHistory();
      fetchSubscriptionData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id, fetchTokenUsage, fetchTransactionHistory, fetchSubscriptionData]);

  return {
    tokenUsage,
    transactionHistory,
    subscriptionData,
    setSubscriptionData,
    loading,
    error,
    initialized,
    fetchTokenUsage,
    fetchTransactionHistory,
    fetchSubscriptionData,
    initializeTokens,
    canPerformOperation,
    recordTokenTransaction
  };
}
