#!/usr/bin/env python3
"""
Do Now — applies all remaining 'do now' tasks:
  #6  - Adds RESEND env vars to .env.local
  #7  - Verifies .gitignore (already confirmed OK, just reports)
  #8  - Fixes toggle button UI in reminders
  #9  - Translates sessions/[id], boats/[id], owners/[id]
  #10 - Deletes dead MapClient.tsx and ParkingLotMap.tsx

Run from project root: python3 do-now.py
"""
import os, sys

ROOT = os.getcwd()
SRC  = os.path.join(ROOT, "src")

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f: f.write(content)
    print(f"  ✓ {path}")

def patch(path, old, new, label=""):
    full = os.path.join(ROOT, path)
    if not os.path.exists(full):
        print(f"  ⚠ not found: {path}")
        return
    with open(full) as f: c = f.read()
    c2 = c.replace(old, new)
    with open(full, "w") as f: f.write(c2)
    tag = label or path.split("/")[-1]
    print(f"  {'✓ changed' if c != c2 else '~ already done'}: {tag}")

def delete(path):
    full = os.path.join(ROOT, path)
    if os.path.exists(full):
        os.remove(full)
        print(f"  🗑 deleted: {path}")
    else:
        print(f"  ~ already gone: {path}")

print("\n🔧 Applying all Do Now tasks...\n")

# ──────────────────────────────────────────────────────────────────────────────
# #6 — Add RESEND env vars to .env.local
# ──────────────────────────────────────────────────────────────────────────────
print("6️⃣  Setting up .env.local for email...")
env_path = os.path.join(ROOT, ".env.local")
if os.path.exists(env_path):
    env_content = open(env_path).read()
else:
    env_content = ""

additions = []
if "RESEND_FROM_EMAIL" not in env_content:
    additions.append("RESEND_FROM_EMAIL=noreply@alseebbay.om")
if "RESEND_FROM_NAME" not in env_content:
    additions.append("RESEND_FROM_NAME=Al Seeb Bay Marina")
if "RESEND_API_KEY" not in env_content:
    additions.append("# RESEND_API_KEY=re_xxxxxxxxxxxx  ← paste your key here")

if additions:
    with open(env_path, "a") as f:
        f.write("\n# ── Email (Resend) ──────────────────────────────\n")
        f.write("\n".join(additions) + "\n")
    print("  ✓ Added RESEND vars to .env.local")
    print("  ⚠  Open .env.local and paste your RESEND_API_KEY")
else:
    print("  ~ RESEND vars already in .env.local")

# ──────────────────────────────────────────────────────────────────────────────
# #7 — Check .gitignore
# ──────────────────────────────────────────────────────────────────────────────
print("\n7️⃣  Checking .gitignore...")
gi = os.path.join(ROOT, ".gitignore")
if os.path.exists(gi) and ".env.local" in open(gi).read():
    print("  ✅ .env.local is in .gitignore — safe")
else:
    with open(gi, "a") as f: f.write("\n.env.local\n")
    print("  ✓ Added .env.local to .gitignore")

# ──────────────────────────────────────────────────────────────────────────────
# #8 — Fix toggle button in ReminderRulesManager
# ──────────────────────────────────────────────────────────────────────────────
print("\n8️⃣  Fixing toggle button in reminders...")
patch(
    "src/components/reminders/ReminderRulesManager.tsx",
    'className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${rule.is_active ? "bg-teal-500" : "bg-slate-300"}`}>',
    'className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${rule.is_active ? "bg-teal-500" : "bg-slate-300"}`}>',
    "toggle track size"
)
patch(
    "src/components/reminders/ReminderRulesManager.tsx",
    'className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.is_active ? "translate-x-5" : "translate-x-0.5"}`}',
    'className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.is_active ? "translate-x-5" : "translate-x-0"}`}',
    "toggle dot position"
)

# ──────────────────────────────────────────────────────────────────────────────
# #9 — Translate sessions/[id], boats/[id], owners/[id]
# ──────────────────────────────────────────────────────────────────────────────
print("\n9️⃣  Translating detail pages...")

write("src/app/(dashboard)/sessions/[id]/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatOMR, formatDatetime, getPaymentStatus, daysUntil, generateReminderSchedule } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge, Alert, Badge } from "@/components/ui";
import SessionActions from "@/components/sessions/SessionActions";
import { getT } from "@/lib/i18n/server";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const supabase = await createClient();

  const [{ data: session }, { data: reminders }] = await Promise.all([
    supabase.from("parking_sessions").select(`
      *, boat:boats(*, boat_owners(is_primary, owner:owners(*))),
      parking_spot:parking_spots(*), payments(*),
      created_by_user:users!parking_sessions_created_by_fkey(full_name),
      closed_by_user:users!parking_sessions_closed_by_fkey(full_name)
    `).eq("id", id).single(),
    supabase.from("reminders").select("*, rule:reminder_rules(name)")
      .eq("session_id", id).order("scheduled_date"),
  ]);

  if (!session) notFound();

  const primaryOwner = session.boat?.boat_owners?.find((bo: any) => bo.is_primary)?.owner;
  const payStatus = getPaymentStatus(session.total_due, session.total_paid, session.status);
  const days = daysUntil(session.expected_end_date);
  const reminderSchedule = generateReminderSchedule(session.expected_end_date);
  const isActive = session.status !== "closed";

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/sessions" className="btn-ghost text-xs">{t("sessionsBack")}</Link>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900">
              {session.boat?.name} — {t("spot")} {session.parking_spot?.spot_number}
            </h1>
            <p className="text-sm text-slate-500 font-mono">{session.id.slice(0, 8)}…</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SessionStatusBadge status={session.status} />
          <PaymentStatusBadge status={payStatus} />
        </div>
      </div>

      {session.status === "overdue" && (
        <Alert variant="danger">
          ⚠️ {t("daysOverdueAlert")}: <strong>{Math.abs(days)} {t("daysAlertPlural")}</strong>. {t("outstandingBalance")}: {formatOMR(session.remaining_balance)}.
        </Alert>
      )}
      {session.status === "ending_soon" && (
        <Alert variant="warning">
          ⏰ {t("expiresIn")} <strong>{days} {days !== 1 ? t("daysAlertPlural") : t("daysAlert")}</strong> — {formatDate(session.expected_end_date)}.
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("sessionDetails")}</h2>
          {[
            { label: t("startDate"),      value: formatDate(session.start_date) },
            { label: t("expectedEnd"),    value: formatDate(session.expected_end_date) },
            { label: t("actualExit"),     value: session.actual_exit_date ? formatDate(session.actual_exit_date) : "—" },
            { label: t("pricingModel"),   value: session.pricing_model },
            { label: t("baseFee"),        value: formatOMR(session.base_fee) },
            { label: t("createdBy"),      value: (session as any).created_by_user?.full_name || "System" },
            { label: t("createdAt"),      value: formatDatetime(session.created_at) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-500">{label}</span>
              <span className="font-semibold text-slate-800">{value}</span>
            </div>
          ))}
          {session.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">{t("notes")}</p>
              <p className="text-sm text-slate-600">{session.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("financials")}</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("totalDue")}</span>
              <span className="num font-semibold">{formatOMR(session.total_due)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("totalPaid")}</span>
              <span className="num font-semibold text-emerald-600">{formatOMR(session.total_paid)}</span>
            </div>
            {session.last_payment_date && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("lastPayment")}</span>
                <span className="text-slate-700">{formatDate(session.last_payment_date)}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between">
              <span className="font-bold text-slate-700">{t("balance")}</span>
              <span className={`num text-lg font-black ${session.remaining_balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {formatOMR(session.remaining_balance)}
              </span>
            </div>
          </div>
          {session.total_due > 0 && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{t("paymentProgress")}</span>
                <span>{Math.min(100, Math.round((session.total_paid / session.total_due) * 100))}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (session.total_paid / session.total_due) * 100)}%`,
                    background: session.total_paid >= session.total_due ? "#059669" : "#0E7490" }} />
              </div>
            </div>
          )}
          {isActive && (
            <Link href={`/payments/new?session=${session.id}`} className="btn-primary text-xs w-full justify-center mt-2">
              + {t("recordPaymentBtn").replace("+ ", "")}
            </Link>
          )}
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("vesselAndOwner")}</h2>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("vessel")}</p>
            <Link href={`/boats/${session.boat?.id}`} className="font-bold text-slate-900 hover:text-teal-700">{session.boat?.name}</Link>
            <p className="text-xs font-mono text-slate-500">{session.boat?.registration_number}</p>
            <p className="text-xs text-slate-500">{session.boat?.type} · {session.boat?.color} · {session.boat?.length_meters}m</p>
          </div>
          {primaryOwner && (
            <div className="space-y-1 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("primaryOwner")}</p>
              <Link href={`/owners/${primaryOwner.id}`} className="font-semibold text-slate-900 hover:text-teal-700">{primaryOwner.full_name}</Link>
              <p className="text-xs text-slate-500">📞 {primaryOwner.phone || "—"}</p>
              <p className="text-xs text-slate-500">✉️ {primaryOwner.email || "—"}</p>
            </div>
          )}
          <div className="space-y-1 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("spot")}</p>
            <p className="font-mono font-bold text-slate-900">{session.parking_spot?.spot_number}</p>
          </div>
        </div>
      </div>

      {isActive && <SessionActions session={session} />}

      {session.payments && session.payments.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display">{t("paymentHistory")}</h2>
            <span className="text-sm text-slate-500">{session.payments.length} {t("records")}</span>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t("dateHeader")}</th><th>{t("amountHeader")}</th><th>{t("method")}</th>
                <th>{t("reference")}</th><th>{t("typeHeader")}</th><th>{t("notesHeader")}</th>
              </tr>
            </thead>
            <tbody>
              {session.payments.sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                .map((p: any) => (
                  <tr key={p.id}>
                    <td className="text-sm">{formatDate(p.payment_date)}</td>
                    <td className="num font-semibold text-emerald-700">{formatOMR(p.amount)}</td>
                    <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                    <td className="text-xs font-mono text-slate-500">{p.reference_number || "—"}</td>
                    <td>{p.is_adjustment
                      ? <Badge variant="gold" className="text-[10px]">{t("adjustment")}</Badge>
                      : <Badge variant="success" className="text-[10px]">{t("payment")}</Badge>}</td>
                    <td className="text-xs text-slate-500">{p.notes || p.adjustment_reason || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 font-display">{t("reminderScheduleTitle")}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t("basedOnEndDate")} {formatDate(session.expected_end_date)}</p>
        </div>
        <div className="divide-y divide-slate-100">
          {reminderSchedule.map((item) => {
            const sent    = reminders?.find((r: any) => r.reminder_type === item.type && r.status === "sent");
            const failed  = reminders?.find((r: any) => r.reminder_type === item.type && r.status === "failed");
            const pending = reminders?.find((r: any) => r.reminder_type === item.type && r.status === "pending");
            const isPast  = new Date(item.date) < new Date();
            return (
              <div key={item.type} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sent ? "bg-emerald-500" : failed ? "bg-red-500" : pending ? "bg-amber-500" : isPast ? "bg-slate-300" : "bg-slate-200"}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${sent ? "bg-emerald-100 text-emerald-800 border-emerald-200" : failed ? "bg-red-100 text-red-800 border-red-200" : pending ? "bg-amber-100 text-amber-800 border-amber-200" : isPast ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                  {sent ? t("sentStatus") : failed ? t("failedStatus") : pending ? t("pending") : isPast ? t("missedStatus") : t("scheduledStatus")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
''')

write("src/app/(dashboard)/boats/[id]/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge, Badge, Alert } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export default async function BoatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const supabase = await createClient();

  const [{ data: boat }, { data: sessions }] = await Promise.all([
    supabase.from("boats").select(`*, boat_owners(is_primary, since_date, owner:owners(*))`).eq("id", id).single(),
    supabase.from("parking_sessions").select(`*, parking_spot:parking_spots(spot_number), payments(id, amount, payment_date, payment_method, reference_number, notes)`)
      .eq("boat_id", id).order("created_at", { ascending: false }),
  ]);

  if (!boat) notFound();

  const activeSession = sessions?.find((s: any) => s.status !== "closed");
  const histSessions  = sessions?.filter((s: any) => s.status === "closed");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/boats" className="btn-ghost text-xs">{t("back")}</Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">{boat.name}</h1>
            <p className="font-mono text-slate-500">{boat.registration_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/boats/${id}/edit`} className="btn-secondary text-sm">{t("edit")}</Link>
          {activeSession && (
            <Link href={`/payments/new?session=${activeSession.id}`} className="btn-primary text-sm">
              + {t("recordPaymentBtn").replace("+ ", "")}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 col-span-1 space-y-4">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("vesselDetails")}</h2>
          {[
            { label: t("boatType"),    value: boat.type },
            { label: t("color"),       value: boat.color },
            { label: t("length"),      value: boat.length_meters ? `${boat.length_meters}m` : null },
            { label: t("status"),      value: boat.status, isStatus: true },
            { label: t("registeredDate"), value: formatDate(boat.created_at) },
          ].map(({ label, value, isStatus }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-500">{label}</span>
              {isStatus ? (
                <span className={`badge text-xs ${value === "parked" ? "bg-teal-100 text-teal-800 border-teal-200" : value === "available" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                  {t((value as any) || "available")}
                </span>
              ) : (
                <span className="font-semibold text-slate-800">{value || "—"}</span>
              )}
            </div>
          ))}
          {boat.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">{t("notes")}</p>
              <p className="text-sm text-slate-600">{boat.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 col-span-1 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("ownerHeader")}</h2>
            <Link href={`/boats/${id}/owners`} className="text-xs text-teal-600 hover:underline">{t("manage")}</Link>
          </div>
          {boat.boat_owners?.map((bo: any) => (
            <div key={bo.owner.id} className="p-3 rounded-xl bg-slate-50 space-y-1">
              <div className="flex items-center gap-2">
                <Link href={`/owners/${bo.owner.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{bo.owner.full_name}</Link>
                {bo.is_primary && <Badge variant="gold" className="text-[10px]">{t("primary")}</Badge>}
              </div>
              <p className="text-xs text-slate-500">📞 {bo.owner.phone || "—"}</p>
              <p className="text-xs text-slate-500">✉️ {bo.owner.email || "—"}</p>
              {bo.since_date && <p className="text-xs text-slate-400">{t("since")} {formatDate(bo.since_date)}</p>}
            </div>
          ))}
        </div>

        <div className="card p-5 col-span-1">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide mb-3">{t("currentSession")}</h2>
          {activeSession ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SessionStatusBadge status={activeSession.status} />
                <span className="font-mono font-bold text-slate-700">{activeSession.parking_spot?.spot_number}</span>
              </div>
              {[
                { label: t("checkIn"),      value: formatDate(activeSession.start_date) },
                { label: t("expectedEnd"),  value: formatDate(activeSession.expected_end_date) },
                { label: t("pricingModel"), value: activeSession.pricing_model },
                { label: t("totalDue"),     value: formatOMR(activeSession.total_due) },
                { label: t("totalPaid"),    value: formatOMR(activeSession.total_paid) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold">
                <span className="text-slate-700">{t("balanceDue")}</span>
                <span className={activeSession.remaining_balance > 0 ? "text-red-600 num" : "text-emerald-600 num"}>
                  {formatOMR(activeSession.remaining_balance)}
                </span>
              </div>
              <Link href={`/sessions/${activeSession.id}`} className="btn-secondary text-xs w-full justify-center mt-2">
                {t("viewFullSession")}
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">{t("noActiveSession")}</p>
              <Link href={`/sessions/new?boat=${id}`} className="btn-primary text-xs mt-3">+ {t("startSession").replace("+ ","")}</Link>
            </div>
          )}
        </div>
      </div>

      {activeSession && activeSession.payments?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display">{t("paymentHistory")}</h2>
            <Link href={`/payments/new?session=${activeSession.id}`} className="btn-primary text-xs py-1.5">+ {t("addPayment").replace("+ ","")}</Link>
          </div>
          <table className="w-full data-table">
            <thead><tr><th>{t("dateHeader")}</th><th>{t("amountHeader")}</th><th>{t("method")}</th><th>{t("reference")}</th><th>{t("notesHeader")}</th></tr></thead>
            <tbody>
              {activeSession.payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="text-sm text-slate-700">{formatDate(p.payment_date)}</td>
                  <td className="num font-semibold text-emerald-700">{formatOMR(p.amount)}</td>
                  <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                  <td className="text-sm font-mono text-slate-500">{p.reference_number || "—"}</td>
                  <td className="text-sm text-slate-500">{p.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {histSessions && histSessions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display">{t("parkingHistory")}</h2>
          </div>
          <table className="w-full data-table">
            <thead><tr><th>{t("spotHeader")}</th><th>{t("checkIn")}</th><th>{t("checkOut")}</th><th>{t("duration")}</th><th>{t("totalPaid")}</th><th>{t("status")}</th></tr></thead>
            <tbody>
              {histSessions.map((s: any) => {
                const dur = s.actual_exit_date
                  ? Math.round((new Date(s.actual_exit_date).getTime() - new Date(s.start_date).getTime()) / (1000*60*60*24))
                  : null;
                return (
                  <tr key={s.id}>
                    <td className="font-mono font-semibold text-slate-700">{s.parking_spot?.spot_number}</td>
                    <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                    <td className="text-sm text-slate-600">{formatDate(s.actual_exit_date)}</td>
                    <td className="text-sm text-slate-600">{dur ? `${dur} ${t("days")}` : "—"}</td>
                    <td className="num text-sm font-semibold text-slate-700">{formatOMR(s.total_paid)}</td>
                    <td><SessionStatusBadge status={s.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
''')

write("src/app/(dashboard)/owners/[id]/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatOMR } from "@/lib/utils";
import { SessionStatusBadge, Badge } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export default async function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const supabase = await createClient();

  const { data: owner } = await supabase.from("owners").select(`
    *, boat_owners(is_primary, since_date, boat:boats(
      id, name, registration_number, type, color, length_meters, status,
      parking_sessions(id, status, expected_end_date, total_due, total_paid, remaining_balance,
        parking_spot:parking_spots(spot_number))
    ))
  `).eq("id", id).single();

  if (!owner) notFound();

  const allBoats = owner.boat_owners?.map((bo: any) => ({ ...bo.boat, is_primary: bo.is_primary, since_date: bo.since_date })) ?? [];
  const totalBalance = allBoats.reduce((sum: number, b: any) => {
    const active = b.parking_sessions?.find((s: any) => s.status !== "closed");
    return sum + (active?.remaining_balance ? Number(active.remaining_balance) : 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/owners" className="btn-ghost text-xs">{t("backToOwners")}</Link>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">{owner.full_name}</h1>
            <p className="text-sm text-slate-500">{t("ownerSince")} {formatDate(owner.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/owners/${id}/edit`} className="btn-secondary text-sm">{t("edit")}</Link>
          <Link href={`/boats/new?owner=${id}`} className="btn-primary text-sm">{t("registerBoat")}</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 col-span-1 space-y-3">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("contactLabel")}</h2>
          {[
            { label: "📞 " + t("phone"),      value: owner.phone },
            { label: "✉️ " + t("email"),      value: owner.email },
            { label: "📋 " + t("altContact"), value: owner.alternate_contact },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 font-semibold">{label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
            </div>
          ))}
          {owner.billing_notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("billingNotes")}</p>
              <p className="text-sm text-slate-600 mt-1">{owner.billing_notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 col-span-2">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide mb-4">{t("accountSummary")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{allBoats.length}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{t("vessels")}</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${totalBalance > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
              <p className={`text-2xl font-bold num ${totalBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatOMR(totalBalance)}</p>
              <p className={`text-xs font-semibold mt-1 ${totalBalance > 0 ? "text-red-500" : "text-emerald-500"}`}>{t("outstandingBalance")}</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-teal-900">{allBoats.filter((b: any) => b.status === "parked").length}</p>
              <p className="text-xs font-semibold text-teal-600 mt-1">{t("currentlyParked")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 font-display">{t("registeredVessels")}</h2>
        </div>
        {allBoats.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {allBoats.map((boat: any) => {
              const active = boat.parking_sessions?.find((s: any) => s.status !== "closed");
              return (
                <div key={boat.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-teal-50">⛵</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/boats/${boat.id}`} className="font-bold text-slate-900 hover:text-teal-700">{boat.name}</Link>
                        {boat.is_primary && <Badge variant="gold" className="text-[10px]">{t("primaryOwner")}</Badge>}
                      </div>
                      <p className="text-xs font-mono text-slate-500">{boat.registration_number}</p>
                      <p className="text-xs text-slate-400">{boat.type} · {boat.color} · {boat.length_meters}m</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {active ? (
                      <div className="space-y-1">
                        <SessionStatusBadge status={active.status} />
                        <p className="text-xs font-mono text-slate-600">{t("spot")} {active.parking_spot?.spot_number}</p>
                        {active.remaining_balance > 0
                          ? <p className="text-xs font-bold text-red-600 num">{formatOMR(active.remaining_balance)} {t("due")}</p>
                          : <p className="text-xs font-bold text-emerald-600">{t("paidShort")}</p>}
                        <p className="text-xs text-slate-400">{t("until")} {formatDate(active.expected_end_date)}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">{t("noActiveSession")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-slate-400">{t("noVesselsRegistered")}</p>
            <Link href={`/boats/new?owner=${id}`} className="btn-primary text-xs mt-3">{t("registerFirstVessel")}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
''')

# ──────────────────────────────────────────────────────────────────────────────
# #10 — Delete dead files
# ──────────────────────────────────────────────────────────────────────────────
print("\n🔟  Removing dead files...")
delete("src/components/map/MapClient.tsx")
delete("src/components/map/ParkingLotMap.tsx")

print("\n✅  All done! Restart your dev server: npm run dev")
print()
print("📋 Reminder — #5 still needs you to do manually:")
print("   → Open Supabase → SQL Editor → run update-spots-to-1-45.sql")
print("   → Open .env.local → paste your RESEND_API_KEY")
