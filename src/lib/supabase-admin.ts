import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
// This client bypasses RLS policies and should ONLY be used in server-side code
// NEVER expose this client to the browser
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key');
    throw new Error('Missing required environment variables for Supabase admin client');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
