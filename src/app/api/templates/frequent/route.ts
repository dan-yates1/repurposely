import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createAdminClient } from '@/lib/supabase-admin'; // Import Admin Client
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: NextRequest) { 
  const supabaseUserClient = createRouteHandlerClient({ cookies: cookies }); // For auth check ONLY
  const supabaseAdmin = createAdminClient(); // Use Admin client for the actual query
  let userId: string | null = null;

  try {
    // 1. Authenticate user (same logic as before to get userId)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser(token);
      if (!userError && user) {
         userId = user.id;
         console.log("Frequent Templates: Authenticated via Authorization header.");
      }
    }
    if (!userId) {
       const { data: { session } } = await supabaseUserClient.auth.getSession();
       if (session?.user) {
          userId = session.user.id;
          console.log("Frequent Templates: Authenticated via cookie session.");
       }
    }
    if (!userId) {
      console.log("Frequent Templates: No valid session or token found.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = 3; 
    console.log(`Fetching frequent templates for user: ${userId} using ADMIN client`);

    // 4. Perform the aggregation query directly using the ADMIN client (bypasses RLS)
    const { data, error } = await supabaseAdmin // Use admin client here
      .from('content_history')
      .select('output_format') 
      .eq('user_id', userId) // Filter by user ID is CRITICAL here as RLS is bypassed
      .neq('output_format', '') 
      .not('output_format', 'is', null) 
      .then(async ({ data: historyData, error: selectError }) => {
         if (selectError) return { data: null, error: selectError };
         
         if (!historyData || historyData.length === 0) {
            return { data: [], error: null }; 
         }

         // Manual aggregation in code
         const counts: { [key: string]: number } = {};
         historyData.forEach(item => {
           if (item.output_format) {
             const templateId = item.output_format.toLowerCase();
             counts[templateId] = (counts[templateId] || 0) + 1;
           }
         });

         const sortedTemplates = Object.entries(counts)
           .sort(([, countA], [, countB]) => countB - countA) 
           .slice(0, limit) 
           .map(([template_id, usage_count]) => ({ template_id, usage_count })); 

         return { data: sortedTemplates, error: null };
      });


    if (error) {
      console.error('Error querying frequent templates (Admin Client):', error);
      throw error; 
    }

    console.log(`Found frequent templates (Admin Client - before return):`, data); 

    // 5. Return the data
    return NextResponse.json(data || []); 

  } catch (error) {
    console.error('Error fetching frequent templates (Admin Client):', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch frequent templates: ${errorMessage}` }, { status: 500 });
  }
}
