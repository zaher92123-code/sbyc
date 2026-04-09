import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateBoatSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  registration_number: z.string().min(1).max(100).optional(),
  type: z.string().optional(),
  color: z.string().optional(),
  length_meters: z.number().positive().optional(),
  width_meters: z.number().positive().nullable().optional(),
  insurance_company: z.string().max(255).nullable().optional(),
  insurance_expiry: z.string().nullable().optional(),
  insurance_policy_number: z.string().max(100).nullable().optional(),
  notes: z.string().optional(),
  status: z.enum(["available", "parked", "maintenance"]).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boats")
    .select(`
      *,
      boat_owners(
        is_primary, since_date,
        owner:owners(*)
      ),
      parking_sessions(
        *,
        parking_spot:parking_spots(spot_number),
        payments(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Boat not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = UpdateBoatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Get existing for audit
  const { data: existing } = await supabase
    .from("boats")
    .select("*")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("boats")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "boat_updated",
    table_name: "boats",
    record_id: id,
    old_values: existing,
    new_values: parsed.data,
    description: `Updated boat: ${data?.name}`,
  });

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Prevent deleting if boat has active sessions
  const { data: activeSessions } = await supabase
    .from("parking_sessions")
    .select("id")
    .eq("boat_id", id)
    .in("status", ["active", "ending_soon", "overdue"]);

  if (activeSessions && activeSessions.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete a boat with active parking sessions" },
      { status: 400 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: boat } = await supabase.from("boats").select("name").eq("id", id).single();

  const { error } = await supabase.from("boats").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "boat_deleted",
    table_name: "boats",
    record_id: id,
    description: `Deleted boat: ${boat?.name}`,
  });

  return NextResponse.json({ success: true });
}
