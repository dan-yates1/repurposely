import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  // Create a new supabase server client with the necessary cookies methods
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      // Define cookie methods that work with Next.js
      cookies: {
        // When getting a cookie, we need to use the .get() method
        get: async function(name) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        // When setting a cookie, we need to use the .set() method
        set: async function(name, value, options) {
          await cookieStore.set({
            name,
            value,
            ...options,
          });
        },
        // When removing a cookie, we set an empty value with maxAge 0
        remove: async function(name, options) {
          await cookieStore.set({
            name,
            value: '',
            maxAge: 0,
            ...options,
          });
        },
      },
    }
  );
}
