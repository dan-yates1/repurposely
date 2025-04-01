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
      console.error("Invalid token during status update:", userError);
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }
    const userId = userData.user.id;

    // 2. Get Data from Request Body
    const { id, status } = await request.json();

    if (!id || !status) { 
       return NextResponse.json({ error: "Missing required fields (id, status)" }, { status: 400 });
    }
    
    // Optional: Validate status value if needed
    const validStatuses = ['draft', 'published', 'completed', 'archived']; // Example valid statuses
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status value provided." }, { status: 400 });
    }


    // 3. Update Database using Admin Client
    const supabaseAdmin = createAdminClient();
    const { data, error: updateError } = await supabaseAdmin
       .from('content_history')
       .update({ 
           status: status, 
           updated_at: new Date().toISOString() // Also update updated_at
        })
       .eq('id', id)
       .eq('user_id', userId) // IMPORTANT: Ensure user can only update their own content
       .select('id, status') // Select only needed fields
       .single(); 

    if (updateError) {
       console.error("Error updating content_history status:", updateError);
       if (updateError.code === 'PGRST116') { 
          return NextResponse.json({ error: "Content not found or permission denied." }, { status: 404 });
       }
       throw updateError; 
    }

    console.log(`Successfully updated status for content history ${id} to ${status}`);
    return NextResponse.json({ success: true, updatedContent: data });

  } catch (error: unknown) {
    console.error("Error in /api/content/update-status:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update status: ${errorMessage}` },
      { status: 500 }
    );
  }
}
