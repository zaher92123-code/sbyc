import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const DiscountSchema = z.object({
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().min(0),
  discount_reason: z.string().optional(),
});

const MarkPaidSchema = z.object({
  action: z.literal("mark_paid"),
});

// PATCH /api/penalties/[id] — Apply discount
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = DiscountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Get current penalty
  const { data: penalty } = await supabase
    .from("penalties")
    .select("*")
    .eq("id", id)
    .single();

  if (!penalty) {
    return NextResponse.json({ error: "Penalty not found" }, { status: 404 });
  }

  if (penalty.is_paid) {
    return NextResponse.json({ error: "Cannot modify a paid penalty" }, { status: 400 });
  }

  // Calculate final amount after discount
  const total = Number(penalty.total_penalty_omr);
  let finalAmount: number;

  if (parsed.data.discount_type === "percentage") {
    finalAmount = total - (total * parsed.data.discount_value / 100);
  } else {
    finalAmount = Math.max(total - parsed.data.discount_value, 0);
  }

  const { data, error } = await supabase
    .from("penalties")
    .update({
      discount_type: parsed.data.discount_type,
      discount_value: parsed.data.discount_value,
      discount_reason: parsed.data.discount_reason || null,
      final_penalty_omr: finalAmount,
      approved_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "penalty_discount_applied",
    table_name: "penalties",
    record_id: id,
    new_values: parsed.data,
    description: `Applied ${parsed.data.discount_type} discount of ${parsed.data.discount_value} to penalty. Final: ${finalAmount} OMR`,
  });

  return NextResponse.json({ data });
}

// POST /api/penalties/[id] — Mark as paid
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = MarkPaidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("penalties")
    .update({
      is_paid: true,
      paid_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: "penalty_paid",
    table_name: "penalties",
    record_id: id,
    description: `Marked penalty as paid: ${data.final_penalty_omr} OMR`,
  });

  return NextResponse.json({ data });
}
