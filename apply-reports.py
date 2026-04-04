#!/usr/bin/env python3
import os, sys
ROOT = os.getcwd()

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    print(f"  ✓ {path}")

print("\n📊 Installing monthly reports...\n")

write("src/app/(dashboard)/reports/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge } from "@/components/ui";
import type { ActiveSessionView } from "@/types";
import MonthlyReportClient from "@/components/reports/MonthlyReportClient";
import ReportExportClient from "@/components/reports/ReportExportClient";
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
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = params.month || defaultMonth;
  const monthOptions = getMonthOptions();
  const supabase = await createClient();

  const monthStart = `${selectedMonth}-01`;
  const [year, mon] = selectedMonth.split("-").map(Number);
  const monthEnd = new Date(year, mon, 0).toISOString().split("T")[0];

  const { data: monthPayments } = await supabase
    .from("payments")
    .select(`*, session:parking_sessions(id, total_due, total_paid, remaining_balance, start_date, expected_end_date, boat:boats(id, name, registration_number, type), parking_spot:parking_spots(spot_number))`)
    .gte("payment_date", monthStart)
    .lte("payment_date", monthEnd)
    .order("payment_date");

  const { data: activeDuringMonth } = await supabase
    .from("parking_sessions")
    .select(`*, boat:boats(id, name, registration_number, type), parking_spot:parking_spots(spot_number), payments(amount, payment_date, is_adjustment)`)
    .lte("start_date", monthEnd)
    .or(`expected_end_date.gte.${monthStart},status.neq.closed`)
    .order("start_date");

  const { data: newSessions } = await supabase
    .from("parking_sessions").select("id").gte("start_date", monthStart).lte("start_date", monthEnd);

  const { data: closedSessions } = await supabase
    .from("parking_sessions").select("id").gte("actual_exit_date", monthStart).lte("actual_exit_date", monthEnd).eq("status", "closed");

  const { data: overdueAtMonth } = await supabase
    .from("parking_sessions").select("id, remaining_balance").lte("expected_end_date", monthEnd).gt("remaining_balance", 0).neq("status", "closed");

  const totalCollected    = (monthPayments || []).reduce((s, p: any) => s + Number(p.amount), 0);
  const paymentCount      = (monthPayments || []).filter((p: any) => !p.is_adjustment).length;
  const adjustments       = (monthPayments || []).filter((p: any) => p.is_adjustment).length;
  const totalOutstanding  = (overdueAtMonth || []).reduce((s, p: any) => s + Number(p.remaining_balance), 0);
  const avgPayment        = paymentCount > 0 ? totalCollected / paymentCount : 0;

  let allMonthlyData: any[] = [];
  if (report === "allmonths") {
    const { data: allPayments } = await supabase.from("payments").select("payment_date, amount, is_adjustment").order("payment_date", { ascending: false });
    const byMonth: Record<string, { month: string; total: number; count: number }> = {};
    (allPayments || []).forEach((p: any) => {
      const month = p.payment_date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { month, total: 0, count: 0 };
      byMonth[month].total += Number(p.amount);
      byMonth[month].count += 1;
    });
    allMonthlyData = Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
  }

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

  const totalBalance           = sessions.reduce((s, r) => s + Number(r.remaining_balance), 0);
  const totalCollectedSessions = sessions.reduce((s, r) => s + Number(r.total_paid), 0);
  const selectedMonthLabel     = monthOptions.find(o => o.value === selectedMonth)?.label || selectedMonth;

  const REPORT_TYPES = [
    { key: "monthly",   label: t("monthlySummary"), icon: "📊" },
    { key: "active",    label: t("activeBoats"),    icon: "🚢" },
    { key: "unpaid",    label: t("unpaid"),          icon: "💰" },
    { key: "ending30",  label: t("ending30Days"),   icon: "⏰" },
    { key: "overdue",   label: t("overdueReport"),  icon: "⚠️" },
    { key: "allmonths", label: "All Months",          icon: "📅" },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("reportsTitle")}</h1>
          <p className="text-sm text-slate-500">{report === "monthly" ? selectedMonthLabel : ""}</p>
        </div>
        <div className="flex gap-2 items-center">
          {report === "monthly" && (
            <MonthlyReportClient
              month={selectedMonth}
              monthLabel={selectedMonthLabel}
              marina={MARINA_CONFIG.name}
              location={MARINA_CONFIG.location}
              stats={{ totalCollected, paymentCount, adjustments, totalOutstanding, avgPayment, newSessions: newSessions?.length ?? 0, closedSessions: closedSessions?.length ?? 0, activeSessions: activeDuringMonth?.length ?? 0 }}
              payments={monthPayments || []}
              sessions={activeDuringMonth || []}
            />
          )}
          {report !== "monthly" && (
            <ReportExportClient sessions={sessions} monthlyData={allMonthlyData} reportType={report} />
          )}
        </div>
      </div>

      <div className="card px-5 py-4 flex gap-2 flex-wrap">
        {REPORT_TYPES.map((r) => (
          <Link key={r.key}
            href={`/reports?report=${r.key}${r.key === "monthly" ? `&month=${selectedMonth}` : ""}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${report === r.key ? "bg-[#0A1628] text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
            {r.icon} {r.label}
          </Link>
        ))}
      </div>

      {report === "monthly" && (
        <div className="space-y-5">
          <div className="card px-5 py-4 flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600">📅 Select Month:</span>
            <form method="get">
              <input type="hidden" name="report" value="monthly" />
              <select name="month" defaultValue={selectedMonth} onChange={e => { (e.target.form as HTMLFormElement).submit(); }} className="form-select w-56 font-semibold">
                {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </form>
            <span className="text-xs text-slate-400">Showing data for {selectedMonthLabel}</span>
          </div>

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

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 font-display">Payments in {selectedMonthLabel}</h2>
              <span className="text-sm text-slate-400">{monthPayments?.length ?? 0} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr><th>Date</th><th>Vessel</th><th>Spot</th><th>Amount</th><th>Method</th><th>Type</th><th>Reference</th></tr>
                </thead>
                <tbody>
                  {monthPayments && monthPayments.length > 0 ? monthPayments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="text-sm text-slate-700 whitespace-nowrap">{formatDate(p.payment_date)}</td>
                      <td>{p.session?.boat ? <Link href={`/boats/${p.session.boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{p.session.boat.name}</Link> : "—"}</td>
                      <td className="font-mono font-semibold text-sm">{p.session?.parking_spot?.spot_number || "—"}</td>
                      <td><span className={`num font-bold text-sm ${Number(p.amount) < 0 ? "text-red-600" : "text-emerald-700"}`}>{formatOMR(Math.abs(Number(p.amount)))}</span></td>
                      <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                      <td>{p.is_adjustment ? <span className="badge bg-purple-100 text-purple-800 border-purple-200">Adjustment</span> : <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">Payment</span>}</td>
                      <td className="text-xs font-mono text-slate-500">{p.reference_number || "—"}</td>
                    </tr>
                  )) : <tr><td colSpan={7} className="text-center py-10 text-slate-400">No payments recorded in {selectedMonthLabel}</td></tr>}
                </tbody>
                {monthPayments && monthPayments.length > 0 && (
                  <tfoot><tr className="bg-slate-50"><td colSpan={3} className="px-4 py-3 font-bold text-slate-700">Total</td><td className="px-4 py-3 font-black text-emerald-700 num">{formatOMR(totalCollected)}</td><td colSpan={3}></td></tr></tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 font-display">Sessions Active in {selectedMonthLabel}</h2>
              <span className="text-sm text-slate-400">{activeDuringMonth?.length ?? 0} sessions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr><th>Vessel</th><th>Spot</th><th>Start</th><th>Expected End</th><th>Total Due</th><th>Paid</th><th>Balance</th></tr>
                </thead>
                <tbody>
                  {(activeDuringMonth || []).map((s: any) => (
                    <tr key={s.id}>
                      <td><Link href={`/boats/${s.boat?.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{s.boat?.name || "—"}</Link><p className="text-xs font-mono text-slate-400">{s.boat?.registration_number}</p></td>
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
          </div>
        </div>
      )}

      {report === "allmonths" && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 font-display">All Months — Payment Summary</h2>
            <ReportExportClient sessions={[]} monthlyData={allMonthlyData} reportType="monthly" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead><tr><th>Month</th><th>Payments</th><th>Total Collected</th><th>Average</th><th></th></tr></thead>
              <tbody>
                {allMonthlyData.map((m) => (
                  <tr key={m.month}>
                    <td className="font-semibold text-slate-800">{m.month}</td>
                    <td className="num text-sm">{m.count}</td>
                    <td className="num font-bold text-emerald-700">{formatOMR(m.total)}</td>
                    <td className="num text-sm text-slate-600">{formatOMR(m.total / m.count)}</td>
                    <td><Link href={`/reports?report=monthly&month=${m.month}`} className="btn-ghost text-xs py-1">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!["monthly","allmonths"].includes(report) && (
        <>
          {sessions.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card"><p className="text-2xl font-bold text-slate-900">{sessions.length}</p><p className="text-sm font-semibold text-slate-600">Total Sessions</p></div>
              <div className="stat-card"><p className="text-2xl font-bold text-emerald-600 num">{formatOMR(totalCollectedSessions)}</p><p className="text-sm font-semibold text-slate-600">Total Collected</p></div>
              <div className="stat-card"><p className="text-2xl font-bold text-red-600 num">{formatOMR(totalBalance)}</p><p className="text-sm font-semibold text-slate-600">Total Outstanding</p></div>
            </div>
          )}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr><th>Vessel</th><th>Owner</th><th>Spot</th><th>Status</th><th>Start</th><th>End Date</th><th>Days Left</th><th>Total Due</th><th>Paid</th><th>Balance</th><th>Payment</th></tr></thead>
                <tbody>
                  {sessions.map((s) => {
                    const payStatus = getPaymentStatus(s.total_due, s.total_paid, s.status);
                    return (
                      <tr key={s.session_id}>
                        <td><Link href={`/boats/${s.boat_id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{s.boat_name}</Link><p className="text-xs font-mono text-slate-400">{s.registration_number}</p></td>
                        <td><p className="text-sm text-slate-700">{s.owner_name || "—"}</p><p className="text-xs text-slate-400">{s.owner_phone}</p></td>
                        <td className="font-mono font-semibold text-sm">{s.spot_number}</td>
                        <td><SessionStatusBadge status={s.status} /></td>
                        <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                        <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                        <td><span className={`num text-sm font-semibold ${s.days_remaining < 0 ? "text-red-600" : s.days_remaining <= 7 ? "text-amber-600" : "text-slate-600"}`}>{s.days_remaining < 0 ? `+${Math.abs(s.days_remaining)}d over` : `${s.days_remaining}d`}</span></td>
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
''')

write("src/components/reports/MonthlyReportClient.tsx", r'''"use client";

import { formatOMR, formatDate } from "@/lib/utils";

interface Stats {
  totalCollected: number; paymentCount: number; adjustments: number;
  totalOutstanding: number; avgPayment: number;
  newSessions: number; closedSessions: number; activeSessions: number;
}
interface Props {
  month: string; monthLabel: string; marina: string; location: string;
  stats: Stats; payments: any[]; sessions: any[];
}

function buildPrintHTML(props: Props): string {
  const { monthLabel, marina, location, stats, payments, sessions } = props;
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const paymentRows = payments.map(p => `
    <tr>
      <td>${formatDate(p.payment_date)}</td>
      <td>${p.session?.boat?.name || "—"}</td>
      <td>${p.session?.parking_spot?.spot_number || "—"}</td>
      <td class="${Number(p.amount) < 0 ? "red" : "green"}">${formatOMR(Math.abs(Number(p.amount)))}</td>
      <td>${p.payment_method || "—"}</td>
      <td>${p.is_adjustment ? "Adjustment" : "Payment"}</td>
      <td>${p.reference_number || "—"}</td>
    </tr>`).join("");

  const sessionRows = sessions.map(s => `
    <tr>
      <td>${s.boat?.name || "—"}</td>
      <td>${s.boat?.registration_number || "—"}</td>
      <td>${s.parking_spot?.spot_number || "—"}</td>
      <td>${formatDate(s.start_date)}</td>
      <td>${formatDate(s.expected_end_date)}</td>
      <td>${formatOMR(s.total_due)}</td>
      <td class="green">${formatOMR(s.total_paid)}</td>
      <td class="${Number(s.remaining_balance) > 0 ? "red" : "green"}">${formatOMR(s.remaining_balance)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>${marina} — ${monthLabel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1e293b;background:#fff;padding:32px 40px}
.watermark{background:linear-gradient(135deg,#0A1628,#0E7490);color:#fff;text-align:center;padding:8px;font-size:11px;font-weight:600;margin-bottom:20px;border-radius:6px;letter-spacing:.08em}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #0E7490}
.header h1{font-size:22px;font-weight:800;color:#0A1628}
.header p{font-size:12px;color:#64748b;margin-top:2px}
.month-label{font-size:18px;font-weight:700;color:#0E7490;text-align:right}
.generated{font-size:10px;color:#94a3b8;margin-top:4px;text-align:right}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
.kpi{border:1px solid #e2e8f0;border-radius:8px;padding:14px;background:#f8fafc}
.kpi .val{font-size:20px;font-weight:800;color:#0A1628;font-family:'Courier New',monospace}
.kpi .val.green{color:#059669}.kpi .val.red{color:#dc2626}.kpi .val.blue{color:#0E7490}
.kpi .lbl{font-size:10px;font-weight:600;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:.05em}
.kpi .sub{font-size:10px;color:#94a3b8;margin-top:2px}
.sec{font-size:13px;font-weight:700;color:#0A1628;margin-bottom:8px;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;display:flex;justify-content:space-between}
.sec span{font-size:10px;font-weight:400;color:#94a3b8}
table{width:100%;border-collapse:collapse;margin-bottom:28px;font-size:10.5px}
th{background:#0A1628;color:#fff;padding:7px 10px;text-align:left;font-weight:600;font-size:10px;letter-spacing:.03em}
td{padding:6px 10px;border-bottom:1px solid #f1f5f9}
tr:last-child td{border-bottom:none}
tr:nth-child(even) td{background:#f8fafc}
tfoot td{background:#ecfdf5!important;font-weight:700;border-top:2px solid #059669}
.green{color:#059669;font-weight:700}.red{color:#dc2626;font-weight:700}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:9px}
@media print{body{padding:16px 20px}@page{margin:1cm;size:A4}}
</style></head><body>
<div class="watermark">⚓ ${marina.toUpperCase()} — OFFICIAL MONTHLY REPORT</div>
<div class="header">
  <div><h1>${marina}</h1><p>${location}</p><p style="margin-top:6px;font-size:11px;color:#475569">Monthly Financial &amp; Operations Report</p></div>
  <div><div class="month-label">${monthLabel}</div><div class="generated">Generated on ${today}</div></div>
</div>
<div class="kpi-grid">
  <div class="kpi"><div class="val green">${formatOMR(stats.totalCollected)}</div><div class="lbl">Revenue Collected</div><div class="sub">${stats.paymentCount} payment${stats.paymentCount !== 1 ? "s" : ""}</div></div>
  <div class="kpi"><div class="val red">${formatOMR(stats.totalOutstanding)}</div><div class="lbl">Outstanding Balance</div><div class="sub">Overdue accounts</div></div>
  <div class="kpi"><div class="val blue">${stats.activeSessions}</div><div class="lbl">Active Sessions</div><div class="sub">${stats.newSessions} new · ${stats.closedSessions} closed</div></div>
  <div class="kpi"><div class="val">${formatOMR(stats.avgPayment)}</div><div class="lbl">Average Payment</div><div class="sub">${stats.adjustments} adjustment${stats.adjustments !== 1 ? "s" : ""}</div></div>
</div>
<div class="sec">Payments Received — ${monthLabel}<span>${payments.length} records · Total: ${formatOMR(stats.totalCollected)}</span></div>
<table>
  <thead><tr><th>Date</th><th>Vessel</th><th>Spot</th><th>Amount (OMR)</th><th>Method</th><th>Type</th><th>Reference</th></tr></thead>
  <tbody>${paymentRows || '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:20px">No payments recorded this month</td></tr>'}</tbody>
  ${payments.length > 0 ? `<tfoot><tr><td colspan="3"><strong>Total Collected</strong></td><td class="green">${formatOMR(stats.totalCollected)}</td><td colspan="3"></td></tr></tfoot>` : ""}
</table>
<div class="sec">Active Sessions — ${monthLabel}<span>${sessions.length} sessions</span></div>
<table>
  <thead><tr><th>Vessel</th><th>Registration</th><th>Spot</th><th>Start Date</th><th>Expected End</th><th>Total Due</th><th>Paid</th><th>Balance</th></tr></thead>
  <tbody>${sessionRows || '<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:20px">No active sessions</td></tr>'}</tbody>
</table>
<div class="footer"><span>⚓ ${marina} · ${location}</span><span>CONFIDENTIAL — For internal use only</span><span>${monthLabel}</span></div>
</body></html>`;
}

export default function MonthlyReportClient(props: Props) {
  function handlePrint() {
    const html = buildPrintHTML(props);
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  function handleExportCSV() {
    const rows = [
      ["Date","Vessel","Spot","Amount (OMR)","Method","Type","Reference"],
      ...props.payments.map((p: any) => [
        p.payment_date, p.session?.boat?.name || "",
        p.session?.parking_spot?.spot_number || "",
        Math.abs(Number(p.amount)).toFixed(3),
        p.payment_method || "", p.is_adjustment ? "Adjustment" : "Payment",
        p.reference_number || "",
      ])
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${props.marina}-${props.month}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2">⬇ Export CSV</button>
      <button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-2">🖨️ Print Report</button>
    </div>
  );
}
''')

print("\n✅ Done! Refresh your browser and go to Reports.")
