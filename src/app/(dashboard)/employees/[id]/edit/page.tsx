"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import DateField from "@/components/DateField";

export default function EmployeeEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name_en: "", name_ar: "", civil_id: "", phone: "", email: "",
    position_en: "", position_ar: "", department: "", hire_date: "",
    base_salary_omr: "", allowances_omr: "", deductions_omr: "",
    bank_name: "", bank_account_number: "", employment_status: "active",
    emergency_contact_name: "", emergency_contact_phone: "", notes: "",
  });

  useEffect(() => {
    fetch(`/api/employees/${id}`).then(r => r.json()).then(result => {
      const e = result.data;
      if (e) {
        setForm({
          name_en: e.name_en || "", name_ar: e.name_ar || "", civil_id: e.civil_id || "",
          phone: e.phone || "", email: e.email || "", position_en: e.position_en || "",
          position_ar: e.position_ar || "", department: e.department || "",
          hire_date: e.hire_date || "", base_salary_omr: String(e.base_salary_omr || ""),
          allowances_omr: String(e.allowances_omr || ""), deductions_omr: String(e.deductions_omr || ""),
          bank_name: e.bank_name || "", bank_account_number: e.bank_account_number || "",
          employment_status: e.employment_status || "active",
          emergency_contact_name: e.emergency_contact_name || "",
          emergency_contact_phone: e.emergency_contact_phone || "", notes: e.notes || "",
        });
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/employees/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        base_salary_omr: Number(form.base_salary_omr) || 0,
        allowances_omr: Number(form.allowances_omr) || 0,
        deductions_omr: Number(form.deductions_omr) || 0,
      }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error?.message || "Failed"); setSaving(false); return; }
    router.push(`/employees/${id}`);
    router.refresh();
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  if (loading) return <div className="py-12 text-center text-slate-400">{t("loading")}</div>;

  const netSalary = (Number(form.base_salary_omr) || 0) + (Number(form.allowances_omr) || 0) - (Number(form.deductions_omr) || 0);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/employees/${id}`} className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("editEmployee")}: {form.name_en}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("personalInfo")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("nameEn")} *</label>
              <input value={form.name_en} onChange={f("name_en")} className="form-input" required />
            </div>
            <div>
              <label className="form-label">{t("nameAr")}</label>
              <input value={form.name_ar} onChange={f("name_ar")} className="form-input text-right" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("civilId")}</label>
              <input value={form.civil_id} onChange={f("civil_id")} className="form-input font-mono" />
            </div>
            <div>
              <label className="form-label">{t("phoneNumber")}</label>
              <input value={form.phone} onChange={f("phone")} className="form-input font-mono" />
            </div>
          </div>
          <div>
            <label className="form-label">{t("emailAddress")}</label>
            <input type="email" value={form.email} onChange={f("email")} className="form-input" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("jobInfo")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("positionEn")}</label>
              <input value={form.position_en} onChange={f("position_en")} className="form-input" />
            </div>
            <div>
              <label className="form-label">{t("positionAr")}</label>
              <input value={form.position_ar} onChange={f("position_ar")} className="form-input text-right" dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("department")}</label>
              <input value={form.department} onChange={f("department")} className="form-input" />
            </div>
            <div>
              <label className="form-label">{t("hireDate")}</label>
              <DateField value={form.hire_date} onChange={f("hire_date")} className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">{t("status")}</label>
            <select value={form.employment_status} onChange={f("employment_status")} className="form-input">
              <option value="active">{t("active")}</option>
              <option value="on_leave">{t("onLeave")}</option>
              <option value="terminated">{t("terminated")}</option>
            </select>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("salaryInfo")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">{t("baseSalary")} (OMR)</label>
              <input type="number" step="0.001" min="0" value={form.base_salary_omr} onChange={f("base_salary_omr")} className="form-input font-mono" />
            </div>
            <div>
              <label className="form-label">{t("allowances")} (OMR)</label>
              <input type="number" step="0.001" min="0" value={form.allowances_omr} onChange={f("allowances_omr")} className="form-input font-mono" />
            </div>
            <div>
              <label className="form-label">{t("deductions")} (OMR)</label>
              <input type="number" step="0.001" min="0" value={form.deductions_omr} onChange={f("deductions_omr")} className="form-input font-mono" />
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
            <span className="font-semibold text-slate-700">{t("netSalary")}</span>
            <span className="num text-xl font-black text-teal-700">{netSalary.toFixed(3)} OMR</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("bankName")}</label>
              <input value={form.bank_name} onChange={f("bank_name")} className="form-input" />
            </div>
            <div>
              <label className="form-label">{t("bankAccount")}</label>
              <input value={form.bank_account_number} onChange={f("bank_account_number")} className="form-input font-mono" />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("emergencyContact")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("contactName")}</label>
              <input value={form.emergency_contact_name} onChange={f("emergency_contact_name")} className="form-input" />
            </div>
            <div>
              <label className="form-label">{t("contactPhone")}</label>
              <input value={form.emergency_contact_phone} onChange={f("emergency_contact_phone")} className="form-input font-mono" />
            </div>
          </div>
          <div>
            <label className="form-label">{t("notes")}</label>
            <textarea value={form.notes} onChange={f("notes")} rows={3} className="form-textarea" />
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-3">
            {saving ? t("saving") : t("saveChanges")}
          </button>
          <Link href={`/employees/${id}`} className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
