import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateOrderSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  payment_status: z.enum(["unpaid", "paid", "partial"]).optional(),
  scheduled_date: z.string().optional().or(z.literal("")),
  completed_date: z.string().optional().or(z.literal("")),
  total_amount_omr: z.number().min(0).optional(),
  notes: z.string().optional().or(z.literal("")),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("service_orders")
    .select("*, service:services(*), boat:boats(id, name, registration_number), owner:owners(id, full_name, phone, email)")
    .eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const parsed = UpdateOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cleaned: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() };
  for (const key of ["scheduled_date", "completed_date", "notes"]) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data, error } = await supabase.from("service_orders").update(cleaned).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("service_orders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
