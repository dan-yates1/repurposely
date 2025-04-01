import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized - Missing token" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseUserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: userData, error: userError } = await supabaseUserClient.auth.getUser();
    if (userError || !userData.user) {
      console.error("Invalid token during content update:", userError);
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }
    const userId = userData.user.id;

    // 2. Get Data from Request Body
    const { id, repurposed_content /*, other fields like tone, target_audience, status */ } = await request.json();

    if (!id || repurposed_content === undefined) { 
       return NextResponse.json({ error: "Missing required fields (id, repurposed_content)" }, { status: 400 });
    }

    // 3. Prepare Update Data
    const updateData: { repurposed_content: string; [key: string]: unknown } = { // Remove updated_at type
       repurposed_content: repurposed_content,
       // updated_at: new Date().toISOString(), // Remove: Database trigger handles this now
       // Add other updatable fields here if they are sent from the client
       // e.g., if (tone !== undefined) updateData.tone = tone;
       // e.g., if (status !== undefined) updateData.status = status; 
    };

    // 4. Update Database using Admin Client
    const supabaseAdmin = createAdminClient();
    const { data, error: updateError } = await supabaseAdmin
       .from('content_history')
       .update(updateData)
       .eq('id', id)
       .eq('user_id', userId) // IMPORTANT: Ensure user can only update their own content
       .select() // Optionally select the updated row
       .single(); // Expect one row to be updated

    if (updateError) {
       console.error("Error updating content_history:", updateError);
       // Check for specific errors, e.g., row not found (could be wrong ID or permission issue if RLS was used)
       if (updateError.code === 'PGRST116') { // PostgREST code for "0 rows returned"
          return NextResponse.json({ error: "Content not found or permission denied." }, { status: 404 });
       }
       throw updateError; // Throw other errors
    }

    console.log("Successfully updated content history:", id);
    return NextResponse.json({ success: true, updatedContent: data });

  } catch (error: unknown) {
    console.error("Error in /api/content/update:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update content: ${errorMessage}` },
      { status: 500 }
    );
  }
}
