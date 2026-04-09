"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Alert, Badge, EmptyState } from "@/components/ui";
import { IconExpense, IconCurrency, IconDocument, IconReports } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import DateField from "@/components/DateField";
import { formatDate, formatOMR } from "@/lib/utils";

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
    const aIdx = ai >= 0 ? ai : CATEGORY_ORDER.length - 1.5;
    const bIdx = bi >= 0 ? bi : CATEGORY_ORDER.length - 1.5;
    return aIdx - bIdx;
  });
}

/** Format YYYY-MM to readable month name */
function formatMonth(ym: string, lang: "en" | "ar"): string {
  if (!ym) return "";
  try {
    const [year, month] = ym.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString(lang === "ar" ? "ar-OM" : "en-US", { month: "long", year: "numeric" });
  } catch {
    return ym;
  }
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
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState({ category: "", month: new Date().toISOString().slice(0, 7) });

  const emptyForm = {
    category_id: "",
    amount_omr: "",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const count = expenses.length;
    const avg = count > 0 ? total / count : 0;

    // Top category by spend
    const catTotals: Record<string, { amount: number; name_en: string; name_ar: string | null }> = {};
    for (const exp of expenses) {
      const catId = exp.category_id;
      if (!catTotals[catId]) {
        catTotals[catId] = { amount: 0, name_en: exp.category?.name_en || "—", name_ar: exp.category?.name_ar || null };
      }
      catTotals[catId].amount += Number(exp.amount_omr);
    }
    const topCat = Object.values(catTotals).sort((a, b) => b.amount - a.amount)[0] || null;

    return { count, avg, topCat };
  }, [expenses, total]);

  // Check if selected category is "Other"
  const selectedCat = categories.find(c => c.id === form.category_id);
  const isOther = selectedCat?.name_en?.toLowerCase() === "other";

  function startEdit(exp: Expense) {
    setEditId(exp.id);
    setForm({
      category_id: exp.category_id,
      amount_omr: String(exp.amount_omr),
      description: exp.description || "",
      expense_date: exp.expense_date,
    });
    setShowForm(false);
    setError(null);
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isOther && !form.description.trim()) {
      setError(lang === "ar" ? "يرجى تحديد نوع المصروف" : "Please specify the expense type");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      amount_omr: Number(form.amount_omr),
    };

    if (editId) {
      // Update existing
      const res = await fetch(`/api/expenses/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json();
        setError(result.error?.message || (lang === "ar" ? "فشل تحديث المصروف" : "Failed to update expense"));
        setSaving(false);
        return;
      }
      setEditId(null);
    } else {
      // Create new
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const result = await res.json();
        setError(result.error?.message || (lang === "ar" ? "فشل إضافة المصروف" : "Failed to add expense"));
        setSaving(false);
        return;
      }
      setShowForm(false);
    }

    setForm(emptyForm);
    setSaving(false);
    fetchExpenses();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDeleteExpense"))) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (editId === id) cancelEdit();
    fetchExpenses();
  }

  const catName = (cat: { name_en: string; name_ar: string | null } | undefined) =>
    cat ? (lang === "ar" && cat.name_ar ? cat.name_ar : cat.name_en) : "—";

  const isFiltered = filter.category !== "" || filter.month !== new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("expenses")}</h1>
          <p className="text-sm text-slate-500">
            {formatMonth(filter.month, lang)} · {t("total")}: {formatOMR(total)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/expenses/categories" className="btn-secondary text-sm">{t("manageCategories")}</Link>
          <button onClick={() => { setShowForm(!showForm); if (editId) cancelEdit(); }} className="btn-primary">
            {showForm ? t("cancel") : t("addExpense")}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card">
          <div className="mb-1"><IconCurrency size={24} /></div>
          <p className="text-xl font-bold num text-slate-900">{formatOMR(total)}</p>
          <p className="text-sm font-semibold text-slate-600">{t("totalExpenses")}</p>
          <p className="text-xs text-slate-400">{t("thisMonth")}</p>
        </div>
        <div className="stat-card">
          <div className="mb-1"><IconDocument size={24} /></div>
          <p className="text-xl font-bold num text-slate-900">{stats.count}</p>
          <p className="text-sm font-semibold text-slate-600">{t("expenseCount")}</p>
          <p className="text-xs text-slate-400">{t("expenseEntries")}</p>
        </div>
        <div className="stat-card">
          <div className="mb-1"><IconReports size={24} /></div>
          <p className="text-xl font-bold num text-slate-900">{stats.count > 0 ? formatOMR(stats.avg) : "—"}</p>
          <p className="text-sm font-semibold text-slate-600">{t("avgExpense")}</p>
          <p className="text-xs text-slate-400">{t("perEntry")}</p>
        </div>
        <div className="stat-card">
          <div className="mb-1"><IconExpense size={24} /></div>
          <p className="text-xl font-bold num text-slate-900 truncate">
            {stats.topCat ? catName(stats.topCat) : "—"}
          </p>
          <p className="text-sm font-semibold text-slate-600">{t("topCategory")}</p>
          <p className="text-xs text-slate-400">{stats.topCat ? formatOMR(stats.topCat.amount) : t("highestSpend")}</p>
        </div>
      </div>

      {/* Add / Edit Expense Form */}
      {(showForm || editId) && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">
            {editId ? t("editExpense") : t("newExpense")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">{t("category")} *</label>
              <select value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value, description: editId ? p.description : "" }))} className="form-input" required>
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
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? t("saving") : editId ? t("updateExpense") : t("addExpense")}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit} className="btn-secondary text-sm">
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="card px-5 py-4 flex flex-wrap gap-3 items-center">
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
        {isFiltered && (
          <button
            onClick={() => setFilter({ category: "", month: new Date().toISOString().slice(0, 7) })}
            className="btn-secondary text-sm"
          >
            {t("clear")}
          </button>
        )}
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
                  <tr key={exp.id} className={editId === exp.id ? "bg-teal-50" : ""}>
                    <td className="text-sm text-slate-700 whitespace-nowrap">{formatDate(exp.expense_date)}</td>
                    <td>
                      <Badge variant="info" className="text-[10px]">
                        {catName(exp.category)}
                      </Badge>
                    </td>
                    <td className="num font-semibold text-red-600">{formatOMR(Number(exp.amount_omr))}</td>
                    <td className="text-sm text-slate-600 max-w-[200px] truncate">{exp.description || "—"}</td>
                    <td className="text-xs text-slate-500">{exp.recorder?.full_name || "—"}</td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => startEdit(exp)} className="text-xs text-teal-600 hover:text-teal-800 font-semibold">
                          {t("edit")}
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                          {t("delete")}
                        </button>
                      </div>
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
