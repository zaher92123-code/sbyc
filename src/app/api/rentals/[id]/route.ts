import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateRentalSchema = z.object({
  tenant_name: z.string().min(1).max(255).optional(),
  tenant_phone: z.string().max(50).optional().or(z.literal("")),
  tenant_email: z.string().email().optional().or(z.literal("")),
  unit_number: z.string().max(50).optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  monthly_rate_omr: z.number().min(0).optional(),
  status: z.enum(["active", "expired", "terminated"]).optional(),
  notes: z.string().optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const parsed = UpdateRentalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cleaned: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() };
  for (const key of Object.keys(cleaned)) { if (cleaned[key] === "") cleaned[key] = null; }

  const { data, error } = await supabase.from("rentals").update(cleaned).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("rentals").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
