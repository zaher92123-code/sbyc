"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

export default function NewServiceOrderPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [boats, setBoats] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);

  const [form, setForm] = useState({
    service_id: "", boat_id: "", owner_id: "", scheduled_date: new Date().toISOString().split("T")[0],
    total_amount_omr: "", notes: "",
  });

  useEffect(() => {
    fetch("/api/services?list=services").then(r => r.json()).then(d => setServices((d.data || []).filter((s: any) => s.type === "lifting")));
    fetch("/api/boats").then(r => r.json()).then(d => setBoats(d.data || []));
    fetch("/api/owners").then(r => r.json()).then(d => setOwners(d.data || []));
  }, []);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/services", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, total_amount_omr: Number(form.total_amount_omr) || 0 }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error?.message || "Failed"); setLoading(false); return; }
    router.push("/services");
    router.refresh();
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/services" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("newServiceOrder")}</h1>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="form-label">{t("service")} *</label>
          <select value={form.service_id} onChange={f("service_id")} className="form-input" required>
            <option value="">{t("selectService")}</option>
            {services.map(s => <option key={s.id} value={s.id}>{lang === "ar" && s.name_ar ? s.name_ar : s.name_en}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("vessel")}</label>
            <select value={form.boat_id} onChange={f("boat_id")} className="form-input">
              <option value="">{t("selectVessel")}</option>
              {boats.map((b: any) => <option key={b.id} value={b.id}>{b.name} ({b.registration_number})</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">{t("owner")}</label>
            <select value={form.owner_id} onChange={f("owner_id")} className="form-input">
              <option value="">{t("selectOwner")}</option>
              {owners.map((o: any) => <option key={o.id} value={o.id}>{o.full_name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("scheduledDate")}</label>
            <input type="date" value={form.scheduled_date} onChange={f("scheduled_date")} className="form-input" />
          </div>
          <div>
            <label className="form-label">{t("amount")} (OMR) *</label>
            <input type="number" step="0.001" min="0" value={form.total_amount_omr} onChange={f("total_amount_omr")} className="form-input font-mono" required />
          </div>
        </div>
        <div>
          <label className="form-label">{t("notes")}</label>
          <textarea value={form.notes} onChange={f("notes")} rows={2} className="form-textarea" />
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("saving") : t("createOrder")}
          </button>
          <Link href="/services" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
