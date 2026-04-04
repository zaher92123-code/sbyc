import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateSalarySchema = z.object({
  base_salary_omr: z.number().min(0).optional(),
  allowances_omr: z.number().min(0).optional(),
  deductions_omr: z.number().min(0).optional(),
  bonus_omr: z.number().min(0).optional(),
  payment_status: z.enum(["pending", "paid"]).optional(),
  payment_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; salaryId: string }> }
) {
  const { id, salaryId } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = UpdateSalarySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Recalculate net salary
  const cleaned: Record<string, unknown> = { ...parsed.data };
  if (cleaned.payment_date === "") cleaned.payment_date = null;
  if (cleaned.notes === "") cleaned.notes = null;

  // Get current record to compute net
  const { data: current } = await supabase.from("salary_records").select("*").eq("id", salaryId).eq("employee_id", id).single();
  if (!current) return NextResponse.json({ error: "Salary record not found" }, { status: 404 });

  const base = parsed.data.base_salary_omr ?? Number(current.base_salary_omr);
  const allow = parsed.data.allowances_omr ?? Number(current.allowances_omr);
  const deduct = parsed.data.deductions_omr ?? Number(current.deductions_omr);
  const bonus = parsed.data.bonus_omr ?? Number(current.bonus_omr);
  cleaned.net_salary_omr = base + allow - deduct + bonus;

  const { data, error } = await supabase
    .from("salary_records")
    .update(cleaned)
    .eq("id", salaryId)
    .eq("employee_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; salaryId: string }> }
) {
  const { id, salaryId } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("salary_records")
    .delete()
    .eq("id", salaryId)
    .eq("employee_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "salary_deleted",
    table_name: "salary_records",
    record_id: salaryId,
    description: `Deleted salary record: ${salaryId}`,
  });

  return NextResponse.json({ success: true });
}
