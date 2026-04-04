#!/usr/bin/env python3
"""Writes all icon-related files directly to the project. No downloads needed."""
import os, shutil

ROOT = os.getcwd()

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    print(f"  ✓ {path}")

print("\n🎨 Installing custom SVG icon system...\n")

write("src/components/ui/Icons.tsx", r'''/**
 * Al Seeb Bay Marina — Custom Icon System
 * Engineering-style SVG icons, stroke-based, currentColor.
 */
import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function IconAnchor({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>;
}
export function IconDashboard({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
}
export function IconMap({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
}
export function IconBoat({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 17l2.5-9h13L21 17"/><path d="M3 17c0 1.5 4 3 9 3s9-1.5 9-3"/><path d="M12 4v4"/><path d="M8 8h8"/></svg>;
}
export function IconOwner({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
}
export function IconSessions({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/></svg>;
}
export function IconPayment({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="6" width="20" height="13" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="14" x2="9" y2="14"/></svg>;
}
export function IconBell({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
}
export function IconReports({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
export function IconSettings({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
export function IconSignOut({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
export function IconWarning({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
export function IconCheck({ size=20,className="",strokeWidth=2 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>;
}
export function IconX({ size=20,className="",strokeWidth=2 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
export function IconInfo({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8.01"/><line x1="12" y1="12" x2="12" y2="16"/></svg>;
}
export function IconCurrency({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.5 8.5h5a2 2 0 0 1 0 4H10a2 2 0 0 0 0 4h5.5"/><line x1="12" y1="6.5" x2="12" y2="8.5"/><line x1="12" y1="16.5" x2="12" y2="18.5"/></svg>;
}
export function IconTrendingUp({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
export function IconClock({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
export function IconCalendar({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
export function IconDownload({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
export function IconPrint({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;
}
export function IconMail({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>;
}
export function IconSend({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
export function IconRepeat({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
}
export function IconKey({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
}
export function IconLightning({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
export function IconBookmark({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
export function IconSpotEmpty({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 2"/></svg>;
}
export function IconCheckCircle({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
export function IconSearch({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
export function IconChevronDown({ size=16,className="",strokeWidth=2 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"/></svg>;
}
export function IconPlus({ size=20,className="",strokeWidth=1.75 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
export function IconOnline({ size=8,className="" }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 8 8" className={className}><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>;
}
''')

# ── Now copy the already-updated files from the project ──────────────────────
SRC = os.path.join(ROOT, "src")

# Files already updated by previous scripts — just need Icons.tsx to be new
# Patch ui/index.tsx to import from Icons.tsx
ui_path = os.path.join(SRC, "components/ui/index.tsx")
with open(ui_path) as f:
    c = f.read()

if "from \"@/components/ui/Icons\"" not in c:
    c = c.replace(
        'import { cn, getSessionStatusColor, getSpotStatusColor, getPaymentStatusColor } from "@/lib/utils";',
        'import React from "react";\nimport { cn, getSessionStatusColor, getSpotStatusColor, getPaymentStatusColor } from "@/lib/utils";\nimport { IconWarning, IconCheck, IconInfo } from "@/components/ui/Icons";'
    )
    c = c.replace(
        'const SESSION_ICONS: Record<SessionStatus, string> = {\n  active: "●",\n  ending_soon: "◑",\n  overdue: "▲",\n  closed: "○",\n};',
        '''const SESSION_ICON_ELS: Record<SessionStatus, React.ReactNode> = {
  active:      <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />,
  ending_soon: <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />,
  overdue:     <IconWarning size={12} />,
  closed:      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />,
};'''
    )
    c = c.replace(
        '      <span className="text-[10px]">{SESSION_ICONS[status]}</span>',
        '      {SESSION_ICON_ELS[status]}'
    )
    c = c.replace(
        'const PAYMENT_ICONS: Record<PaymentStatus, string> = {\n  paid: "✓",\n  partial: "◑",\n  unpaid: "○",\n  overdue: "▲",\n};',
        '''const PAYMENT_ICON_ELS: Record<PaymentStatus, React.ReactNode> = {
  paid:    <IconCheck size={12} />,
  partial: <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />,
  unpaid:  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />,
  overdue: <IconWarning size={12} />,
};'''
    )
    c = c.replace(
        '      <span className="text-[10px]">{PAYMENT_ICONS[status]}</span>',
        '      {PAYMENT_ICON_ELS[status]}'
    )
    c = c.replace(
        '  const icons = { info: "ℹ", warning: "⚠", danger: "⛔", success: "✓" };',
        '  const icons = { info: <IconInfo size={16} />, warning: <IconWarning size={16} />, danger: <IconWarning size={16} />, success: <IconCheck size={16} /> };'
    )
    c = c.replace('  icon: string;', '  icon: React.ReactNode;')
    with open(ui_path, "w") as f:
        f.write(c)
    print("  ✓ src/components/ui/index.tsx")
else:
    print("  ~ src/components/ui/index.tsx (already done)")

# Patch Sidebar
sidebar_path = os.path.join(SRC, "components/layout/Sidebar.tsx")
with open(sidebar_path) as f:
    c = f.read()

if "IconDashboard" not in c:
    c = c.replace(
        'import { useLanguage } from "@/lib/i18n/LanguageContext";\nimport type { TranslationKey } from "@/lib/i18n/translations";',
        'import { useLanguage } from "@/lib/i18n/LanguageContext";\nimport type { TranslationKey } from "@/lib/i18n/translations";\nimport { IconDashboard, IconMap, IconBoat, IconOwner, IconSessions, IconPayment, IconBell, IconReports, IconSettings, IconSignOut, IconAnchor } from "@/components/ui/Icons";'
    )
    c = c.replace(
        '''const NAV_ITEMS: { href: string; icon: string; key: TranslationKey }[] = [
  { href: "/dashboard", icon: "◈", key: "dashboard" },
  { href: "/map",       icon: "◎", key: "marinaMap" },
  { href: "/boats",     icon: "⛵", key: "boats" },
  { href: "/owners",    icon: "👤", key: "owners" },
  { href: "/sessions",  icon: "📋", key: "parkingSessions" },
  { href: "/payments",  icon: "💳", key: "payments" },
  { href: "/reminders", icon: "🔔", key: "reminders" },
  { href: "/reports",   icon: "📊", key: "reports" },
  { href: "/settings",  icon: "⚙",  key: "settings" },
];''',
        '''const NAV_ITEMS: { href: string; icon: React.ReactNode; key: TranslationKey }[] = [
  { href: "/dashboard", icon: <IconDashboard size={17} />, key: "dashboard" },
  { href: "/map",       icon: <IconMap       size={17} />, key: "marinaMap" },
  { href: "/boats",     icon: <IconBoat      size={17} />, key: "boats" },
  { href: "/owners",    icon: <IconOwner     size={17} />, key: "owners" },
  { href: "/sessions",  icon: <IconSessions  size={17} />, key: "parkingSessions" },
  { href: "/payments",  icon: <IconPayment   size={17} />, key: "payments" },
  { href: "/reminders", icon: <IconBell      size={17} />, key: "reminders" },
  { href: "/reports",   icon: <IconReports   size={17} />, key: "reports" },
  { href: "/settings",  icon: <IconSettings  size={17} />, key: "settings" },
];
import React from "react";'''
    )
    c = c.replace(
        '<span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>',
        '<span className="w-5 flex-shrink-0 flex items-center justify-center opacity-80">{item.icon}</span>'
    )
    for old, new in [
        ('            ⚓\n          </div>', '            <IconAnchor size={20} className="text-white" />\n          </div>'),
        ('<span>⇥</span> {t("signOut")}', '<><IconSignOut size={14} /> {t("signOut")}</>'),
        ('<span>⇥</span>\n            <span className="hidden group-hover:block">{t("signOut")}</span>', '<IconSignOut size={16} />'),
    ]:
        c = c.replace(old, new)
    with open(sidebar_path, "w") as f:
        f.write(c)
    print("  ✓ src/components/layout/Sidebar.tsx")
else:
    print("  ~ src/components/layout/Sidebar.tsx (already done)")

# Patch TopBar
topbar_path = os.path.join(SRC, "components/layout/TopBar.tsx")
with open(topbar_path) as f:
    c = f.read()
if "IconOnline" not in c:
    c = c.replace(
        'import GlobalSearch from "@/components/layout/GlobalSearch";',
        'import GlobalSearch from "@/components/layout/GlobalSearch";\nimport { IconOnline } from "@/components/ui/Icons";'
    )
    c = c.replace(
        '<span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />',
        '<IconOnline size={7} className="text-teal-500 animate-pulse" />'
    )
    with open(topbar_path, "w") as f:
        f.write(c)
    print("  ✓ src/components/layout/TopBar.tsx")
else:
    print("  ~ src/components/layout/TopBar.tsx (already done)")

# Patch dashboard
dash_path = os.path.join(SRC, "app/(dashboard)/dashboard/page.tsx")
with open(dash_path) as f:
    c = f.read()
if "IconAnchor" not in c:
    c = c.replace(
        'import { getT } from "@/lib/i18n/server";',
        'import { getT } from "@/lib/i18n/server";\nimport { IconAnchor, IconBoat, IconClock, IconWarning, IconCurrency, IconBell, IconTrendingUp, IconSpotEmpty } from "@/components/ui/Icons";'
    )
    for old, new in [
        ('icon="⚓"', 'icon={<IconAnchor size={22} />}'),
        ('icon="🚢"', 'icon={<IconBoat size={22} />}'),
        ('icon="⏰"', 'icon={<IconClock size={22} />}'),
        ('icon="⚠️"', 'icon={<IconWarning size={22} />}'),
        ('icon="💰"', 'icon={<IconCurrency size={22} />}'),
        ('icon="🔔"', 'icon={<IconBell size={22} />}'),
        ('icon="📈"', 'icon={<IconTrendingUp size={22} />}'),
        ('icon="🟢"', 'icon={<IconSpotEmpty size={22} />}'),
    ]:
        c = c.replace(old, new)
    with open(dash_path, "w") as f:
        f.write(c)
    print("  ✓ src/app/(dashboard)/dashboard/page.tsx")
else:
    print("  ~ dashboard/page.tsx (already done)")

# Patch SessionActions
sa_path = os.path.join(SRC, "components/sessions/SessionActions.tsx")
with open(sa_path) as f:
    c = f.read()
if "IconCalendar" not in c:
    c = c.replace('"use client";', '"use client";\nimport { IconCalendar, IconCheck } from "@/components/ui/Icons";')
    c = c.replace('📅 Extend Parking Period', '<><IconCalendar size={15} /> Extend Parking Period</>')
    c = c.replace('✓ Close Session (Boat Departed)', '<><IconCheck size={15} /> Close Session (Boat Departed)</>')
    with open(sa_path, "w") as f:
        f.write(c)
    print("  ✓ src/components/sessions/SessionActions.tsx")
else:
    print("  ~ SessionActions.tsx (already done)")

# Patch MonthlyReportClient
mrc_path = os.path.join(SRC, "components/reports/MonthlyReportClient.tsx")
with open(mrc_path) as f:
    c = f.read()
if "IconDownload" not in c:
    c = c.replace(
        'import { formatOMR, formatDate } from "@/lib/utils";',
        'import { formatOMR, formatDate } from "@/lib/utils";\nimport { IconDownload, IconPrint } from "@/components/ui/Icons";'
    )
    c = c.replace(
        '<button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2">⬇ Export CSV</button>',
        '<button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2"><IconDownload size={15} /> Export CSV</button>'
    )
    c = c.replace(
        '<button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-2">🖨️ Print Report</button>',
        '<button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-2"><IconPrint size={15} /> Print Report</button>'
    )
    with open(mrc_path, "w") as f:
        f.write(c)
    print("  ✓ src/components/reports/MonthlyReportClient.tsx")
else:
    print("  ~ MonthlyReportClient.tsx (already done)")

# Patch ReportExportClient
rec_path = os.path.join(SRC, "components/reports/ReportExportClient.tsx")
with open(rec_path) as f:
    c = f.read()
if "IconDownload" not in c:
    c = c.replace('"use client";', '"use client";\nimport { IconDownload } from "@/components/ui/Icons";')
    c = c.replace(
        '<button onClick={handleExport} className="btn-secondary text-sm">\n      ⬇ Export CSV\n    </button>',
        '<button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2"><IconDownload size={15} /> Export CSV</button>'
    )
    with open(rec_path, "w") as f:
        f.write(c)
    print("  ✓ src/components/reports/ReportExportClient.tsx")
else:
    print("  ~ ReportExportClient.tsx (already done)")

print("\n✅ Done! Run: npm run dev")
