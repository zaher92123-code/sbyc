"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { formatOMR, formatDate, todayMuscat } from "@/lib/utils";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import DateField from "@/components/DateField";

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSession = searchParams.get("session");
  const supabase = createClient();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const [form, setForm] = useState({
    session_id: preselectedSession || "",
    amount: "",
    payment_date: todayMuscat(),
    payment_method: "Bank Transfer",
    reference_number: "",
    notes: "",
    is_adjustment: false,
    adjustment_reason: "",
  });

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase.from("active_sessions_view").select("*")
        .in("status", ["active", "ending_soon", "overdue"]).order("boat_name");
      setSessions(data || []);
      if (preselectedSession) {
        const found = data?.find((s: any) => s.session_id === preselectedSession);
        if (found) setSelectedSession(found);
      }
    }
    fetchSessions();
  }, []);

  function handleSessionChange(id: string) {
    const s = sessions.find((s) => s.session_id === id);
    setSelectedSession(s || null);
    setForm((f) => ({ ...f, session_id: id }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.session_id) { setError(t("pleaseSelectBoatAndSpot")); setLoading(false); return; }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setError("Please enter a valid amount"); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error: dbError } = await supabase.from("payments").insert({
      session_id: form.session_id, amount, payment_date: form.payment_date,
      payment_method: form.payment_method || null, reference_number: form.reference_number || null,
      notes: form.notes || null, is_adjustment: form.is_adjustment,
      adjustment_reason: form.is_adjustment ? form.adjustment_reason : null, created_by: user?.id,
    });
    if (dbError) { setError(dbError.message); setLoading(false); return; }
    await supabase.from("audit_logs").insert({
      user_id: user?.id, action: "payment_recorded", table_name: "payments",
      description: `Payment of ${formatOMR(amount)} recorded for session ${form.session_id}`,
    });
    router.push(selectedSession ? `/boats/${selectedSession.boat_id}` : "/payments");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/payments" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("recordPaymentTitle")}</h1>
      </div>

      {selectedSession && (
        <div className="card p-5" style={{ background:"linear-gradient(135deg,#f0fdfc,#fff)", borderColor:"#99f6f0" }}>
          <h2 className="font-bold text-teal-900 mb-3">{t("sessionSummary")}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-500">{t("vessel")}</p><p className="font-bold text-slate-900">{selectedSession.boat_name}</p></div>
            <div><p className="text-slate-500">{t("spot")}</p><p className="font-mono font-bold text-slate-900">{selectedSession.spot_number}</p></div>
            <div><p className="text-slate-500">{t("totalDue")}</p><p className="num font-bold text-slate-900">{formatOMR(selectedSession.total_due)}</p></div>
            <div><p className="text-slate-500">{t("alreadyPaid")}</p><p className="num font-bold text-emerald-600">{formatOMR(selectedSession.total_paid)}</p></div>
          </div>
          <div className="mt-3 pt-3 border-t border-teal-100 flex justify-between items-center">
            <span className="font-bold text-slate-700">{t("outstandingBalance")}</span>
            <span className="num text-2xl font-black text-red-600">{formatOMR(selectedSession.remaining_balance)}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="form-label">{t("parkingSessionStar")}</label>
          <select value={form.session_id} onChange={(e) => handleSessionChange(e.target.value)} className="form-select" required>
            <option value="">{t("selectSession")}</option>
            {sessions.map((s: any) => (
              <option key={s.session_id} value={s.session_id}>
                {s.boat_name} — {t("spot")} {s.spot_number} — {t("balance")}: {formatOMR(s.remaining_balance)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("amountOMRStar")}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">OMR</span>
              <input type="number" step="0.001" min="0.001" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.000" className="form-input pl-12 font-mono" required />
            </div>
            {selectedSession && form.amount && (
              <p className="text-xs text-slate-400 mt-1">{t("remainingAfter")} {formatOMR(selectedSession.remaining_balance - (parseFloat(form.amount) || 0))}</p>
            )}
          </div>
          <div>
            <label className="form-label">{t("paymentDateStar")}</label>
            <DateField value={form.payment_date} onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))} className="form-input" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("paymentMethodLabel")}</label>
            <select value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))} className="form-select">
              <option>{t("bankTransfer")}</option>
              <option>{t("cash")}</option>
              <option>{t("cheque")}</option>
              <option>{t("onlinePayment")}</option>
              <option>{t("other")}</option>
            </select>
          </div>
          <div>
            <label className="form-label">{t("referenceNumber")}</label>
            <input type="text" value={form.reference_number} onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))} placeholder="TXN-2024-001" className="form-input font-mono" />
          </div>
        </div>

        <div>
          <label className="form-label">{t("notes")}</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="form-textarea" placeholder={t("optionalNotes")} />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_adjustment} onChange={(e) => setForm((f) => ({ ...f, is_adjustment: e.target.checked }))} className="rounded" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">{t("manualAdjustment")}</p>
              <p className="text-xs text-amber-600">{t("adjustmentNote")}</p>
            </div>
          </label>
          {form.is_adjustment && (
            <div className="mt-3">
              <label className="form-label">{t("adjustmentReasonLabel")}</label>
              <input type="text" value={form.adjustment_reason} onChange={(e) => setForm((f) => ({ ...f, adjustment_reason: e.target.value }))} className="form-input" placeholder={t("reasonPlaceholder")} required={form.is_adjustment} />
            </div>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("recording") : t("recordPaymentTitle")}
          </button>
          <Link href="/payments" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
