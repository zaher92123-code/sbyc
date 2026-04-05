"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import DateField from "@/components/DateField";

type OwnerType = "individual" | "company";

export default function NewOwnerPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    alternate_contact: "",
    billing_notes: "",
    owner_type: "individual" as OwnerType,
    civil_id: "",
    company_name_ar: "",
    company_name_en: "",
    commercial_register_number: "",
    commercial_register_expiry: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/owners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error?.message || "Failed to create owner");
      setLoading(false);
      return;
    }

    router.push(`/owners/${result.data.id}`);
    router.refresh();
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isCompany = form.owner_type === "company";

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/owners" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("registerNewOwner")}</h1>
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

        {/* Contact Info */}
        <h2 className="font-bold text-slate-800 font-display">{t("contactInfo")}</h2>

        <div>
          <label className="form-label">
            {isCompany ? t("contactPersonName") : t("fullNameStar")}
          </label>
          <input value={form.full_name} onChange={f("full_name")} className="form-input" placeholder="Mohammed Al Balushi" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("phoneNumber")}</label>
            <input value={form.phone} onChange={f("phone")} className="form-input font-mono" placeholder="+968 9100 0000" />
          </div>
          <div>
            <label className="form-label">{t("emailAddress")}</label>
            <input type="email" value={form.email} onChange={f("email")} className="form-input" placeholder="name@example.com" />
          </div>
        </div>

        {/* Civil ID — always shown */}
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

        {/* Company fields — only when company */}
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
                <DateField
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
          <input value={form.alternate_contact} onChange={f("alternate_contact")} className="form-input" placeholder={t("altContactPlaceholder")} />
        </div>

        <div>
          <label className="form-label">{t("billingNotes")}</label>
          <textarea value={form.billing_notes} onChange={f("billing_notes")} rows={3} className="form-textarea" placeholder={t("billingNotesPlaceholder")} />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("saving") : t("registerOwner")}
          </button>
          <Link href="/owners" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
