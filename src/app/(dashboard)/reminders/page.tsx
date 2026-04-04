"use client";

import { useState, useEffect } from "react";
import { Badge, Alert, EmptyState } from "@/components/ui";
import { IconBell, IconSettings, IconClock, IconCheck, IconWarning, IconSend, IconMail } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";
import Link from "next/link";
import ReminderRulesManager from "@/components/reminders/ReminderRulesManager";

/* ─── Types ───────────────────────────────────────────────────────────────── */

type Notification = {
  id: string; channel: "whatsapp" | "email"; status: string;
  recipient_name: string; recipient_phone: string; recipient_email: string;
  subject: string; message_body: string; trigger_type: string;
  rejected_reason: string; error_message: string; created_at: string;
  sent_at: string; approved_at: string;
  recipient?: { id: string; full_name: string; phone: string | null; email: string | null } | null;
  approver?: { full_name: string } | null;
};

type Reminder = {
  id: string; status: string; reminder_type: string; recipient_type: string;
  recipient_email: string; scheduled_date: string; sent_at: string;
  error_message: string;
  session?: { id: string; expected_end_date: string; status: string; boat?: { id: string; name: string } } | null;
  rule?: { name: string } | null;
};

type ReminderRule = {
  id: string; name: string; days_before_end: number; recipient_type: string;
  template_key: string; is_active: boolean; custom_message: string | null;
  custom_subject: string | null;
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */

export default function NotificationsPage() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key]?.[lang] ?? T[key]?.["en"] ?? key;

  const [tab, setTab] = useState<"queue" | "rules" | "history">("queue");

  const tabs = [
    { key: "queue" as const,   label: t("notificationQueue"),  icon: <IconBell size={15} />,     desc: lang === "ar" ? "مراجعة وإرسال الرسائل" : "Review & send messages" },
    { key: "rules" as const,   label: t("reminderRules"),      icon: <IconSettings size={15} />, desc: lang === "ar" ? "إعداد التذكيرات التلقائية" : "Configure auto-reminders" },
    { key: "history" as const, label: t("emailHistory"),       icon: <IconClock size={15} />,    desc: lang === "ar" ? "سجل الرسائل المرسلة" : "Sent messages log" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="page-title">{t("notificationQueue")}</h1>
        <p className="text-sm text-slate-500 mt-1">{t("notifQueueDesc")}</p>
      </div>

      {/* Tab cards */}
      <div className="grid grid-cols-3 gap-3">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`relative rounded-xl p-4 text-left transition-all ${
              tab === tb.key
                ? "bg-[#0A1628] text-white shadow-lg ring-2 ring-teal-500/30"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <span className={tab === tb.key ? "text-teal-400" : "text-slate-400"}>{tb.icon}</span>
              <span className="text-sm font-bold">{tb.label}</span>
            </div>
            <p className={`text-xs ${tab === tb.key ? "text-slate-400" : "text-slate-400"}`}>{tb.desc}</p>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "queue" && <QueueTab t={t} lang={lang} />}
      {tab === "rules" && <RulesTab t={t} lang={lang} />}
      {tab === "history" && <HistoryTab t={t} lang={lang} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1: QUEUE — Notification queue with approve / reject / send
   ═══════════════════════════════════════════════════════════════════════════ */

function QueueTab({ t, lang }: { t: (k: any) => string; lang: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState({ status: "pending", channel: "all" });
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    channel: "whatsapp" as "whatsapp" | "email",
    recipient_name: "", recipient_phone: "", recipient_email: "",
    subject: "", message_body: "",
  });

  const statusTabs = ["pending", "approved", "sent", "rejected", "failed"];

  useEffect(() => { fetchData(); }, [filter.status, filter.channel]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams({ status: filter.status, channel: filter.channel });
    const res = await fetch(`/api/notification-queue?${params}`);
    const result = await res.json();
    setNotifications(result.data || []);
    setLoading(false);
  }

  async function doAction(id: string, action: "approve" | "reject" | "send", reason?: string) {
    setActing(id);
    await fetch(`/api/notification-queue/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejected_reason: reason }),
    });
    setRejectId(null); setRejectReason(""); setActing(null);
    fetchData();
  }

  async function batchAction(action: "approve" | "send") {
    const items = notifications.filter(n => action === "approve" ? n.status === "pending" : n.status === "approved");
    for (const n of items) {
      await fetch(`/api/notification-queue/${n.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    }
    fetchData();
  }

  async function handleCompose(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/notification-queue", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(composeForm),
    });
    setShowCompose(false);
    setComposeForm({ channel: "whatsapp", recipient_name: "", recipient_phone: "", recipient_email: "", subject: "", message_body: "" });
    fetchData();
  }

  const statusVariant: Record<string, "warning" | "info" | "success" | "danger" | "default"> = {
    pending: "warning", approved: "info", sent: "success", rejected: "default", failed: "danger",
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Status pills */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {statusTabs.map((s) => (
              <button key={s} onClick={() => setFilter((p) => ({ ...p, status: s }))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                  filter.status === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >{s}</button>
            ))}
          </div>
          <select value={filter.channel} onChange={(e) => setFilter((p) => ({ ...p, channel: e.target.value }))}
            className="form-input text-xs w-28 py-1.5">
            <option value="all">{t("allChannels")}</option>
            <option value="email">{t("email")}</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div className="flex gap-2">
          {filter.status === "pending" && notifications.length > 0 && (
            <button onClick={() => batchAction("approve")} className="btn-secondary text-xs">{t("approveAll")}</button>
          )}
          {filter.status === "approved" && notifications.length > 0 && (
            <button onClick={() => batchAction("send")} className="btn-primary text-xs">
              <IconSend size={12} className="mr-1" />{t("sendAll")}
            </button>
          )}
          <button onClick={() => setShowCompose(!showCompose)} className="btn-primary text-xs">
            {showCompose ? t("cancel") : t("composeMessage")}
          </button>
        </div>
      </div>

      {/* Compose form */}
      {showCompose && (
        <form onSubmit={handleCompose} className="card p-6 space-y-5">
          <h2 className="font-bold text-slate-800 font-display">{t("composeMessage")}</h2>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="form-label">{t("channelLabel")}</label>
              <select value={composeForm.channel} onChange={(e) => setComposeForm((p) => ({ ...p, channel: e.target.value as any }))} className="form-input">
                <option value="whatsapp">WhatsApp</option>
                <option value="email">{t("email")}</option>
              </select>
            </div>
            <div>
              <label className="form-label">{t("recipientName")}</label>
              <input value={composeForm.recipient_name} onChange={(e) => setComposeForm((p) => ({ ...p, recipient_name: e.target.value }))} className="form-input" />
            </div>
            <div>
              <label className="form-label">{composeForm.channel === "whatsapp" ? t("phone") : t("email")}</label>
              {composeForm.channel === "whatsapp" ? (
                <input value={composeForm.recipient_phone} onChange={(e) => setComposeForm((p) => ({ ...p, recipient_phone: e.target.value }))} className="form-input font-mono" placeholder="+968" />
              ) : (
                <input type="email" value={composeForm.recipient_email} onChange={(e) => setComposeForm((p) => ({ ...p, recipient_email: e.target.value }))} className="form-input" />
              )}
            </div>
          </div>
          {composeForm.channel === "email" && (
            <div>
              <label className="form-label">{t("subjectLabel")}</label>
              <input value={composeForm.subject} onChange={(e) => setComposeForm((p) => ({ ...p, subject: e.target.value }))} className="form-input" />
            </div>
          )}
          <div>
            <label className="form-label">{t("messageBody")} *</label>
            <textarea value={composeForm.message_body} onChange={(e) => setComposeForm((p) => ({ ...p, message_body: e.target.value }))} rows={4} className="form-textarea" required />
          </div>
          <button type="submit" className="btn-primary text-sm">{t("addToQueue")}</button>
        </form>
      )}

      {/* Notification cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">{t("loading")}</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="card p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    n.channel === "whatsapp" ? "bg-green-50" : "bg-blue-50"
                  }`}>
                    {n.channel === "whatsapp" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    ) : (
                      <IconMail size={18} className="text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {n.recipient?.full_name || n.recipient_name || "—"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {n.channel === "whatsapp"
                        ? (n.recipient_phone || n.recipient?.phone || "—")
                        : (n.recipient_email || n.recipient?.email || "—")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant={statusVariant[n.status] || "default"} className="text-[10px]">{n.status}</Badge>
                  <span className="text-[11px] text-slate-400">{new Date(n.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                </div>
              </div>

              {/* Subject */}
              {n.subject && (
                <p className="text-xs font-semibold text-slate-600 mb-2">{n.subject}</p>
              )}

              {/* Message body */}
              <div className="bg-slate-50 rounded-xl p-4 mb-3">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-4">{n.message_body}</p>
              </div>

              {/* Meta */}
              {n.trigger_type && <p className="text-xs text-slate-400 mb-2">{t("trigger")}: {n.trigger_type}</p>}
              {n.rejected_reason && <p className="text-xs text-red-500 mb-2">{t("rejectedReason")}: {n.rejected_reason}</p>}
              {n.error_message && <p className="text-xs text-red-500 mb-2">{t("errorMsg")}: {n.error_message}</p>}

              {/* Actions */}
              {n.status === "pending" && (
                <div className="flex gap-2 pt-2 border-t border-slate-100 mt-3">
                  {rejectId === n.id ? (
                    <div className="flex gap-2 flex-1">
                      <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                        className="form-input text-sm flex-1" placeholder={t("rejectReasonPlaceholder")} />
                      <button onClick={() => doAction(n.id, "reject", rejectReason)} disabled={acting === n.id}
                        className="btn-danger text-xs">{t("confirmReject")}</button>
                      <button onClick={() => setRejectId(null)} className="btn-secondary text-xs">{t("cancel")}</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => doAction(n.id, "approve")} disabled={acting === n.id}
                        className="btn-primary text-xs"><IconCheck size={12} className="mr-1" />{t("approve")}</button>
                      <button onClick={() => setRejectId(n.id)}
                        className="btn-danger text-xs">{t("reject")}</button>
                    </>
                  )}
                </div>
              )}
              {n.status === "approved" && (
                <div className="pt-2 border-t border-slate-100 mt-3">
                  <button onClick={() => doAction(n.id, "send")} disabled={acting === n.id}
                    className="btn-primary text-xs"><IconSend size={12} className="mr-1" />{acting === n.id ? t("sending") : t("sendNow")}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={<IconBell size={44} className="opacity-30" />}
            title={t("noNotifications")}
            description={lang === "ar" ? "لا توجد رسائل في هذه الفئة" : "No messages in this category"}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2: RULES — Reminder rules (reuse existing component)
   ═══════════════════════════════════════════════════════════════════════════ */

function RulesTab({ t, lang }: { t: (k: any) => string; lang: string }) {
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reminder-rules")
      .then((r) => r.json())
      .then((data) => { setRules(Array.isArray(data) ? data : data.data || []); setLoading(false); });
  }, []);

  if (loading) return <div className="py-16 text-center text-slate-400">{t("loading")}</div>;

  return <ReminderRulesManager initialRules={rules} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3: HISTORY — Sent reminders log
   ═══════════════════════════════════════════════════════════════════════════ */

function HistoryTab({ t, lang }: { t: (k: any) => string; lang: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchReminders(); }, [statusFilter]);

  async function fetchReminders() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/reminders?${params}`);
    const result = await res.json();
    setReminders(result.data || []);
    setLoading(false);
  }

  async function sendPending() {
    setSending(true);
    await fetch("/api/reminders/send", { method: "POST" });
    setSending(false);
    fetchReminders();
  }

  const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
    pending:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
    sent:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    failed:    { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
    skipped:   { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200" },
    cancelled: { bg: "bg-slate-50",   text: "text-slate-500",   border: "border-slate-200" },
  };

  const pendingCount = reminders.filter((r) => r.status === "pending").length;
  const failedCount = reminders.filter((r) => r.status === "failed").length;

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {pendingCount > 0 && (
        <div className="rounded-xl px-5 py-4 flex items-center justify-between bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <IconWarning size={20} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">{pendingCount} {t("remindersOverdueToSend")}</p>
              <p className="text-xs text-amber-600 mt-0.5">{t("switchToHistory")}</p>
            </div>
          </div>
          <button onClick={sendPending} disabled={sending} className="btn-primary text-xs flex-shrink-0">
            <IconSend size={12} className="mr-1.5" />
            {sending ? t("sending") : t("sendPendingNow")}
          </button>
        </div>
      )}

      {failedCount > 0 && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3 bg-red-50 border border-red-200">
          <IconWarning size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">{failedCount} {t("remindersFailed")}</p>
            <p className="text-xs text-red-600 mt-0.5">{t("checkHistoryTab")}</p>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select text-sm w-36">
            <option value="all">{t("allStatusFilter")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="sent">{t("sent")}</option>
            <option value="failed">{t("failed")}</option>
            <option value="skipped">{t("skipped")}</option>
          </select>
          <span className="text-xs text-slate-400">{reminders.length} {t("records")}</span>
        </div>
      </div>

      {/* Reminder cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">{t("loading")}</div>
      ) : reminders.length > 0 ? (
        <div className="space-y-2">
          {reminders.map((r) => {
            const st = statusStyle[r.status] || statusStyle.skipped;
            return (
              <div key={r.id} className="card px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: vessel + rule */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      r.status === "sent" ? "bg-emerald-500" :
                      r.status === "failed" ? "bg-red-500" :
                      r.status === "pending" ? "bg-amber-400" : "bg-slate-300"
                    }`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {r.session?.boat ? (
                          <Link href={`/boats/${r.session.boat.id}`} className="text-sm font-bold text-slate-800 hover:text-teal-700 truncate">
                            {r.session.boat.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                        <span className="text-xs text-slate-400 hidden sm:inline">·</span>
                        <span className="text-xs text-slate-500 truncate hidden sm:inline">
                          {r.rule?.name || r.reminder_type?.replace(/_/g, " ") || "—"}
                        </span>
                      </div>
                      {r.error_message && (
                        <p className="text-xs text-red-500 mt-0.5 truncate max-w-md">{r.error_message}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: meta */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={r.recipient_type === "customer" ? "info" : "default"} className="text-[10px] hidden sm:inline-flex">
                      {r.recipient_type}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono whitespace-nowrap">{r.scheduled_date}</span>
                    <span className={`badge text-[10px] ${st.bg} ${st.text} ${st.border}`}>{r.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            title={t("noReminderHistory")}
            icon={<IconBell size={44} className="opacity-30" />}
            description={lang === "ar" ? "لم يتم إرسال أي تذكيرات بعد" : "No reminders have been sent yet"}
          />
        </div>
      )}
    </div>
  );
}
