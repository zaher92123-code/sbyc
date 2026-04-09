"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatDatetime, formatOMR } from "@/lib/utils";
import { Alert } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import DateField from "@/components/DateField";

export default function SessionEditCard({ session }: { session: any }) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boats, setBoats] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);

  const [form, setForm] = useState({
    boat_id: session.boat_id,
    parking_spot_id: session.parking_spot_id,
    start_date: session.start_date,
    expected_end_date: session.expected_end_date,
    pricing_model: session.pricing_model,
    base_fee: String(session.base_fee ?? ""),
    total_due: String(session.total_due ?? ""),
    notes: session.notes || "",
  });

  const editLabel = lang === "ar" ? "تعديل" : "Edit";
  const saveLabel = lang === "ar" ? "حفظ التغييرات" : "Save Changes";

  useEffect(() => {
    if (!editing) return;
    const supabase = createClient();
    (async () => {
      const [{ data: b }, { data: s }] = await Promise.all([
        supabase.from("boats").select("id, name, registration_number, status").order("name"),
        supabase.from("parking_spots").select("id, spot_number, status").order("spot_number"),
      ]);
      setBoats(b || []);
      setSpots((s || []).sort((x: any, y: any) => Number(x.spot_number) - Number(y.spot_number)));
    })();
  }, [editing]);

  function cancelEdit() {
    setForm({
      boat_id: session.boat_id,
      parking_spot_id: session.parking_spot_id,
      start_date: session.start_date,
      expected_end_date: session.expected_end_date,
      pricing_model: session.pricing_model,
      base_fee: String(session.base_fee ?? ""),
      total_due: String(session.total_due ?? ""),
      notes: session.notes || "",
    });
    setError(null);
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body: Record<string, unknown> = {
      action: "update",
      notes: form.notes,
      pricing_model: form.pricing_model,
      base_fee: parseFloat(form.base_fee) || 0,
      total_due: parseFloat(form.total_due) || 0,
      start_date: form.start_date,
      expected_end_date: form.expected_end_date,
    };
    if (form.boat_id !== session.boat_id) body.boat_id = form.boat_id;
    if (form.parking_spot_id !== session.parking_spot_id) body.parking_spot_id = form.parking_spot_id;

    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed to update");
      setLoading(false);
      return;
    }
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("sessionDetails")}</h2>
          {session.status !== "closed" && (
            <button onClick={() => setEditing(true)} className="btn-ghost text-xs">{editLabel}</button>
          )}
        </div>
        {[
          { label: t("startDate"),    value: formatDate(session.start_date) },
          { label: t("expectedEnd"),  value: formatDate(session.expected_end_date) },
          { label: t("actualExit"),   value: session.actual_exit_date ? formatDate(session.actual_exit_date) : "—" },
          { label: t("pricingModel"), value: session.pricing_model },
          { label: t("baseFee"),      value: formatOMR(session.base_fee) },
          { label: t("createdBy"),    value: session.created_by_user?.full_name || "System" },
          { label: t("createdAt"),    value: formatDatetime(session.created_at) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-semibold text-slate-800">{value}</span>
          </div>
        ))}
        {session.notes && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">{t("notes")}</p>
            <p className="text-sm text-slate-600">{session.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="card p-5 space-y-4 col-span-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("sessionDetails")}</h2>
        <button type="button" onClick={cancelEdit} className="btn-ghost text-xs">{t("cancel")}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">{t("vessel")}</label>
          <select
            value={form.boat_id}
            onChange={(e) => setForm((f) => ({ ...f, boat_id: e.target.value }))}
            className="form-select" required
          >
            {boats.map((b) => (
              <option key={b.id} value={b.id} disabled={b.status === "parked" && b.id !== session.boat_id}>
                {b.name} ({b.registration_number})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">{t("spot")}</label>
          <select
            value={form.parking_spot_id}
            onChange={(e) => setForm((f) => ({ ...f, parking_spot_id: e.target.value }))}
            className="form-select" required
          >
            {spots.map((s) => (
              <option key={s.id} value={s.id} disabled={s.status !== "empty" && s.id !== session.parking_spot_id}>
                {t("spot")} {s.spot_number}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">{t("startDate")}</label>
          <DateField
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            className="form-input" required
          />
        </div>
        <div>
          <label className="form-label">{t("expectedEnd")}</label>
          <DateField
            value={form.expected_end_date}
            min={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, expected_end_date: e.target.value }))}
            className="form-input" required
          />
        </div>
        <div>
          <label className="form-label">{t("pricingModel")}</label>
          <select
            value={form.pricing_model}
            onChange={(e) => setForm((f) => ({ ...f, pricing_model: e.target.value }))}
            className="form-select"
          >
            <option value="daily">{t("daily")}</option>
            <option value="weekly">{t("weekly")}</option>
            <option value="monthly">{t("monthly")}</option>
            <option value="custom">{t("custom")}</option>
          </select>
        </div>
        <div>
          <label className="form-label">{t("baseFee")} (OMR)</label>
          <input
            type="number" step="0.001" min="0"
            value={form.base_fee}
            onChange={(e) => setForm((f) => ({ ...f, base_fee: e.target.value }))}
            className="form-input font-mono"
          />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">{t("totalDue")} (OMR)</label>
          <input
            type="number" step="0.001" min="0"
            value={form.total_due}
            onChange={(e) => setForm((f) => ({ ...f, total_due: e.target.value }))}
            className="form-input font-mono"
          />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">{t("notes")}</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2} className="form-textarea"
          />
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? t("saving") : saveLabel}
        </button>
        <button type="button" onClick={cancelEdit} className="btn-secondary px-5">{t("cancel")}</button>
      </div>
    </form>
  );
}
