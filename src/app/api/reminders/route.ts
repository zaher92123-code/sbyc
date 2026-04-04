import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase
    .from("reminders")
    .select(`
      *,
      session:parking_sessions(
        id, expected_end_date, status,
        boat:boats(id, name, registration_number)
      ),
      rule:reminder_rules(name, template_key)
    `)
    .order("scheduled_date", { ascending: false })
    .limit(200);

  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const recipientType = searchParams.get("recipient_type");

  if (status) query = query.eq("status", status);
  if (sessionId) query = query.eq("session_id", sessionId);
  if (recipientType) query = query.eq("recipient_type", recipientType);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  // Allow manually creating a reminder
  const { session_id, reminder_type, recipient_type, recipient_email, scheduled_date } = body;

  if (!session_id || !reminder_type || !recipient_type || !scheduled_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      session_id,
      reminder_type,
      recipient_type,
      recipient_email: recipient_email || null,
      scheduled_date,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
