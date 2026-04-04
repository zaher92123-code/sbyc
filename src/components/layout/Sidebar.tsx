"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";
import { cn, initials } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  IconDashboard, IconMap, IconBoat, IconOwner, IconSessions,
  IconPayment, IconBell, IconReports, IconSettings, IconSignOut, IconAnchor,
  IconEmployee, IconExpense, IconServices,
} from "@/components/ui/Icons";

type NavItem = { href: string; icon: React.ReactNode; key: TranslationKey; adminOnly?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",          icon: <IconDashboard size={17} />, key: "dashboard" },
  { href: "/map",                icon: <IconMap       size={17} />, key: "marinaMap" },
  { href: "/boats",              icon: <IconBoat      size={17} />, key: "boats" },
  { href: "/owners",             icon: <IconOwner     size={17} />, key: "owners" },
  { href: "/sessions",           icon: <IconSessions  size={17} />, key: "parkingSessions" },
  { href: "/payments",           icon: <IconPayment   size={17} />, key: "payments" },
];

export default function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const { t }    = useLanguage();

  const isAdmin = (user as any)?.role?.name === "admin";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className="flex-shrink-0 flex flex-col w-[260px] h-full overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0A1628 0%, #0d1f3c 60%, #0A1628 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0E7490, #0369a1)" }}>
            <IconAnchor size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-[15px] leading-tight">{t("appName")}</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{t("appTagline")}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          {t("navigation")}
        </p>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn("sidebar-link", isActive && "active")}>
              <span className="w-5 flex-shrink-0 flex items-center justify-center opacity-80">
                {item.icon}
              </span>
              <span className="text-[13.5px]">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D4A853, #b07024)" }}>
            {user?.full_name ? initials(user.full_name) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.full_name || "User"}</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {(user as any)?.job_title || (isAdmin ? t("admin") : t("staff"))}
            </p>
          </div>
          <button onClick={handleSignOut} type="button"
            className="text-white/40 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/15"
            title={t("signOut")}>
            <IconSignOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
