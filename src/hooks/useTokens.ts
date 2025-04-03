import { useTokenContext } from '@/context/TokenContext'; // Import the context hook

// The original useTokens hook now simply returns the context value
export function useTokens() {
  return useTokenContext();
}

// Remove all the state management and logic that was moved to TokenProvider
