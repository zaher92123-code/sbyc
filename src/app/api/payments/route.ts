import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PaymentSchema = z.object({
  session_id: z.string().uuid(),
  amount: z.number().positive("Amount must be greater than 0"),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payment_method: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
  is_adjustment: z.boolean().default(false),
  adjustment_reason: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  let query = supabase
    .from("payments")
    .select(`
      *,
      session:parking_sessions(
        id, status, total_due, total_paid, remaining_balance,
        boat:boats(id, name, registration_number),
        parking_spot:parking_spots(spot_number)
      )
    `)
    .order("payment_date", { ascending: false });

  if (sessionId) query = query.eq("session_id", sessionId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = PaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.is_adjustment && !parsed.data.adjustment_reason) {
    return NextResponse.json(
      { error: "adjustment_reason is required for adjustments" },
      { status: 400 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Verify session exists and is not closed
  const { data: session } = await supabase
    .from("parking_sessions")
    .select("id, status, total_due, total_paid")
    .eq("id", parsed.data.session_id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.status === "closed") {
    return NextResponse.json({ error: "Cannot add payments to a closed session" }, { status: 400 });
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ ...parsed.data, created_by: user?.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: parsed.data.is_adjustment ? "balance_adjusted" : "payment_recorded",
    table_name: "payments",
    record_id: payment?.id,
    new_values: parsed.data,
    description: `${parsed.data.is_adjustment ? "Adjustment" : "Payment"} of OMR ${parsed.data.amount.toFixed(3)} for session ${parsed.data.session_id}`,
  });

  return NextResponse.json({ data: payment }, { status: 201 });
}
