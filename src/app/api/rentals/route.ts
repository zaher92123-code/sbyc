import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RentalSchema = z.object({
  service_id: z.string().uuid(),
  tenant_name: z.string().min(1).max(255),
  tenant_phone: z.string().max(50).optional().or(z.literal("")),
  tenant_email: z.string().email().optional().or(z.literal("")),
  owner_id: z.string().uuid().optional().or(z.literal("")),
  unit_number: z.string().max(50).optional().or(z.literal("")),
  start_date: z.string().min(1),
  end_date: z.string().optional().or(z.literal("")),
  monthly_rate_omr: z.number().min(0),
  notes: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type"); // storage_rental or office_rental

  let query = supabase.from("rentals")
    .select("*, service:services(id, name_en, name_ar, type), owner:owners(id, full_name)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (type) query = query.eq("service.type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const parsed = RentalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();
  const cleaned: Record<string, unknown> = { ...parsed.data, created_by: user?.id };
  for (const key of ["tenant_phone", "tenant_email", "owner_id", "unit_number", "end_date", "notes"]) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data, error } = await supabase.from("rentals").insert(cleaned).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
