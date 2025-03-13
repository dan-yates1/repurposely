import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TokenService, OperationType } from './token-service';

// Create a Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Middleware to check if a user has enough tokens for an operation
 * @param operationType The type of operation being performed
 */
export async function checkTokens(
  req: NextRequest,
  operationType: OperationType
) {
  try {
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Initialize tokens for new users
    await TokenService.initializeUserTokens(userId);

    // Check if the user has enough tokens
    const hasEnoughTokens = await TokenService.hasEnoughTokens(userId, operationType);

    if (!hasEnoughTokens) {
      return NextResponse.json(
        { 
          error: 'Not enough tokens', 
          message: 'You do not have enough tokens for this operation. Please upgrade your plan or wait until your tokens reset.'
        },
        { status: 403 }
      );
    }

    // If they have enough tokens, continue
    return null;
  } catch (error) {
    console.error('Error checking tokens:', error);
    return NextResponse.json(
      { error: 'Failed to check token availability' },
      { status: 500 }
    );
  }
}

/**
 * Use tokens for an operation after it completes successfully
 */
export async function useTokensForOperation(
  userId: string,
  operationType: OperationType,
  contentId?: string
) {
  try {
    // Call the TokenService directly, not as a React Hook
    return await TokenService.consumeTokens(userId, operationType, contentId);
  } catch (error) {
    console.error('Error using tokens:', error);
    return { success: false, tokensRemaining: 0 };
  }
}
