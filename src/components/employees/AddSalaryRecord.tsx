"use client";

import { useState } from "react";
import { Alert } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import DateField from "@/components/DateField";

interface Props {
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  onAdded: () => void;
}

export default function AddSalaryRecord({ employeeId, baseSalary, allowances, deductions, onAdded }: Props) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [form, setForm] = useState({
    month: defaultMonth,
    base_salary_omr: String(baseSalary),
    allowances_omr: String(allowances),
    deductions_omr: String(deductions),
    bonus_omr: "0",
    payment_status: "pending" as "pending" | "paid",
    payment_date: "",
    notes: "",
  });

  const net = (Number(form.base_salary_omr) || 0) + (Number(form.allowances_omr) || 0)
    - (Number(form.deductions_omr) || 0) + (Number(form.bonus_omr) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/employees/${employeeId}/salary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: form.month,
        base_salary_omr: Number(form.base_salary_omr) || 0,
        allowances_omr: Number(form.allowances_omr) || 0,
        deductions_omr: Number(form.deductions_omr) || 0,
        bonus_omr: Number(form.bonus_omr) || 0,
        payment_status: form.payment_status,
        payment_date: form.payment_date || "",
        notes: form.notes,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed to add salary record");
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    setForm(f => ({ ...f, month: defaultMonth, bonus_omr: "0", payment_status: "pending", payment_date: "", notes: "" }));
    onAdded();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary text-xs">
        + {t("addSalaryRecord")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">{t("addSalaryRecord")}</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">{t("cancel")}</button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div>
          <label className="text-xs text-slate-500 font-semibold">{t("month")} *</label>
          <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
            className="form-input text-sm" required />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-semibold">{t("baseSalary")}</label>
          <input type="number" step="0.001" value={form.base_salary_omr}
            onChange={e => setForm(f => ({ ...f, base_salary_omr: e.target.value }))}
            className="form-input text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-semibold">{t("allowances")}</label>
          <input type="number" step="0.001" value={form.allowances_omr}
            onChange={e => setForm(f => ({ ...f, allowances_omr: e.target.value }))}
            className="form-input text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-semibold">{t("deductions")}</label>
          <input type="number" step="0.001" value={form.deductions_omr}
            onChange={e => setForm(f => ({ ...f, deductions_omr: e.target.value }))}
            className="form-input text-sm font-mono" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-semibold">{t("bonus")}</label>
          <input type="number" step="0.001" value={form.bonus_omr}
            onChange={e => setForm(f => ({ ...f, bonus_omr: e.target.value }))}
            className="form-input text-sm font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-500 font-semibold">{t("status")}</label>
          <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value as any }))}
            className="form-input text-sm">
            <option value="pending">{t("pending")}</option>
            <option value="paid">{t("paid")}</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-semibold">{t("paymentDate")}</label>
          <DateField value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
            className="form-input text-sm" />
        </div>
        <div className="flex items-end">
          <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 w-full text-center">
            <span className="text-xs text-slate-400">{t("netSalary")}: </span>
            <span className="num font-bold text-teal-700">{net.toFixed(3)} OMR</span>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <button type="submit" disabled={saving} className="btn-primary text-xs w-full justify-center">
        {saving ? t("saving") : t("addSalaryRecord")}
      </button>
    </form>
  );
}
