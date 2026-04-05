import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getEmailTemplate, buildCustomEmail } from "@/lib/email/templates";
import { replacePlaceholders } from "@/lib/email/placeholders";
import type { ActiveSessionView } from "@/types";

export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = request.headers.get("x-cron-secret");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    cronSecret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runReminderJob();
}

export async function POST(request: NextRequest) {
  return runReminderJob();
}

async function runReminderJob() {
  const supabase = await createServiceClient();
  const today = new Date().toISOString().split("T")[0];
  // ═══ STEP 1: Refresh session statuses ═══
  await supabase.rpc("refresh_session_statuses");

  // ═══ STEP 2: Recalculate all penalties ═══
  try {
    await supabase.rpc("recalculate_all_penalties");
  } catch (err) {
    console.error("[Cron Job] Failed to recalculate penalties:", err);
  }

  // ═══ STEP 3: Generate reminders for active sessions ═══
  const { data: activeSessions } = await supabase
    .from("parking_sessions")
    .select("id")
    .in("status", ["active", "ending_soon", "overdue"]);

  for (const session of activeSessions || []) {
    await supabase.rpc("generate_reminders_for_session", { p_session_id: session.id });
  }

  // ═══ STEP 4: Route pending reminders to notification queue ═══
  const { data: pendingReminders } = await supabase
    .from("reminders")
    .select(`
      *,
      rule:reminder_rules(template_key, name, custom_subject, custom_message),
      session:active_sessions_view(*)
    `)
    .eq("status", "pending")
    .lte("scheduled_date", today);

  if (!pendingReminders || pendingReminders.length === 0) {
    return NextResponse.json({ success: true, queued: 0 });
  }
  let queued = 0;
  let skipped = 0;

  for (const reminder of pendingReminders) {
    const session = reminder.session as ActiveSessionView;

    if (!session) {
      await supabase.from("reminders")
        .update({ status: "skipped", error_message: "Session not found in view" })
        .eq("id", reminder.id);
      skipped++;
      continue;
    }

    // Determine recipients
    let recipientEmail: string | null = null;
    let recipientPhone: string | null = null;
    let recipientName: string | null = null;

    if (reminder.recipient_type === "customer") {
      if (!session.owner_email && !session.owner_phone) {
        await supabase.from("reminders")
          .update({ status: "skipped", error_message: "Owner has no email or phone" })
          .eq("id", reminder.id);
        skipped++;
        continue;
      }
      recipientEmail = session.owner_email;
      recipientPhone = session.owner_phone;
      recipientName = session.owner_name;
    } else if (reminder.recipient_type === "staff") {
      const { data: staffUsers } = await supabase
        .from("users").select("email, full_name").eq("is_active", true).not("email", "is", null).limit(1);
      if (staffUsers && staffUsers.length > 0) {
        recipientEmail = staffUsers[0].email;
        recipientName = staffUsers[0].full_name;
      }
    }

    // Build email content
    const rule = reminder.rule as any;
    let subject: string;
    let messageBody: string;

    if (rule?.custom_message && rule.custom_message.trim()) {
      subject = rule.custom_subject?.trim()
        ? replacePlaceholders(rule.custom_subject, session)
        : `Reminder: ${session.boat_name} — Al Seeb Boat Club`;
      messageBody = replacePlaceholders(rule.custom_message, session);
    } else {
      const templateKey = rule?.template_key || reminder.reminder_type;
      const template = getEmailTemplate(templateKey, session, reminder.recipient_type);
      subject = template.subject;
      // Strip HTML for the queue message body (plain text for WhatsApp too)
      messageBody = template.html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 1000);
    }

    // Queue email notification
    if (recipientEmail) {
      await supabase.from("notification_queue").insert({
        channel: "email",
        recipient_id: session.owner_id || null,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        subject,
        message_body: messageBody,
        status: "pending",
        trigger_type: reminder.reminder_type,
        trigger_id: reminder.id,
      });
      queued++;
    }

    // Queue WhatsApp notification (if owner has phone)
    if (recipientPhone && reminder.recipient_type === "customer") {
      await supabase.from("notification_queue").insert({
        channel: "whatsapp",
        recipient_id: session.owner_id || null,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        message_body: messageBody,
        status: "pending",
        trigger_type: reminder.reminder_type,
        trigger_id: reminder.id,
      });
      queued++;
    }

    // Mark reminder as processed (queued, not sent — admin will approve)
    await supabase.from("reminders")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", reminder.id);
  }

  // ═══ STEP 5: Create overdue follow-up reminders ═══
  const { data: overdueForRepeat } = await supabase
    .from("active_sessions_view").select("*").eq("status", "overdue");

  for (const session of overdueForRepeat || []) {
    const { data: existing } = await supabase
      .from("reminders").select("id")
      .eq("session_id", session.session_id)
      .eq("reminder_type", "reminder_overdue")
      .in("status", ["pending"]).gte("scheduled_date", today);

    if (!existing || existing.length === 0) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7);
      if (session.owner_email) {
        await supabase.from("reminders").insert({
          session_id: session.session_id,
          reminder_type: "reminder_overdue",
          recipient_type: "customer",
          recipient_email: session.owner_email,
          scheduled_date: nextDate.toISOString().split("T")[0],
          status: "pending",
        });
      }
    }
  }
  return NextResponse.json({
    success: true,
    queued,
    skipped,
    processedAt: new Date().toISOString(),
  });
}
