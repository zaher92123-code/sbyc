import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const BoatSchema = z.object({
  name: z.string().min(1).max(255),
  registration_number: z.string().min(1).max(100),
  type: z.string().optional(),
  color: z.string().optional(),
  length_meters: z.number().positive().optional(),
  width_meters: z.number().positive().optional(),
  insurance_company: z.string().max(255).optional(),
  insurance_expiry: z.string().optional(),
  width_meters: z.number().positive().optional(),
  insurance_company: z.string().max(255).optional(),
  insurance_expiry: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["available", "parked", "maintenance"]).default("available"),
  owner_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  let query = supabase
    .from("boats")
    .select(`
      *,
      boat_owners(is_primary, owner:owners(*)),
      parking_sessions(id, status, expected_end_date, remaining_balance, parking_spot:parking_spots(spot_number))
    `)
    .order("name");

  if (status) query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,registration_number.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = BoatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { owner_id, ...boatData } = parsed.data;

  const { data: { user } } = await supabase.auth.getUser();

  const { data: boat, error } = await supabase
    .from("boats")
    .insert({ ...boatData, created_by: user?.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Link owner if provided
  if (owner_id && boat) {
    await supabase.from("boat_owners").insert({
      boat_id: boat.id,
      owner_id,
      is_primary: true,
    });
  }

  // Audit log
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "boat_created",
    table_name: "boats",
    record_id: boat?.id,
    new_values: boatData,
    description: `Registered new boat: ${boatData.name}`,
  });

  return NextResponse.json({ data: boat }, { status: 201 });
}
