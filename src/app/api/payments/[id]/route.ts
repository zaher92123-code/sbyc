import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      session:parking_sessions(
        id, status, total_due, total_paid, remaining_balance,
        boat:boats(id, name, registration_number),
        parking_spot:parking_spots(spot_number)
      ),
      created_by_user:users(full_name)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Only admin can delete payments
  const { data: userProfile } = await supabase
    .from("users")
    .select("role:roles(name)")
    .eq("id", user?.id || "")
    .single();

  if ((userProfile as any)?.role?.name !== "admin") {
    return NextResponse.json({ error: "Only admins can delete payments" }, { status: 403 });
  }

  // Get payment details for audit
  const { data: payment } = await supabase
    .from("payments")
    .select("amount, session_id, payment_date")
    .eq("id", id)
    .single();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log the deletion
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "payment_deleted",
    table_name: "payments",
    record_id: id,
    old_values: payment,
    description: `Deleted payment of OMR ${Number(payment.amount).toFixed(3)} dated ${payment.payment_date}`,
  });

  return NextResponse.json({ success: true });
}
