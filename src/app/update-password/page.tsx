"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false); // Control form visibility

  useEffect(() => {
    // Supabase calls onAuthStateChange when the user lands on this page
    // after clicking the password reset link.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { // Removed unused session parameter
      if (event === 'PASSWORD_RECOVERY') {
        // User is authenticated via the recovery token
        console.log('Password recovery event detected.');
        setShowForm(true); // Show the password update form
        setMessage('Enter your new password.');
        setError('');
      } else if (event === 'SIGNED_IN' && showForm) {
         // This might happen after successful password update if session persists
         // Optionally redirect or show success message
         console.log('User signed in after password update.');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [showForm]); // Re-run if showForm changes (might not be necessary)

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Example: Enforce minimum password length
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setPassword('');
      setConfirmPassword('');
      setMessage('Password updated successfully! Redirecting to dashboard...');
      toast.success('Password updated successfully!');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password.');
      toast.error(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Set Your New Password
          </h2>
        </div>

        {showForm ? (
          <form className="mt-8 space-y-6 bg-white p-8 shadow-lg rounded-lg" onSubmit={handlePasswordUpdate}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <div>
              {/* Removed type="submit" again */}
              <Button className="group relative flex w-full justify-center" disabled={loading}>
                {loading && <Loader2 className="animate-spin h-5 w-5 mr-3" />}
                Set New Password
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center p-8 bg-white shadow-lg rounded-lg">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded mx-auto"></div>
                <div className="h-4 w-full bg-gray-200 rounded mx-auto"></div>
                <div className="space-y-3 mt-6">
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-200 rounded"></div>
                  <div className="h-10 w-1/2 bg-gray-200 rounded mx-auto mt-4"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600">Waiting for authentication...</p>
                <p className="text-sm text-gray-500 mt-2">If you arrived here from a password reset email, please wait a moment.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
