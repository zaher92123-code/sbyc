"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Alert, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

type Category = { id: string; name_en: string; name_ar: string | null; is_active: boolean };

export default function ExpenseCategoriesPage() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({ name_en: "", name_ar: "" });

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/expense-categories");
    const result = await res.json();
    setCategories(result.data || []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/expense-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const result = await res.json();
      setError(result.error?.message || "Failed");
      setSaving(false);
      return;
    }
    setForm({ name_en: "", name_ar: "" });
    setSaving(false);
    fetchCategories();
  }

  async function handleUpdate(cat: Category) {
    const res = await fetch(`/api/expense-categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_en: form.name_en, name_ar: form.name_ar }),
    });
    if (res.ok) {
      setEditId(null);
      setForm({ name_en: "", name_ar: "" });
      fetchCategories();
    }
  }

  async function toggleActive(cat: Category) {
    await fetch(`/api/expense-categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !cat.is_active }),
    });
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDeleteCategory"))) return;
    const res = await fetch(`/api/expense-categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Cannot delete");
      return;
    }
    fetchCategories();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/expenses" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("expenseCategories")}</h1>
      </div>

      {/* Add new category */}
      <form onSubmit={handleAdd} className="card p-5 space-y-4">
        <h2 className="font-bold text-slate-800 font-display">{t("addCategory")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("nameEn")} *</label>
            <input value={form.name_en} onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
              className="form-input" placeholder="e.g. Electricity" required />
          </div>
          <div>
            <label className="form-label">{t("nameAr")}</label>
            <input value={form.name_ar} onChange={(e) => setForm((p) => ({ ...p, name_ar: e.target.value }))}
              className="form-input text-right" dir="rtl" placeholder="مثال: الكهرباء" />
          </div>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? t("saving") : t("addCategory")}
        </button>
      </form>

      {/* Categories list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 font-display">{t("existingCategories")}</h2>
        </div>
        {loading ? (
          <div className="py-8 text-center text-slate-400">{t("loading")}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.id} className="px-5 py-3.5 flex items-center justify-between">
                {editId === cat.id ? (
                  <div className="flex-1 flex gap-2 items-center">
                    <input value={form.name_en} onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
                      className="form-input text-sm flex-1" />
                    <input value={form.name_ar} onChange={(e) => setForm((p) => ({ ...p, name_ar: e.target.value }))}
                      className="form-input text-sm flex-1 text-right" dir="rtl" />
                    <button onClick={() => handleUpdate(cat)} className="btn-primary text-xs">{t("save")}</button>
                    <button onClick={() => { setEditId(null); setForm({ name_en: "", name_ar: "" }); }} className="btn-secondary text-xs">{t("cancel")}</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{cat.name_en}</p>
                        {cat.name_ar && <p className="text-xs text-slate-400">{cat.name_ar}</p>}
                      </div>
                      <Badge variant={cat.is_active ? "success" : "default"} className="text-[10px]">
                        {cat.is_active ? t("activeStatus") : t("inactiveStatus")}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditId(cat.id); setForm({ name_en: cat.name_en, name_ar: cat.name_ar || "" }); }}
                        className="text-xs text-teal-600 hover:text-teal-800 font-semibold">{t("edit")}</button>
                      <button onClick={() => toggleActive(cat)}
                        className="text-xs text-amber-600 hover:text-amber-800 font-semibold">
                        {cat.is_active ? t("deactivate") : t("activate")}
                      </button>
                      <button onClick={() => handleDelete(cat.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold">{t("delete")}</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
