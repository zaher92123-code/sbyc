import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsApp, sendEmail } from "@/lib/appSettings";
import { z } from "zod";

const ActionSchema = z.object({
  action: z.enum(["approve", "reject", "send"]),
  rejected_reason: z.string().optional(),
});

// PATCH - approve, reject, or send
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: { user } } = await supabase.auth.getUser();
  const now = new Date().toISOString();

  if (parsed.data.action === "approve") {
    const { data, error } = await supabase.from("notification_queue")
      .update({ status: "approved", approved_by: user?.id, approved_at: now })
      .eq("id", id).eq("status", "pending").select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (parsed.data.action === "reject") {
    const { data, error } = await supabase.from("notification_queue")
      .update({ status: "rejected", approved_by: user?.id, approved_at: now, rejected_reason: parsed.data.rejected_reason || null })
      .eq("id", id).eq("status", "pending").select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (parsed.data.action === "send") {
    const { data: notif } = await supabase.from("notification_queue").select("*").eq("id", id).single();
    if (!notif) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (notif.status !== "approved") return NextResponse.json({ error: "Must be approved first" }, { status: 400 });

    let sendResult: { success: boolean; error?: string };

    if (notif.channel === "whatsapp") {
      const phone = notif.recipient_phone;
      if (!phone) {
        sendResult = { success: false, error: "No phone number provided" };
      } else {
        sendResult = await sendWhatsApp(phone, notif.message_body);
      }
    } else {
      // Email
      const email = notif.recipient_email;
      if (!email) {
        sendResult = { success: false, error: "No email address provided" };
      } else {
        const htmlBody = `<div style="font-family:sans-serif;padding:20px;">${notif.message_body.replace(/\n/g, "<br>")}</div>`;
        sendResult = await sendEmail(email, notif.subject || "Al Seeb Boat Club", htmlBody);
      }
    }

    if (sendResult.success) {
      const { data, error } = await supabase.from("notification_queue")
        .update({ status: "sent", sent_at: now })
        .eq("id", id).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await supabase.from("audit_logs").insert({
        user_id: user?.id, action: "notification_sent", table_name: "notification_queue",
        record_id: id,
        description: `Sent ${notif.channel} to ${notif.recipient_name || notif.recipient_email || notif.recipient_phone}`,
      });

      return NextResponse.json({ data });
    } else {
      // Mark as failed with error
      const { data, error } = await supabase.from("notification_queue")
        .update({ status: "failed", error_message: sendResult.error })
        .eq("id", id).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data, sendError: sendResult.error }, { status: 200 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("notification_queue").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
