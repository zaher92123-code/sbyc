"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import { IconBoat } from "@/components/ui/Icons";

export default function NewBoatPage() {
  const router = useRouter();
  const supabase = createClient();
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owners, setOwners] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    registration_number: "",
    type: "",
    color: "",
    length_meters: "",
    width_meters: "",
    insurance_company: "",
    insurance_expiry: "",
    width_meters: "",
    insurance_company: "",
    insurance_expiry: "",
    notes: "",
    status: "available",
    owner_id: "",
  });

  useEffect(() => {
    supabase.from("owners").select("id, full_name, phone").order("full_name").then(({ data }) => {
      setOwners(data || []);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/boats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        length_meters: form.length_meters ? parseFloat(form.length_meters) : undefined,
        width_meters: form.width_meters ? parseFloat(form.width_meters) : undefined,
        insurance_company: form.insurance_company || undefined,
        insurance_expiry: form.insurance_expiry || undefined,
        width_meters: form.width_meters ? parseFloat(form.width_meters) : undefined,
        insurance_company: form.insurance_company || undefined,
        insurance_expiry: form.insurance_expiry || undefined,
        owner_id: form.owner_id || undefined,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error?.message || JSON.stringify(result.error) || "Failed to create boat");
      setLoading(false);
      return;
    }

    // Upload photo if selected
    if (photoFile && result.data?.id) {
      const formData = new FormData();
      formData.append("photo", photoFile);
      await fetch(`/api/boats/${result.data.id}/photo`, {
        method: "POST",
        body: formData,
      });
    }

    router.push(`/boats/${result.data.id}`);
    router.refresh();
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) { setError("Invalid file type"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File too large. Max 5MB."); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/boats" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("registerNewVessel")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("vesselInformation")}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">{t("boatPhoto")}</label>
              <div className="flex items-start gap-4">
                <div
                  className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0 cursor-pointer hover:border-teal-400 transition-colors"
                  style={photoPreview ? { borderStyle: "solid", borderColor: "#0e7490" } : {}}
                  onClick={() => fileRef.current?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <IconBoat size={32} className="text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-400 mt-1">{t("noPhoto")}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2 pt-1">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-xs">
                    {photoPreview ? t("changePhoto") : t("uploadPhoto")}
                  </button>
                  {photoPreview && (
                    <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="text-xs text-red-600 hover:text-red-700 font-semibold block">
                      {t("removePhoto")}
                    </button>
                  )}
                  <p className="text-xs text-slate-400">{t("photoHint")}</p>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="form-label">{t("vesselNameStar")}</label>
              <input value={form.name} onChange={f("name")} className="form-input" placeholder="e.g. Al Nokhada" required />
            </div>

            <div className="col-span-2">
              <label className="form-label">{t("regNumberStar")}</label>
              <input
                value={form.registration_number}
                onChange={f("registration_number")}
                className="form-input font-mono"
                placeholder="OM-MSC-2024-001"
                required
              />
            </div>

            <div>
              <label className="form-label">{t("vesselType")}</label>
              <select value={form.type} onChange={f("type")} className="form-select">
                <option value="">{t("selectType")}</option>
                <option value="Dhow">{t("dhow")}</option>
                <option value="Motorboat">{t("motorboat")}</option>
                <option value="Sailing Yacht">{t("sailingYacht")}</option>
                <option value="Luxury Yacht">{t("luxuryYacht")}</option>
                <option value="Speed Boat">{t("speedBoat")}</option>
                <option value="Fishing Boat">{t("fishingBoat")}</option>
                <option value="Ferry">{t("ferry")}</option>
                <option value="Other">{t("other")}</option>
              </select>
            </div>

            <div>
              <label className="form-label">{t("color")}</label>
              <input value={form.color} onChange={f("color")} className="form-input" placeholder="e.g. White/Blue" />
            </div>

            <div>
              <label className="form-label">{t("lengthMeters")}</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="100"
                value={form.length_meters}
                onChange={f("length_meters")}
                className="form-input font-mono"
                placeholder="12.5"
              />
            </div>

            <div>
              <label className="form-label">{t("widthMeters")}</label>
              <input type="number" step="0.1" min="0.5" max="30" value={form.width_meters} onChange={f("width_meters")} className="form-input font-mono" placeholder="4.2" />
            </div>
            <div>
              <label className="form-label">{t("status")}</label>
              <select value={form.status} onChange={f("status")} className="form-select">
                <option value="available">{t("available")}</option>
                <option value="maintenance">{t("maintenance")}</option>
              </select>
            </div>

            <div>
              <label className="form-label">{t("insuranceCompany")}</label>
              <input value={form.insurance_company} onChange={f("insurance_company")} className="form-input" placeholder={t("insuranceCompanyPlaceholder")} />
            </div>

            <div>
              <label className="form-label">{t("insuranceExpiry")}</label>
              <input type="date" value={form.insurance_expiry} onChange={f("insurance_expiry")} className="form-input font-mono" />
            </div>
            <div className="col-span-2">
              <label className="form-label">{t("notes")}</label>
              <textarea value={form.notes} onChange={f("notes")} rows={3} className="form-textarea" placeholder={t("anyNotes")} />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("primaryOwnerTitle")}</h2>

          <div>
            <label className="form-label">{t("owner")}</label>
            <select value={form.owner_id} onChange={f("owner_id")} className="form-select">
              <option value="">{t("selectOwnerOpt")}</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.full_name} {o.phone ? `— ${o.phone}` : ""}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-400">
            {t("dontSeeOwner")}{" "}
            <Link href="/owners/new" className="text-teal-600 hover:underline font-medium">
              {t("registerOwnerFirst")}
            </Link>
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("registering") : t("registerVessel")}
          </button>
          <Link href="/boats" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
