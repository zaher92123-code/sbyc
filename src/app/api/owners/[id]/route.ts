import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateOwnerSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  alternate_contact: z.string().max(255).optional(),
  billing_notes: z.string().optional(),
  owner_type: z.enum(["individual", "company"]).optional(),
  civil_id: z.string().max(50).optional().or(z.literal("")),
  company_name_ar: z.string().max(255).optional().or(z.literal("")),
  company_name_en: z.string().max(255).optional().or(z.literal("")),
  commercial_register_number: z.string().max(100).optional().or(z.literal("")),
  commercial_register_expiry: z.string().optional().or(z.literal("")),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("owners")
    .select(`
      *,
      boat_owners(
        is_primary, since_date,
        boat:boats(
          *,
          parking_sessions(id, status, expected_end_date, remaining_balance, parking_spot:parking_spots(spot_number))
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = UpdateOwnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Clean empty strings to null for optional fields
  const cleaned: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() };
  for (const key of ["civil_id", "company_name_ar", "company_name_en", "commercial_register_number", "commercial_register_expiry"]) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data, error } = await supabase
    .from("owners")
    .update(cleaned)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "owner_updated",
    table_name: "owners",
    record_id: id,
    new_values: parsed.data,
    description: `Updated owner record: ${id}`,
  });

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check for active sessions
  const { data: activeSessions } = await supabase
    .from("parking_sessions")
    .select("id")
    .in("status", ["active", "ending_soon", "overdue"])
    .eq(
      "boat_id",
      supabase
        .from("boat_owners")
        .select("boat_id")
        .eq("owner_id", id)
    );

  if (activeSessions && activeSessions.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete owner with active parking sessions" },
      { status: 400 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("owners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "owner_deleted",
    table_name: "owners",
    record_id: id,
    description: `Deleted owner: ${id}`,
  });

  return NextResponse.json({ success: true });
}
