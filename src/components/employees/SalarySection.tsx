"use client";

import { useState, useEffect } from "react";
import { Badge, Alert } from "@/components/ui";
import { formatOMR } from "@/lib/utils";
import { IconEdit, IconTrash, IconCheck, IconX } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import AddSalaryRecord from "./AddSalaryRecord";

interface Props {
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
}

export default function SalarySection({ employeeId, baseSalary, allowances, deductions }: Props) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key]?.[lang] ?? T[key]?.["en"] ?? key;

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchRecords(); }, [employeeId]);

  async function fetchRecords() {
    setLoading(true);
    const res = await fetch(`/api/employees/${employeeId}`);
    const result = await res.json();
    setRecords(result.data?.salary_records || []);
    setLoading(false);
  }

  function startEdit(sr: any) {
    setEditId(sr.id);
    setEditForm({
      base_salary_omr: String(sr.base_salary_omr),
      allowances_omr: String(sr.allowances_omr),
      deductions_omr: String(sr.deductions_omr),
      bonus_omr: String(sr.bonus_omr),
      payment_status: sr.payment_status,
      payment_date: sr.payment_date || "",
      notes: sr.notes || "",
    });
    setError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm({});
    setError(null);
  }

  async function saveEdit(salaryId: string) {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/employees/${employeeId}/salary/${salaryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_salary_omr: Number(editForm.base_salary_omr) || 0,
        allowances_omr: Number(editForm.allowances_omr) || 0,
        deductions_omr: Number(editForm.deductions_omr) || 0,
        bonus_omr: Number(editForm.bonus_omr) || 0,
        payment_status: editForm.payment_status,
        payment_date: editForm.payment_date || "",
        notes: editForm.notes || "",
      }),
    });

    const result = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed to update");
      return;
    }

    setEditId(null);
    fetchRecords();
  }

  async function handleDelete(salaryId: string, month: string) {
    const msg = lang === "ar"
      ? `حذف سجل الراتب لشهر ${month}؟`
      : `Delete salary record for ${month}?`;
    if (!confirm(msg)) return;

    const res = await fetch(`/api/employees/${employeeId}/salary/${salaryId}`, { method: "DELETE" });
    if (res.ok) fetchRecords();
  }

  async function togglePaid(sr: any) {
    const newStatus = sr.payment_status === "paid" ? "pending" : "paid";
    await fetch(`/api/employees/${employeeId}/salary/${sr.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_status: newStatus,
        payment_date: newStatus === "paid" ? new Date().toISOString().split("T")[0] : "",
      }),
    });
    fetchRecords();
  }

  const ef = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setEditForm((p: any) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-800 font-display">{t("salaryHistory")}</h2>
        <AddSalaryRecord
          employeeId={employeeId}
          baseSalary={baseSalary}
          allowances={allowances}
          deductions={deductions}
          onAdded={fetchRecords}
        />
      </div>

      {error && <div className="px-5 pt-3"><Alert variant="danger">{error}</Alert></div>}

      {loading ? (
        <div className="py-8 text-center text-slate-400">{t("loading")}</div>
      ) : records.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {records.map((sr: any) => {
            const isEditing = editId === sr.id;
            const net = (Number(sr.base_salary_omr) + Number(sr.allowances_omr) - Number(sr.deductions_omr) + Number(sr.bonus_omr));

            return (
              <div key={sr.id} className={`px-5 py-4 ${isEditing ? "bg-teal-50/30" : ""}`}>
                {isEditing ? (
                  /* ── Edit mode ────────────────────────────────────── */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{sr.month}</span>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(sr.id)} disabled={saving} className="btn-primary text-xs">
                          <IconCheck size={12} className="mr-1" />{saving ? t("saving") : t("save")}
                        </button>
                        <button onClick={cancelEdit} className="btn-secondary text-xs">
                          <IconX size={12} className="mr-1" />{t("cancel")}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">{t("baseSalary")}</label>
                        <input type="number" step="0.001" value={editForm.base_salary_omr} onChange={ef("base_salary_omr")} className="form-input text-sm font-mono" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">{t("allowances")}</label>
                        <input type="number" step="0.001" value={editForm.allowances_omr} onChange={ef("allowances_omr")} className="form-input text-sm font-mono" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">{t("deductions")}</label>
                        <input type="number" step="0.001" value={editForm.deductions_omr} onChange={ef("deductions_omr")} className="form-input text-sm font-mono" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">{t("bonus")}</label>
                        <input type="number" step="0.001" value={editForm.bonus_omr} onChange={ef("bonus_omr")} className="form-input text-sm font-mono" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">{t("status")}</label>
                        <select value={editForm.payment_status} onChange={ef("payment_status")} className="form-input text-sm">
                          <option value="pending">{t("pending")}</option>
                          <option value="paid">{t("paid")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">{t("paymentDate")}</label>
                        <input type="date" value={editForm.payment_date} onChange={ef("payment_date")} className="form-input text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold">{t("notes")}</label>
                        <input value={editForm.notes} onChange={ef("notes")} className="form-input text-sm" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ────────────────────────────────────── */
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <span className="font-mono font-bold text-slate-800 w-20 flex-shrink-0">{sr.month}</span>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">{formatOMR(sr.base_salary_omr)}</span>
                        <span className="text-emerald-600">+{formatOMR(sr.allowances_omr)}</span>
                        <span className="text-red-600">-{formatOMR(sr.deductions_omr)}</span>
                        {Number(sr.bonus_omr) > 0 && (
                          <span className="text-amber-600">+{formatOMR(sr.bonus_omr)}</span>
                        )}
                      </div>

                      <span className="text-slate-300">→</span>

                      <span className="num font-bold text-teal-700">{formatOMR(sr.net_salary_omr)}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Quick toggle paid/pending */}
                      <button
                        onClick={() => togglePaid(sr)}
                        title={sr.payment_status === "paid" ? "Mark as pending" : "Mark as paid"}
                      >
                        <Badge
                          variant={sr.payment_status === "paid" ? "success" : "warning"}
                          className="text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {sr.payment_status === "paid" ? t("paid") : t("pending")}
                        </Badge>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => startEdit(sr)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title={t("edit")}
                      >
                        <IconEdit size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(sr.id, sr.month)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title={t("delete")}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-slate-400">{t("noSalaryRecords")}</p>
        </div>
      )}
    </div>
  );
}
