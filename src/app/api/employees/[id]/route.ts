import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateEmployeeSchema = z.object({
  name_en: z.string().min(1).max(255).optional(),
  name_ar: z.string().max(255).optional().or(z.literal("")),
  civil_id: z.string().max(50).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  position_en: z.string().max(100).optional().or(z.literal("")),
  position_ar: z.string().max(100).optional().or(z.literal("")),
  department: z.string().max(100).optional().or(z.literal("")),
  hire_date: z.string().optional().or(z.literal("")),
  base_salary_omr: z.number().min(0).optional(),
  allowances_omr: z.number().min(0).optional(),
  deductions_omr: z.number().min(0).optional(),
  bank_name: z.string().max(255).optional().or(z.literal("")),
  bank_account_number: z.string().max(100).optional().or(z.literal("")),
  employment_status: z.enum(["active", "on_leave", "terminated"]).optional(),
  emergency_contact_name: z.string().max(255).optional().or(z.literal("")),
  emergency_contact_phone: z.string().max(50).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

  // Also fetch salary records
  const { data: salaries } = await supabase
    .from("salary_records")
    .select("*")
    .eq("employee_id", id)
    .order("month", { ascending: false })
    .limit(12);

  return NextResponse.json({ data: { ...data, salary_records: salaries || [] } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = UpdateEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cleaned: Record<string, unknown> = { ...parsed.data, updated_at: new Date().toISOString() };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data, error } = await supabase
    .from("employees")
    .update(cleaned)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "employee_updated",
    table_name: "employees",
    record_id: id,
    new_values: parsed.data,
    description: `Updated employee: ${id}`,
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

  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "employee_deleted",
    table_name: "employees",
    record_id: id,
    description: `Deleted employee: ${id}`,
  });

  return NextResponse.json({ success: true });
}
