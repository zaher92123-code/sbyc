import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PatchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("extend"),
    new_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    new_total_due: z.number().min(0).optional(),
    notes: z.string().optional(),
  }),
  z.object({
    action: z.literal("close"),
    actual_exit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    notes: z.string().optional(),
  }),
  z.object({
    action: z.literal("update"),
    notes: z.string().optional(),
    pricing_model: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
    total_due: z.number().min(0).optional(),
    base_fee: z.number().min(0).optional(),
  }),
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("parking_sessions")
    .select(`
      *,
      boat:boats(*, boat_owners(is_primary, owner:owners(*))),
      parking_spot:parking_spots(*),
      payments(*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Get current session
  const { data: session, error: fetchError } = await supabase
    .from("parking_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  let auditAction = "session_updated";
  let auditDescription = "";

  if (parsed.data.action === "extend") {
    // Validate new end date is after current end date
    if (parsed.data.new_end_date <= session.expected_end_date) {
      return NextResponse.json({ error: "New end date must be after current end date" }, { status: 400 });
    }

    updateData = {
      ...updateData,
      expected_end_date: parsed.data.new_end_date,
      status: "active",
      notes: parsed.data.notes || session.notes,
    };
    if (parsed.data.new_total_due !== undefined) {
      updateData.total_due = parsed.data.new_total_due;
    }
    auditAction = "session_extended";
    auditDescription = `Session extended to ${parsed.data.new_end_date}`;

    // Regenerate reminders after extension
    await supabase.rpc("generate_reminders_for_session", { p_session_id: id });

  } else if (parsed.data.action === "close") {
    if (!parsed.data.actual_exit_date) {
      return NextResponse.json({ error: "actual_exit_date is required to close a session" }, { status: 400 });
    }

    updateData = {
      ...updateData,
      status: "closed",
      actual_exit_date: parsed.data.actual_exit_date,
      closed_by: user?.id,
      notes: parsed.data.notes || session.notes,
    };
    auditAction = "session_closed";
    auditDescription = `Session closed. Actual exit: ${parsed.data.actual_exit_date}`;

    // ═══ FREEZE PENALTY before closing ═══
    try {
      await supabase.rpc("freeze_penalty_on_close", {
        p_session_id: id,
        p_exit_date: parsed.data.actual_exit_date,
      });
    } catch (err) {
      console.error("Failed to freeze penalty:", err);
      // Don't block close — penalty freeze is best-effort
    }

    // Free up the parking spot
    await supabase
      .from("parking_spots")
      .update({ status: "empty", updated_at: new Date().toISOString() })
      .eq("id", session.parking_spot_id);

    // Update boat status
    await supabase
      .from("boats")
      .update({ status: "available", updated_at: new Date().toISOString() })
      .eq("id", session.boat_id);

    // Cancel pending reminders
    await supabase
      .from("reminders")
      .update({ status: "cancelled" })
      .eq("session_id", id)
      .eq("status", "pending");

  } else if (parsed.data.action === "update") {
    const { action: _, ...fields } = parsed.data;
    updateData = { ...updateData, ...fields };
    auditAction = "session_updated";
    auditDescription = `Session details updated`;
  }

  const { data: updated, error } = await supabase
    .from("parking_sessions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  await supabase.from("audit_logs").insert({
    user_id: user?.id,
    action: auditAction,
    table_name: "parking_sessions",
    record_id: id,
    old_values: session,
    new_values: updateData,
    description: auditDescription,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("parking_sessions")
    .select("status, parking_spot_id, boat_id")
    .eq("id", id)
    .single();

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.status !== "closed") {
    return NextResponse.json({ error: "Only closed sessions can be deleted" }, { status: 400 });
  }

  const { error } = await supabase.from("parking_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
