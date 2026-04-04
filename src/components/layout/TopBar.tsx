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

export default function TopBar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  const now = formatDatetime(nowInMuscat().toISOString());
  const base = "/" + pathname.split("/")[1];
  const titleKey = PAGE_TITLE_KEYS[pathname] || PAGE_TITLE_KEYS[base];
  const title = titleKey ? t(titleKey) : "Al Seeb Boat Club";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 gap-4"
      style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", height: "60px" }}
    >
      <div className="flex items-center gap-3 flex-shrink-0">
        <h1 className="text-lg font-bold text-slate-900 font-display">{title}</h1>
        <span className="text-slate-300 hidden md:block">·</span>
        <span className="text-slate-400 font-mono text-[11px] hidden md:block">{now} ({t("muscatTimezone")})</span>
      </div>

      <GlobalSearch />

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* EN / AR toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-[#0A1628] text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >EN</button>
          <button
            onClick={() => setLang("ar")}
            className={`px-3 py-1.5 transition-colors border-l border-slate-200 ${lang === "ar" ? "bg-[#0A1628] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            style={{ fontFamily: "Arial, sans-serif" }}
          >ع</button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "#f0fdfc", color: "#0E7490", border: "1px solid #99f6f0" }}>
          <IconOnline size={7} className="text-teal-500 animate-pulse" />
          {t("online")}
        </div>
        <div className="text-sm text-slate-500 hidden sm:block">
          {user?.full_name || user?.email}
        </div>
      </div>
    </header>
  );
}
