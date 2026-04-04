"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, EmptyState } from "@/components/ui";
import { IconServices } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

type ServiceOrder = {
  id: string; status: string; payment_status: string; scheduled_date: string | null;
  completed_date: string | null; total_amount_omr: number; notes: string | null; created_at: string;
  service?: { id: string; name_en: string; name_ar: string | null; type: string; unit: string };
  boat?: { id: string; name: string } | null;
  owner?: { id: string; full_name: string } | null;
};
type Rental = {
  id: string; tenant_name: string; tenant_phone: string | null; unit_number: string | null;
  start_date: string; end_date: string | null; monthly_rate_omr: number; status: string;
  service?: { id: string; name_en: string; name_ar: string | null; type: string };
  owner?: { id: string; full_name: string } | null;
};

export default function ServicesPage() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

  const [tab, setTab] = useState<"lifting" | "storage" | "office">("lifting");
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, [tab]);

  async function fetchData() {
    setLoading(true);
    if (tab === "lifting") {
      const res = await fetch("/api/services?list=orders");
      const result = await res.json();
      setOrders((result.data || []).filter((o: ServiceOrder) => o.service?.type === "lifting"));
    } else {
      const type = tab === "storage" ? "storage_rental" : "office_rental";
      const res = await fetch(`/api/rentals?type=${type}`);
      const result = await res.json();
      setRentals(result.data || []);
    }
    setLoading(false);
  }

  async function updateOrder(id: string, data: Record<string, unknown>) {
    setActing(id);
    await fetch(`/api/services/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setActing(null);
    fetchData();
  }

  async function updateRental(id: string, data: Record<string, unknown>) {
    setActing(id);
    await fetch(`/api/rentals/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setActing(null);
    fetchData();
  }

  const statusV: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
    pending: "warning", in_progress: "info", completed: "success", cancelled: "danger",
    active: "success", expired: "danger", terminated: "default",
    paid: "success", unpaid: "danger", partial: "warning",
  };

  const nextStatus: Record<string, string> = {
    pending: "in_progress", in_progress: "completed",
  };

  const tabs = [
    { key: "lifting" as const, label: t("liftingServices") },
    { key: "storage" as const, label: t("storageRentals") },
    { key: "office" as const, label: t("officeRentals") },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("services")}</h1>
          <p className="text-sm text-slate-500">{t("servicesDescription")}</p>
        </div>
        <div className="flex gap-2">
          {tab === "lifting" ? (
            <Link href="/services/new" className="btn-primary">{t("newServiceOrder")}</Link>
          ) : (
            <Link href="/rentals/new" className="btn-primary">{t("newRental")}</Link>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {tabs.map((t2) => (
          <button key={t2.key} onClick={() => setTab(t2.key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t2.key ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t2.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">{t("loading")}</div>
        ) : tab === "lifting" ? (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>{t("service")}</th><th>{t("vessel")}</th><th>{t("owner")}</th>
                  <th>{t("date")}</th><th>{t("amount")}</th><th>{t("status")}</th><th>{t("paymentLabel")}</th><th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map((o) => (
                  <tr key={o.id}>
                    <td className="text-sm font-semibold text-slate-800">
                      {lang === "ar" && o.service?.name_ar ? o.service.name_ar : o.service?.name_en}
                    </td>
                    <td>{o.boat ? <Link href={`/boats/${o.boat.id}`} className="text-sm text-teal-700 hover:underline">{o.boat.name}</Link> : "—"}</td>
                    <td>{o.owner ? <Link href={`/owners/${o.owner.id}`} className="text-sm text-teal-700 hover:underline">{o.owner.full_name}</Link> : "—"}</td>
                    <td className="text-sm text-slate-600">{o.scheduled_date || "—"}</td>
                    <td className="num font-semibold text-slate-800">{Number(o.total_amount_omr).toFixed(3)} OMR</td>
                    <td><Badge variant={statusV[o.status] || "default"} className="text-[10px]">{o.status}</Badge></td>
                    <td><Badge variant={statusV[o.payment_status] || "default"} className="text-[10px]">{o.payment_status}</Badge></td>
                    <td>
                      <div className="flex gap-1.5">
                        {nextStatus[o.status] && (
                          <button onClick={() => updateOrder(o.id, { status: nextStatus[o.status], ...(nextStatus[o.status] === "completed" ? { completed_date: new Date().toISOString().split("T")[0] } : {}) })}
                            disabled={acting === o.id}
                            className="text-xs px-2 py-1 rounded-lg bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 transition-colors">
                            {nextStatus[o.status] === "in_progress" ? t("startJob") : t("markComplete")}
                          </button>
                        )}
                        {o.payment_status === "unpaid" && (
                          <button onClick={() => updateOrder(o.id, { payment_status: "paid" })}
                            disabled={acting === o.id}
                            className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors">
                            {t("markPaid")}
                          </button>
                        )}
                        {o.status === "pending" && (
                          <button onClick={() => updateOrder(o.id, { status: "cancelled" })}
                            disabled={acting === o.id}
                            className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">
                            {t("cancel")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8}><EmptyState icon={<IconServices size={40} className="opacity-40" />} title={t("noServiceOrders")} /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>{t("tenant")}</th><th>{t("unit")}</th><th>{t("service")}</th>
                  <th>{t("startDate")}</th><th>{t("endDateLabel")}</th><th>{t("monthlyRate")}</th><th>{t("status")}</th><th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {rentals.length > 0 ? rentals.map((r) => (
                  <tr key={r.id}>
                    <td className="text-sm font-semibold text-slate-800">{r.tenant_name}</td>
                    <td className="text-sm font-mono text-slate-600">{r.unit_number || "—"}</td>
                    <td className="text-sm text-slate-600">{lang === "ar" && r.service?.name_ar ? r.service.name_ar : r.service?.name_en}</td>
                    <td className="text-sm text-slate-600">{r.start_date}</td>
                    <td className="text-sm text-slate-600">{r.end_date || "—"}</td>
                    <td className="num font-semibold text-slate-800">{Number(r.monthly_rate_omr).toFixed(3)} OMR</td>
                    <td><Badge variant={statusV[r.status] || "default"} className="text-[10px]">{r.status}</Badge></td>
                    <td>
                      {r.status === "active" && (
                        <button onClick={() => {
                          if (confirm(lang === "ar" ? "هل تريد إنهاء هذا الإيجار؟" : "Terminate this rental?")) {
                            updateRental(r.id, { status: "terminated", end_date: new Date().toISOString().split("T")[0] });
                          }
                        }} disabled={acting === r.id}
                          className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">
                          {t("terminate")}
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8}><EmptyState icon={<IconServices size={40} className="opacity-40" />} title={t("noRentals")} /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
