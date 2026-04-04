import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const EmployeeSchema = z.object({
  name_en: z.string().min(1).max(255),
  name_ar: z.string().max(255).optional().or(z.literal("")),
  civil_id: z.string().max(50).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  position_en: z.string().max(100).optional().or(z.literal("")),
  position_ar: z.string().max(100).optional().or(z.literal("")),
  department: z.string().max(100).optional().or(z.literal("")),
  hire_date: z.string().optional().or(z.literal("")),
  base_salary_omr: z.number().min(0).default(0),
  allowances_omr: z.number().min(0).default(0),
  deductions_omr: z.number().min(0).default(0),
  bank_name: z.string().max(255).optional().or(z.literal("")),
  bank_account_number: z.string().max(100).optional().or(z.literal("")),
  employment_status: z.enum(["active", "on_leave", "terminated"]).default("active"),
  emergency_contact_name: z.string().max(255).optional().or(z.literal("")),
  emergency_contact_phone: z.string().max(50).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const status = searchParams.get("status");

  let query = supabase.from("employees").select("*").order("name_en");

  if (q) {
    query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%,civil_id.ilike.%${q}%`);
  }
  if (status && status !== "all") {
    query = query.eq("employment_status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = EmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = { ...parsed.data };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data, error } = await supabase.from("employees").insert(cleaned).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "employee_created",
    table_name: "employees",
    record_id: data?.id,
    new_values: parsed.data,
    description: `Added employee: ${parsed.data.name_en}`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
