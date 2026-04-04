import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ExpenseSchema = z.object({
  category_id: z.string().uuid(),
  amount_omr: z.number().positive(),
  description: z.string().optional().or(z.literal("")),
  expense_date: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const month = searchParams.get("month"); // YYYY-MM

  let query = supabase
    .from("expenses")
    .select("*, category:expense_categories(id, name_en, name_ar), recorder:users!expenses_recorded_by_fkey(full_name)")
    .order("expense_date", { ascending: false });

  if (category) query = query.eq("category_id", category);
  if (from) query = query.gte("expense_date", from);
  if (to) query = query.lte("expense_date", to);
  if (month) {
    query = query.gte("expense_date", `${month}-01`).lte("expense_date", `${month}-31`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Calculate total
  const total = data?.reduce((sum, e) => sum + Number(e.amount_omr), 0) || 0;

  return NextResponse.json({ data, total });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = ExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  const cleaned: Record<string, unknown> = { ...parsed.data, recorded_by: user?.id };
  if (cleaned.description === "") cleaned.description = null;

  const { data, error } = await supabase.from("expenses").insert(cleaned).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "expense_created",
    table_name: "expenses",
    record_id: data?.id,
    new_values: parsed.data,
    description: `Recorded expense: ${parsed.data.amount_omr} OMR`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
