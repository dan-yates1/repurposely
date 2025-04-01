import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js'; // Import Session

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Add state for session
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      try {
        setLoading(true);
        // Get session which includes user data
        const { data: sessionData, error } = await supabase.auth.getSession(); 
        
        if (error) {
          throw error;
        }
        
        setUser(sessionData.session?.user ?? null);
        setSession(sessionData.session); // Store the session
      } catch (err) {
        console.error('Error getting user:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setSession(session); // Update session on auth state change
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading, error }; // Return session
}
