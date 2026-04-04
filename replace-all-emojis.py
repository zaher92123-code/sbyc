#!/usr/bin/env python3
"""Replaces every remaining emoji with SVG icons or clean text."""
import os, re

ROOT = os.getcwd()
SRC  = os.path.join(ROOT, "src")

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f: f.write(content)
    print(f"  ✓ {path}")

def patch(path, old, new):
    full = os.path.join(ROOT, path)
    if not os.path.exists(full): return
    with open(full) as f: c = f.read()
    c2 = c.replace(old, new)
    with open(full, "w") as f: f.write(c2)
    if c != c2: print(f"  ✓ {path}")

print("\n🔁 Replacing all remaining emojis...\n")

# ═══════════════════════════════════════════════════════
# 1. LOGIN PAGE
# ═══════════════════════════════════════════════════════
print("1️⃣  Login page...")
path = "src/app/(auth)/login/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconAnchor' not in c:
    c = c.replace('"use client";', '"use client";\nimport { IconAnchor, IconBoat, IconPayment, IconReports, IconBell, IconLock } from "@/components/ui/Icons";')
c = c.replace('<div className="text-8xl mb-6 drop-shadow-2xl">⚓</div>', '<div className="mb-6 drop-shadow-2xl flex justify-center"><IconAnchor size={80} className="text-teal-400" /></div>')
c = c.replace('<span className="text-5xl">⚓</span>', '<IconAnchor size={32} className="text-teal-400" />')
c = c.replace('{ icon: "🚢", label: "Boat Registry" }', '{ icon: <IconBoat size={20} />, label: "Boat Registry" }')
c = c.replace('{ icon: "🗺️", label: "Interactive Map" }', '{ icon: <IconAnchor size={20} />, label: "Interactive Map" }')
c = c.replace('{ icon: "💳", label: "Payments" }', '{ icon: <IconPayment size={20} />, label: "Payments" }')
c = c.replace('{ icon: "📊", label: "Reports" }', '{ icon: <IconReports size={20} />, label: "Reports" }')
c = c.replace('{ icon: "🔔", label: "Reminders" }', '{ icon: <IconBell size={20} />, label: "Reminders" }')
c = c.replace('{ icon: "🔒", label: "Secure Access" }', '{ icon: <IconLock size={20} />, label: "Secure Access" }')
# fix icon rendering if it renders as string
c = c.replace('{feature.icon}', '<span className="flex items-center justify-center">{feature.icon}</span>')
c = c.replace('⚠️ {error}', '<span className="flex items-center gap-1.5"><IconWarning size={14} />{error}</span>')
if 'IconWarning' not in c:
    c = c.replace('import { IconAnchor', 'import { IconAnchor, IconWarning,')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 2. DASHBOARD
# ═══════════════════════════════════════════════════════
print("2️⃣  Dashboard...")
path = "src/app/(dashboard)/dashboard/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
c = c.replace(
    'import { IconAnchor, IconBoat, IconClock, IconWarning, IconCurrency, IconBell, IconTrendingUp, IconSpotEmpty } from "@/components/ui/Icons";',
    'import { IconAnchor, IconBoat, IconClock, IconWarning, IconCurrency, IconBell, IconTrendingUp, IconSpotEmpty, IconCheckCircle } from "@/components/ui/Icons";'
)
c = c.replace('<h2 className="font-bold text-slate-800 font-display">⚠️ Sessions Requiring Attention</h2>',
              '<h2 className="font-bold text-slate-800 font-display flex items-center gap-2"><IconWarning size={18} className="text-amber-500" /> Sessions Requiring Attention</h2>')
c = c.replace('<h2 className="font-bold text-slate-800 font-display">🔔 Pending Reminders</h2>',
              '<h2 className="font-bold text-slate-800 font-display flex items-center gap-2"><IconBell size={18} className="text-violet-500" /> Pending Reminders</h2>')
c = c.replace('<span className="text-4xl">✅</span>', '<IconCheckCircle size={40} className="text-emerald-500" />')
c = c.replace('<span className="text-3xl">✅</span>', '<IconCheckCircle size={32} className="text-emerald-500" />')
c = c.replace('Send All Pending →', '<span className="flex items-center gap-1.5"><IconBell size={14} /> Send All Pending</span>')
c = c.replace('View all →', 'View all')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 3. BOATS LIST
# ═══════════════════════════════════════════════════════
print("3️⃣  Boats list...")
path = "src/app/(dashboard)/boats/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
c = c.replace(
    'import { IconCheck } from "@/components/ui/Icons";',
    'import { IconCheck, IconBoat } from "@/components/ui/Icons";'
)
c = c.replace('icon="⛵"', 'icon={<IconBoat size={40} className="opacity-40" />}')
c = c.replace('View →', 'View')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 4. BOATS DETAIL
# ═══════════════════════════════════════════════════════
print("4️⃣  Boats detail...")
path = "src/app/(dashboard)/boats/[id]/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconPhone' not in c and 'IconMail' not in c:
    c = c.replace(
        'import { getT } from "@/lib/i18n/server";',
        'import { getT } from "@/lib/i18n/server";\nimport { IconCheck, IconBoat, IconMail, IconSearch } from "@/components/ui/Icons";'
    )
c = c.replace('<p className="text-xs text-slate-500">📞 {bo.owner.phone || "—"}</p>',
              '<p className="text-xs text-slate-500 flex items-center gap-1"><IconSearch size={10} />{bo.owner.phone || "—"}</p>')
c = c.replace('<p className="text-xs text-slate-500">✉️ {bo.owner.email || "—"}</p>',
              '<p className="text-xs text-slate-500 flex items-center gap-1"><IconMail size={10} />{bo.owner.email || "—"}</p>')
c = c.replace('View Full Session →', 'View Full Session')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 5. OWNERS PAGE
# ═══════════════════════════════════════════════════════
print("5️⃣  Owners pages...")
path = "src/app/(dashboard)/owners/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconOwner' not in c:
    c = c.replace('"use client"' if '"use client"' in c else 'import { createClient }',
                  'import { createClient }')
    c = c.replace('import { getT } from "@/lib/i18n/server";',
                  'import { getT } from "@/lib/i18n/server";\nimport { IconOwner } from "@/components/ui/Icons";')
c = c.replace('icon="👤"', 'icon={<IconOwner size={40} className="opacity-40" />}')
c = c.replace('View →', 'View')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# Owners detail
path = "src/app/(dashboard)/owners/[id]/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
c = c.replace(
    'import { IconOwner, IconMail, IconBoat } from "@/components/ui/Icons";',
    'import { IconOwner, IconMail, IconBoat, IconSearch } from "@/components/ui/Icons";'
)
c = c.replace('{ label: t("phone"), value: owner.phone }',
              '{ label: <span className="flex items-center gap-1"><IconSearch size={11} />{t("phone")}</span>, value: owner.phone }')
c = c.replace('{ label: t("email"), value: owner.email }',
              '{ label: <span className="flex items-center gap-1"><IconMail size={11} />{t("email")}</span>, value: owner.email }')
c = c.replace('"⛵\n"', '')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 6. PAYMENTS
# ═══════════════════════════════════════════════════════
print("6️⃣  Payments...")
path = "src/app/(dashboard)/payments/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconCurrency' not in c:
    c = c.replace('import { getT } from "@/lib/i18n/server";',
                  'import { getT } from "@/lib/i18n/server";\nimport { IconCurrency, IconDocument, IconSettings, IconReports, IconPayment } from "@/components/ui/Icons";')
c = c.replace('<div className="text-2xl mb-1">💰</div>', '<div className="mb-1"><IconCurrency size={24} /></div>')
c = c.replace('<div className="text-2xl mb-1">📄</div>', '<div className="mb-1"><IconDocument size={24} /></div>')
c = c.replace('<div className="text-2xl mb-1">⚙️</div>', '<div className="mb-1"><IconSettings size={24} /></div>')
c = c.replace('<div className="text-2xl mb-1">📊</div>', '<div className="mb-1"><IconReports size={24} /></div>')
c = c.replace('icon="💳"', 'icon={<IconPayment size={40} className="opacity-40" />}')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 7. SESSIONS
# ═══════════════════════════════════════════════════════
print("7️⃣  Sessions...")
path = "src/app/(dashboard)/sessions/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconSessions' not in c:
    c = c.replace('import { getT } from "@/lib/i18n/server";',
                  'import { getT } from "@/lib/i18n/server";\nimport { IconSessions } from "@/components/ui/Icons";')
c = c.replace('icon="📋"', 'icon={<IconSessions size={40} className="opacity-40" />}')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# Sessions detail
path = "src/app/(dashboard)/sessions/[id]/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconWarning' not in c:
    c = c.replace('import { getT } from "@/lib/i18n/server";',
                  'import { getT } from "@/lib/i18n/server";\nimport { IconWarning, IconClock, IconCheck, IconMail, IconSearch } from "@/components/ui/Icons";')
c = c.replace('⚠️ {t("daysOverdueAlert")}', '<IconWarning size={16} className="inline mr-1" />{t("daysOverdueAlert")}')
c = c.replace('⏰ {t("expiresIn")}', '<IconClock size={16} className="inline mr-1" />{t("expiresIn")}')
c = c.replace('<p className="text-xs text-slate-500">📞 {primaryOwner.phone || "—"}</p>',
              '<p className="text-xs text-slate-500 flex items-center gap-1"><IconSearch size={10} />{primaryOwner.phone || "—"}</p>')
c = c.replace('<p className="text-xs text-slate-500">✉️ {primaryOwner.email || "—"}</p>',
              '<p className="text-xs text-slate-500 flex items-center gap-1"><IconMail size={10} />{primaryOwner.email || "—"}</p>')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# Sessions new
path = "src/app/(dashboard)/sessions/new/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconWarning' not in c:
    c = c.replace('import { useLanguage } from "@/lib/i18n/LanguageContext";',
                  'import { useLanguage } from "@/lib/i18n/LanguageContext";\nimport { IconWarning } from "@/components/ui/Icons";')
c = c.replace('{t("noEmptySpotsNote")}', '<span className="flex items-center gap-1.5"><IconWarning size={13} />{t("noEmptySpotsNote")}</span>')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 8. REMINDERS
# ═══════════════════════════════════════════════════════
print("8️⃣  Reminders page...")
path = "src/app/(dashboard)/reminders/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconSend' not in c:
    c = c.replace('import { IconBell, IconMail, IconWarning, IconCheck } from "@/components/ui/Icons";',
                  'import { IconBell, IconMail, IconWarning, IconCheck, IconSend, IconSettings, IconSessions } from "@/components/ui/Icons";')
c = c.replace('<button type="submit" className="btn-primary">🚀 Send Pending Now</button>',
              '<button type="submit" className="btn-primary flex items-center gap-2"><IconSend size={15} /> Send Pending Now</button>')
c = c.replace('Rules & Settings\n        </Link>',
              '<span className="flex items-center gap-2"><IconSettings size={15} /> Rules &amp; Settings</span>\n        </Link>')
c = c.replace('Email History\n        </Link>',
              '<span className="flex items-center gap-2"><IconSessions size={15} /> Email History</span>\n        </Link>')
c = c.replace('<span>📤</span> Email Sender Configuration',
              '<><IconMail size={18} className="text-teal-600" /> Email Sender Configuration</>')
c = c.replace('{hasApiKey ? "✓ API Key Set" : "⚠ No API Key"}', '{hasApiKey ? "API Key Set" : "No API Key"}')
c = c.replace('{hasApiKey ? "✓ API Key Set" : "⚠ No API Key"}', '{hasApiKey ? "API Key Set" : "No API Key"}')
c = c.replace('⚠️ <strong>Email sending is disabled.</strong>', '<strong className="flex items-center gap-1.5"><IconWarning size={14} /> Email sending is disabled.</strong>')
c = c.replace('<EmptyState icon="🔔" title="No reminder history yet" />',
              '<EmptyState title="No reminder history yet" />')
c = c.replace('🔔 Pending Reminders', 'Pending Reminders')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# Reminder Rules Manager
print("   ReminderRulesManager...")
path = "src/components/reminders/ReminderRulesManager.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
# Replace placeholder icons with SVG ones
c = c.replace('{ token: "[Owner Name]",     desc: "Owner\'s full name",      icon: "👤" }',
              '{ token: "[Owner Name]",     desc: "Owner\'s full name",      icon: "owner" }')
c = c.replace('{ token: "[Boat Name]",      desc: "Vessel name",            icon: "⛵" }',
              '{ token: "[Boat Name]",      desc: "Vessel name",            icon: "boat" }')
c = c.replace('{ token: "[Spot Number]",    desc: "Parking spot number",    icon: "📍" }',
              '{ token: "[Spot Number]",    desc: "Parking spot number",    icon: "spot" }')
c = c.replace('{ token: "[Expiry Date]",    desc: "Session expiry date",    icon: "📅" }',
              '{ token: "[Expiry Date]",    desc: "Session expiry date",    icon: "calendar" }')
c = c.replace('{ token: "[Entry Date]",     desc: "Session start date",     icon: "📅" }',
              '{ token: "[Entry Date]",     desc: "Session start date",     icon: "calendar" }')
c = c.replace('{ token: "[Days Remaining]", desc: "Days left or overdue",   icon: "⏳" }',
              '{ token: "[Days Remaining]", desc: "Days left or overdue",   icon: "clock" }')
c = c.replace('{ token: "[Balance Due]",    desc: "Outstanding balance OMR",icon: "💰" }',
              '{ token: "[Balance Due]",    desc: "Outstanding balance OMR",icon: "currency" }')
c = c.replace('{ token: "[Total Due]",      desc: "Total amount due",       icon: "💳" }',
              '{ token: "[Total Due]",      desc: "Total amount due",       icon: "payment" }')
c = c.replace('{ token: "[Total Paid]",     desc: "Amount already paid",    icon: "✅" }',
              '{ token: "[Total Paid]",     desc: "Amount already paid",    icon: "check" }')
c = c.replace('{ token: "[Registration]",   desc: "Boat registration no.",  icon: "🔢" }',
              '{ token: "[Registration]",   desc: "Boat registration no.",  icon: "sessions" }')
c = c.replace('{ token: "[Marina Name]",    desc: "Marina name",            icon: "⚓" }',
              '{ token: "[Marina Name]",    desc: "Marina name",            icon: "anchor" }')

# Add Icon import and replace icon rendering
if 'import { Icon }' not in c:
    c = c.replace(
        'import { IconBell',
        'import { Icon, IconBell'
    )
# Replace the span rendering of icon in placeholder chips
c = c.replace(
    '<span style={{ fontSize: 16 }}>{ph.icon}</span>',
    '<span className="flex items-center justify-center w-5 h-5"><Icon name={ph.icon} size={16} /></span>'
)
c = c.replace('<span style={{ fontSize: 14 }}>📧</span>', '<IconMail size={14} />')
# Remove email icon from header bar - it's already IconMail
c = c.replace('<span style={{ fontSize: 16 }}>⚓</span>', '<IconAnchor size={16} />')
if 'IconAnchor' not in c:
    c = c.replace('import { Icon, IconBell', 'import { Icon, IconBell, IconAnchor,')
c = c.replace('✓ {toast}', '')
c = c.replace('{toast}', '')
# Fix toast
c = c.replace(
    '          ✓ {toast}\n        </div>',
    '          <span className="flex items-center gap-2"><IconCheck size={14} /> {toast}</span>\n        </div>'
)
c = c.replace('<p className="text-3xl mb-3">🔔</p>', '<div className="mb-3 flex justify-center"><IconBell size={40} className="text-slate-300" /></div>')
c = c.replace('<span>ℹ️</span> How automatic reminders work', '<span className="flex items-center gap-2"><IconInfo size={16} /> How automatic reminders work</span>')
if 'IconInfo' not in c:
    c = c.replace('import { Icon, IconBell', 'import { Icon, IconBell, IconInfo,')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 9. REPORTS
# ═══════════════════════════════════════════════════════
print("9️⃣  Reports...")
path = "src/app/(dashboard)/reports/page.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
# Fix report type icons — they may still be strings
c = c.replace('{ key: "monthly",   label: t("monthlySummary"),  icon: "📊" }',
              '{ key: "monthly",   label: t("monthlySummary"),  icon: <IconReports size={15} /> }')
c = c.replace('{ key: "active",    label: t("activeBoats"),      icon: "🚢" }',
              '{ key: "active",    label: t("activeBoats"),      icon: <IconBoat size={15} /> }')
c = c.replace('{ key: "unpaid",    label: t("unpaid"),            icon: "💰" }',
              '{ key: "unpaid",    label: t("unpaid"),            icon: <IconCurrency size={15} /> }')
c = c.replace('{ key: "ending30",  label: t("ending30Days"),      icon: "⏰" }',
              '{ key: "ending30",  label: t("ending30Days"),      icon: <IconClock size={15} /> }')
c = c.replace('{ key: "overdue",   label: t("overdueReport"),     icon: "⚠️" }',
              '{ key: "overdue",   label: t("overdueReport"),     icon: <IconWarning size={15} /> }')
c = c.replace('{ key: "allmonths", label: "All Months",            icon: "📅" }',
              '{ key: "allmonths", label: "All Months",            icon: <IconCalendar size={15} /> }')
if 'IconBoat' not in c:
    c = c.replace(
        'import MonthlyReportClient from "@/components/reports/MonthlyReportClient";',
        'import MonthlyReportClient from "@/components/reports/MonthlyReportClient";\nimport { IconBoat, IconCurrency, IconClock, IconWarning, IconReports, IconCalendar } from "@/components/ui/Icons";'
    )
c = c.replace('View →', 'View')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# MonthPicker
path = "src/components/reports/MonthPicker.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconCalendar' not in c:
    c = c.replace('"use client";', '"use client";\nimport { IconCalendar } from "@/components/ui/Icons";')
c = c.replace('<span className="text-sm font-semibold text-slate-600">📅 Select Month:</span>',
              '<span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5"><IconCalendar size={15} /> Select Month:</span>')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 10. SpotInfoPanel
# ═══════════════════════════════════════════════════════
print("🔟  SpotInfoPanel...")
path = "src/components/map/SpotInfoPanel.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
c = c.replace(
    '? `⚠️  ${t("expiredLabel")} ${Math.abs(days)} ${t("expiredDaysAgo")}`\n              : days === 0 ? `⏰  ${t("expiresToday")}`\n              : isSoon    ? `⏰  ${t("expiresIn")} ${days} ${t("days")}`\n              : `✓  ${days} ${t("expiresInDays")}`}',
    '? <span className="flex items-center gap-1.5 justify-center"><IconWarning size={13} /> {t("expiredLabel")} {Math.abs(days)} {t("expiredDaysAgo")}</span>\n              : days === 0 ? <span className="flex items-center gap-1.5 justify-center"><IconClock size={13} /> {t("expiresToday")}</span>\n              : isSoon    ? <span className="flex items-center gap-1.5 justify-center"><IconClock size={13} /> {t("expiresIn")} {days} {t("days")}</span>\n              : <span className="flex items-center gap-1.5 justify-center"><IconCheck size={13} /> {days} {t("expiresInDays")}</span>}'
)
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 11. GlobalSearch
# ═══════════════════════════════════════════════════════
print("1️⃣1️⃣  GlobalSearch...")
path = "src/components/layout/GlobalSearch.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconBoat' not in c:
    c = c.replace('"use client";', '"use client";\nimport { IconBoat, IconOwner, IconSessions, IconSearch } from "@/components/ui/Icons";')
c = c.replace('<span className="text-lg">⛵</span>', '<IconBoat size={18} className="text-slate-400" />')
c = c.replace('<span className="text-lg">👤</span>', '<IconOwner size={18} className="text-slate-400" />')
c = c.replace('<span className="text-lg">📋</span>', '<IconSessions size={18} className="text-slate-400" />')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 12. NOT FOUND & ERROR PAGES
# ═══════════════════════════════════════════════════════
print("1️⃣2️⃣  Error & not-found pages...")
path = "src/app/not-found.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconAnchor' not in c:
    c = c.replace('"use client"' if '"use client"' in c else 'export default', 'import { IconAnchor } from "@/components/ui/Icons";\nexport default')
    if 'export default function' in c and 'import { IconAnchor }' not in c:
        c = 'import { IconAnchor } from "@/components/ui/Icons";\n' + c
c = c.replace('<div className="text-8xl mb-6">⚓</div>', '<div className="mb-6 flex justify-center"><IconAnchor size={80} className="text-teal-400 opacity-60" /></div>')
c = c.replace('← Back to Dashboard', 'Back to Dashboard')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

path = "src/app/(dashboard)/error.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconWarning' not in c:
    c = c.replace('"use client";', '"use client";\nimport { IconWarning } from "@/components/ui/Icons";')
c = c.replace('<div className="text-6xl mb-4">⚠️</div>', '<div className="mb-4 flex justify-center"><IconWarning size={60} className="text-amber-500 opacity-70" /></div>')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 13. EMAIL TEMPLATES (replace emoji in HTML emails)
# ═══════════════════════════════════════════════════════
print("1️⃣3️⃣  Email templates...")
path = "src/lib/email/templates.ts"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
c = c.replace('<h1>⚓ ${APP_NAME}</h1>', '<h1>⚓ ${APP_NAME}</h1>')  # keep anchor in email HTML (it's fine)
c = c.replace('<span class="info-label">🛥 Vessel</span>', '<span class="info-label">Vessel</span>')
c = c.replace('<span class="info-label">📋 Registration</span>', '<span class="info-label">Registration</span>')
c = c.replace('<span class="info-label">⚓ Berth</span>', '<span class="info-label">Spot</span>')
c = c.replace('<span class="info-label">📅 Check-In</span>', '<span class="info-label">Check-In</span>')
c = c.replace('<span class="info-label">📅 Expected Departure</span>', '<span class="info-label">Expected Departure</span>')
c = c.replace('<span class="info-label">💰 Total Charges</span>', '<span class="info-label">Total Charges</span>')
c = c.replace('<span class="info-label">✅ Amount Paid</span>', '<span class="info-label">Amount Paid</span>')
c = c.replace('<span class="info-label">⚠️ Balance Due</span>', '<span class="info-label">Balance Due</span>')
c = c.replace('⏰ ${alertText}', '${alertText}')
c = c.replace('✅ Your account is fully settled.', 'Your account is fully settled.')
c = c.replace('<p style="color:#64748b;font-size:14px;">📞 Marina Office:', '<p style="color:#64748b;font-size:14px;">Tel: Marina Office:')
c = c.replace('⚠️ URGENT:', 'URGENT:')
c = c.replace('<p>📞 Marina Office:', '<p>Tel: Marina Office:')
c = c.replace('<p>📧 info@alseebbay.om</p>', '<p>Email: info@alseebbay.om</p>')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 14. UI/INDEX — remove remaining ✕ emoji in modal
# ═══════════════════════════════════════════════════════
print("1️⃣4️⃣  UI components...")
path = "src/components/ui/index.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconX' not in c:
    c = c.replace('import { IconWarning, IconCheck, IconInfo } from "@/components/ui/Icons";',
                  'import { IconWarning, IconCheck, IconInfo, IconX } from "@/components/ui/Icons";')
c = c.replace('            ✕\n          </button>', '            <IconX size={14} />\n          </button>')
c = c.replace('maintenance: "▲",', 'maintenance: "!",')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

# ═══════════════════════════════════════════════════════
# 15. SESSION ACTIONS
# ═══════════════════════════════════════════════════════
print("1️⃣5️⃣  Session actions...")
path = "src/components/sessions/SessionActions.tsx"
full = os.path.join(ROOT, path)
with open(full) as f: c = f.read()
if 'IconWarning' not in c:
    c = c.replace('import { IconCalendar, IconCheck } from "@/components/ui/Icons";',
                  'import { IconCalendar, IconCheck, IconWarning } from "@/components/ui/Icons";')
c = c.replace('"✓ Account is fully settled. Safe to close."',
              '"Account is fully settled. Safe to close."')
c = c.replace('{loading ? "Closing…" : "✓ Confirm Departure & Close"}',
              '{loading ? "Closing…" : <><IconCheck size={14} /> Confirm Departure &amp; Close</>}')
with open(full, "w") as f: f.write(c)
print(f"  ✓ {path}")

print("\n✅  All emojis replaced! Run: npm run dev")
