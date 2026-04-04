"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import Link from "next/link";
import type { Owner } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

type OwnerType = "individual" | "company";

export default function OwnerEditForm({ owner }: { owner: Owner }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    full_name: owner.full_name || "",
    phone: owner.phone || "",
    email: owner.email || "",
    alternate_contact: owner.alternate_contact || "",
    billing_notes: owner.billing_notes || "",
    owner_type: (owner.owner_type || "individual") as OwnerType,
    civil_id: owner.civil_id || "",
    company_name_ar: owner.company_name_ar || "",
    company_name_en: owner.company_name_en || "",
    commercial_register_number: owner.commercial_register_number || "",
    commercial_register_expiry: owner.commercial_register_expiry || "",
  });

  const f =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isCompany = form.owner_type === "company";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/owners/${owner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error?.message || "Failed to update owner");
      setLoading(false);
      return;
    }

    router.push(`/owners/${owner.id}`);
    router.refresh();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const res = await fetch(`/api/owners/${owner.id}`, { method: "DELETE" });
    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Cannot delete this owner");
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      return;
    }
    router.push("/owners");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/owners/${owner.id}`} className="btn-ghost text-xs">
          {t("back")}
        </Link>
        <h1 className="page-title">{t("editOwnerTitle")}: {owner.full_name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Owner Type Toggle */}
        <div>
          <label className="form-label mb-2 block">{t("ownerType")}</label>
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, owner_type: "individual" }))}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                !isCompany
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t("individual")}
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, owner_type: "company" }))}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                isCompany
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t("company")}
            </button>
          </div>
        </div>

        <h2 className="font-bold text-slate-800 font-display">{t("contactInfo")}</h2>

        <div>
          <label className="form-label">
            {isCompany ? t("contactPersonName") : t("fullNameStar")}
          </label>
          <input value={form.full_name} onChange={f("full_name")} className="form-input" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("phoneNumber")}</label>
            <input value={form.phone} onChange={f("phone")} className="form-input font-mono" placeholder="+968 9100 0000" />
          </div>
          <div>
            <label className="form-label">{t("emailAddress")}</label>
            <input type="email" value={form.email} onChange={f("email")} className="form-input" />
          </div>
        </div>

        {/* Civil ID */}
        <div>
          <label className="form-label">{t("civilId")} {!isCompany && "*"}</label>
          <input
            value={form.civil_id}
            onChange={f("civil_id")}
            className="form-input font-mono"
            placeholder={t("civilIdPlaceholder")}
            required={!isCompany}
          />
          <p className="text-xs text-slate-400 mt-1">
            {isCompany ? t("civilIdContactPerson") : t("civilIdDescription")}
          </p>
        </div>

        {/* Company fields */}
        {isCompany && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h2 className="font-bold text-slate-800 font-display pt-2">{t("companyDetails")}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">{t("companyNameAr")} *</label>
                <input
                  value={form.company_name_ar}
                  onChange={f("company_name_ar")}
                  className="form-input text-right"
                  dir="rtl"
                  placeholder="شركة النور للتجارة"
                  required
                />
              </div>
              <div>
                <label className="form-label">{t("companyNameEn")} *</label>
                <input
                  value={form.company_name_en}
                  onChange={f("company_name_en")}
                  className="form-input"
                  placeholder="Al Noor Trading Co."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">{t("commercialRegisterNumber")} *</label>
                <input
                  value={form.commercial_register_number}
                  onChange={f("commercial_register_number")}
                  className="form-input font-mono"
                  placeholder={t("crNumberPlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="form-label">{t("crExpiryDate")}</label>
                <input
                  type="date"
                  value={form.commercial_register_expiry}
                  onChange={f("commercial_register_expiry")}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="form-label">{t("alternateContact")}</label>
          <input value={form.alternate_contact} onChange={f("alternate_contact")} className="form-input" />
        </div>

        <div>
          <label className="form-label">{t("billingNotes")}</label>
          <textarea value={form.billing_notes} onChange={f("billing_notes")} rows={3} className="form-textarea" />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("saving") : t("saveChanges")}
          </button>
          <Link href={`/owners/${owner.id}`} className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>

      {/* Danger zone */}
      <div className="card p-5 border-red-200">
        <h3 className="font-bold text-red-700 mb-2">{t("dangerZone")}</h3>
        <p className="text-sm text-slate-500 mb-3">{t("deleteOwnerWarning")}</p>
        {showDeleteConfirm ? (
          <div className="flex gap-3 items-center">
            <p className="text-sm font-semibold text-red-700 flex-1">{t("areYouSure")}</p>
            <button onClick={handleDelete} disabled={deleteLoading} className="btn-danger text-sm">
              {deleteLoading ? t("deleting") : t("yesDelete")}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary text-sm">
              {t("cancel")}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm">
            {t("deleteOwner")}
          </button>
        )}
      </div>
    </div>
  );
}
