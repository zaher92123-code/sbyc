"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import DateField from "@/components/DateField";

export default function NewRentalPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);

  const [form, setForm] = useState({
    service_id: "", tenant_name: "", tenant_phone: "", tenant_email: "", owner_id: "",
    unit_number: "", start_date: new Date().toISOString().split("T")[0], end_date: "",
    monthly_rate_omr: "", notes: "",
  });

  useEffect(() => {
    fetch("/api/services?list=services").then(r => r.json()).then(d =>
      setServices((d.data || []).filter((s: any) => s.type === "storage_rental" || s.type === "office_rental"))
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/rentals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, monthly_rate_omr: Number(form.monthly_rate_omr) || 0 }),
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
        <h1 className="page-title">{t("newRental")}</h1>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="form-label">{t("service")} *</label>
          <select value={form.service_id} onChange={f("service_id")} className="form-input" required>
            <option value="">{t("selectService")}</option>
            {services.map(s => <option key={s.id} value={s.id}>{lang === "ar" && s.name_ar ? s.name_ar : s.name_en}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">{t("tenantName")} *</label>
          <input value={form.tenant_name} onChange={f("tenant_name")} className="form-input" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("phone")}</label>
            <input value={form.tenant_phone} onChange={f("tenant_phone")} className="form-input font-mono" />
          </div>
          <div>
            <label className="form-label">{t("email")}</label>
            <input type="email" value={form.tenant_email} onChange={f("tenant_email")} className="form-input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("unitNumber")}</label>
            <input value={form.unit_number} onChange={f("unit_number")} className="form-input" placeholder="A-01" />
          </div>
          <div>
            <label className="form-label">{t("monthlyRate")} (OMR)</label>
            <input type="number" step="0.001" min="0" value={form.monthly_rate_omr} onChange={f("monthly_rate_omr")} className="form-input font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("startDate")} *</label>
            <DateField value={form.start_date} onChange={f("start_date")} className="form-input" required />
          </div>
          <div>
            <label className="form-label">{t("endDateLabel")}</label>
            <DateField value={form.end_date} onChange={f("end_date")} className="form-input" />
          </div>
        </div>
        <div>
          <label className="form-label">{t("notes")}</label>
          <textarea value={form.notes} onChange={f("notes")} rows={2} className="form-textarea" />
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("saving") : t("createRental")}
          </button>
          <Link href="/services" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
