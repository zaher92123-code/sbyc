#!/usr/bin/env python3
"""
Run from your project root:  python3 install-i18n.py
Creates all i18n files and updates existing ones automatically.
"""

import os, sys

ROOT = os.getcwd()
SRC  = os.path.join(ROOT, "src")

def write(path, content):
    full = os.path.join(SRC, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    print(f"  ✓ src/{path}")

def patch(path, old, new):
    full = os.path.join(SRC, path)
    if not os.path.exists(full):
        print(f"  ⚠ not found: src/{path}")
        return
    with open(full) as f:
        c = f.read()
    c2 = c.replace(old, new)
    with open(full, "w") as f:
        f.write(c2)
    print(f"  {'✓ changed' if c != c2 else '~ already done'}: src/{path}")

print("\n🌍 Installing Arabic/English translation system...\n")

# ─────────────────────────────────────────────────────────────────────────────
# 1. translations.ts
# ─────────────────────────────────────────────────────────────────────────────
print("1️⃣  Writing translations file...")
write("lib/i18n/translations.ts", r'''// =============================================================================
//  TRANSLATIONS  —  Al Seeb Bay Marina
//  Edit the "ar" values to fix any Arabic translation.
// =============================================================================
export type Lang = "en" | "ar";

export const T = {
  appName:           { en: "Al Seeb Bay Marina",              ar: "مرسى السيب" },
  appTagline:        { en: "Boat Parking Management",         ar: "نظام إدارة مواقف القوارب" },
  location:          { en: "Muscat, Sultanate of Oman",       ar: "مسقط، سلطنة عُمان" },
  // Navigation
  navigation:        { en: "Navigation",        ar: "التنقل" },
  dashboard:         { en: "Dashboard",         ar: "لوحة التحكم" },
  marinaMap:         { en: "Marina Map",        ar: "خريطة المرسى" },
  boats:             { en: "Boats",             ar: "القوارب" },
  owners:            { en: "Owners",            ar: "الملاك" },
  parkingSessions:   { en: "Parking Sessions",  ar: "جلسات الإيقاف" },
  payments:          { en: "Payments",          ar: "المدفوعات" },
  reminders:         { en: "Reminders",         ar: "التذكيرات" },
  reports:           { en: "Reports",           ar: "التقارير" },
  settings:          { en: "Settings",          ar: "الإعدادات" },
  auditLog:          { en: "Audit Log",         ar: "سجل المراجعة" },
  // Top bar
  online:            { en: "Online",            ar: "متصل" },
  signOut:           { en: "Sign Out",          ar: "تسجيل الخروج" },
  searchPlaceholder: { en: "Search vessels, owners, spots…", ar: "ابحث عن قوارب، ملاك، مواقف…" },
  // Status
  occupied:          { en: "Occupied",          ar: "مشغول" },
  available:         { en: "Available",         ar: "متاح" },
  reserved:          { en: "Reserved",          ar: "محجوز" },
  expired:           { en: "Expired",           ar: "منتهي" },
  active:            { en: "Active",            ar: "نشط" },
  endingSoon:        { en: "Ending Soon",       ar: "تنتهي قريباً" },
  overdue:           { en: "Overdue",           ar: "متأخر" },
  closed:            { en: "Closed",            ar: "مغلق" },
  // Map
  clickSpot:         { en: "Click any spot to view vessel details", ar: "انقر على أي موقف لعرض تفاصيل السفينة" },
  spotsTotal:        { en: "spots total",       ar: "موقف إجمالي" },
  entrance:          { en: "ENTRANCE",          ar: "المدخل" },
  spot:              { en: "Spot",              ar: "موقف" },
  // Spot panel
  vessel:            { en: "Vessel",            ar: "السفينة" },
  owner:             { en: "Owner",             ar: "المالك" },
  storagePeriod:     { en: "Storage Period",    ar: "فترة التخزين" },
  billing:           { en: "Billing",           ar: "الفواتير" },
  notes:             { en: "Notes",             ar: "الملاحظات" },
  boatName:          { en: "Name",              ar: "الاسم" },
  boatType:          { en: "Type",              ar: "النوع" },
  boatLength:        { en: "Length",            ar: "الطول" },
  registration:      { en: "Registration",      ar: "رقم التسجيل" },
  phone:             { en: "Phone",             ar: "الهاتف" },
  email:             { en: "Email",             ar: "البريد الإلكتروني" },
  entryDate:         { en: "Entry",             ar: "تاريخ الدخول" },
  expiryDate:        { en: "Expiry",            ar: "تاريخ الانتهاء" },
  totalDue:          { en: "Total Due",         ar: "المبلغ المستحق" },
  totalPaid:         { en: "Total Paid",        ar: "المبلغ المدفوع" },
  outstanding:       { en: "Outstanding",       ar: "المتبقي" },
  balance:           { en: "Balance",           ar: "الرصيد" },
  paid:              { en: "PAID ✓",            ar: "مدفوع ✓" },
  spotAvailable:     { en: "This spot is available",          ar: "هذا الموقف متاح" },
  noVesselAssigned:  { en: "No vessel assigned",              ar: "لا توجد سفينة مخصصة" },
  noVesselStored:    { en: "No vessel currently stored here", ar: "لا توجد سفينة مخزنة هنا حالياً" },
  createSession:     { en: "Create Parking Session",          ar: "إنشاء جلسة إيقاف" },
  expiresInDays:     { en: "days remaining",   ar: "أيام متبقية" },
  expiredDaysAgo:    { en: "days ago",          ar: "أيام مضت" },
  expiredLabel:      { en: "EXPIRED",           ar: "منتهي" },
  expiresToday:      { en: "Expires TODAY",     ar: "ينتهي اليوم" },
  expiresIn:         { en: "Expires in",        ar: "ينتهي خلال" },
  days:              { en: "days",              ar: "أيام" },
  // Dashboard
  totalSpots:        { en: "Total Spots",           ar: "إجمالي المواقف" },
  expiringSoon:      { en: "Expiring Soon",          ar: "تنتهي قريباً" },
  revenueThisMonth:  { en: "Revenue This Month",     ar: "إيرادات هذا الشهر" },
  outstandingBalance:{ en: "Outstanding Balance",    ar: "الرصيد المستحق" },
  urgentAttention:   { en: "Urgent Attention",       ar: "يحتاج اهتماماً عاجلاً" },
  noUrgentItems:     { en: "No urgent items",        ar: "لا توجد عناصر عاجلة" },
  viewAll:           { en: "View All",               ar: "عرض الكل" },
  pendingReminders:  { en: "Pending Reminders",      ar: "تذكيرات معلقة" },
  overduesessions:   { en: "Overdue Sessions",       ar: "جلسات متأخرة" },
  daysLeft:          { en: "days left",              ar: "أيام متبقية" },
  daysOverdue:       { en: "days overdue",           ar: "أيام متأخرة" },
  // Sessions
  newSession:        { en: "+ New Session",          ar: "+ جلسة جديدة" },
  activeSessions:    { en: "active sessions",        ar: "جلسات نشطة" },
  vesselAndSpot:     { en: "Vessel & Parking Spot",  ar: "السفينة والموقف" },
  sessionDates:      { en: "Session Dates",          ar: "تواريخ الجلسة" },
  startDate:         { en: "Start Date",             ar: "تاريخ البداية" },
  expectedEndDate:   { en: "Expected End Date",      ar: "تاريخ الانتهاء المتوقع" },
  pricingModel:      { en: "Pricing Model",          ar: "نموذج التسعير" },
  baseFee:           { en: "Base Fee",               ar: "الرسوم الأساسية" },
  daily:             { en: "Daily",                  ar: "يومي" },
  weekly:            { en: "Weekly",                 ar: "أسبوعي" },
  monthly:           { en: "Monthly",                ar: "شهري" },
  custom:            { en: "Custom",                 ar: "مخصص" },
  noSessionsFound:   { en: "No sessions found",      ar: "لا توجد جلسات" },
  spotNumber:        { en: "Spot",                   ar: "الموقف" },
  unpaidOnly:        { en: "Unpaid only",            ar: "غير مدفوعة فقط" },
  allActive:         { en: "All Active",             ar: "جميع النشطة" },
  selectVessel:      { en: "Select a vessel…",       ar: "اختر سفينة…" },
  selectSpot:        { en: "Select an empty spot…",  ar: "اختر موقفاً فارغاً…" },
  noEmptySpots:      { en: "No empty spots available", ar: "لا توجد مواقف فارغة" },
  autoCalculated:    { en: "Auto-calculated; adjust if needed", ar: "محسوب تلقائياً؛ عدّل إذا لزم" },
  // Boats
  addBoat:           { en: "+ Add Boat",             ar: "+ إضافة قارب" },
  boatDetails:       { en: "Boat Details",           ar: "تفاصيل القارب" },
  editBoat:          { en: "Edit Boat",              ar: "تعديل القارب" },
  newBoat:           { en: "New Boat",               ar: "قارب جديد" },
  noBoatsFound:      { en: "No boats found",         ar: "لا توجد قوارب" },
  sessionHistory:    { en: "Session History",        ar: "سجل الجلسات" },
  // Owners
  addOwner:          { en: "+ Add Owner",            ar: "+ إضافة مالك" },
  ownerDetails:      { en: "Owner Details",          ar: "تفاصيل المالك" },
  editOwner:         { en: "Edit Owner",             ar: "تعديل بيانات المالك" },
  registeredBoats:   { en: "Registered Boats",       ar: "القوارب المسجلة" },
  noOwnersFound:     { en: "No owners found",        ar: "لا يوجد ملاك" },
  // Payments
  newPayment:        { en: "+ New Payment",          ar: "+ دفعة جديدة" },
  recordPayment:     { en: "Record Payment",         ar: "تسجيل دفعة" },
  paymentDate:       { en: "Payment Date",           ar: "تاريخ الدفع" },
  paymentMethod:     { en: "Payment Method",         ar: "طريقة الدفع" },
  amount:            { en: "Amount (OMR)",           ar: "المبلغ (ر.ع.)" },
  cash:              { en: "Cash",                   ar: "نقداً" },
  bankTransfer:      { en: "Bank Transfer",          ar: "تحويل بنكي" },
  cheque:            { en: "Cheque",                 ar: "شيك" },
  card:              { en: "Card",                   ar: "بطاقة" },
  receiptNumber:     { en: "Receipt Number",         ar: "رقم الإيصال" },
  noPaymentsFound:   { en: "No payments found",      ar: "لا توجد مدفوعات" },
  // Reminders
  reminderCenter:    { en: "Reminder Center",        ar: "مركز التذكيرات" },
  reminderRules:     { en: "Reminder Rules",         ar: "قواعد التذكير" },
  emailHistory:      { en: "Email History",          ar: "سجل الرسائل" },
  rulesSettings:     { en: "Rules & Settings",       ar: "القواعد والإعدادات" },
  sendPendingNow:    { en: "🚀 Send Pending Now",    ar: "🚀 إرسال المعلقة الآن" },
  newRule:           { en: "+ New Rule",             ar: "+ قاعدة جديدة" },
  saveRule:          { en: "Save Rule",              ar: "حفظ القاعدة" },
  noRulesYet:        { en: "No reminder rules yet",  ar: "لا توجد قواعد تذكير بعد" },
  // Reports
  reportsTitle:      { en: "Reports",                ar: "التقارير" },
  exportCSV:         { en: "Export CSV",             ar: "تصدير CSV" },
  generateReport:    { en: "Generate Report",        ar: "إنشاء تقرير" },
  // Settings
  systemSettings:    { en: "System Settings",        ar: "إعدادات النظام" },
  systemUsers:       { en: "System Users",           ar: "مستخدمو النظام" },
  inviteUser:        { en: "+ Invite User",          ar: "+ دعوة مستخدم" },
  systemInfo:        { en: "System Information",     ar: "معلومات النظام" },
  companyName:       { en: "Company Name",           ar: "اسم الشركة" },
  // Common
  save:              { en: "Save",                   ar: "حفظ" },
  cancel:            { en: "Cancel",                 ar: "إلغاء" },
  edit:              { en: "Edit",                   ar: "تعديل" },
  delete:            { en: "Delete",                 ar: "حذف" },
  back:              { en: "← Back",                ar: "→ رجوع" },
  view:              { en: "View",                   ar: "عرض" },
  search:            { en: "Search",                 ar: "بحث" },
  filter:            { en: "Filter",                 ar: "تصفية" },
  clear:             { en: "Clear",                  ar: "مسح" },
  apply:             { en: "Apply",                  ar: "تطبيق" },
  loading:           { en: "Loading…",               ar: "جار التحميل…" },
  saving:            { en: "Saving…",                ar: "جار الحفظ…" },
  status:            { en: "Status",                 ar: "الحالة" },
  name:              { en: "Name",                   ar: "الاسم" },
  role:              { en: "Role",                   ar: "الدور" },
  joined:            { en: "Joined",                 ar: "تاريخ الانضمام" },
  admin:             { en: "Admin",                  ar: "مدير" },
  staff:             { en: "Staff",                  ar: "موظف" },
  pay:               { en: "Pay",                    ar: "دفع" },
  total:             { en: "Total",                  ar: "الإجمالي" },
  date:              { en: "Date",                   ar: "التاريخ" },
  type:              { en: "Type",                   ar: "النوع" },
  sent:              { en: "Sent",                   ar: "مُرسل" },
  pending:           { en: "Pending",                ar: "معلق" },
  failed:            { en: "Failed",                 ar: "فشل" },
  error:             { en: "Error",                  ar: "خطأ" },
  method:            { en: "Method",                 ar: "الطريقة" },
  session:           { en: "Session",                ar: "الجلسة" },
  allStatus:         { en: "All Status",             ar: "جميع الحالات" },
  additionalNotes:   { en: "Additional notes…",      ar: "ملاحظات إضافية…" },
  ownerName:         { en: "Owner Name",             ar: "اسم المالك" },
  pricing:           { en: "Pricing",                ar: "التسعير" },
} as const;

export type TranslationKey = keyof typeof T;
''')

# ─────────────────────────────────────────────────────────────────────────────
# 2. LanguageContext.tsx
# ─────────────────────────────────────────────────────────────────────────────
print("\n2️⃣  Writing LanguageContext...")
write("lib/i18n/LanguageContext.tsx", '''"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Lang, TranslationKey } from "./translations";
import { T } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => T[key].en,
  isAr: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("al-seeb-lang") as Lang | null;
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("al-seeb-lang", l);
    document.documentElement.setAttribute("lang", l);
  }

  function t(key: TranslationKey): string {
    return T[key]?.[lang] ?? T[key]?.en ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isAr: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
''')

# ─────────────────────────────────────────────────────────────────────────────
# 3. Dashboard layout — add LanguageProvider
# ─────────────────────────────────────────────────────────────────────────────
print("\n3️⃣  Patching dashboard layout...")
patch("app/(dashboard)/layout.tsx",
  'import Sidebar from "@/components/layout/Sidebar";\nimport TopBar from "@/components/layout/TopBar";',
  'import Sidebar from "@/components/layout/Sidebar";\nimport TopBar from "@/components/layout/TopBar";\nimport { LanguageProvider } from "@/lib/i18n/LanguageContext";'
)
patch("app/(dashboard)/layout.tsx",
  '  return (\n    <div className="flex h-screen overflow-hidden bg-slate-50">',
  '  return (\n    <LanguageProvider>\n    <div className="flex h-screen overflow-hidden bg-slate-50">'
)
patch("app/(dashboard)/layout.tsx",
  '    </div>\n  );\n}',
  '    </div>\n    </LanguageProvider>\n  );\n}'
)

# ─────────────────────────────────────────────────────────────────────────────
# 4. TopBar — language toggle
# ─────────────────────────────────────────────────────────────────────────────
print("\n4️⃣  Writing TopBar with language toggle...")
write("components/layout/TopBar.tsx", '''"use client";

import { usePathname } from "next/navigation";
import type { User } from "@/types";
import { formatDatetime, nowInMuscat } from "@/lib/utils";
import GlobalSearch from "@/components/layout/GlobalSearch";
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
  const title = titleKey ? t(titleKey) : "Al Seeb Bay";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 gap-4"
      style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", height: "60px" }}
    >
      <div className="flex items-center gap-3 flex-shrink-0">
        <h1 className="text-lg font-bold text-slate-900 font-display">{title}</h1>
        <span className="text-slate-300 hidden md:block">·</span>
        <span className="text-slate-400 font-mono text-[11px] hidden md:block">{now} (Muscat)</span>
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
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          {t("online")}
        </div>
        <div className="text-sm text-slate-500 hidden sm:block">
          {user?.full_name || user?.email}
        </div>
      </div>
    </header>
  );
}
''')

# ─────────────────────────────────────────────────────────────────────────────
# 5. Sidebar — translated nav labels
# ─────────────────────────────────────────────────────────────────────────────
print("\n5️⃣  Writing Sidebar with translations...")
write("components/layout/Sidebar.tsx", '''"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";
import { cn, initials } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const NAV_ITEMS: { href: string; icon: string; key: TranslationKey }[] = [
  { href: "/dashboard", icon: "◈", key: "dashboard" },
  { href: "/map",       icon: "◎", key: "marinaMap" },
  { href: "/boats",     icon: "⛵", key: "boats" },
  { href: "/owners",    icon: "👤", key: "owners" },
  { href: "/sessions",  icon: "📋", key: "parkingSessions" },
  { href: "/payments",  icon: "💳", key: "payments" },
  { href: "/reminders", icon: "🔔", key: "reminders" },
  { href: "/reports",   icon: "📊", key: "reports" },
  { href: "/settings",  icon: "⚙",  key: "settings" },
];

export default function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex-shrink-0 flex flex-col w-[260px] h-full overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #0A1628 0%, #0d1f3c 60%, #0A1628 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0E7490, #0369a1)" }}>⚓</div>
          <div>
            <div className="font-display font-bold text-white text-[15px] leading-tight">{t("appName")}</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{t("appTagline")}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
          {t("navigation")}
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn("sidebar-link", isActive && "active")}>
              <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
              <span className="text-[13.5px]">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D4A853, #b07024)" }}>
            {user?.full_name ? initials(user.full_name) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.full_name || "User"}</p>
            <p className="text-[11px] capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>
              {(user as any)?.role?.name === "admin" ? t("admin") : t("staff")}
            </p>
          </div>
          <button onClick={handleSignOut} className="text-[18px] opacity-40 hover:opacity-80 transition-opacity" title={t("signOut")}>⇥</button>
        </div>
      </div>
    </aside>
  );
}
''')

# ─────────────────────────────────────────────────────────────────────────────
# 6. SpotInfoPanel — fully translated
# ─────────────────────────────────────────────────────────────────────────────
print("\n6️⃣  Writing SpotInfoPanel with translations...")
write("components/map/SpotInfoPanel.tsx", '''"use client";

import type { YardSpot, SpotStatus } from "@/data/yardSpots";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props { spot: YardSpot | null; onClose: () => void; inline?: boolean; }

const CFG: Record<SpotStatus, { grad: string; accent: string; dot: string }> = {
  occupied: { grad:"linear-gradient(148deg,#061828 0%,#0b3c52 100%)", accent:"#0e7490", dot:"#22d3ee" },
  empty:    { grad:"linear-gradient(148deg,#030d06 0%,#054028 100%)", accent:"#059669", dot:"#34d399" },
  expired:  { grad:"linear-gradient(148deg,#160404 0%,#5a1010 100%)", accent:"#dc2626", dot:"#f87171" },
  reserved: { grad:"linear-gradient(148deg,#0a0620 0%,#2e1060 100%)", accent:"#7c3aed", dot:"#a78bfa" },
};

function daysUntil(d?: string): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

function SL({ children }: { children: string }) {
  return <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mt-4 mb-1.5 first:mt-0">{children}</p>;
}

function Row({ label, value, mono = false }: { label: string; value?: string|number|null; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between py-[6px] border-b border-white/[0.06] last:border-0 gap-3">
      <span className="text-[11px] text-white/40 font-medium shrink-0">{label}</span>
      <span className={`text-[11px] font-semibold text-right leading-snug max-w-[175px] text-white/88 ${mono?"font-mono":""}`}>{value}</span>
    </div>
  );
}

export default function SpotInfoPanel({ spot, onClose, inline = false }: Props) {
  if (!spot) return null;
  const { t } = useLanguage();
  const cfg = CFG[spot.status];
  const days = daysUntil(spot.expiryDate);
  const isExpired = days !== null && days < 0;
  const isSoon    = days !== null && days >= 0 && days <= 7;
  const balance   = spot.totalDue !== undefined && spot.totalPaid !== undefined
    ? +(spot.totalDue - spot.totalPaid).toFixed(3) : undefined;
  const statusLabel = t(spot.status === "empty" ? "available" : spot.status as any);
  const wrapClass = inline
    ? "flex flex-col h-full rounded-2xl overflow-hidden shadow-xl"
    : "absolute top-4 right-4 z-[1000] w-[314px] rounded-2xl overflow-hidden shadow-2xl";

  return (
    <div className={wrapClass} style={{ border:`1px solid ${cfg.accent}40` }}>
      <div style={{ background: cfg.grad }} className="px-5 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }}/>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">{statusLabel}</span>
          </div>
          <button onClick={onClose} className="text-white/35 hover:text-white/75 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[28px] font-black leading-none text-white">{t("spot")} {spot.id}</p>
            {spot.boatName
              ? <p className="text-sm font-bold mt-1" style={{ color: cfg.dot }}>⛵ {spot.boatName}</p>
              : <p className="text-sm font-medium mt-1 text-white/35">{t("noVesselAssigned")}</p>}
          </div>
          {balance !== undefined && (
            <div className={`shrink-0 px-3 py-2 rounded-xl text-center border ${balance > 0 ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
              <p className="text-[8px] font-bold uppercase tracking-wider text-white/45 mb-0.5">{t("balance")}</p>
              <p className="text-[13px] font-black font-mono leading-tight">{balance > 0 ? `OMR ${balance.toFixed(3)}` : t("paid")}</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#060c18] px-5 py-4 flex-1 overflow-y-auto">
        {spot.status === "empty" ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🟢</div>
            <p className="text-white/75 text-sm font-semibold">{t("spotAvailable")}</p>
            <p className="text-white/35 text-xs mt-1">{t("noVesselStored")}</p>
            <Link href="/sessions/new" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-80 transition-opacity" style={{ background:"#059669" }}>
              + {t("createSession")}
            </Link>
          </div>
        ) : (
          <>
            <SL>{t("vessel")}</SL>
            <Row label={t("boatName")}     value={spot.boatName} />
            <Row label={t("boatType")}     value={spot.boatType} />
            <Row label={t("boatLength")}   value={spot.boatLength} />
            <Row label={t("registration")} value={spot.registrationNumber} mono />
            <SL>{t("owner")}</SL>
            <Row label={t("ownerName")} value={spot.ownerName} />
            <Row label={t("phone")}     value={spot.ownerPhone} mono />
            <Row label={t("email")}     value={spot.ownerEmail} mono />
            <SL>{t("storagePeriod")}</SL>
            <Row label={t("entryDate")}  value={spot.entryDate  ? formatDate(spot.entryDate)  : undefined} />
            <Row label={t("expiryDate")} value={spot.expiryDate ? formatDate(spot.expiryDate) : undefined} />
            {days !== null && (
              <div className={`mt-2.5 rounded-xl px-3 py-2.5 text-center text-[11px] font-bold border ${
                isExpired ? "bg-red-500/18 text-red-300 border-red-500/25" : isSoon ? "bg-amber-500/18 text-amber-300 border-amber-500/25" : "bg-teal-500/15 text-teal-300 border-teal-500/20"
              }`}>
                {isExpired ? `⚠️ ${t("expiredLabel")} ${Math.abs(days)} ${t("expiredDaysAgo")}` : days === 0 ? `⏰ ${t("expiresToday")}` : isSoon ? `⏰ ${t("expiresIn")} ${days} ${t("days")}` : `✓ ${days} ${t("expiresInDays")}`}
              </div>
            )}
            {spot.totalDue !== undefined && (
              <>
                <SL>{t("billing")}</SL>
                <Row label={t("totalDue")}  value={`OMR ${spot.totalDue.toFixed(3)}`} mono />
                <Row label={t("totalPaid")} value={`OMR ${(spot.totalPaid??0).toFixed(3)}`} mono />
                {balance !== undefined && balance !== 0 && (
                  <div className="flex justify-between items-center pt-2 mt-1.5 border-t border-white/[0.06]">
                    <span className="text-[11px] font-semibold text-white/40">{t("outstanding")}</span>
                    <span className={`text-sm font-black font-mono ${balance>0?"text-red-300":"text-emerald-300"}`}>OMR {balance.toFixed(3)}</span>
                  </div>
                )}
              </>
            )}
            {spot.notes && (
              <>
                <SL>{t("notes")}</SL>
                <div className="bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.05]">
                  <p className="text-white/60 text-[11px] leading-relaxed">{spot.notes}</p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
''')

# ─────────────────────────────────────────────────────────────────────────────
# 7. YardMapSVG — patch in translations
# ─────────────────────────────────────────────────────────────────────────────
print("\n7️⃣  Patching YardMapSVG...")
patch("components/map/YardMapSVG.tsx",
  'import SpotInfoPanel from "@/components/map/SpotInfoPanel";',
  'import SpotInfoPanel from "@/components/map/SpotInfoPanel";\nimport { useLanguage } from "@/lib/i18n/LanguageContext";'
)
patch("components/map/YardMapSVG.tsx",
  "function Legend() {\n  const counts = getStatusCounts();\n  return (\n    <div className=\"flex flex-wrap gap-2\">\n      {([\"occupied\",\"empty\",\"reserved\",\"expired\"] as SpotStatus[]).map(st => {\n        const p = PAL[st];\n        const label = st===\"empty\"?\"Available\":st.charAt(0).toUpperCase()+st.slice(1);",
  "function Legend() {\n  const counts = getStatusCounts();\n  const { t } = useLanguage();\n  const LABELS: Record<SpotStatus,string> = { occupied:t(\"occupied\"), empty:t(\"available\"), reserved:t(\"reserved\"), expired:t(\"expired\") };\n  return (\n    <div className=\"flex flex-wrap gap-2\">\n      {([\"occupied\",\"empty\",\"reserved\",\"expired\"] as SpotStatus[]).map(st => {\n        const p = PAL[st];\n        const label = LABELS[st];"
)
patch("components/map/YardMapSVG.tsx",
  "  const [selected, setSelected] = useState<YardSpot|null>(null);\n  const toggle",
  "  const [selected, setSelected] = useState<YardSpot|null>(null);\n  const { t } = useLanguage();\n  const toggle"
)
patch("components/map/YardMapSVG.tsx",
  "          Click any spot to view vessel details",
  "          {t(\"clickSpot\")}"
)
patch("components/map/YardMapSVG.tsx",
  "{YARD_SPOTS.length} spots total",
  "{YARD_SPOTS.length} {t(\"spotsTotal\")}"
)
patch("components/map/YardMapSVG.tsx",
  ">▲  ENTRANCE</text>",
  ">{`▲  ${t(\"entrance\")}`}</text>"
)

print("\n✅ All done! Save your files and refresh the browser.")
print("   The EN/AR toggle button will appear in the top bar.")