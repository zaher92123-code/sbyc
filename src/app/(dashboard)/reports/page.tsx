import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge } from "@/components/ui";
import type { ActiveSessionView } from "@/types";
import MonthlyReportClient from "@/components/reports/MonthlyReportClient";
import MonthPicker from "@/components/reports/MonthPicker";
import ReportExportClient from "@/components/reports/ReportExportClient";
import CollapsibleSection from "@/components/reports/CollapsibleSection";
import { IconReports, IconBoat, IconCurrency, IconClock, IconWarning, IconCalendar, IconTrendingUp } from "@/components/ui/Icons";
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

function getYearOptions() {
  const now = new Date();
  const options = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
    options.push({ value: String(y), label: String(y) });
  }
  return options;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ report?: string; month?: string; year?: string }>;
}) {
  const t = await getT();
  const params = await searchParams;
  const report = params.report || "monthly";

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = params.month || defaultMonth;
  const selectedYear = params.year || String(now.getFullYear());
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();

  const supabase = await createClient();

  // ── DATA FETCHES ─────────────────────────────────────────────────────────
  const monthStart = `${selectedMonth}-01`;
  const [yr, mn] = selectedMonth.split("-").map(Number);
  const monthEnd = new Date(yr, mn, 0).toISOString().split("T")[0];

  const { data: monthPayments } = await supabase
    .from("payments")
    .select(`*, session:parking_sessions(id, total_due, total_paid, remaining_balance, start_date, expected_end_date, boat:boats(id, name, registration_number, type), parking_spot:parking_spots(spot_number))`)
    .gte("payment_date", monthStart).lte("payment_date", monthEnd).order("payment_date");

  const { data: monthServiceOrders } = await supabase
    .from("service_orders").select("id, total_amount_omr, payment_status, status, scheduled_date, service:services(name)")
    .gte("scheduled_date", monthStart).lte("scheduled_date", monthEnd);

  const { data: monthRentals } = await supabase
    .from("rentals").select("id, monthly_rate_omr, status, service:services(name)").eq("status", "active");

  const { data: monthExpenses } = await supabase
    .from("expenses").select("id, amount_omr, category:expense_categories(name_en, name_ar)")
    .gte("expense_date", monthStart).lte("expense_date", monthEnd);

  const { data: monthEmployees } = await supabase
    .from("employees").select("id, name_en, base_salary_omr, allowances_omr, deductions_omr").eq("employment_status", "active");

  const { data: activeDuringMonth } = await supabase
    .from("parking_sessions")
    .select(`*, boat:boats(id, name, registration_number, type), parking_spot:parking_spots(spot_number), payments(amount, payment_date, is_adjustment)`)
    .lte("start_date", monthEnd).or(`expected_end_date.gte.${monthStart},status.neq.closed`).order("start_date");

  const { data: newSessions } = await supabase
    .from("parking_sessions").select("id, start_date, boat:boats(name)")
    .gte("start_date", monthStart).lte("start_date", monthEnd);

  const { data: closedSessions } = await supabase
    .from("parking_sessions").select("id, actual_exit_date, boat:boats(name)")
    .gte("actual_exit_date", monthStart).lte("actual_exit_date", monthEnd).eq("status", "closed");

  const { data: overdueAtMonth } = await supabase
    .from("parking_sessions").select("id, remaining_balance, boat:boats(name)")
    .lte("expected_end_date", monthEnd).gt("remaining_balance", 0).neq("status", "closed");

  // ── COMPUTE ──────────────────────────────────────────────────────────────
  const parkingRevenue = (monthPayments || []).reduce((s, p: any) => s + Number(p.amount), 0);
  const paymentCount = (monthPayments || []).filter((p: any) => !p.is_adjustment).length;
  const adjustments = (monthPayments || []).filter((p: any) => p.is_adjustment).length;
  const totalOutstanding = (overdueAtMonth || []).reduce((s, p: any) => s + Number(p.remaining_balance), 0);
  const avgPayment = paymentCount > 0 ? parkingRevenue / paymentCount : 0;

  const serviceRevenue = (monthServiceOrders || [])
    .filter((o: any) => o.payment_status === "paid")
    .reduce((s, o: any) => s + Number(o.total_amount_omr), 0);

  const rentalIncome = (monthRentals || []).reduce((s, r: any) => s + Number(r.monthly_rate_omr), 0);
  const totalRevenue = parkingRevenue + serviceRevenue + rentalIncome;

  const totalExpenses = (monthExpenses || []).reduce((s, e: any) => s + Number(e.amount_omr), 0);
  const totalSalaries = (monthEmployees || []).reduce((s, e: any) =>
    s + Number(e.base_salary_omr) + Number(e.allowances_omr) - Number(e.deductions_omr), 0);
  const totalCosts = totalExpenses + totalSalaries;
  const netProfit = totalRevenue - totalCosts;

  // Expense by category
  const expenseByCategory: Record<string, { name: string; total: number }> = {};
  (monthExpenses || []).forEach((e: any) => {
    const name = e.category?.name_en || "Other";
    if (!expenseByCategory[name]) expenseByCategory[name] = { name, total: 0 };
    expenseByCategory[name].total += Number(e.amount_omr);
  });
  const expenseCategories = Object.values(expenseByCategory).sort((a, b) => b.total - a.total);

  // ── YEARLY ───────────────────────────────────────────────────────────────
  let yearlyData: { month: string; parking: number; services: number; rentals: number; expenses: number; salaries: number }[] = [];

  if (report === "yearly") {
    const yearStart = `${selectedYear}-01-01`;
    const yearEnd = `${selectedYear}-12-31`;

    const [{ data: yp }, { data: ys }, { data: ye }] = await Promise.all([
      supabase.from("payments").select("payment_date, amount").gte("payment_date", yearStart).lte("payment_date", yearEnd),
      supabase.from("service_orders").select("scheduled_date, total_amount_omr").gte("scheduled_date", yearStart).lte("scheduled_date", yearEnd).eq("payment_status", "paid"),
      supabase.from("expenses").select("expense_date, amount_omr").gte("expense_date", yearStart).lte("expense_date", yearEnd),
    ]);

    const months: Record<string, { parking: number; services: number; rentals: number; expenses: number; salaries: number }> = {};
    for (let m = 1; m <= 12; m++) {
      const key = `${selectedYear}-${String(m).padStart(2, "0")}`;
      months[key] = { parking: 0, services: 0, rentals: 0, expenses: 0, salaries: 0 };
    }
    (yp || []).forEach((p: any) => { const k = p.payment_date.slice(0, 7); if (months[k]) months[k].parking += Number(p.amount); });
    (ys || []).forEach((o: any) => { const k = o.scheduled_date.slice(0, 7); if (months[k]) months[k].services += Number(o.total_amount_omr); });
    (ye || []).forEach((e: any) => { const k = e.expense_date.slice(0, 7); if (months[k]) months[k].expenses += Number(e.amount_omr); });

    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    Object.keys(months).forEach(key => {
      if (selectedYear === String(now.getFullYear()) && key > currentKey) { delete months[key]; }
      else { months[key].salaries = totalSalaries; months[key].rentals = rentalIncome; }
    });
    yearlyData = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => ({ month, ...d }));
  }

  // ── ALL MONTHS ───────────────────────────────────────────────────────────
  let allMonthlyData: any[] = [];
  if (report === "allmonths") {
    const { data: allPayments } = await supabase.from("payments").select("payment_date, amount").order("payment_date", { ascending: false });
    const byMonth: Record<string, { month: string; total: number; count: number }> = {};
    (allPayments || []).forEach((p: any) => {
      const m = p.payment_date.slice(0, 7);
      if (!byMonth[m]) byMonth[m] = { month: m, total: 0, count: 0 };
      byMonth[m].total += Number(p.amount); byMonth[m].count += 1;
    });
    allMonthlyData = Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
  }

  // ── SESSION REPORTS ──────────────────────────────────────────────────────
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
    const { data } = await baseQuery.gte("expected_end_date", new Date().toISOString().split("T")[0]).lte("expected_end_date", future30.toISOString().split("T")[0]).order("expected_end_date");
    sessions = (data as ActiveSessionView[]) || [];
  } else if (report === "overdue") {
    const { data } = await baseQuery.eq("status", "overdue").order("days_overdue", { ascending: false });
    sessions = (data as ActiveSessionView[]) || [];
  }

  const totalBalance = sessions.reduce((s, r) => s + Number(r.remaining_balance), 0);
  const totalCollectedSessions = sessions.reduce((s, r) => s + Number(r.total_paid), 0);
  const selectedMonthLabel = monthOptions.find(o => o.value === selectedMonth)?.label || selectedMonth;

  // Yearly totals
  const yearTotalParking = yearlyData.reduce((s, m) => s + m.parking, 0);
  const yearTotalServices = yearlyData.reduce((s, m) => s + m.services, 0);
  const yearTotalRentals = yearlyData.reduce((s, m) => s + m.rentals, 0);
  const yearTotalExpenses = yearlyData.reduce((s, m) => s + m.expenses, 0);
  const yearTotalSalaries = yearlyData.reduce((s, m) => s + m.salaries, 0);
  const yearTotalRevenue = yearTotalParking + yearTotalServices + yearTotalRentals;
  const yearTotalCosts = yearTotalExpenses + yearTotalSalaries;
  const yearNetProfit = yearTotalRevenue - yearTotalCosts;

  const REPORT_TABS = [
    { key: "monthly",   label: t("monthlySummary"),  icon: <IconReports size={15} /> },
    { key: "yearly",    label: t("yearlyOverview"),   icon: <IconTrendingUp size={15} /> },
    { key: "allmonths", label: t("allMonths"),         icon: <IconCalendar size={15} /> },
  ];
  const SESSION_TABS = [
    { key: "active",   label: t("activeBoats"),    icon: <IconBoat size={15} /> },
    { key: "unpaid",   label: t("unpaid"),         icon: <IconCurrency size={15} /> },
    { key: "ending30", label: t("ending30Days"),   icon: <IconClock size={15} /> },
    { key: "overdue",  label: t("overdueReport"),  icon: <IconWarning size={15} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("reportsTitle")}</h1>
          <p className="text-sm text-slate-500">
            {report === "monthly" ? selectedMonthLabel : report === "yearly" ? selectedYear : ""}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {report === "monthly" && (
            <MonthlyReportClient month={selectedMonth} monthLabel={selectedMonthLabel}
              marina={MARINA_CONFIG.name} location={MARINA_CONFIG.location}
              stats={{ totalCollected: parkingRevenue, paymentCount, adjustments, totalOutstanding, avgPayment,
                newSessions: newSessions?.length ?? 0, closedSessions: closedSessions?.length ?? 0,
                activeSessions: activeDuringMonth?.length ?? 0, serviceRevenue, rentalIncome, totalExpenses, totalSalaries, netProfit }}
              payments={monthPayments || []} sessions={activeDuringMonth || []} />
          )}
          {!["monthly", "yearly"].includes(report) && (
            <ReportExportClient sessions={sessions} monthlyData={allMonthlyData} reportType={report} />
          )}
        </div>
      </div>

      {/* Tabs — Financial reports */}
      <div className="card px-5 py-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {REPORT_TABS.map((r) => (
            <Link key={r.key}
              href={`/reports?report=${r.key}${r.key === "monthly" ? `&month=${selectedMonth}` : r.key === "yearly" ? `&year=${selectedYear}` : ""}`}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                report === r.key ? "bg-[#0A1628] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}>{r.icon} {r.label}</Link>
          ))}
          <span className="w-px bg-slate-200 mx-1" />
          {SESSION_TABS.map((r) => (
            <Link key={r.key}
              href={`/reports?report=${r.key}`}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                report === r.key ? "bg-slate-700 text-white shadow-sm" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}>{r.icon} {r.label}</Link>
          ))}
        </div>
      </div>

      {/* ══════════ MONTHLY ══════════ */}
      {report === "monthly" && (
        <div className="space-y-5">
          <MonthPicker selectedMonth={selectedMonth} monthOptions={monthOptions} monthLabel={selectedMonthLabel} />

          {/* Profit/Loss Summary — 3 key numbers */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-emerald-600 num">{formatOMR(totalRevenue)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{t("totalRevenue")}</p>
              <div className="mt-2 flex justify-center gap-3 text-[10px] text-slate-400">
                <span>{t("parking")}: {formatOMR(parkingRevenue)}</span>
                <span>·</span>
                <span>{t("services")}: {formatOMR(serviceRevenue)}</span>
                <span>·</span>
                <span>{t("rentalsLabel")}: {formatOMR(rentalIncome)}</span>
              </div>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-red-500 num">{formatOMR(totalCosts)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{t("totalCosts")}</p>
              <div className="mt-2 flex justify-center gap-3 text-[10px] text-slate-400">
                <span>{t("expenses")}: {formatOMR(totalExpenses)}</span>
                <span>·</span>
                <span>{t("salaries")}: {formatOMR(totalSalaries)}</span>
              </div>
            </div>
            <div className={`card p-5 text-center border-l-4 ${netProfit >= 0 ? "border-l-emerald-500" : "border-l-red-500"}`}>
              <p className={`text-3xl font-black num ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatOMR(netProfit)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{t("netProfitReport")}</p>
              <p className="mt-2 text-[10px] text-slate-400">{netProfit >= 0 ? "✓ " + t("profit") : "⚠ " + t("loss")}</p>
            </div>
          </div>

          {/* Compact breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-5 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("revenueBreakdownReport")}</h3>
              <div className="flex justify-between text-sm"><span className="text-slate-600">{t("parkingRevenue")}</span><span className="num font-semibold text-emerald-600">{formatOMR(parkingRevenue)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">{t("serviceRevenue")}</span><span className="num font-semibold text-blue-600">{formatOMR(serviceRevenue)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">{t("rentalIncome")}</span><span className="num font-semibold text-cyan-600">{formatOMR(rentalIncome)}</span></div>
            </div>
            <div className="card p-5 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">{t("costsBreakdown")}</h3>
              <div className="flex justify-between text-sm"><span className="text-slate-600">{t("employeeSalaries")}</span><span className="num font-semibold text-red-500">{formatOMR(totalSalaries)}</span></div>
              {expenseCategories.map((cat) => (
                <div key={cat.name} className="flex justify-between text-sm"><span className="text-slate-500 pl-2">· {cat.name}</span><span className="num text-xs text-slate-500">{formatOMR(cat.total)}</span></div>
              ))}
              {expenseCategories.length === 0 && (
                <div className="flex justify-between text-sm"><span className="text-slate-600">{t("operatingExpenses")}</span><span className="num font-semibold text-red-500">{formatOMR(totalExpenses)}</span></div>
              )}
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-slate-700">{activeDuringMonth?.length ?? 0}</p>
              <p className="text-[10px] text-slate-400">{t("activeSessions")}</p>
            </div>
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-red-500 num">{formatOMR(totalOutstanding)}</p>
              <p className="text-[10px] text-slate-400">{t("outstandingBalanceReport")}</p>
            </div>
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-slate-700">{newSessions?.length ?? 0} / {closedSessions?.length ?? 0}</p>
              <p className="text-[10px] text-slate-400">{t("newThisMonth")} / {t("closedSessionsLabel")}</p>
            </div>
            <div className="card px-4 py-3 text-center">
              <p className="text-lg font-bold text-slate-700 num">{formatOMR(avgPayment)}</p>
              <p className="text-[10px] text-slate-400">{t("avgPaymentLabel")}</p>
            </div>
          </div>

          {/* Collapsible: Payments */}
          <CollapsibleSection title={`${t("paymentsIn")} ${selectedMonthLabel}`} subtitle={`${monthPayments?.length ?? 0} ${t("records")}`}>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr>
                  <th>{t("date")}</th><th>{t("vesselHeader")}</th><th>{t("spotHeader")}</th>
                  <th>{t("amount")}</th><th>{t("method")}</th><th>{t("typeHeader")}</th><th>{t("reference")}</th>
                </tr></thead>
                <tbody>
                  {monthPayments && monthPayments.length > 0 ? monthPayments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="text-sm text-slate-700 whitespace-nowrap">{formatDate(p.payment_date)}</td>
                      <td>{p.session?.boat ? <Link href={`/boats/${p.session.boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{p.session.boat.name}</Link> : "—"}</td>
                      <td className="font-mono font-semibold text-sm">{p.session?.parking_spot?.spot_number || "—"}</td>
                      <td><span className={`num font-bold text-sm ${Number(p.amount) < 0 ? "text-red-600" : "text-emerald-700"}`}>{formatOMR(Math.abs(p.amount))}</span></td>
                      <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                      <td>{p.is_adjustment ? <span className="badge bg-purple-100 text-purple-800 border-purple-200">{t("adjustment")}</span> : <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">{t("payment")}</span>}</td>
                      <td className="text-xs font-mono text-slate-500">{p.reference_number || "—"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="text-center py-10 text-slate-400">{t("noPaymentsInMonth")} {selectedMonthLabel}</td></tr>
                  )}
                </tbody>
                {monthPayments && monthPayments.length > 0 && (
                  <tfoot><tr className="bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 font-bold text-slate-700">{t("total")}</td>
                    <td className="px-4 py-3 font-black text-emerald-700 num">{formatOMR(parkingRevenue)}</td>
                    <td colSpan={3}></td>
                  </tr></tfoot>
                )}
              </table>
            </div>
          </CollapsibleSection>

          {/* Collapsible: Sessions */}
          <CollapsibleSection title={`${t("sessionsActiveIn")} ${selectedMonthLabel}`} subtitle={`${activeDuringMonth?.length ?? 0} ${t("sessions")}`}>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr>
                  <th>{t("vesselHeader")}</th><th>{t("spotHeader")}</th><th>{t("startDate")}</th>
                  <th>{t("expectedEnd")}</th><th>{t("totalDue")}</th><th>{t("totalPaid")}</th><th>{t("balance")}</th>
                </tr></thead>
                <tbody>
                  {(activeDuringMonth || []).map((s: any) => (
                    <tr key={s.id}>
                      <td><Link href={`/boats/${s.boat?.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{s.boat?.name || "—"}</Link>
                        <p className="text-xs font-mono text-slate-400">{s.boat?.registration_number}</p></td>
                      <td className="font-mono font-semibold text-sm">{s.parking_spot?.spot_number || "—"}</td>
                      <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                      <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                      <td className="num text-sm font-semibold">{formatOMR(s.total_due)}</td>
                      <td className="num text-sm font-semibold text-emerald-600">{formatOMR(s.total_paid)}</td>
                      <td className={`num text-sm font-bold ${Number(s.remaining_balance) > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatOMR(s.remaining_balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* ══════════ YEARLY ══════════ */}
      {report === "yearly" && (
        <div className="space-y-5">
          {/* Year picker */}
          <div className="card px-5 py-4 flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5"><IconCalendar size={15} /> {t("selectYear")}</span>
            <div className="flex gap-2">
              {yearOptions.map(o => (
                <Link key={o.value} href={`/reports?report=yearly&year=${o.value}`}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedYear === o.value ? "bg-[#0A1628] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}>{o.label}</Link>
              ))}
            </div>
          </div>

          {/* Year summary - 3 key numbers */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-emerald-600 num">{formatOMR(yearTotalRevenue)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{t("totalRevenue")}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-black text-red-500 num">{formatOMR(yearTotalCosts)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{t("totalCosts")}</p>
            </div>
            <div className={`card p-5 text-center border-l-4 ${yearNetProfit >= 0 ? "border-l-emerald-500" : "border-l-red-500"}`}>
              <p className={`text-3xl font-black num ${yearNetProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatOMR(yearNetProfit)}</p>
              <p className="text-sm font-semibold text-slate-600 mt-1">{t("netProfitReport")}</p>
            </div>
          </div>

          {/* Monthly breakdown table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 font-display">{t("monthlyBreakdown")} — {selectedYear}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table text-sm">
                <thead><tr>
                  <th>{t("month")}</th>
                  <th>{t("parkingRevenue")}</th><th>{t("serviceRevenue")}</th><th>{t("rentalIncome")}</th>
                  <th className="bg-emerald-900 text-emerald-100">{t("totalRevenue")}</th>
                  <th>{t("operatingExpenses")}</th><th>{t("salaries")}</th>
                  <th className="bg-red-900 text-red-100">{t("totalCosts")}</th>
                  <th className="bg-slate-700">{t("netProfitReport")}</th>
                  <th></th>
                </tr></thead>
                <tbody>
                  {yearlyData.map((m) => {
                    const rev = m.parking + m.services + m.rentals;
                    const cost = m.expenses + m.salaries;
                    const profit = rev - cost;
                    const lbl = new Date(`${m.month}-01`).toLocaleDateString("en-GB", { month: "short" });
                    return (
                      <tr key={m.month}>
                        <td className="font-semibold text-slate-800">{lbl}</td>
                        <td className="num text-emerald-600">{formatOMR(m.parking)}</td>
                        <td className="num text-blue-600">{formatOMR(m.services)}</td>
                        <td className="num text-cyan-600">{formatOMR(m.rentals)}</td>
                        <td className="num font-bold text-emerald-700 bg-emerald-50">{formatOMR(rev)}</td>
                        <td className="num text-red-500">{formatOMR(m.expenses)}</td>
                        <td className="num text-red-500">{formatOMR(m.salaries)}</td>
                        <td className="num font-bold text-red-600 bg-red-50">{formatOMR(cost)}</td>
                        <td className={`num font-bold ${profit >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>{formatOMR(profit)}</td>
                        <td><Link href={`/reports?report=monthly&month=${m.month}`} className="btn-ghost text-xs py-1">{t("viewArrow")}</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot><tr className="bg-slate-50 border-t-2 border-slate-300">
                  <td className="px-4 py-3 font-black text-slate-800">{t("total")}</td>
                  <td className="px-4 py-3 num font-bold text-emerald-700">{formatOMR(yearTotalParking)}</td>
                  <td className="px-4 py-3 num font-bold text-blue-700">{formatOMR(yearTotalServices)}</td>
                  <td className="px-4 py-3 num font-bold text-cyan-700">{formatOMR(yearTotalRentals)}</td>
                  <td className="px-4 py-3 num font-black text-emerald-800 bg-emerald-100">{formatOMR(yearTotalRevenue)}</td>
                  <td className="px-4 py-3 num font-bold text-red-600">{formatOMR(yearTotalExpenses)}</td>
                  <td className="px-4 py-3 num font-bold text-red-600">{formatOMR(yearTotalSalaries)}</td>
                  <td className="px-4 py-3 num font-black text-red-700 bg-red-100">{formatOMR(yearTotalCosts)}</td>
                  <td className={`px-4 py-3 num font-black ${yearNetProfit >= 0 ? "text-emerald-800 bg-emerald-100" : "text-red-800 bg-red-100"}`}>{formatOMR(yearNetProfit)}</td>
                  <td></td>
                </tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ ALL MONTHS ══════════ */}
      {report === "allmonths" && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 font-display">{t("allMonthsPayment")}</h2>
            <ReportExportClient sessions={[]} monthlyData={allMonthlyData} reportType="monthly" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead><tr><th>{t("month")}</th><th>{t("numberOfPayments")}</th><th>{t("totalCollectedLabel")}</th><th>{t("average")}</th><th></th></tr></thead>
              <tbody>
                {allMonthlyData.map((m) => (
                  <tr key={m.month}>
                    <td className="font-semibold text-slate-800">{m.month}</td>
                    <td className="num text-sm">{m.count}</td>
                    <td className="num font-bold text-emerald-700">{formatOMR(m.total)}</td>
                    <td className="num text-sm text-slate-600">{formatOMR(m.total / m.count)}</td>
                    <td><Link href={`/reports?report=monthly&month=${m.month}`} className="btn-ghost text-xs py-1">{t("viewArrow")}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ SESSION REPORTS ══════════ */}
      {["active", "unpaid", "ending30", "overdue"].includes(report) && (
        <>
          {sessions.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card"><p className="text-2xl font-bold text-slate-900">{sessions.length}</p><p className="text-sm font-semibold text-slate-600">{t("totalSessions")}</p></div>
              <div className="stat-card"><p className="text-2xl font-bold text-emerald-600 num">{formatOMR(totalCollectedSessions)}</p><p className="text-sm font-semibold text-slate-600">{t("totalCollectedLabel")}</p></div>
              <div className="stat-card"><p className="text-2xl font-bold text-red-600 num">{formatOMR(totalBalance)}</p><p className="text-sm font-semibold text-slate-600">{t("totalOutstanding")}</p></div>
            </div>
          )}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr>
                  <th>{t("vesselHeader")}</th><th>{t("ownerHeader")}</th><th>{t("spotHeader")}</th><th>{t("statusHeader")}</th>
                  <th>{t("startDate")}</th><th>{t("expectedEnd")}</th><th>{t("daysLeft")}</th>
                  <th>{t("totalDue")}</th><th>{t("totalPaid")}</th><th>{t("balance")}</th><th>{t("paymentStatusHeader")}</th>
                </tr></thead>
                <tbody>
                  {sessions.map((s) => {
                    const payStatus = getPaymentStatus(s.total_due, s.total_paid, s.status);
                    return (
                      <tr key={s.session_id}>
                        <td><Link href={`/boats/${s.boat_id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{s.boat_name}</Link>
                          <p className="text-xs font-mono text-slate-400">{s.registration_number}</p></td>
                        <td><p className="text-sm text-slate-700">{s.owner_name || "—"}</p><p className="text-xs text-slate-400">{s.owner_phone}</p></td>
                        <td className="font-mono font-semibold text-sm">{s.spot_number}</td>
                        <td><SessionStatusBadge status={s.status} /></td>
                        <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                        <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                        <td><span className={`num text-sm font-semibold ${s.days_remaining < 0 ? "text-red-600" : s.days_remaining <= 7 ? "text-amber-600" : "text-slate-600"}`}>
                          {s.days_remaining < 0 ? `+${Math.abs(s.days_remaining)}d ${t("over")}` : `${s.days_remaining}d`}
                        </span></td>
                        <td className="num text-sm font-semibold">{formatOMR(s.total_due)}</td>
                        <td className="num text-sm font-semibold text-emerald-600">{formatOMR(s.total_paid)}</td>
                        <td className={`num text-sm font-bold ${s.remaining_balance > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatOMR(s.remaining_balance)}</td>
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
