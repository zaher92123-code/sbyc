import { createClient } from "@/lib/supabase/server";
import { formatOMR, formatDate, getPaymentStatus } from "@/lib/utils";
import { StatCard, SessionStatusBadge, PaymentStatusBadge } from "@/components/ui";
import type { DashboardStats, ActiveSessionView } from "@/types";
import { getT } from "@/lib/i18n/server";
import {
  IconAnchor, IconBoat, IconClock, IconWarning, IconCurrency, IconBell,
  IconTrendingUp, IconSpotEmpty, IconEmployee, IconExpense, IconServices,
} from "@/components/ui/Icons";
import Link from "next/link";

export default async function DashboardPage() {
  const t = await getT();
  const supabase = await createClient();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [
    { data: stats },
    { data: sessions },
    { data: reminders },
    { data: employeeData },
    { data: expenseData },
    { data: penaltyData },
    { data: serviceOrderData },
    { data: rentalData },
    { data: notifData },
  ] = await Promise.all([
    supabase.from("dashboard_stats").select("*").single(),
    supabase.from("active_sessions_view").select("*")
      .in("status", ["ending_soon", "overdue"]).order("days_remaining", { ascending: true }).limit(8),
    supabase.from("reminders").select("*, session:parking_sessions(id, parking_sessions_boat:boats(name))")
      .eq("status", "pending").lte("scheduled_date", new Date().toISOString().split("T")[0]).limit(6),
    supabase.from("employees").select("id, base_salary_omr, allowances_omr, deductions_omr")
      .eq("employment_status", "active"),
    supabase.from("expenses").select("amount_omr")
      .gte("expense_date", `${currentMonth}-01`).lte("expense_date", `${currentMonth}-31`),
    supabase.from("penalties").select("final_penalty_omr").eq("is_paid", false),
    supabase.from("service_orders").select("id, status").in("status", ["pending", "in_progress"]),
    supabase.from("rentals").select("id, monthly_rate_omr").eq("status", "active"),
    supabase.from("notification_queue").select("id").eq("status", "pending"),
  ]);

  const s = stats as DashboardStats | null;

  // Computed values
  const activeEmployees = employeeData?.length ?? 0;
  const totalSalary = employeeData?.reduce((sum, e) =>
    sum + Number(e.base_salary_omr) + Number(e.allowances_omr) - Number(e.deductions_omr), 0) ?? 0;
  const monthlyExpenses = expenseData?.reduce((sum, e) => sum + Number(e.amount_omr), 0) ?? 0;
  const unpaidPenalties = penaltyData?.reduce((sum, p) => sum + Number(p.final_penalty_omr), 0) ?? 0;
  const activeServiceOrders = serviceOrderData?.length ?? 0;
  const monthlyRentalIncome = rentalData?.reduce((sum, r) => sum + Number(r.monthly_rate_omr), 0) ?? 0;
  const pendingNotifications = notifData?.length ?? 0;
  const totalRevenue = (s?.collected_this_month ?? 0) + monthlyRentalIncome;
  const netProfit = totalRevenue - monthlyExpenses - totalSalary;

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t("totalSpots")} value={s?.total_spots ?? "—"} icon={<IconAnchor size={22} />}
          accent="#0E7490" sub={`${s?.occupied_spots ?? 0} ${t("occupied")}, ${s?.empty_spots ?? 0} ${t("available")}`} />
        <StatCard label={t("collectedThisMonth")} value={formatOMR(totalRevenue)} icon={<IconTrendingUp size={22} />}
          accent="#059669" sub={`${t("parking")}: ${formatOMR(s?.collected_this_month ?? 0)} + ${t("rentalsLabel")}: ${formatOMR(monthlyRentalIncome)}`} />
        <StatCard label={t("monthlyExpensesLabel")} value={formatOMR(monthlyExpenses + totalSalary)} icon={<IconExpense size={22} />}
          accent="#dc2626" sub={`${t("expenses")}: ${formatOMR(monthlyExpenses)} + ${t("salaries")}: ${formatOMR(totalSalary)}`} />
        <StatCard label={t("netProfitLabel")} value={formatOMR(netProfit)}
          icon={<IconCurrency size={22} />}
          accent={netProfit >= 0 ? "#059669" : "#dc2626"}
          sub={t("revenueMinusExpenses")} />
        <StatCard label={t("overduesessions")} value={s?.overdue_count ?? "—"} icon={<IconWarning size={22} />}
          accent="#dc2626" sub={unpaidPenalties > 0 ? `${t("penalties")}: ${formatOMR(unpaidPenalties)}` : t("requireImmediateAction")} />
        <StatCard label={t("employees")} value={activeEmployees} icon={<IconEmployee size={22} />}
          accent="#7c3aed" sub={`${t("totalMonthlySalary")}: ${formatOMR(totalSalary)}`} />
        <StatCard label={t("activeServicesLabel")} value={activeServiceOrders} icon={<IconServices size={22} />}
          accent="#0369a1" sub={`${rentalData?.length ?? 0} ${t("activeRentalsLabel")}`} />
        <StatCard label={t("pendingNotifLabel")} value={pendingNotifications} icon={<IconBell size={22} />}
          accent="#d97706" sub={t("awaitingApproval")} />
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent sessions */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100">
                <IconWarning size={16} className="text-amber-600" />
              </span>
              {t("sessionsNeedingAttention")}
            </h2>
            <Link href="/sessions?status=overdue" className="text-xs text-teal-600 font-semibold hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            {sessions && sessions.length > 0 ? (
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>{t("vessel")}</th><th>{t("spotNumber")}</th><th>{t("status")}</th>
                    <th>{t("endDateLabel")}</th><th>{t("balanceDueLabel")}</th><th>{t("owner")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(sessions as ActiveSessionView[]).map((s) => {
                    const payStatus = getPaymentStatus(s.total_due, s.total_paid, s.status);
                    return (
                      <tr key={s.session_id} className="cursor-pointer hover:bg-slate-50">
                        <td>
                          <Link href={`/boats/${s.boat_id}`} className="font-semibold text-slate-900 hover:text-teal-700">{s.boat_name}</Link>
                          <p className="text-xs text-slate-400 font-mono">{s.registration_number}</p>
                        </td>
                        <td><span className="font-mono font-semibold text-slate-700">{s.spot_number}</span></td>
                        <td><SessionStatusBadge status={s.status} /></td>
                        <td>
                          <span className="text-sm text-slate-700">{formatDate(s.expected_end_date)}</span>
                          {s.days_overdue > 0 && <p className="text-xs text-red-600 font-semibold">{s.days_overdue}{t("daysOverdueLabel")}</p>}
                          {s.days_remaining > 0 && <p className="text-xs text-amber-600 font-semibold">{s.days_remaining}{t("daysLeftLabel")}</p>}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="num font-semibold text-slate-800">{formatOMR(s.remaining_balance)}</span>
                            <PaymentStatusBadge status={payStatus} />
                          </div>
                        </td>
                        <td>
                          <p className="text-sm text-slate-700">{s.owner_name || "—"}</p>
                          <p className="text-xs text-slate-400">{s.owner_phone}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <p className="mt-1 text-sm font-semibold text-slate-600">{t("noUrgentSessions")}</p>
                <p className="text-xs text-slate-400">{t("allOnSchedule")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick links + pending notifications */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100">
                <IconBell size={16} className="text-violet-600" />
              </span>
              {t("pendingReminders")}
            </h2>
            <Link href="/notification-queue" className="text-xs text-teal-600 font-semibold hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {reminders && reminders.length > 0 ? (
              reminders.map((r: any) => (
                <div key={r.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {r.reminder_type?.replace(/_/g, " ").replace("reminder ", "")}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{r.recipient_type}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                      r.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{t("scheduled")}: {formatDate(r.scheduled_date)}</p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="mt-1 text-sm text-slate-500">{t("noPendingReminders")}</p>
              </div>
            )}
          </div>
          {pendingNotifications > 0 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <Link href="/notification-queue" className="btn-primary w-full justify-center text-xs py-2">
                {pendingNotifications} {t("pendingNotifLabel")} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
