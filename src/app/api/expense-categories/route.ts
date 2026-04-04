import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CategorySchema = z.object({
  name_en: z.string().min(1).max(255),
  name_ar: z.string().max(255).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .order("name_en");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cleaned: Record<string, unknown> = { ...parsed.data };
  if (cleaned.name_ar === "") cleaned.name_ar = null;

  const { data, error } = await supabase.from("expense_categories").insert(cleaned).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
