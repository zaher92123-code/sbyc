import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateExpenseSchema = z.object({
  category_id: z.string().uuid().optional(),
  amount_omr: z.number().positive().optional(),
  description: z.string().optional().or(z.literal("")),
  expense_date: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = UpdateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  const cleaned: Record<string, unknown> = { ...parsed.data };
  if (cleaned.description === "") cleaned.description = null;

  const { data, error } = await supabase
    .from("expenses")
    .update(cleaned)
    .eq("id", id)
    .select("*, category:expense_categories(id, name_en, name_ar), recorder:users!expenses_recorded_by_fkey(full_name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "expense_updated",
    table_name: "expenses",
    record_id: id,
    new_values: parsed.data,
    description: `Updated expense: ${id}`,
  });

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "expense_deleted",
    table_name: "expenses",
    record_id: id,
    description: `Deleted expense: ${id}`,
  });

  return NextResponse.json({ success: true });
}
