import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // DB connection
  try {
    const { error } = await supabase.from("parking_spots").select("id").limit(1);
    checks.database = error ? { ok: false, detail: error.message } : { ok: true };
  } catch (e: any) {
    checks.database = { ok: false, detail: e.message };
  }

  // Check if settings are configured
  try {
    const { data } = await supabase.from("app_settings").select("key, value");
    const settings = Object.fromEntries((data || []).map(s => [s.key, s.value]));
    checks.email = { ok: !!settings.email_resend_api_key, detail: settings.email_resend_api_key ? "Configured" : "Not configured" };
    checks.whatsapp = { ok: !!settings.whatsapp_access_token, detail: settings.whatsapp_access_token ? "Configured" : "Not configured" };
  } catch {
    checks.email = { ok: false, detail: "Cannot read settings" };
    checks.whatsapp = { ok: false, detail: "Cannot read settings" };
  }

  // Check last cron run (look at most recent audit log for cron-related action)
  try {
    const { data: lastReminder } = await supabase
      .from("reminders")
      .select("sent_at")
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastReminder?.sent_at) {
      const hours = (Date.now() - new Date(lastReminder.sent_at).getTime()) / (1000 * 60 * 60);
      checks.cron = { ok: hours < 48, detail: `Last activity: ${Math.round(hours)}h ago` };
    } else {
      checks.cron = { ok: false, detail: "No cron activity detected" };
    }
  } catch {
    checks.cron = { ok: false, detail: "Cannot check" };
  }

  // Quick stats
  const { count: spotCount } = await supabase.from("parking_spots").select("id", { count: "exact", head: true });
  const { count: activeCount } = await supabase.from("parking_sessions").select("id", { count: "exact", head: true }).in("status", ["active", "ending_soon", "overdue"]);
  const { count: pendingNotif } = await supabase.from("notification_queue").select("id", { count: "exact", head: true }).eq("status", "pending");

  const allOk = Object.values(checks).every(c => c.ok);

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    checks,
    stats: { spots: spotCount, activeSessions: activeCount, pendingNotifications: pendingNotif },
    timestamp: new Date().toISOString(),
  });
}
