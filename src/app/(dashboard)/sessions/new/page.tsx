"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { todayMuscat, formatOMR } from "@/lib/utils";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { IconWarning } from "@/components/ui/Icons";
import DateField from "@/components/DateField";

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBoat = searchParams.get("boat");
  const supabase = createClient();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boats, setBoats] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);

  const [form, setForm] = useState({
    boat_id: preselectedBoat || "",
    parking_spot_id: "",
    start_date: todayMuscat(),
    expected_end_date: "",
    pricing_model: "monthly",
    base_fee: "",
    total_due: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchData() {
      const [{ data: boatsData }, { data: spotsData }] = await Promise.all([
        supabase.from("boats").select("id, name, registration_number, status").order("name"),
        supabase.from("parking_spots").select("id, spot_number, status").eq("status", "empty").order("spot_number", { ascending: true }),
      ]);
      setBoats(boatsData || []);
      setSpots((spotsData || []).sort((a, b) => Number(a.spot_number) - Number(b.spot_number)));
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!form.start_date || !form.expected_end_date || !form.base_fee) return;
    const start = new Date(form.start_date);
    const end   = new Date(form.expected_end_date);
    const days  = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const fee   = parseFloat(form.base_fee);
    if (isNaN(fee)) return;
    let total = 0;
    if (form.pricing_model === "daily")   total = fee * days;
    else if (form.pricing_model === "weekly")  total = fee * Math.max(1, Math.round(days / 7));
    else if (form.pricing_model === "monthly") {
      const months = (end.getFullYear() - start.getFullYear()) * 12
                   + (end.getMonth() - start.getMonth())
                   + (end.getDate() >= start.getDate() ? 0 : -1);
      total = fee * Math.max(1, months);
    }
    else total = fee;
    setForm((f) => ({ ...f, total_due: total.toFixed(3) }));
  }, [form.start_date, form.expected_end_date, form.base_fee, form.pricing_model]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.boat_id || !form.parking_spot_id) {
      setError(t("pleaseSelectBoatAndSpot"));
      setLoading(false);
      return;
    }
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boat_id: form.boat_id, parking_spot_id: form.parking_spot_id,
        start_date: form.start_date, expected_end_date: form.expected_end_date,
        pricing_model: form.pricing_model, base_fee: parseFloat(form.base_fee) || 0,
        total_due: parseFloat(form.total_due) || 0, notes: form.notes || undefined,
      }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error?.message || result.error || "Failed"); setLoading(false); return; }
    router.push(`/boats/${form.boat_id}`);
    router.refresh();
  }

  const days = form.start_date && form.expected_end_date
    ? Math.max(0, Math.round((new Date(form.expected_end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sessions" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("newParkingSession")}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("vesselAndSpot")}</h2>
          <div>
            <label className="form-label">{t("vessel_star")}</label>
            <select value={form.boat_id} onChange={(e) => setForm((f) => ({ ...f, boat_id: e.target.value }))} className="form-select" required>
              <option value="">{t("selectVessel")}</option>
              {boats.map((b) => (
                <option key={b.id} value={b.id} disabled={b.status === "parked"}>
                  {b.name} ({b.registration_number}){b.status === "parked" ? ` ${t("currentlyParkedNote")}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">{t("parkingSpot_star")}</label>
            <select value={form.parking_spot_id} onChange={(e) => setForm((f) => ({ ...f, parking_spot_id: e.target.value }))} className="form-select" required>
              <option value="">{t("selectSpot")}</option>
              {spots.map((s) => <option key={s.id} value={s.id}>{t("spot")} {s.spot_number}</option>)}
            </select>
            {spots.length === 0 && <p className="text-xs text-amber-600 mt-1"><span className="flex items-center gap-1.5"><IconWarning size={13} />{t("noEmptySpotsNote")}</span></p>}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("sessionDates")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("startDate_star")}</label>
              <DateField value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className="form-input" required />
            </div>
            <div>
              <label className="form-label">{t("expectedEndDate_star")}</label>
              <DateField value={form.expected_end_date} min={form.start_date} onChange={(e) => setForm((f) => ({ ...f, expected_end_date: e.target.value }))} className="form-input" required />
              {days > 0 && <p className="text-xs text-slate-400 mt-1">{days} {t("daysDuration")}</p>}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("pricing")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">{t("pricingModel")}</label>
              <select value={form.pricing_model} onChange={(e) => setForm((f) => ({ ...f, pricing_model: e.target.value }))} className="form-select">
                <option value="daily">{t("daily")}</option>
                <option value="weekly">{t("weekly")}</option>
                <option value="monthly">{t("monthly")}</option>
                <option value="custom">{t("custom")}</option>
              </select>
            </div>
            <div>
              <label className="form-label">{t("baseFee")} (OMR / {form.pricing_model === "custom" ? "total" : form.pricing_model})</label>
              <input type="number" step="0.001" min="0" value={form.base_fee} onChange={(e) => setForm((f) => ({ ...f, base_fee: e.target.value }))} placeholder="0.000" className="form-input font-mono" />
            </div>
            <div>
              <label className="form-label">{t("totalDueOMR")}</label>
              <input type="number" step="0.001" min="0" value={form.total_due} onChange={(e) => setForm((f) => ({ ...f, total_due: e.target.value }))} placeholder="0.000" className="form-input font-mono" />
              <p className="text-xs text-slate-400 mt-1">{t("autoCalculated")}</p>
            </div>
          </div>
          {form.total_due && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <p className="text-sm text-teal-700 font-medium">{t("totalAmountToCharge")}</p>
              <p className="text-3xl font-black text-teal-900 num mt-1">{formatOMR(parseFloat(form.total_due) || 0)}</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <label className="form-label">{t("notes")}</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className="form-textarea" placeholder={t("anyAdditionalNotes")} />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("creatingSession") : t("createParkingSession")}
          </button>
          <Link href="/sessions" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
