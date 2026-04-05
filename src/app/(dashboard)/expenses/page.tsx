"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Alert, Badge, EmptyState } from "@/components/ui";
import { IconExpense } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import DateField from "@/components/DateField";

type Category = { id: string; name_en: string; name_ar: string | null; is_active: boolean };
type Expense = {
  id: string; category_id: string; amount_omr: number; description: string | null;
  expense_date: string; category?: { id: string; name_en: string; name_ar: string | null };
  recorder?: { full_name: string } | null; created_at: string;
};

// Preferred display order — "Other" always last
const CATEGORY_ORDER = ["Electricity", "Water", "WiFi / Internet", "Fuel", "Maintenance", "Equipment", "Office Supplies", "Other"];

function sortCategories(cats: Category[]): Category[] {
  return [...cats].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.name_en);
    const bi = CATEGORY_ORDER.indexOf(b.name_en);
    // Known categories by order, unknown ones before "Other" but after known
    const aIdx = ai >= 0 ? ai : CATEGORY_ORDER.length - 1.5;
    const bIdx = bi >= 0 ? bi : CATEGORY_ORDER.length - 1.5;
    return aIdx - bIdx;
  });
}

export default function ExpensesPage() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({ category: "", month: new Date().toISOString().slice(0, 7) });

  const [form, setForm] = useState({
    category_id: "",
    amount_omr: "",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filter.category, filter.month]);

  async function fetchCategories() {
    const res = await fetch("/api/expense-categories");
    const result = await res.json();
    setCategories(sortCategories(result.data || []));
  }

  async function fetchExpenses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.category) params.set("category", filter.category);
    if (filter.month) params.set("month", filter.month);
    const res = await fetch(`/api/expenses?${params}`);
    const result = await res.json();
    setExpenses(result.data || []);
    setTotal(result.total || 0);
    setLoading(false);
  }

  // Check if selected category is "Other"
  const selectedCat = categories.find(c => c.id === form.category_id);
  const isOther = selectedCat?.name_en?.toLowerCase() === "other";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOther && !form.description.trim()) {
      setError(lang === "ar" ? "يرجى تحديد نوع المصروف" : "Please specify the expense type");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount_omr: Number(form.amount_omr),
      }),
    });

    if (!res.ok) {
      const result = await res.json();
      setError(result.error?.message || "Failed to add expense");
      setSaving(false);
      return;
    }

    setForm({ category_id: "", amount_omr: "", description: "", expense_date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    setSaving(false);
    fetchExpenses();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDeleteExpense"))) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    fetchExpenses();
  }

  const catName = (cat: { name_en: string; name_ar: string | null } | undefined) =>
    cat ? (lang === "ar" && cat.name_ar ? cat.name_ar : cat.name_en) : "—";

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("expenses")}</h1>
          <p className="text-sm text-slate-500">
            {filter.month} · {t("total")}: {total.toFixed(3)} OMR
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/expenses/categories" className="btn-secondary text-sm">{t("manageCategories")}</Link>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? t("cancel") : t("addExpense")}
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("newExpense")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">{t("category")} *</label>
              <select value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value, description: "" }))} className="form-input" required>
                <option value="">{t("selectCategory")}</option>
                {categories.filter((c) => c.is_active).map((c) => (
                  <option key={c.id} value={c.id}>{catName(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">{t("amount")} (OMR) *</label>
              <input type="number" step="0.001" min="0.001" value={form.amount_omr}
                onChange={(e) => setForm((p) => ({ ...p, amount_omr: e.target.value }))}
                className="form-input font-mono" required />
            </div>
            <div>
              <label className="form-label">{t("date")} *</label>
              <DateField value={form.expense_date}
                onChange={(e) => setForm((p) => ({ ...p, expense_date: e.target.value }))}
                className="form-input" required />
            </div>
            <div>
              <label className="form-label">
                {isOther ? (lang === "ar" ? "حدد نوع المصروف *" : "Specify expense *") : t("description")}
              </label>
              <input value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={`form-input ${isOther ? "border-amber-300 bg-amber-50" : ""}`}
                placeholder={isOther
                  ? (lang === "ar" ? "مثال: صيانة مكيف، شراء طابعة…" : "e.g. AC repair, printer purchase…")
                  : t("expenseDescPlaceholder")}
                required={isOther} />
            </div>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? t("saving") : t("addExpense")}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="card px-5 py-4 flex gap-3">
        <div>
          <input type="month" value={filter.month}
            onChange={(e) => setFilter((p) => ({ ...p, month: e.target.value }))}
            className="form-input text-sm" />
        </div>
        <select value={filter.category}
          onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))}
          className="form-input text-sm w-48">
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{catName(c)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t("date")}</th>
                <th>{t("category")}</th>
                <th>{t("amount")}</th>
                <th>{t("description")}</th>
                <th>{t("recordedBy")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">{t("loading")}</td></tr>
              ) : expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td className="text-sm text-slate-700">{exp.expense_date}</td>
                    <td>
                      <Badge variant="info" className="text-[10px]">
                        {catName(exp.category)}
                      </Badge>
                    </td>
                    <td className="num font-semibold text-red-600">{Number(exp.amount_omr).toFixed(3)} OMR</td>
                    <td className="text-sm text-slate-600 max-w-[200px] truncate">{exp.description || "—"}</td>
                    <td className="text-xs text-slate-500">{exp.recorder?.full_name || "—"}</td>
                    <td>
                      <button onClick={() => handleDelete(exp.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6}>
                  <EmptyState icon={<IconExpense size={40} className="opacity-40" />} title={t("noExpensesFound")} />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
