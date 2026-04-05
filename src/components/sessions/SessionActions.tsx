"use client";
import { IconCalendar, IconCheck, IconWarning } from "@/components/ui/Icons";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatOMR, todayMuscat } from "@/lib/utils";
import { Modal, Alert } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import DateField from "@/components/DateField";

interface SessionActionsProps {
  session: any;
}

export default function SessionActions({ session }: SessionActionsProps) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [showExtend, setShowExtend] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [penalty, setPenalty] = useState<any>(null);

  const [extendForm, setExtendForm] = useState({
    new_end_date: session.expected_end_date,
    new_total_due: session.total_due.toString(),
    notes: session.notes || "",
  });

  const [closeForm, setCloseForm] = useState({
    actual_exit_date: todayMuscat(),
    notes: session.notes || "",
  });

  // Fetch penalty if session is overdue
  useEffect(() => {
    if (session.status === "overdue") {
      fetch(`/api/penalties?session_id=${session.id}`)
        .then(r => r.json())
        .then(result => setPenalty(result.data));
    }
  }, [session.id, session.status]);

  async function handleExtend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "extend",
        new_end_date: extendForm.new_end_date,
        new_total_due: parseFloat(extendForm.new_total_due),
        notes: extendForm.notes,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Failed to extend session");
      setLoading(false);
      return;
    }

    setShowExtend(false);
    router.refresh();
    setLoading(false);
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "close",
        actual_exit_date: closeForm.actual_exit_date,
        notes: closeForm.notes,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Failed to close session");
      setLoading(false);
      return;
    }

    setShowClose(false);
    router.push("/sessions");
    router.refresh();
  }

  const unpaidPenalty = penalty && !penalty.is_paid ? Number(penalty.final_penalty_omr) : 0;

  return (
    <>
      <div className="card p-5">
        <h2 className="font-bold text-slate-800 font-display mb-4">{t("sessionActions")}</h2>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowExtend(true)} className="btn-secondary text-sm">
            <><IconCalendar size={15} /> {t("extendPeriod")}</>
          </button>
          <button onClick={() => setShowClose(true)}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2">
            <><IconCheck size={15} /> {t("closeSession")}</>
          </button>
          {session.remaining_balance > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200">
              <span className="text-red-600 text-sm font-semibold">
                <IconWarning size={14} className="inline mr-1" />
                {formatOMR(session.remaining_balance)} {t("outstandingCollect")}
              </span>
            </div>
          )}
          {unpaidPenalty > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-amber-700 text-sm font-semibold">
                <IconWarning size={14} className="inline mr-1" />
                {t("penaltyOf")} {formatOMR(unpaidPenalty)} {t("unpaidPenaltyWarn")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Extend Modal */}
      <Modal open={showExtend} onClose={() => setShowExtend(false)} title={t("extendPeriod")}>
        <form onSubmit={handleExtend} className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            {t("currentEndDate")}: <strong>{session.expected_end_date}</strong>
          </p>
          <div>
            <label className="form-label">{t("newEndDate")} *</label>
            <DateField value={extendForm.new_end_date} min={session.expected_end_date}
              onChange={(e) => setExtendForm((f) => ({ ...f, new_end_date: e.target.value }))}
              className="form-input" required />
          </div>
          <div>
            <label className="form-label">{t("updatedTotalDue")} (OMR)</label>
            <input type="number" step="0.001" min="0" value={extendForm.new_total_due}
              onChange={(e) => setExtendForm((f) => ({ ...f, new_total_due: e.target.value }))}
              className="form-input font-mono" />
            <p className="text-xs text-slate-400 mt-1">{t("updateIfExtending")}</p>
          </div>
          <div>
            <label className="form-label">{t("notes")}</label>
            <textarea value={extendForm.notes}
              onChange={(e) => setExtendForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2} className="form-textarea" placeholder={t("extensionReasonPlaceholder")} />
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? t("saving") : t("extendPeriod")}
            </button>
            <button type="button" onClick={() => setShowExtend(false)} className="btn-secondary px-5">{t("cancel")}</button>
          </div>
        </form>
      </Modal>

      {/* Close Modal */}
      <Modal open={showClose} onClose={() => setShowClose(false)} title={t("closeSessionTitle")}>
        <form onSubmit={handleClose} className="p-6 space-y-4">
          {session.remaining_balance > 0 ? (
            <Alert variant="warning">
              <IconWarning size={14} className="inline mr-1" />
              {t("outstandingBalanceOf")} {formatOMR(session.remaining_balance)}. {t("ensurePaymentCollected")}
            </Alert>
          ) : (
            <Alert variant="success">{t("accountSettled")}</Alert>
          )}

          {unpaidPenalty > 0 && (
            <Alert variant="danger">
              <IconWarning size={14} className="inline mr-1" />
              {t("unpaidPenaltyOf")} {formatOMR(unpaidPenalty)}. {t("collectPenaltyBefore")}
            </Alert>
          )}

          <div>
            <label className="form-label">{t("actualExitDate")} *</label>
            <DateField value={closeForm.actual_exit_date} min={session.start_date}
              onChange={(e) => setCloseForm((f) => ({ ...f, actual_exit_date: e.target.value }))}
              className="form-input" required />
          </div>
          <div>
            <label className="form-label">{t("closingNotes")}</label>
            <textarea value={closeForm.notes}
              onChange={(e) => setCloseForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2} className="form-textarea" />
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {loading ? t("saving") : <><IconCheck size={14} /> {t("confirmClose")}</>}
            </button>
            <button type="button" onClick={() => setShowClose(false)} className="btn-secondary px-5">{t("cancel")}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
