"use client";

import { useState, useEffect } from "react";
import { Alert, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

type Penalty = {
  id: string;
  session_id: string;
  daily_rate_omr: number;
  start_date: string;
  end_date: string | null;
  days_overdue: number;
  total_penalty_omr: number;
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  discount_reason: string | null;
  final_penalty_omr: number;
  approved_by: string | null;
  is_paid: boolean;
  paid_date: string | null;
  approved_by_user?: { full_name: string } | null;
};

export default function PenaltyCard({ sessionId, sessionStatus }: { sessionId: string; sessionStatus: string }) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

  const [penalty, setPenalty] = useState<Penalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDiscount, setShowDiscount] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [discountForm, setDiscountForm] = useState({
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    discount_reason: "",
  });

  useEffect(() => {
    fetchPenalty();
  }, [sessionId]);

  async function fetchPenalty() {
    setLoading(true);
    const res = await fetch(`/api/penalties?session_id=${sessionId}`);
    const result = await res.json();
    setPenalty(result.data || null);
    setLoading(false);
  }

  async function applyDiscount() {
    if (!penalty) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/penalties/${penalty.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discount_type: discountForm.discount_type,
        discount_value: Number(discountForm.discount_value),
        discount_reason: discountForm.discount_reason,
      }),
    });

    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Failed to apply discount");
      setSaving(false);
      return;
    }

    setShowDiscount(false);
    setSaving(false);
    fetchPenalty();
  }

  async function markPaid() {
    if (!penalty) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/penalties/${penalty.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_paid" }),
    });

    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "Failed to mark as paid");
      setSaving(false);
      return;
    }

    setSaving(false);
    fetchPenalty();
  }

  // Only show for overdue sessions
  if (sessionStatus !== "overdue") return null;
  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{t("loadingPenalty")}</span>
        </div>
      </div>
    );
  }
  if (!penalty) return null;

  const hasDiscount = penalty.discount_type && penalty.discount_value > 0;
  const discountLabel = hasDiscount
    ? penalty.discount_type === "percentage"
      ? `${penalty.discount_value}%`
      : `${Number(penalty.discount_value).toFixed(3)} OMR`
    : null;

  return (
    <div className={`card overflow-hidden ${penalty.is_paid ? "border-emerald-200" : "border-red-200"}`}>
      <div className={`px-5 py-4 flex items-center justify-between ${penalty.is_paid ? "bg-emerald-50" : "bg-red-50"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${penalty.is_paid ? "bg-emerald-100" : "bg-red-100"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={penalty.is_paid ? "#059669" : "#dc2626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-slate-800 font-display">{t("latePenalty")}</h2>
            <p className="text-xs text-slate-500">
              {penalty.days_overdue} {t("daysAt")} {Number(penalty.daily_rate_omr).toFixed(3)} OMR/{t("day")}
            </p>
          </div>
        </div>
        <div className="text-right">
          {penalty.is_paid ? (
            <Badge variant="success">{t("penaltyPaid")}</Badge>
          ) : (
            <Badge variant="danger">{t("penaltyUnpaid")}</Badge>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Amounts */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t("grossPenalty")}</span>
            <span className="num font-semibold text-slate-800">{Number(penalty.total_penalty_omr).toFixed(3)} OMR</span>
          </div>
          {hasDiscount && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("discount")} ({discountLabel})</span>
              <span className="num font-semibold text-emerald-600">
                -{(Number(penalty.total_penalty_omr) - Number(penalty.final_penalty_omr)).toFixed(3)} OMR
              </span>
            </div>
          )}
          <div className="h-px bg-slate-200" />
          <div className="flex justify-between">
            <span className="font-bold text-slate-700">{t("finalPenalty")}</span>
            <span className={`num text-lg font-black ${penalty.is_paid ? "text-emerald-600" : "text-red-600"}`}>
              {Number(penalty.final_penalty_omr).toFixed(3)} OMR
            </span>
          </div>
          {hasDiscount && penalty.discount_reason && (
            <p className="text-xs text-slate-400">{t("discountReason")}: {penalty.discount_reason}</p>
          )}
          {penalty.approved_by_user && (
            <p className="text-xs text-slate-400">{t("approvedBy")}: {penalty.approved_by_user.full_name}</p>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Actions — only when unpaid */}
        {!penalty.is_paid && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            {showDiscount ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="form-label text-xs">{t("discountType")}</label>
                    <select
                      value={discountForm.discount_type}
                      onChange={(e) => setDiscountForm((p) => ({ ...p, discount_type: e.target.value as "percentage" | "fixed" }))}
                      className="form-input text-sm"
                    >
                      <option value="percentage">{t("percentage")} (%)</option>
                      <option value="fixed">{t("fixedAmount")} (OMR)</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="form-label text-xs">{t("discountValue")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={discountForm.discount_value}
                      onChange={(e) => setDiscountForm((p) => ({ ...p, discount_value: e.target.value }))}
                      className="form-input text-sm font-mono"
                      placeholder={discountForm.discount_type === "percentage" ? "e.g. 25" : "e.g. 50.000"}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs">{t("discountReason")}</label>
                  <input
                    value={discountForm.discount_reason}
                    onChange={(e) => setDiscountForm((p) => ({ ...p, discount_reason: e.target.value }))}
                    className="form-input text-sm"
                    placeholder={t("discountReasonPlaceholder")}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={applyDiscount} disabled={saving || !discountForm.discount_value} className="btn-primary text-xs flex-1 justify-center">
                    {saving ? t("saving") : t("applyDiscount")}
                  </button>
                  <button onClick={() => setShowDiscount(false)} className="btn-secondary text-xs">{t("cancel")}</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowDiscount(true)} className="btn-secondary text-xs flex-1 justify-center">
                  {t("giveDiscount")}
                </button>
                <button onClick={markPaid} disabled={saving} className="btn-primary text-xs flex-1 justify-center">
                  {saving ? t("saving") : t("markPenaltyPaid")}
                </button>
              </div>
            )}
          </div>
        )}

        {penalty.is_paid && penalty.paid_date && (
          <p className="text-xs text-emerald-600 font-semibold pt-2 border-t border-slate-100">
            {t("paidOn")} {penalty.paid_date}
          </p>
        )}
      </div>
    </div>
  );
}
