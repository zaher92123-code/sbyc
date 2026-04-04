import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SalarySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  base_salary_omr: z.number().min(0),
  allowances_omr: z.number().min(0).default(0),
  deductions_omr: z.number().min(0).default(0),
  bonus_omr: z.number().min(0).default(0),
  payment_status: z.enum(["pending", "paid"]).default("pending"),
  payment_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

// POST /api/employees/[id]/salary — add salary record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = SalarySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const net = parsed.data.base_salary_omr + parsed.data.allowances_omr - parsed.data.deductions_omr + parsed.data.bonus_omr;

  const cleaned: Record<string, unknown> = {
    employee_id: id,
    ...parsed.data,
    net_salary_omr: net,
  };
  if (cleaned.payment_date === "") cleaned.payment_date = null;
  if (cleaned.notes === "") cleaned.notes = null;

  const { data, error } = await supabase.from("salary_records").insert(cleaned).select().single();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Salary record already exists for this month" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
