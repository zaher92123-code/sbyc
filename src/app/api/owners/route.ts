import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const OwnerSchema = z.object({
  full_name: z.string().min(1).max(255),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  alternate_contact: z.string().max(255).optional(),
  billing_notes: z.string().optional(),
  owner_type: z.enum(["individual", "company"]).default("individual"),
  civil_id: z.string().max(50).optional().or(z.literal("")),
  company_name_ar: z.string().max(255).optional().or(z.literal("")),
  company_name_en: z.string().max(255).optional().or(z.literal("")),
  commercial_register_number: z.string().max(100).optional().or(z.literal("")),
  commercial_register_expiry: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  let query = supabase
    .from("owners")
    .select(`
      *,
      boat_owners(is_primary, boat:boats(id, name, registration_number, status))
    `)
    .order("full_name");

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = OwnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Clean empty strings to null for optional fields
  const cleaned: Record<string, unknown> = { ...parsed.data, created_by: user?.id };
  for (const key of ["civil_id", "company_name_ar", "company_name_en", "commercial_register_number", "commercial_register_expiry"]) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data: owner, error } = await supabase
    .from("owners")
    .insert(cleaned)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "owner_created",
    table_name: "owners",
    record_id: owner?.id,
    new_values: parsed.data,
    description: `Registered new owner: ${parsed.data.full_name}`,
  });

  return NextResponse.json({ data: owner }, { status: 201 });
}
