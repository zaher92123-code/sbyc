import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateCategorySchema = z.object({
  name_en: z.string().min(1).max(255).optional(),
  name_ar: z.string().max(255).optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = UpdateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cleaned: Record<string, unknown> = { ...parsed.data };
  if (cleaned.name_ar === "") cleaned.name_ar = null;

  const { data, error } = await supabase
    .from("expense_categories")
    .update(cleaned)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if category has expenses
  const { count } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Cannot delete category with existing expenses. Deactivate it instead." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("expense_categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
