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
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    expected_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    pricing_model: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
    base_fee: z.number().min(0).optional(),
    total_due: z.number().min(0).optional(),
    boat_id: z.string().uuid().optional(),
    parking_spot_id: z.string().uuid().optional(),
    notes: z.string().optional(),
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
    try {
      await supabase.rpc("freeze_penalty_on_close", {
        p_session_id: id,
        p_exit_date: parsed.data.actual_exit_date,
      });
    } catch (err) {
      console.error("Failed to freeze penalty:", err);
    }
    await supabase.from("parking_spots")
      .update({ status: "empty", updated_at: new Date().toISOString() })
      .eq("id", session.parking_spot_id);
    await supabase.from("boats")
      .update({ status: "available", updated_at: new Date().toISOString() })
      .eq("id", session.boat_id);
    await supabase.from("reminders")
      .update({ status: "cancelled" })
      .eq("session_id", id)
      .eq("status", "pending");

  } else if (parsed.data.action === "update") {
    const { action: _action, boat_id, parking_spot_id, ...rest } = parsed.data;

    const newStart = rest.start_date ?? session.start_date;
    const newEnd = rest.expected_end_date ?? session.expected_end_date;
    if (newStart >= newEnd) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    if (parking_spot_id && parking_spot_id !== session.parking_spot_id) {
      const { data: newSpot } = await supabase
        .from("parking_spots")
        .select("id, status")
        .eq("id", parking_spot_id)
        .single();
      if (!newSpot) {
        return NextResponse.json({ error: "New spot not found" }, { status: 400 });
      }
      if (newSpot.status !== "empty") {
        return NextResponse.json({ error: "New spot is not available" }, { status: 409 });
      }
      await supabase.from("parking_spots")
        .update({ status: "empty", updated_at: new Date().toISOString() })
        .eq("id", session.parking_spot_id);
      await supabase.from("parking_spots")
        .update({ status: "occupied", updated_at: new Date().toISOString() })
        .eq("id", parking_spot_id);
      updateData.parking_spot_id = parking_spot_id;
    }

    if (boat_id && boat_id !== session.boat_id) {
      const { data: conflict } = await supabase
        .from("parking_sessions")
        .select("id")
        .eq("boat_id", boat_id)
        .in("status", ["active", "ending_soon", "overdue"])
        .neq("id", id)
        .maybeSingle();
      if (conflict) {
        return NextResponse.json({ error: "New boat already has an active session" }, { status: 409 });
      }
      await supabase.from("boats")
        .update({ status: "available", updated_at: new Date().toISOString() })
        .eq("id", session.boat_id);
      await supabase.from("boats")
        .update({ status: "parked", updated_at: new Date().toISOString() })
        .eq("id", boat_id);
      updateData.boat_id = boat_id;
    }

    updateData = { ...updateData, ...rest };

    if (rest.expected_end_date && rest.expected_end_date !== session.expected_end_date) {
      await supabase.rpc("generate_reminders_for_session", { p_session_id: id });
    }

    auditAction = "session_updated";
    auditDescription = "Session details updated";
  }

  const { data: updated, error } = await supabase
    .from("parking_sessions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
