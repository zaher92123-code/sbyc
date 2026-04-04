import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ServiceOrderSchema = z.object({
  service_id: z.string().uuid(),
  boat_id: z.string().uuid().optional().or(z.literal("")),
  owner_id: z.string().uuid().optional().or(z.literal("")),
  scheduled_date: z.string().optional().or(z.literal("")),
  total_amount_omr: z.number().min(0),
  notes: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const listType = searchParams.get("list");
  const status = searchParams.get("status");

  if (listType === "services") {
    let query = supabase.from("services").select("*").order("type").order("name_en");
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // List service orders — filter by type via service_id subquery
  if (type) {
    // First get service IDs of the requested type
    const { data: serviceIds } = await supabase
      .from("services")
      .select("id")
      .eq("type", type);

    const ids = (serviceIds || []).map(s => s.id);

    if (ids.length === 0) {
      return NextResponse.json({ data: [] });
    }

    let query = supabase
      .from("service_orders")
      .select("*, service:services(id, name_en, name_ar, type, unit), boat:boats(id, name), owner:owners(id, full_name)")
      .in("service_id", ids)
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  // No type filter — return all
  let query = supabase
    .from("service_orders")
    .select("*, service:services(id, name_en, name_ar, type, unit), boat:boats(id, name), owner:owners(id, full_name)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = ServiceOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const cleaned: Record<string, unknown> = { ...parsed.data, created_by: user?.id };
  for (const key of ["boat_id", "owner_id", "scheduled_date", "notes"]) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data, error } = await supabase.from("service_orders").insert(cleaned).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id, action: "service_order_created", table_name: "service_orders",
    record_id: data?.id, new_values: parsed.data, description: `New service order created`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
