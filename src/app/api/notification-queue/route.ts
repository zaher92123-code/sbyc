import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateNotifSchema = z.object({
  channel: z.enum(["email", "whatsapp"]),
  recipient_name: z.string().max(255).optional(),
  recipient_phone: z.string().max(50).optional().or(z.literal("")),
  recipient_email: z.string().email().optional().or(z.literal("")),
  recipient_id: z.string().uuid().optional().or(z.literal("")),
  subject: z.string().max(500).optional().or(z.literal("")),
  message_body: z.string().min(1),
  trigger_type: z.string().optional().default("manual"),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");

  let query = supabase.from("notification_queue")
    .select("*, recipient:owners(id, full_name, phone, email), approver:users!notification_queue_approved_by_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") query = query.eq("status", status);
  if (channel && channel !== "all") query = query.eq("channel", channel);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}

// POST - create manual notification
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = CreateNotifSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cleaned: Record<string, unknown> = { ...parsed.data };
  for (const key of ["recipient_phone", "recipient_email", "recipient_id", "subject"]) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  const { data, error } = await supabase.from("notification_queue").insert(cleaned).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
