import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  // Create a new supabase server client with the necessary cookies methods
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      // Define cookie methods that work with Next.js
      cookies: {
        // When getting a cookie, we need to use the .get() method
        get: function(name) {
          // @ts-expect-error - Next.js types are not accurate here
          return cookies().get(name)?.value;
        },
        // When setting a cookie, we need to use the .set() method
        set: function(name, value, options) {
          // @ts-expect-error - Next.js types are not accurate here
          cookies().set({
            name,
            value,
            ...options,
          });
        },
        // When removing a cookie, we set an empty value with maxAge 0
        remove: function(name, options) {
          // @ts-expect-error - Next.js types are not accurate here
          cookies().set({
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
