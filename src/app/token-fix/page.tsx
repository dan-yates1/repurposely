'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Define the Card components since they might not exist in the project
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-bold text-gray-800">{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-sm text-gray-600">{children}</p>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
);

const CardFooter = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-6 py-4 bg-gray-50 ${className}`}>{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  className = '' 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  disabled?: boolean, 
  variant?: 'primary' | 'outline', 
  className?: string 
}) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  const variantClasses = variant === 'outline' 
    ? "border border-gray-300 text-gray-700 hover:bg-gray-50" 
    : "bg-indigo-600 text-white hover:bg-indigo-700";
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default function TokenFixPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<'checking' | 'initialized' | 'error'>('checking');
  const [message, setMessage] = useState<string>('Checking token status...');
  const [error, setError] = useState<string | null>(null);
  
  // Define proper types for the token debug response
  interface TokenUsageData {
    user_id: string;
    tokens_used: number;
    tokens_remaining: number;
    reset_date: string;
  }
  
  interface TokenDebugResponse {
    success: boolean;
    user?: {
      id: string;
      email: string;
    };
    subscription?: {
      data: Array<{
        user_id: string;
        subscription_tier: string;
        subscription_start_date: string;
        is_active: boolean;
      }> | null;
      error: string | null;
    };
    tokenUsage?: {
      data: TokenUsageData[] | null;
      error: string | null;
    };
    error?: string;
    details?: string;
  }
  
  const [debugInfo, setDebugInfo] = useState<TokenDebugResponse | null>(null);

  // Check token status using useCallback to prevent dependency issues
  const checkTokenStatus = useCallback(async (userId: string) => {
    try {
      setMessage('Checking token status...');
      console.log('Checking token status for user:', userId);
      
      // First try the API endpoint
      try {
        const response = await fetch('/api/token-debug', {
          method: 'GET',
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
        
        const data = await response.json();
        setDebugInfo(data);
        
        if (data.tokenUsage && data.tokenUsage.data && data.tokenUsage.data.length > 0) {
          setMessage('Token records found!');
          setStatus('initialized');
        } else {
          setMessage('No token records found. Ready to initialize.');
          setStatus('error');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Fall back to direct database check
        try {
          const { data: tokenData, error: tokenError } = await supabase
            .from('token_usage')
            .select('*')
            .eq('user_id', userId);
            
          if (tokenError) {
            throw new Error(`Database error: ${tokenError.message}`);
          }
          
          if (tokenData && tokenData.length > 0) {
            setMessage('Token records found (via database)!');
            setStatus('initialized');
          } else {
            setMessage('No token records found. Ready to initialize.');
            setStatus('error');
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          setMessage('Error checking token status. Please try again.');
          setStatus('error');
          setError(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
        }
      }
    } catch (error) {
      console.error('Error checking token status:', error);
      setMessage('Error checking token status');
      setStatus('error');
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }, [supabase, setMessage, setStatus, setError, setLoading, setDebugInfo]);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          setError(`Authentication error: ${authError.message}`);
          setStatus('error');
          setLoading(false);
          return;
        }
        
        if (!user) {
          console.log('No user found, redirecting to login');
          setError('You must be logged in to access this page');
          setStatus('error');
          setLoading(false);
          router.push('/login');
          return;
        }
        
        setUserId(user.id);
        console.log('User authenticated:', user.id);
        
        // Check token status
        await checkTokenStatus(user.id);
      } catch (error) {
        console.error('Error checking auth:', error);
        setError(`Error checking authentication: ${error instanceof Error ? error.message : String(error)}`);
        setStatus('error');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [supabase, router, checkTokenStatus]);

  // Initialize tokens
  const initializeTokens = async () => {
    if (!userId) {
      setError('No user ID available');
      return;
    }
    
    setInitializing(true);
    setError(null);
    
    try {
      setMessage('Initializing tokens...');
      
      // Try to use the API endpoint first
      try {
        console.log('Initializing tokens via API...');
        const response = await fetch('/api/token-debug', {
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
        setDebugInfo(result);
        
        if (!result.success) {
          throw new Error(result.error || 'Unknown error initializing tokens');
        }
        
        console.log('Token initialization successful via API');
        setMessage('Tokens initialized successfully!');
        setStatus('initialized');
      } catch (apiError) {
        console.error('API token initialization failed:', apiError);
        setError(`API initialization failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        
        // Try direct database access as fallback
        try {
          console.log('Falling back to direct database access...');
          
          // Check for existing subscription
          const { data: existingSubscription, error: subQueryError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId);
            
          if (subQueryError) {
            throw new Error(`Subscription query error: ${subQueryError.message}`);
          }
          
          // Create subscription if it doesn't exist
          if (!existingSubscription || existingSubscription.length === 0) {
            console.log('Creating subscription record...');
            const { error: subError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                subscription_tier: 'free',
                subscription_start_date: new Date().toISOString(),
                is_active: true
              });
              
            if (subError) {
              throw new Error(`Failed to create subscription: ${subError.message}`);
            }
          }
          
          // Check for existing token usage
          const { data: existingTokens, error: tokenQueryError } = await supabase
            .from('token_usage')
            .select('*')
            .eq('user_id', userId);
            
          if (tokenQueryError) {
            throw new Error(`Token query error: ${tokenQueryError.message}`);
          }
          
          // Create token usage if it doesn't exist
          if (!existingTokens || existingTokens.length === 0) {
            console.log('Creating token usage record...');
            
            // Calculate next month's reset date
            const resetDate = new Date();
            resetDate.setMonth(resetDate.getMonth() + 1);
            resetDate.setDate(1);
            resetDate.setHours(0, 0, 0, 0);
            
            const { error: tokenError } = await supabase
              .from('token_usage')
              .insert({
                user_id: userId,
                tokens_used: 0,
                tokens_remaining: 50,
                reset_date: resetDate.toISOString()
              });
              
            if (tokenError) {
              throw new Error(`Failed to create token usage: ${tokenError.message}`);
            }
          }
          
          console.log('Token initialization successful via direct database access');
          setMessage('Tokens initialized successfully (via database)!');
          setStatus('initialized');
        } catch (dbError) {
          console.error('Database token initialization failed:', dbError);
          setError(`Database initialization failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
          setStatus('error');
        }
      }
    } catch (error) {
      console.error('Error initializing tokens:', error);
      setMessage('Error initializing tokens');
      setStatus('error');
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>Token System Initialization</CardTitle>
          <CardDescription>
            This page helps initialize the token system for your account if it&apos;s not already set up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8">
                {loading ? (
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                ) : status === 'initialized' ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <AlertCircle className="text-amber-500" size={24} />
                )}
              </div>
              <div>
                <p className="font-medium">{message}</p>
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>
            </div>
            
            {debugInfo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm">
                <h3 className="font-medium mb-2">Debug Information</h3>
                <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-64">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          
          <Button 
            onClick={initializeTokens} 
            disabled={initializing || status === 'initialized'} 
            className={status === 'initialized' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {initializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : status === 'initialized' ? (
              'Already Initialized'
            ) : (
              'Initialize Tokens'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
