"use client";
import { IconDownload } from "@/components/ui/Icons";
import { exportToCSV } from "@/lib/utils";
import type { ActiveSessionView } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

interface ReportExportClientProps {
  sessions: ActiveSessionView[];
  monthlyData: any[];
  reportType: string;
}

export default function ReportExportClient({ sessions, monthlyData, reportType }: ReportExportClientProps) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

  function handleExport() {
    if (reportType === "monthly") {
      exportToCSV(
        monthlyData.map((m) => ({
          Month: m.month,
          "Number of Payments": m.count,
          "Total Collected (OMR)": m.total.toFixed(3),
          "Average (OMR)": (m.total / m.count).toFixed(3),
        })),
        `monthly-summary`
      );
    } else {
      exportToCSV(
        sessions.map((s) => ({
          "Boat Name": s.boat_name,
          Registration: s.registration_number,
          Owner: s.owner_name || "",
          "Owner Phone": s.owner_phone || "",
          "Owner Email": s.owner_email || "",
          "Spot Number": s.spot_number,
          Status: s.status,
          "Start Date": s.start_date,
          "Expected End": s.expected_end_date,
          "Days Remaining": s.days_remaining,
          "Pricing Model": s.pricing_model,
          "Total Due (OMR)": s.total_due.toFixed(3),
          "Total Paid (OMR)": s.total_paid.toFixed(3),
          "Balance (OMR)": s.remaining_balance.toFixed(3),
        })),
        `report-${reportType}`
      );
    }
  }

  return (
    <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2"><IconDownload size={15} /> {t("exportCSV")}</button>
  );
}
