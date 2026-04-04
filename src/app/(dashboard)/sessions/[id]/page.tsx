import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatOMR, formatDatetime, getPaymentStatus, daysUntil, generateReminderSchedule } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge, Alert, Badge } from "@/components/ui";
import SessionActions from "@/components/sessions/SessionActions";
import PenaltyCard from "@/components/sessions/PenaltyCard";
import { getT } from "@/lib/i18n/server";
import { IconWarning, IconClock, IconCheck, IconMail, IconSearch } from "@/components/ui/Icons";

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
          <IconWarning size={16} className="inline mr-1" />{t("daysOverdueAlert")}: <strong>{Math.abs(days)} {t("daysAlertPlural")}</strong>. {t("outstandingBalance")}: {formatOMR(session.remaining_balance)}.
        </Alert>
      )}
      {session.status === "ending_soon" && (
        <Alert variant="warning">
          <IconClock size={16} className="inline mr-1" />{t("expiresIn")} <strong>{days} {days !== 1 ? t("daysAlertPlural") : t("daysAlert")}</strong> — {formatDate(session.expected_end_date)}.
        </Alert>
      )}

      {/* Penalty Card — only renders for overdue sessions */}
      <PenaltyCard sessionId={session.id} sessionStatus={session.status} />

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
              <p className="text-xs text-slate-500 flex items-center gap-1"><IconSearch size={10} />{primaryOwner.phone || "—"}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><IconMail size={10} />{primaryOwner.email || "—"}</p>
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
