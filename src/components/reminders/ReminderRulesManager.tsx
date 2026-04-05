"use client";
import { Icon, IconBell, IconMail, IconBookmark, IconClock, IconSend, IconRepeat, IconKey, IconLightning, IconCheck, IconInfo, IconAnchor } from "@/components/ui/Icons";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

// ── Placeholder definitions ───────────────────────────────────────────────────
function usePlaceholders() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  return [
    { token: "[Owner Name]",     desc: t("phOwnerName"),      icon: "person" },
    { token: "[Boat Name]",      desc: t("phBoatName"),       icon: "boat" },
    { token: "[Spot Number]",    desc: t("phSpotNumber"),     icon: "pin" },
    { token: "[Expiry Date]",    desc: t("phExpiryDate"),     icon: "cal" },
    { token: "[Entry Date]",     desc: t("phEntryDate"),      icon: "cal" },
    { token: "[Days Remaining]", desc: t("phDaysRemaining"),  icon: "time" },
    { token: "[Balance Due]",    desc: t("phBalanceDue"),     icon: "money" },
    { token: "[Total Due]",      desc: t("phTotalDue"),       icon: "card" },
    { token: "[Total Paid]",     desc: t("phTotalPaid"),      icon: "check" },
    { token: "[Registration]",   desc: t("phRegistration"),   icon: "num" },
    { token: "[Marina Name]",    desc: t("phMarinaName"),     icon: "anchor" },
  ];
}

const PLACEHOLDERS_STATIC = [
  { token: "[Owner Name]" }, { token: "[Boat Name]" }, { token: "[Spot Number]" },
  { token: "[Registration]" }, { token: "[Entry Date]" }, { token: "[Expiry Date]" },
  { token: "[Days Remaining]" }, { token: "[Balance Due]" }, { token: "[Total Due]" },
  { token: "[Total Paid]" }, { token: "[Marina Name]" },
];

const TOKEN_REGEX = /(\[Owner Name\]|\[Boat Name\]|\[Spot Number\]|\[Registration\]|\[Entry Date\]|\[Expiry Date\]|\[Days Remaining\]|\[Balance Due\]|\[Total Due\]|\[Total Paid\]|\[Marina Name\])/gi;

function renderWithHighlights(text: string): React.ReactNode[] {
  const parts = text.split(TOKEN_REGEX);
  return parts.map((part, i) => {
    const isToken = PLACEHOLDERS_STATIC.some(p => p.token.toLowerCase() === part.toLowerCase());
    if (!isToken) return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    return (
      <span key={i}
        style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
          color: "#065f46", fontWeight: 700, borderRadius: 5,
          padding: "1px 6px", fontSize: "0.85em",
          border: "1px solid #6ee7b7", lineHeight: 1.6,
          boxShadow: "0 1px 2px rgba(6,95,70,0.1)",
          cursor: "help",
        }}>
        {part}
      </span>
    );
  });
}

// ── Live preview ──────────────────────────────────────────────────────────────
function LivePreview({ subject, message }: { subject: string; message: string }) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  if (!message && !subject) return null;
  return (
    <div style={{
      marginTop: 12,
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #d1fae5",
      boxShadow: "0 2px 8px rgba(6,95,70,0.08)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px",
        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
        borderBottom: "1px solid #a7f3d0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <IconMail size={14} className="text-emerald-700" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46", letterSpacing: "0.04em" }}>
            {t("emailPreview")}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#059669" }}>
          <span style={{
            display: "inline-block", width: 7, height: 7,
            background: "#10b981", borderRadius: "50%", marginRight: 5,
          }} />
          {t("greenTokensNote")}
        </span>
      </div>

      <div style={{ background: "#f8fafc", padding: "16px" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          border: "1px solid #e2e8f0",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #0A1628 0%, #0E7490 100%)",
            padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <IconAnchor size={16} className="text-white" />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Al Seeb Boat Club</span>
          </div>

          {subject && (
            <div style={{
              padding: "10px 18px", borderBottom: "1px solid #f1f5f9",
              display: "flex", alignItems: "baseline", gap: 8,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
                {t("subject")}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                {renderWithHighlights(subject)}
              </span>
            </div>
          )}

          {message && (
            <div style={{
              padding: "14px 18px",
              fontSize: 13,
              color: "#334155",
              lineHeight: 1.75,
              fontFamily: "ui-monospace, monospace",
            }}>
              {renderWithHighlights(message)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Placeholder chip picker ───────────────────────────────────────────────────
function PlaceholderChips({ onInsert }: { onInsert: (token: string) => void }) {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const placeholders = usePlaceholders();
  return (
    <div style={{ marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 8,
          background: open ? "#ecfdf5" : "#f8fafc",
          border: "1px solid " + (open ? "#6ee7b7" : "#e2e8f0"),
          color: open ? "#065f46" : "#64748b",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <IconBookmark size={14} />
        {t("insertPlaceholder")}
        <span style={{
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s",
          fontSize: 10,
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          marginTop: 8,
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 6,
          padding: "10px",
          background: "#f8fafc",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
        }}>
          {placeholders.map(ph => (
            <button
              key={ph.token}
              type="button"
              onClick={() => { onInsert(ph.token); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 10px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "#ecfdf5";
                (e.currentTarget as HTMLElement).style.borderColor = "#6ee7b7";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "#ffffff";
                (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", flexShrink: 0, display: "inline-block" }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", fontFamily: "ui-monospace, monospace" }}>
                  {ph.token}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{ph.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ReminderRule {
  id: string;
  name: string;
  days_before_end: number;
  recipient_type: "customer" | "staff" | "both";
  template_key: string;
  is_active: boolean;
  custom_subject?: string;
  custom_message?: string;
}

interface Props { initialRules: ReminderRule[] }

function useRecipientLabels() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  return {
    customer: t("boatOwnerOnly"),
    staff:    t("staffOnly"),
    both:     t("boatOwnerStaff"),
  } as Record<string, string>;
}

function useTimingLabel() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  return (days: number) => {
    if (days > 0) return `${days} ${days !== 1 ? t("daysBeforeExpiry") : t("dayBeforeExpiry")}`;
    if (days === 0) return t("onExpiryDate");
    return `${Math.abs(days)} ${Math.abs(days) !== 1 ? t("daysAfterExpiry") : t("dayAfterExpiry")}`;
  };
}

// ── Rule form ─────────────────────────────────────────────────────────────────
function RuleForm({ initial, onSave, onCancel }: {
  initial?: Partial<ReminderRule>;
  onSave: (d: Partial<ReminderRule>) => Promise<void>;
  onCancel: () => void;
}) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [form, setForm] = useState<Partial<ReminderRule>>({
    name: "", days_before_end: 7, recipient_type: "both",
    template_key: "expiry_reminder", is_active: true,
    custom_subject: "", custom_message: "", ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: keyof ReminderRule, v: any) { setForm(p => ({ ...p, [k]: v })); }

  function insertToken(token: string) {
    const ta = document.getElementById("reminder-message-body") as HTMLTextAreaElement;
    if (!ta) { set("custom_message", (form.custom_message || "") + token); return; }
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const before = (form.custom_message || "").slice(0, start);
    const after  = (form.custom_message || "").slice(end);
    const newVal = before + token + after;
    set("custom_message", newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { setError(t("ruleName") + " required."); return; }
    setSaving(true); setError("");
    try { await onSave(form); }
    catch (err: any) { setError(err.message || "Failed to save."); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("ruleName")}</label>
        <input className="form-input w-full" placeholder={t("ruleNamePlaceholder")}
          value={form.name || ""} onChange={e => set("name", e.target.value)} />
        <p className="text-xs text-slate-400 mt-1">{t("ruleNameHint")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("daysRelative")}</label>
          <div className="flex items-center gap-2">
            <input type="number" className="form-input w-24"
              value={form.days_before_end ?? 7}
              onChange={e => set("days_before_end", parseInt(e.target.value, 10) || 0)} />
            <span className="text-sm text-slate-500">{t("daysWord")}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t("positiveBeforeHint")}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("sendEmailTo")}</label>
          <select className="form-select w-full" value={form.recipient_type}
            onChange={e => set("recipient_type", e.target.value)}>
            <option value="both">{t("boatOwnerStaff")}</option>
            <option value="customer">{t("boatOwnerOnly")}</option>
            <option value="staff">{t("staffOnly")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("emailSubject")}</label>
        <input className="form-input w-full"
          placeholder={t("emailSubjectPlaceholder")}
          value={form.custom_subject || ""} onChange={e => set("custom_subject", e.target.value)} />
        <p className="text-xs text-slate-400 mt-1">{t("leaveBlankDefault")}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            {t("customMessageBody")} <span className="font-normal text-slate-400">({t("optional")})</span>
          </label>
        </div>

        <PlaceholderChips onInsert={insertToken} />

        <textarea
          id="reminder-message-body"
          className="form-input w-full font-mono text-sm"
          style={{ minHeight: 160, resize: "vertical" }}
          placeholder={"Dear [Owner Name],\n\nYour boat [Boat Name] at spot [Spot Number] expires on [Expiry Date].\nOutstanding balance: [Balance Due].\n\nPlease contact us to renew your storage contract.\n\nAl Seeb Boat Club"}
          value={form.custom_message || ""}
          onChange={e => set("custom_message", e.target.value)}
        />

        <LivePreview subject={form.custom_subject || ""} message={form.custom_message || ""} />
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => set("is_active", !form.is_active)}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-teal-500" : "bg-slate-300"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {form.is_active ? t("activeAutoSend") : t("disabledNoSend")}
        </span>
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t("saving") : t("saveRule")}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">{t("cancel")}</button>
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReminderRulesManager({ initialRules }: Props) {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const recipientLabels = useRecipientLabels();
  const timingLabel = useTimingLabel();
  const [rules, setRules] = useState<ReminderRule[]>(initialRules);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleToggle(rule: ReminderRule) {
    const updated = { ...rule, is_active: !rule.is_active };
    setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
    await fetch(`/api/reminder-rules/${rule.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: updated.is_active }),
    });
    showToast(updated.is_active ? t("ruleEnabled") : t("ruleDisabled"));
  }

  async function handleSave(data: Partial<ReminderRule>) {
    if (editing === "new") {
      const res = await fetch("/api/reminder-rules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, template_key: data.template_key || "expiry_reminder" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setRules(prev => [...prev, created]);
      showToast(t("ruleCreated"));
    } else {
      const res = await fetch(`/api/reminder-rules/${editing}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setRules(prev => prev.map(r => r.id === editing ? updated : r));
      showToast(t("ruleUpdated"));
    }
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    setDeleting(id);
    const res = await fetch(`/api/reminder-rules/${id}`, { method: "DELETE" });
    if (res.ok) { setRules(prev => prev.filter(r => r.id !== id)); showToast(t("ruleDeleted")); }
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl">
          ✓ {toast}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold text-slate-800 font-display text-lg">{t("reminderRules")}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("eachRuleSends")}
          </p>
        </div>
        {editing !== "new" && (
          <button className="btn-primary" onClick={() => setEditing("new")}>{t("newRule")}</button>
        )}
      </div>

      {editing === "new" && (
        <div className="card p-6 border-2 border-teal-200 bg-teal-50/20">
          <h3 className="font-bold text-slate-800 mb-5 text-base">{t("createNewRule")}</h3>
          <RuleForm onSave={handleSave} onCancel={() => setEditing(null)} />
        </div>
      )}

      {rules.length === 0 && editing !== "new" && (
        <div className="card p-12 text-center">
          <div className="mb-3"><IconBell size={40} className="text-slate-400" /></div>
          <p className="font-semibold text-slate-600">{t("noRulesYet")}</p>
          <p className="text-sm text-slate-400 mt-1">
            {t("createFirstRule")}
          </p>
        </div>
      )}

      {rules.map(rule => (
        <div key={rule.id} className={`card overflow-hidden transition-all ${!rule.is_active ? "opacity-60" : ""}`}>
          {editing === rule.id ? (
            <div className="p-6">
              <h3 className="font-bold text-slate-800 mb-5 text-base">{t("editRule")}</h3>
              <RuleForm initial={rule} onSave={handleSave} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => handleToggle(rule)}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${rule.is_active ? "bg-teal-500" : "bg-slate-300"}`}>
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.is_active ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <span className="font-bold text-slate-800 text-base">{rule.name}</span>
                    <span className={`badge text-xs ${rule.is_active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {rule.is_active ? t("active") : t("disabled")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <IconClock size={14} className="flex-shrink-0" />
                      <span className="font-medium">{timingLabel(rule.days_before_end)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IconMail size={14} className="flex-shrink-0" />
                      <span className="font-medium">{recipientLabels[rule.recipient_type]}</span>
                    </span>
                  </div>
                  {rule.custom_subject && (
                    <p className="text-xs text-slate-500 mt-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
                      {t("subject")}: {rule.custom_subject}
                    </p>
                  )}
                  {rule.custom_message && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">
                      &ldquo;{rule.custom_message}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setEditing(rule.id)} className="btn-secondary text-xs py-1.5 px-3">{t("edit")}</button>
                  <button onClick={() => handleDelete(rule.id)} disabled={deleting === rule.id}
                    className="text-xs py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-semibold disabled:opacity-40">
                    {deleting === rule.id ? "…" : t("delete")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="rounded-2xl p-5 bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8.01"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
          {t("howRemindersWork")}
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex gap-2"><IconLightning size={14} className="flex-shrink-0 mt-0.5" /><span>{t("howStep1")}</span></li>
          <li className="flex gap-2"><IconMail size={14} className="flex-shrink-0 mt-0.5" /><span>{t("howStep2")}</span></li>
          <li className="flex gap-2"><IconRepeat size={14} className="flex-shrink-0 mt-0.5" /><span>{t("howStep3")}</span></li>
          <li className="flex gap-2"><IconSend size={14} className="flex-shrink-0 mt-0.5" /><span>{t("howStep4")}</span></li>
          <li className="flex gap-2"><IconKey size={14} className="flex-shrink-0 mt-0.5" /><span>{t("howStep5")}</span></li>
        </ul>
      </div>
    </div>
  );
}
