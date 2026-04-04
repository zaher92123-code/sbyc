import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ReserveSchema = z.object({
  reserved_for_name: z.string().min(1, "Name is required"),
  reserved_for_phone: z.string().optional().or(z.literal("")),
  reserved_until: z.string().optional().or(z.literal("")),
  reserved_notes: z.string().optional().or(z.literal("")),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = ReserveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: spot } = await supabase.from("parking_spots").select("id, status, spot_number").eq("id", id).single();
  if (!spot) return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  if (spot.status !== "empty") return NextResponse.json({ error: "Spot is not available" }, { status: 400 });

  const cleaned: Record<string, unknown> = { ...parsed.data };
  if (cleaned.reserved_for_phone === "") cleaned.reserved_for_phone = null;
  if (cleaned.reserved_until === "") cleaned.reserved_until = null;
  if (cleaned.reserved_notes === "") cleaned.reserved_notes = null;

  const { data, error } = await supabase.from("parking_spots")
    .update({ status: "reserved", ...cleaned, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    user_id: user?.id, action: "spot_reserved", table_name: "parking_spots",
    record_id: id, description: `Reserved spot ${spot.spot_number} for ${parsed.data.reserved_for_name}`,
  });

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: spot } = await supabase.from("parking_spots").select("id, status, spot_number").eq("id", id).single();
  if (!spot) return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  if (spot.status !== "reserved") return NextResponse.json({ error: "Spot is not reserved" }, { status: 400 });

  const { data, error } = await supabase.from("parking_spots")
    .update({ status: "empty", reserved_for_name: null, reserved_for_phone: null, reserved_until: null, reserved_notes: null, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    user_id: user?.id, action: "spot_unreserved", table_name: "parking_spots",
    record_id: id, description: `Released reservation on spot ${spot.spot_number}`,
  });

  return NextResponse.json({ data });
}
