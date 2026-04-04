import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SessionSchema = z.object({
  boat_id: z.string().uuid(),
  parking_spot_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expected_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pricing_model: z.enum(["daily", "weekly", "monthly", "custom"]).default("monthly"),
  base_fee: z.number().min(0),
  total_due: z.number().min(0),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase
    .from("active_sessions_view")
    .select("*")
    .order("expected_end_date");

  const status = searchParams.get("status");
  const unpaid = searchParams.get("unpaid");

  if (status) query = query.eq("status", status);
  if (unpaid === "1") query = query.gt("remaining_balance", 0);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = SessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Validate start_date < expected_end_date
  if (parsed.data.start_date >= parsed.data.expected_end_date) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Use atomic function — handles spot lock, boat check, and all updates in one transaction
  const { data: sessionId, error } = await supabase.rpc("create_session_atomic", {
    p_boat_id: parsed.data.boat_id,
    p_spot_id: parsed.data.parking_spot_id,
    p_start_date: parsed.data.start_date,
    p_end_date: parsed.data.expected_end_date,
    p_pricing_model: parsed.data.pricing_model,
    p_base_fee: parsed.data.base_fee,
    p_total_due: parsed.data.total_due,
    p_notes: parsed.data.notes || null,
    p_created_by: user?.id,
  });

  if (error) {
    // Parse our custom error messages
    const msg = error.message || "";
    if (msg.includes("SPOT_TAKEN")) {
      return NextResponse.json({ error: "This parking spot already has an active session" }, { status: 409 });
    }
    if (msg.includes("BOAT_ACTIVE")) {
      return NextResponse.json({ error: "This boat already has an active parking session" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "session_created",
    table_name: "parking_sessions",
    record_id: sessionId,
    new_values: parsed.data,
    description: `Created parking session for boat ${parsed.data.boat_id} at spot ${parsed.data.parking_spot_id}`,
  });

  return NextResponse.json({ data: { id: sessionId } }, { status: 201 });
}
