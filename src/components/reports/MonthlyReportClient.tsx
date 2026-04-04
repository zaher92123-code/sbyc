"use client";

import { formatOMR, formatDate } from "@/lib/utils";
import { IconDownload, IconPrint } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

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
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

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
      <button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2"><IconDownload size={15} /> {t("exportCSV")}</button>
      <button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-2"><IconPrint size={15} /> {t("printReport")}</button>
    </div>
  );
}
