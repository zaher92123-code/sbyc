"use client";

import { useState, useEffect } from "react";
import { Alert, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

type Setting = {
  key: string; value: string; label: string; is_secret: boolean;
  has_value: boolean; updated_at: string;
};

export default function SettingsPage() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ wa?: string; email?: string }>({});

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/settings");
    const result = await res.json();
    const data = result.data || [];
    setSettings(data);
    const initial: Record<string, string> = {};
    data.forEach((s: Setting) => { initial[s.key] = s.value || ""; });
    setForm(initial);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setError("Failed to save settings");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    fetchSettings();
  }

  async function testWhatsApp() {
    setTestResult(prev => ({ ...prev, wa: "testing" }));
    try {
      const res = await fetch("/api/notification-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "whatsapp",
          recipient_name: "Test",
          recipient_phone: form.whatsapp_phone_number_id ? "+968" : "",
          message_body: "Test message from Al Seeb Boat Club",
          trigger_type: "test",
        }),
      });
      setTestResult(prev => ({ ...prev, wa: res.ok ? "success" : "failed" }));
    } catch {
      setTestResult(prev => ({ ...prev, wa: "failed" }));
    }
    setTimeout(() => setTestResult(prev => ({ ...prev, wa: undefined })), 3000);
  }

  const getSetting = (key: string) => settings.find(s => s.key === key);

  if (loading) return <div className="py-12 text-center text-slate-400">{t("loading")}</div>;

  const waConfigured = getSetting("whatsapp_access_token")?.has_value;
  const emailConfigured = getSetting("email_resend_api_key")?.has_value;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="page-header">
        <h1 className="page-title">{t("settings")}</h1>
      </div>

      {success && <Alert variant="success">{t("settingsSaved")}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* WhatsApp Configuration */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 font-display">{t("whatsappConfig")}</h2>
              <p className="text-xs text-slate-400">{t("whatsappConfigDesc")}</p>
            </div>
          </div>
          <Badge variant={waConfigured ? "success" : "danger"} className="text-[10px]">
            {waConfigured ? t("configured") : t("notConfigured")}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("waPhoneNumberId")}</label>
            <input value={form.whatsapp_phone_number_id || ""} onChange={e => setForm(p => ({ ...p, whatsapp_phone_number_id: e.target.value }))}
              className="form-input font-mono text-sm" placeholder="e.g. 112233445566778899" />
            <p className="text-xs text-slate-400 mt-1">{t("waPhoneIdHelp")}</p>
          </div>
          <div>
            <label className="form-label">{t("waApiVersion")}</label>
            <input value={form.whatsapp_api_version || ""} onChange={e => setForm(p => ({ ...p, whatsapp_api_version: e.target.value }))}
              className="form-input font-mono text-sm" placeholder="v21.0" />
          </div>
        </div>
        <div>
          <label className="form-label">{t("waAccessToken")}</label>
          <input type="password" value={form.whatsapp_access_token || ""} onChange={e => setForm(p => ({ ...p, whatsapp_access_token: e.target.value }))}
            className="form-input font-mono text-sm" placeholder={t("waTokenPlaceholder")} />
          <p className="text-xs text-slate-400 mt-1">{t("waTokenHelp")}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700">{t("waSetupSteps")}</p>
          <p>1. {t("waStep1")}</p>
          <p>2. {t("waStep2")}</p>
          <p>3. {t("waStep3")}</p>
          <p>4. {t("waStep4")}</p>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 font-display">{t("emailConfig")}</h2>
              <p className="text-xs text-slate-400">{t("emailConfigDesc")}</p>
            </div>
          </div>
          <Badge variant={emailConfigured ? "success" : "danger"} className="text-[10px]">
            {emailConfigured ? t("configured") : t("notConfigured")}
          </Badge>
        </div>

        <div>
          <label className="form-label">{t("resendApiKey")}</label>
          <input type="password" value={form.email_resend_api_key || ""} onChange={e => setForm(p => ({ ...p, email_resend_api_key: e.target.value }))}
            className="form-input font-mono text-sm" placeholder="re_xxxxxxxxx" />
          <p className="text-xs text-slate-400 mt-1">{t("resendKeyHelp")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("senderName")}</label>
            <input value={form.email_from_name || ""} onChange={e => setForm(p => ({ ...p, email_from_name: e.target.value }))}
              className="form-input text-sm" placeholder="Al Seeb Boat Club" />
          </div>
          <div>
            <label className="form-label">{t("senderEmail")}</label>
            <input type="email" value={form.email_from_address || ""} onChange={e => setForm(p => ({ ...p, email_from_address: e.target.value }))}
              className="form-input text-sm" placeholder="noreply@example.com" />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center py-3">
          {saving ? t("saving") : t("saveSettings")}
        </button>
      </div>
    </div>
  );
}
