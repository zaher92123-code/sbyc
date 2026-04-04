import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge } from "@/components/ui";
import type { ActiveSessionView } from "@/types";
import MonthlyReportClient from "@/components/reports/MonthlyReportClient";
import MonthPicker from "@/components/reports/MonthPicker";
import ReportExportClient from "@/components/reports/ReportExportClient";
import { IconReports, IconBoat, IconCurrency, IconClock, IconWarning, IconCalendar } from "@/components/ui/Icons";
import { getT } from "@/lib/i18n/server";
import { MARINA_CONFIG } from "@/config/marina";

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ report?: string; month?: string }>;
}) {
  const t = await getT();
  const params = await searchParams;
  const report = params.report || "monthly";

  // Default month = current month
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = params.month || defaultMonth;
  const monthOptions = getMonthOptions();

  const supabase = await createClient();

  // ── Monthly report data ───────────────────────────────────────────────────
  const monthStart = `${selectedMonth}-01`;
  const [year, mon] = selectedMonth.split("-").map(Number);
  const monthEnd = new Date(year, mon, 0).toISOString().split("T")[0]; // last day

  // Payments collected in selected month
  const { data: monthPayments } = await supabase
    .from("payments")
    .select(`
      *,
      session:parking_sessions(
        id, total_due, total_paid, remaining_balance, start_date, expected_end_date,
        boat:boats(id, name, registration_number, type),
        parking_spot:parking_spots(spot_number)
      )
    `)
    .gte("payment_date", monthStart)
    .lte("payment_date", monthEnd)
    .order("payment_date");

  // Sessions active during selected month
  const { data: activeDuringMonth } = await supabase
    .from("parking_sessions")
    .select(`
      *,
      boat:boats(id, name, registration_number, type),
      parking_spot:parking_spots(spot_number),
      payments(amount, payment_date, is_adjustment)
    `)
    .lte("start_date", monthEnd)
    .or(`expected_end_date.gte.${monthStart},status.neq.closed`)
    .order("start_date");

  // New sessions started in month
  const { data: newSessions } = await supabase
    .from("parking_sessions")
    .select("id, start_date, boat:boats(name)")
    .gte("start_date", monthStart)
    .lte("start_date", monthEnd);

  // Sessions closed/exited in month
  const { data: closedSessions } = await supabase
    .from("parking_sessions")
    .select("id, actual_exit_date, boat:boats(name)")
    .gte("actual_exit_date", monthStart)
    .lte("actual_exit_date", monthEnd)
    .eq("status", "closed");

  // Outstanding balances at end of month
  const { data: overdueAtMonth } = await supabase
    .from("parking_sessions")
    .select("id, remaining_balance, boat:boats(name)")
    .lte("expected_end_date", monthEnd)
    .gt("remaining_balance", 0)
    .neq("status", "closed");

  // Compute monthly stats
  const totalCollected = (monthPayments || []).reduce((s, p: any) => s + Number(p.amount), 0);
  const paymentCount   = (monthPayments || []).filter((p: any) => !p.is_adjustment).length;
  const adjustments    = (monthPayments || []).filter((p: any) => p.is_adjustment).length;
  const totalOutstanding = (overdueAtMonth || []).reduce((s, p: any) => s + Number(p.remaining_balance), 0);
  const avgPayment = paymentCount > 0 ? totalCollected / paymentCount : 0;

  // All-time monthly summary
  let allMonthlyData: any[] = [];
  if (report === "allmonths") {
    const { data: allPayments } = await supabase
      .from("payments")
      .select("payment_date, amount, is_adjustment")
      .order("payment_date", { ascending: false });

    const byMonth: Record<string, { month: string; total: number; count: number }> = {};
    (allPayments || []).forEach((p: any) => {
      const month = p.payment_date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { month, total: 0, count: 0 };
      byMonth[month].total += Number(p.amount);
      byMonth[month].count += 1;
    });
    allMonthlyData = Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
  }

  // Other report types
  let sessions: ActiveSessionView[] = [];
  const baseQuery = supabase.from("active_sessions_view").select("*");

  if (report === "active") {
    const { data } = await baseQuery.in("status", ["active", "ending_soon"]).order("expected_end_date");
    sessions = (data as ActiveSessionView[]) || [];
  } else if (report === "unpaid") {
    const { data } = await baseQuery.gt("remaining_balance", 0).order("remaining_balance", { ascending: false });
    sessions = (data as ActiveSessionView[]) || [];
  } else if (report === "ending30") {
    const future30 = new Date(); future30.setDate(future30.getDate() + 30);
    const { data } = await baseQuery
      .gte("expected_end_date", new Date().toISOString().split("T")[0])
      .lte("expected_end_date", future30.toISOString().split("T")[0])
      .order("expected_end_date");
    sessions = (data as ActiveSessionView[]) || [];
  } else if (report === "overdue") {
    const { data } = await baseQuery.eq("status", "overdue").order("days_overdue", { ascending: false });
    sessions = (data as ActiveSessionView[]) || [];
  }

  const totalBalance   = sessions.reduce((s, r) => s + Number(r.remaining_balance), 0);
  const totalCollectedSessions = sessions.reduce((s, r) => s + Number(r.total_paid), 0);

  const selectedMonthLabel = monthOptions.find(o => o.value === selectedMonth)?.label || selectedMonth;

  const REPORT_TYPES: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "monthly",   label: t("monthlySummary"),  icon: <IconReports size={15} /> },
    { key: "active",    label: t("activeBoats"),      icon: <IconBoat size={15} /> },
    { key: "unpaid",    label: t("unpaid"),            icon: <IconCurrency size={15} /> },
    { key: "ending30",  label: t("ending30Days"),      icon: <IconClock size={15} /> },
    { key: "overdue",   label: t("overdueReport"),     icon: <IconWarning size={15} /> },
    { key: "allmonths", label: "All Months",            icon: <IconCalendar size={15} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("reportsTitle")}</h1>
          <p className="text-sm text-slate-500">
            {report === "monthly" ? selectedMonthLabel : ""}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {report === "monthly" && (
            <MonthlyReportClient
              month={selectedMonth}
              monthLabel={selectedMonthLabel}
              marina={MARINA_CONFIG.name}
              location={MARINA_CONFIG.location}
              stats={{
                totalCollected, paymentCount, adjustments,
                totalOutstanding, avgPayment,
                newSessions: newSessions?.length ?? 0,
                closedSessions: closedSessions?.length ?? 0,
                activeSessions: activeDuringMonth?.length ?? 0,
              }}
              payments={monthPayments || []}
              sessions={activeDuringMonth || []}
            />
          )}
          {report !== "monthly" && (
            <ReportExportClient sessions={sessions} monthlyData={allMonthlyData} reportType={report} />
          )}
        </div>
      </div>

      {/* Report type tabs */}
      <div className="card px-5 py-4 flex gap-2 flex-wrap">
        {REPORT_TYPES.map((r) => (
          <Link key={r.key}
            href={`/reports?report=${r.key}${r.key === "monthly" ? `&month=${selectedMonth}` : ""}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              report === r.key
                ? "bg-[#0A1628] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}>
            {r.icon} {r.label}
          </Link>
        ))}
      </div>

      {/* ── MONTHLY REPORT ── */}
      {report === "monthly" && (
        <div className="space-y-5">
          <MonthPicker selectedMonth={selectedMonth} monthOptions={monthOptions} monthLabel={selectedMonthLabel} />


          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-emerald-600 num">{formatOMR(totalCollected)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Revenue Collected</p>
              <p className="text-xs text-slate-400">{paymentCount} payment{paymentCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-red-500 num">{formatOMR(totalOutstanding)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Outstanding Balance</p>
              <p className="text-xs text-slate-400">{overdueAtMonth?.length ?? 0} sessions overdue</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-teal-600">{activeDuringMonth?.length ?? 0}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Active Sessions</p>
              <p className="text-xs text-slate-400">{newSessions?.length ?? 0} new this month</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-slate-700 num">{formatOMR(avgPayment)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">Avg Payment</p>
              <p className="text-xs text-slate-400">{adjustments} adjustment{adjustments !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Payments table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 font-display">
                Payments in {selectedMonthLabel}
              </h2>
              <span className="text-sm text-slate-400">{monthPayments?.length ?? 0} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Vessel</th><th>Spot</th>
                    <th>Amount</th><th>Method</th><th>Type</th><th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {monthPayments && monthPayments.length > 0 ? (
                    monthPayments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="text-sm text-slate-700 whitespace-nowrap">{formatDate(p.payment_date)}</td>
                        <td>
                          {p.session?.boat ? (
                            <Link href={`/boats/${p.session.boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">
                              {p.session.boat.name}
                            </Link>
                          ) : "—"}
                        </td>
                        <td className="font-mono font-semibold text-sm">{p.session?.parking_spot?.spot_number || "—"}</td>
                        <td>
                          <span className={`num font-bold text-sm ${Number(p.amount) < 0 ? "text-red-600" : "text-emerald-700"}`}>
                            {formatOMR(Math.abs(p.amount))}
                          </span>
                        </td>
                        <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                        <td>
                          {p.is_adjustment
                            ? <span className="badge bg-purple-100 text-purple-800 border-purple-200">Adjustment</span>
                            : <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">Payment</span>}
                        </td>
                        <td className="text-xs font-mono text-slate-500">{p.reference_number || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="text-center py-10 text-slate-400">No payments recorded in {selectedMonthLabel}</td></tr>
                  )}
                </tbody>
                {monthPayments && monthPayments.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="px-4 py-3 font-bold text-slate-700">Total</td>
                      <td className="px-4 py-3 font-black text-emerald-700 num">{formatOMR(totalCollected)}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Active sessions table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 font-display">
                Sessions Active in {selectedMonthLabel}
              </h2>
              <span className="text-sm text-slate-400">{activeDuringMonth?.length ?? 0} sessions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Vessel</th><th>Spot</th><th>Start</th>
                    <th>Expected End</th><th>Total Due</th><th>Paid</th><th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeDuringMonth || []).map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <Link href={`/boats/${s.boat?.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">
                          {s.boat?.name || "—"}
                        </Link>
                        <p className="text-xs font-mono text-slate-400">{s.boat?.registration_number}</p>
                      </td>
                      <td className="font-mono font-semibold text-sm">{s.parking_spot?.spot_number || "—"}</td>
                      <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                      <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                      <td className="num text-sm font-semibold">{formatOMR(s.total_due)}</td>
                      <td className="num text-sm font-semibold text-emerald-600">{formatOMR(s.total_paid)}</td>
                      <td className={`num text-sm font-bold ${Number(s.remaining_balance) > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {formatOMR(s.remaining_balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL MONTHS SUMMARY ── */}
      {report === "allmonths" && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 font-display">All Months — Payment Summary</h2>
            <ReportExportClient sessions={[]} monthlyData={allMonthlyData} reportType="monthly" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr><th>Month</th><th>Payments</th><th>Total Collected</th><th>Average</th><th></th></tr>
              </thead>
              <tbody>
                {allMonthlyData.map((m) => (
                  <tr key={m.month}>
                    <td className="font-semibold text-slate-800">{m.month}</td>
                    <td className="num text-sm">{m.count}</td>
                    <td className="num font-bold text-emerald-700">{formatOMR(m.total)}</td>
                    <td className="num text-sm text-slate-600">{formatOMR(m.total / m.count)}</td>
                    <td>
                      <Link href={`/reports?report=monthly&month=${m.month}`}
                        className="btn-ghost text-xs py-1">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── OTHER REPORTS ── */}
      {!["monthly","allmonths"].includes(report) && (
        <>
          {sessions.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card">
                <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
                <p className="text-sm font-semibold text-slate-600">Total Sessions</p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-bold text-emerald-600 num">{formatOMR(totalCollectedSessions)}</p>
                <p className="text-sm font-semibold text-slate-600">Total Collected</p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-bold text-red-600 num">{formatOMR(totalBalance)}</p>
                <p className="text-sm font-semibold text-slate-600">Total Outstanding</p>
              </div>
            </div>
          )}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Vessel</th><th>Owner</th><th>Spot</th><th>Status</th>
                    <th>Start</th><th>End Date</th><th>Days Left</th>
                    <th>Total Due</th><th>Paid</th><th>Balance</th><th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const payStatus = getPaymentStatus(s.total_due, s.total_paid, s.status);
                    return (
                      <tr key={s.session_id}>
                        <td>
                          <Link href={`/boats/${s.boat_id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">
                            {s.boat_name}
                          </Link>
                          <p className="text-xs font-mono text-slate-400">{s.registration_number}</p>
                        </td>
                        <td>
                          <p className="text-sm text-slate-700">{s.owner_name || "—"}</p>
                          <p className="text-xs text-slate-400">{s.owner_phone}</p>
                        </td>
                        <td className="font-mono font-semibold text-sm">{s.spot_number}</td>
                        <td><SessionStatusBadge status={s.status} /></td>
                        <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                        <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                        <td>
                          <span className={`num text-sm font-semibold ${s.days_remaining < 0 ? "text-red-600" : s.days_remaining <= 7 ? "text-amber-600" : "text-slate-600"}`}>
                            {s.days_remaining < 0 ? `+${Math.abs(s.days_remaining)}d over` : `${s.days_remaining}d`}
                          </span>
                        </td>
                        <td className="num text-sm font-semibold">{formatOMR(s.total_due)}</td>
                        <td className="num text-sm font-semibold text-emerald-600">{formatOMR(s.total_paid)}</td>
                        <td className={`num text-sm font-bold ${s.remaining_balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {formatOMR(s.remaining_balance)}
                        </td>
                        <td><PaymentStatusBadge status={payStatus} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
