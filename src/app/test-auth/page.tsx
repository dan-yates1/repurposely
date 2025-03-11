'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestAuthPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get session data
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          return;
        }
        setSessionData(sessionData);

        // Get user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setError(`User error: ${userError.message}`);
          return;
        }
        setUserData(userData);
      } catch (e) {
        setError(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password',
    });
    
    if (error) {
      setError(`Sign in error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(`Sign out error: ${error.message}`);
    } else {
      // Clear state
      setSessionData(null);
      setUserData(null);
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      {loading ? (
        <div className="bg-gray-100 p-4 rounded">Loading authentication data...</div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">Session Status</h2>
            <p>
              Session exists: <span className="font-mono">{sessionData?.session ? 'Yes' : 'No'}</span>
            </p>
            {sessionData?.session && (
              <>
                <p>Session expires at: {new Date(sessionData.session.expires_at * 1000).toLocaleString()}</p>
                <p>User ID from session: {sessionData.session.user.id}</p>
              </>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">User Data</h2>
            <p>
              User exists: <span className="font-mono">{userData?.user ? 'Yes' : 'No'}</span>
            </p>
            {userData?.user && (
              <>
                <p>User ID: {userData.user.id}</p>
                <p>Email: {userData.user.email}</p>
                <p>Created at: {new Date(userData.user.created_at).toLocaleString()}</p>
              </>
            )}
          </div>
        </>
      )}

      <div className="mt-6 space-x-4">
        {!userData?.user ? (
          <button 
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Sign In
          </button>
        ) : (
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
        
        <a 
          href="/dashboard" 
          className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Dashboard
        </a>
        
        <a 
          href="/auth" 
          className="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go to Auth Page
        </a>
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Information</h2>
        <div className="overflow-auto max-h-60">
          <pre className="text-xs">
            {JSON.stringify({ sessionData, userData }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
