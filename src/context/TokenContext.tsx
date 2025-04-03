"use client"; // Context Providers are often client components

import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { TokenService, TokenUsage, TokenTransaction, OperationType } from '@/lib/token-service';
import { supabase } from '@/lib/supabase';

// Define a type for subscription data (can be shared or imported)
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

// Define the shape of the context data
interface TokenContextType {
  tokenUsage: TokenUsage | null;
  transactionHistory: TokenTransaction[];
  subscriptionData: SubscriptionData | null;
  setSubscriptionData: React.Dispatch<React.SetStateAction<SubscriptionData | null>>; // Allow setting from outside if needed
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  fetchTokenUsage: () => Promise<void>;
  fetchTransactionHistory: (limit?: number) => Promise<void>;
  fetchSubscriptionData: () => Promise<void>;
  initializeTokens: () => Promise<boolean>;
  canPerformOperation: (operation: OperationType) => boolean;
  recordTokenTransaction: (operation: OperationType, contentId?: string) => Promise<boolean>;
}

// Create the context with a default value (can be undefined or null initially)
const TokenContext = createContext<TokenContextType | undefined>(undefined);

// Create the Provider component
interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const { user, loading: userLoading } = useUser();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<TokenTransaction[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  // --- Logic moved from useTokens hook ---

  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      setSubscriptionData(data);
    } catch (err) {
      console.error(`Error fetching subscription data:`, err);
      setSubscriptionData(null);
    }
  }, [user?.id]);

  const fetchTokenUsage = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const usage = await TokenService.getUserTokenUsage(user.id);
      setTokenUsage(usage);
      if (usage) setInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching token usage:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchTransactionHistory = useCallback(async (limit = 5) => {
    if (!user?.id) return;
    try {
      const history = await TokenService.getTokenTransactionHistory(user.id, limit);
      setTransactionHistory(history);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
    }
  }, [user?.id]);

  const initializeTokens = useCallback(async () => {
     if (!user?.id) throw new Error('No user ID');
     setLoading(true);
     try {
       const response = await fetch('/api/init-tokens', { method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include' });
       if (!response.ok) throw new Error(`API error: ${response.status}`);
       const result = await response.json();
       if (!result.success) throw new Error(result.error || 'Unknown error');
       await fetchTokenUsage(); // Re-fetch after init
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

  const canPerformOperation = useCallback((operation: OperationType): boolean => {
    if (!tokenUsage) return false;
    const cost = TokenService.getOperationCost(operation);
    return tokenUsage.tokensRemaining >= cost;
  }, [tokenUsage]);

  const recordTokenTransaction = useCallback(async (operation: OperationType, contentId?: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('Cannot record transaction: No user ID');
      throw new Error('User not authenticated');
    }
    if (!canPerformOperation(operation)) {
      throw new Error('Insufficient tokens');
    }
    try {
      const cost = TokenService.getOperationCost(operation);
      await TokenService.recordTokenTransaction(user.id, operation, contentId);
      
      // Optimistic update directly on the shared state
      setTokenUsage(prevUsage => {
        if (!prevUsage) return null;
        return {
          ...prevUsage,
          tokensRemaining: prevUsage.tokensRemaining - cost,
          tokensUsed: prevUsage.tokensUsed + cost,
        };
      });
      
      // Trigger background refresh for consistency (don't await)
      fetchTokenUsage(); 
      fetchTransactionHistory(); 
      
      return true;
    } catch (err) {
      console.error('Error recording token transaction:', err);
      // Consider reverting optimistic update on error? Maybe not necessary if fetchTokenUsage runs soon.
      throw err;
    }
  }, [user?.id, canPerformOperation, fetchTokenUsage, fetchTransactionHistory]);

  // Fetch initial data when user is available
  useEffect(() => {
    if (userLoading) return;
    if (user?.id) {
      fetchTokenUsage();
      fetchTransactionHistory();
      fetchSubscriptionData();
    } else {
      setTokenUsage(null);
      setTransactionHistory([]);
      setSubscriptionData(null);
      setLoading(false);
      setInitialized(false);
    }
  }, [user?.id, userLoading, fetchTokenUsage, fetchTransactionHistory, fetchSubscriptionData]);

  // --- End Logic Moved ---

  // Value provided to consumers
  const value = {
    tokenUsage,
    transactionHistory,
    subscriptionData,
    setSubscriptionData, // Expose setter if needed elsewhere
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

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}

// Custom hook to use the TokenContext
export function useTokenContext() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
}
