"use client";

import { usePathname } from "next/navigation";
import type { User } from "@/types";
import { formatDatetime, nowInMuscat } from "@/lib/utils";
import GlobalSearch from "@/components/layout/GlobalSearch";
import { IconOnline } from "@/components/ui/Icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const PAGE_TITLE_KEYS: Record<string, TranslationKey> = {
  "/dashboard": "dashboard",
  "/map":       "marinaMap",
  "/boats":     "boats",
  "/owners":    "owners",
  "/sessions":  "parkingSessions",
  "/payments":  "payments",
  "/reminders": "reminders",
  "/reports":   "reports",
  "/settings":  "settings",
};

export default function TopBar({ user, onMenuToggle }: { user: User | null; onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  const now = formatDatetime(nowInMuscat().toISOString());
  const base = "/" + pathname.split("/")[1];
  const titleKey = PAGE_TITLE_KEYS[pathname] || PAGE_TITLE_KEYS[base];
  const title = titleKey ? t(titleKey) : "Al Seeb Boat Club";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 gap-2 sm:gap-4"
      style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", minHeight: "60px" }}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile hamburger */}
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
        <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">{title}</h1>
        <span className="text-slate-300 hidden md:block">·</span>
        <span className="text-slate-400 font-mono text-[11px] hidden md:block">{now} ({t("muscatTimezone")})</span>
      </div>

      <div className="hidden sm:block flex-1 max-w-md">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 sm:px-3 py-1.5 transition-colors ${lang === "en" ? "bg-[#0A1628] text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >EN</button>
          <button
            onClick={() => setLang("ar")}
            className={`px-2.5 sm:px-3 py-1.5 transition-colors border-l border-slate-200 ${lang === "ar" ? "bg-[#0A1628] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            style={{ fontFamily: "Arial, sans-serif" }}
          >ع</button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "#f0fdfc", color: "#0E7490", border: "1px solid #99f6f0" }}>
          <IconOnline size={7} className="text-teal-500 animate-pulse" />
          {t("online")}
        </div>
        <div className="text-sm text-slate-500 hidden md:block">
          {user?.full_name || user?.email}
        </div>
      </div>
    </header>
  );
}
