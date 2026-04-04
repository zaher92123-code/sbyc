import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/penalties?session_id=xxx
// Returns the penalty for a session, recalculating first if overdue
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  // Recalculate before returning
  await supabase.rpc("recalculate_penalty", { p_session_id: sessionId });

  const { data, error } = await supabase
    .from("penalties")
    .select("*, approved_by_user:users!penalties_approved_by_fkey(full_name)")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// GET all unpaid penalties (for dashboard)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // POST ?action=list-unpaid — returns all unpaid penalties with session info
  if (action === "list-unpaid") {
    // Recalculate all first
    await supabase.rpc("recalculate_all_penalties");

    const { data, error } = await supabase
      .from("penalties")
      .select(`
        *,
        session:parking_sessions(
          id, start_date, expected_end_date, status,
          boat:boats(id, name, registration_number),
          parking_spot:parking_spots(spot_number)
        )
      `)
      .eq("is_paid", false)
      .order("days_overdue", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // POST ?action=recalculate-all — recalculate all overdue penalties
  if (action === "recalculate-all") {
    await supabase.rpc("recalculate_all_penalties");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
