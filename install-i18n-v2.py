#!/usr/bin/env python3
"""
install-i18n-v2.py
Run from project root:  python3 install-i18n-v2.py
Adds Arabic translation to ALL pages (server + client components).
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

print("\n🌍 Installing full Arabic translation (v2)...\n")

# ═══════════════════════════════════════════════════════════════════════════════
# 1. Updated translations.ts  (comprehensive)
# ═══════════════════════════════════════════════════════════════════════════════
print("1️⃣  Writing comprehensive translations.ts...")
write("lib/i18n/translations.ts", r'''// =============================================================================
//  TRANSLATIONS — Al Seeb Bay Marina
//  Edit the "ar" values to correct any Arabic translation.
// =============================================================================
export type Lang = "en" | "ar";

export const T = {
  // ── App identity ────────────────────────────────────────────────────────────
  appName:           { en: "Al Seeb Bay Marina",              ar: "مرسى السيب" },
  appTagline:        { en: "Boat Parking Management",         ar: "نظام إدارة مواقف القوارب" },
  location:          { en: "Muscat, Sultanate of Oman",       ar: "مسقط، سلطنة عُمان" },
  // ── Navigation ──────────────────────────────────────────────────────────────
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
  // ── Top bar ─────────────────────────────────────────────────────────────────
  online:            { en: "Online",            ar: "متصل" },
  signOut:           { en: "Sign Out",          ar: "تسجيل الخروج" },
  searchPlaceholder: { en: "Search vessels, owners, spots…", ar: "ابحث عن قوارب، ملاك، مواقف…" },
  // ── Status ──────────────────────────────────────────────────────────────────
  occupied:          { en: "Occupied",          ar: "مشغول" },
  available:         { en: "Available",         ar: "متاح" },
  reserved:          { en: "Reserved",          ar: "محجوز" },
  expired:           { en: "Expired",           ar: "منتهي" },
  active:            { en: "Active",            ar: "نشط" },
  endingSoon:        { en: "Ending Soon",       ar: "تنتهي قريباً" },
  overdue:           { en: "Overdue",           ar: "متأخر" },
  closed:            { en: "Closed",            ar: "مغلق" },
  parked:            { en: "Parked",            ar: "موقوف" },
  maintenance:       { en: "Maintenance",       ar: "صيانة" },
  activeStatus:      { en: "Active",            ar: "نشط" },
  inactiveStatus:    { en: "Inactive",          ar: "غير نشط" },
  // ── Dashboard ───────────────────────────────────────────────────────────────
  totalSpots:        { en: "Total Spots",             ar: "إجمالي المواقف" },
  occupiedSpots:     { en: "Occupied Spots",          ar: "مواقف مشغولة" },
  availableSpots:    { en: "Available Spots",         ar: "مواقف متاحة" },
  expiringSoon:      { en: "Ending Soon",             ar: "تنتهي قريباً" },
  overdueSessionsLabel: { en: "Overdue Sessions",     ar: "جلسات متأخرة" },
  unpaidBalance:     { en: "Unpaid Balance",          ar: "رصيد غير مدفوع" },
  remindersToday:    { en: "Reminders Today",         ar: "تذكيرات اليوم" },
  collectedThisMonth:{ en: "Collected This Month",    ar: "المحصّل هذا الشهر" },
  withinNext7Days:   { en: "Within next 7 days",      ar: "خلال 7 أيام القادمة" },
  requireImmediateAction: { en: "Require immediate action", ar: "تحتاج إجراء فوري" },
  acrossAllSessions: { en: "Across all active sessions", ar: "عبر جميع الجلسات" },
  pendingToSend:     { en: "Pending to send",         ar: "معلقة للإرسال" },
  monthToDate:       { en: "Month to date",           ar: "من بداية الشهر" },
  availableForNew:   { en: "Available for new bookings", ar: "متاح لحجوزات جديدة" },
  occupancyPct:      { en: "% occupancy",             ar: "٪ إشغال" },
  sessionsRequiringAttention: { en: "⚠️ Sessions Requiring Attention", ar: "⚠️ جلسات تحتاج اهتماماً" },
  noUrgentSessions:  { en: "No urgent sessions",      ar: "لا توجد جلسات عاجلة" },
  allOnSchedule:     { en: "All sessions are on schedule", ar: "جميع الجلسات في موعدها" },
  pendingRemindersTitle: { en: "🔔 Pending Reminders", ar: "🔔 التذكيرات المعلقة" },
  sendAllPending:    { en: "Send All Pending →",      ar: "← إرسال جميع المعلقة" },
  noPendingReminders:{ en: "No pending reminders",    ar: "لا توجد تذكيرات معلقة" },
  scheduledColon:    { en: "Scheduled:",              ar: "مجدول:" },
  daysOverdueShort:  { en: "d overdue",               ar: "ي متأخرة" },
  daysLeftShort:     { en: "d left",                  ar: "ي متبقية" },
  viewAll:           { en: "View all →",              ar: "← عرض الكل" },
  // ── Map ─────────────────────────────────────────────────────────────────────
  clickSpot:         { en: "Click any spot to view vessel details", ar: "انقر على أي موقف لعرض تفاصيل السفينة" },
  spotsTotal:        { en: "spots total",       ar: "موقف إجمالي" },
  entrance:          { en: "ENTRANCE",          ar: "المدخل" },
  spot:              { en: "Spot",              ar: "موقف" },
  // ── Spot info panel ─────────────────────────────────────────────────────────
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
  paidShort:         { en: "Paid ✓",            ar: "مدفوع ✓" },
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
  // ── Boats ───────────────────────────────────────────────────────────────────
  boatRegistry:      { en: "Boat Registry",           ar: "سجل القوارب" },
  vesselsRegistered: { en: "vessels registered",      ar: "سفينة مسجلة" },
  registerBoat:      { en: "+ Register Boat",         ar: "+ تسجيل قارب" },
  searchByNameOrReg: { en: "Search by name or registration…", ar: "ابحث بالاسم أو رقم التسجيل…" },
  allStatus:         { en: "All Status",              ar: "جميع الحالات" },
  vesselDetails:     { en: "Vessel Details",          ar: "تفاصيل السفينة" },
  color:             { en: "Color",                   ar: "اللون" },
  length:            { en: "Length",                  ar: "الطول" },
  registeredDate:    { en: "Registered",              ar: "تاريخ التسجيل" },
  manage:            { en: "Manage",                  ar: "إدارة" },
  primary:           { en: "Primary",                 ar: "رئيسي" },
  since:             { en: "Since",                   ar: "منذ" },
  currentSession:    { en: "Current Session",         ar: "الجلسة الحالية" },
  noActiveSession:   { en: "No active session",       ar: "لا توجد جلسة نشطة" },
  startSession:      { en: "+ Start Session",         ar: "+ بدء جلسة" },
  checkIn:           { en: "Check-in",                ar: "تاريخ الدخول" },
  expectedEnd:       { en: "Expected End",            ar: "التاريخ المتوقع للخروج" },
  balanceDue:        { en: "Balance Due",             ar: "الرصيد المستحق" },
  viewFullSession:   { en: "View Full Session →",     ar: "← عرض الجلسة كاملاً" },
  paymentHistory:    { en: "Payment History",         ar: "سجل المدفوعات" },
  addPayment:        { en: "+ Add Payment",           ar: "+ إضافة دفعة" },
  parkingHistory:    { en: "Parking History",         ar: "سجل الإيقاف" },
  checkOut:          { en: "Check-Out",               ar: "تاريخ الخروج" },
  duration:          { en: "Duration",                ar: "المدة" },
  reference:         { en: "Reference",               ar: "المرجع" },
  noPaidBalance:     { en: "✓ Paid",                  ar: "✓ مدفوع" },
  noBoatsFound:      { en: "No boats found",          ar: "لا توجد قوارب" },
  tryAdjustingFilters: { en: "Try adjusting your search filters", ar: "حاول تعديل مرشحات البحث" },
  registerFirstBoat: { en: "Register First Boat",     ar: "تسجيل أول قارب" },
  // ── Owners ──────────────────────────────────────────────────────────────────
  boatOwners:        { en: "Boat Owners",             ar: "ملاك القوارب" },
  registeredOwners:  { en: "registered owners",      ar: "مالك مسجل" },
  addOwner:          { en: "+ Add Owner",             ar: "+ إضافة مالك" },
  searchOwnerPlaceholder: { en: "Search by name, email, or phone…", ar: "ابحث بالاسم أو البريد أو الهاتف…" },
  memberSince:       { en: "Member Since",            ar: "عضو منذ" },
  noBoatsLabel:      { en: "No boats",                ar: "لا توجد قوارب" },
  noOwnersFound:     { en: "No owners found",         ar: "لا يوجد ملاك" },
  billingNotes:      { en: "Billing Notes",           ar: "ملاحظات الفواتير" },
  accountSummary:    { en: "Account Summary",         ar: "ملخص الحساب" },
  vessels:           { en: "Vessels",                 ar: "السفن" },
  currentlyParked:   { en: "Currently Parked",        ar: "موقوف حالياً" },
  registeredVessels: { en: "Registered Vessels",      ar: "السفن المسجلة" },
  primaryOwner:      { en: "Primary Owner",           ar: "المالك الرئيسي" },
  ownerSince:        { en: "Owner since",             ar: "مالك منذ" },
  contactLabel:      { en: "Contact",                 ar: "التواصل" },
  altContact:        { en: "Alt. Contact",            ar: "جهة تواصل بديلة" },
  noVesselsRegistered: { en: "No vessels registered", ar: "لا توجد سفن مسجلة" },
  registerFirstVessel: { en: "+ Register First Vessel", ar: "+ تسجيل السفينة الأولى" },
  outstandingBalance: { en: "Outstanding Balance",    ar: "الرصيد المستحق" },
  due:               { en: "due",                     ar: "مستحق" },
  until:             { en: "Until",                   ar: "حتى" },
  registerBoatForOwner: { en: "+ Register Boat",      ar: "+ تسجيل قارب" },
  // ── Sessions ────────────────────────────────────────────────────────────────
  newSession:        { en: "+ New Session",           ar: "+ جلسة جديدة" },
  activeSessionsLabel: { en: "active sessions",       ar: "جلسات نشطة" },
  vesselAndSpot:     { en: "Vessel & Parking Spot",   ar: "السفينة والموقف" },
  sessionDates:      { en: "Session Dates",           ar: "تواريخ الجلسة" },
  startDate:         { en: "Start Date",              ar: "تاريخ البداية" },
  expectedEndDate:   { en: "Expected End Date",       ar: "تاريخ الانتهاء المتوقع" },
  pricingModel:      { en: "Pricing Model",           ar: "نموذج التسعير" },
  baseFee:           { en: "Base Fee",                ar: "الرسوم الأساسية" },
  daily:             { en: "Daily",                   ar: "يومي" },
  weekly:            { en: "Weekly",                  ar: "أسبوعي" },
  monthly:           { en: "Monthly",                 ar: "شهري" },
  custom:            { en: "Custom",                  ar: "مخصص" },
  noSessionsFound:   { en: "No sessions found",       ar: "لا توجد جلسات" },
  spotNumber:        { en: "Spot",                    ar: "الموقف" },
  unpaidOnly:        { en: "Unpaid only",             ar: "غير مدفوعة فقط" },
  allActive:         { en: "All Active",              ar: "جميع النشطة" },
  selectVessel:      { en: "Select a vessel…",        ar: "اختر سفينة…" },
  selectSpot:        { en: "Select an empty spot…",   ar: "اختر موقفاً فارغاً…" },
  noEmptySpots:      { en: "No empty spots available",ar: "لا توجد مواقف فارغة" },
  noEmptySpotsNote:  { en: "⚠️ No empty spots available. A spot must be marked empty first.", ar: "⚠️ لا توجد مواقف فارغة. يجب تحديد موقف كفارغ أولاً." },
  autoCalculated:    { en: "Auto-calculated; adjust if needed", ar: "محسوب تلقائياً؛ عدّل إذا لزم" },
  daysDuration:      { en: "days duration",           ar: "أيام مدة الإيقاف" },
  totalAmountToCharge: { en: "Total amount to be charged", ar: "المبلغ الإجمالي المطلوب" },
  anyAdditionalNotes:{ en: "Any additional notes about this parking session…", ar: "أي ملاحظات إضافية حول جلسة الإيقاف…" },
  creatingSession:   { en: "Creating Session…",       ar: "جار إنشاء الجلسة…" },
  createParkingSession: { en: "Create Parking Session", ar: "إنشاء جلسة إيقاف" },
  newParkingSession: { en: "New Parking Session",     ar: "جلسة إيقاف جديدة" },
  vessel_star:       { en: "Vessel *",                ar: "السفينة *" },
  parkingSpot_star:  { en: "Parking Spot *",          ar: "موقف الإيقاف *" },
  currentlyParkedNote: { en: "— Currently Parked",   ar: "— موقوف حالياً" },
  startDate_star:    { en: "Start Date *",            ar: "تاريخ البداية *" },
  expectedEndDate_star: { en: "Expected End Date *",  ar: "تاريخ الانتهاء المتوقع *" },
  totalDueOMR:       { en: "Total Due (OMR)",         ar: "الإجمالي المستحق (ر.ع.)" },
  pleaseSelectBoatAndSpot: { en: "Please select a boat and parking spot", ar: "يرجى اختيار قارب وموقف إيقاف" },
  // ── Session detail ──────────────────────────────────────────────────────────
  sessionDetails:    { en: "Session Details",         ar: "تفاصيل الجلسة" },
  actualExit:        { en: "Actual Exit",             ar: "تاريخ الخروج الفعلي" },
  createdBy:         { en: "Created By",              ar: "أنشأه" },
  createdAt:         { en: "Created At",              ar: "تاريخ الإنشاء" },
  financials:        { en: "Financials",              ar: "الماليات" },
  lastPayment:       { en: "Last Payment",            ar: "آخر دفعة" },
  paymentProgress:   { en: "Payment progress",        ar: "تقدم الدفع" },
  recordPaymentBtn:  { en: "+ Record Payment",        ar: "+ تسجيل دفعة" },
  vesselAndOwner:    { en: "Vessel & Owner",          ar: "السفينة والمالك" },
  reminderScheduleTitle: { en: "Reminder Schedule",   ar: "جدول التذكيرات" },
  basedOnEndDate:    { en: "Based on expected end date:", ar: "بناءً على تاريخ الانتهاء المتوقع:" },
  sentStatus:        { en: "✓ Sent",                  ar: "✓ مُرسل" },
  failedStatus:      { en: "✗ Failed",                ar: "✗ فشل" },
  missedStatus:      { en: "Missed",                  ar: "فائت" },
  scheduledStatus:   { en: "Scheduled",               ar: "مجدول" },
  adjustment:        { en: "Adjustment",              ar: "تعديل" },
  payment:           { en: "Payment",                 ar: "دفعة" },
  records:           { en: "records",                 ar: "سجل" },
  sessionsBack:      { en: "← Sessions",              ar: "→ الجلسات" },
  daysOverdueAlert:  { en: "days overdue",            ar: "أيام متأخرة" },
  daysAlert:         { en: "day",                     ar: "يوم" },
  daysAlertPlural:   { en: "days",                    ar: "أيام" },
  // ── Payments ────────────────────────────────────────────────────────────────
  paymentsTitle:     { en: "Payments",                ar: "المدفوعات" },
  paymentRecordsLabel: { en: "records",               ar: "سجل" },
  newPayment:        { en: "+ Record Payment",        ar: "+ تسجيل دفعة" },
  totalCollected:    { en: "Total Collected",         ar: "الإجمالي المحصّل" },
  filteredPeriod:    { en: "Filtered period",         ar: "الفترة المحددة" },
  allTime:           { en: "All time",                ar: "كل الوقت" },
  paymentRecordsCount: { en: "Payment Records",       ar: "سجلات الدفع" },
  adjustmentsCount:  { en: "Adjustments",            ar: "تعديلات" },
  avgPayment:        { en: "Avg Payment",             ar: "متوسط الدفع" },
  fromLabel:         { en: "From:",                   ar: "من:" },
  toLabel:           { en: "To:",                     ar: "إلى:" },
  sessionBalanceAfter: { en: "Session Balance After", ar: "رصيد الجلسة بعد" },
  noPaymentsFound:   { en: "No payments found",       ar: "لا توجد مدفوعات" },
  recordPaymentTitle:{ en: "Record Payment",          ar: "تسجيل دفعة" },
  sessionSummary:    { en: "Session Summary",         ar: "ملخص الجلسة" },
  alreadyPaid:       { en: "Already Paid",            ar: "المدفوع مسبقاً" },
  parkingSessionStar:{ en: "Parking Session *",       ar: "جلسة الإيقاف *" },
  selectSession:     { en: "Select a session…",       ar: "اختر جلسة…" },
  amountOMRStar:     { en: "Amount (OMR) *",          ar: "المبلغ (ر.ع.) *" },
  remainingAfter:    { en: "Remaining after:",        ar: "المتبقي بعد:" },
  paymentDateStar:   { en: "Payment Date *",          ar: "تاريخ الدفع *" },
  paymentMethodLabel:{ en: "Payment Method",          ar: "طريقة الدفع" },
  bankTransfer:      { en: "Bank Transfer",           ar: "تحويل بنكي" },
  cash:              { en: "Cash",                    ar: "نقداً" },
  cheque:            { en: "Cheque",                  ar: "شيك" },
  onlinePayment:     { en: "Online Payment",          ar: "دفع إلكتروني" },
  other:             { en: "Other",                   ar: "أخرى" },
  referenceNumber:   { en: "Reference Number",        ar: "رقم المرجع" },
  optionalNotes:     { en: "Optional payment notes…", ar: "ملاحظات اختيارية…" },
  manualAdjustment:  { en: "Manual Balance Adjustment", ar: "تعديل يدوي للرصيد" },
  adjustmentNote:    { en: "Check this if this is a fee adjustment, not a payment", ar: "حدد هذا إذا كان تعديلاً وليس دفعة" },
  adjustmentReasonLabel: { en: "Adjustment Reason *", ar: "سبب التعديل *" },
  reasonPlaceholder: { en: "Reason for adjustment…", ar: "سبب التعديل…" },
  recording:         { en: "Recording…",              ar: "جار التسجيل…" },
  // ── Reminders ───────────────────────────────────────────────────────────────
  remindersTitle:    { en: "Reminders",               ar: "التذكيرات" },
  rulesConfigured:   { en: "rules configured",        ar: "قاعدة مضبوطة" },
  emailsInHistory:   { en: "emails in history",       ar: "بريد في السجل" },
  sendPendingNow:    { en: "🚀 Send Pending Now",      ar: "🚀 إرسال المعلقة الآن" },
  remindersOverdueToSend: { en: "reminders overdue to send", ar: "تذكيرات متأخرة للإرسال" },
  switchToHistory:   { en: "Switch to History tab and click \"Send Pending Now\".", ar: "انتقل إلى تبويب السجل وانقر \"إرسال المعلقة الآن\"." },
  remindersFailed:   { en: "reminders failed to send", ar: "تذكيرات فشل إرسالها" },
  checkHistoryTab:   { en: "Check the History tab for error details.", ar: "تحقق من تبويب السجل لتفاصيل الخطأ." },
  rulesSettings:     { en: "⚙️ Rules & Settings",     ar: "⚙️ القواعد والإعدادات" },
  emailHistory:      { en: "📋 Email History",         ar: "📋 سجل الرسائل" },
  noReminderHistory: { en: "No reminder history yet", ar: "لا يوجد سجل تذكيرات بعد" },
  sentTo:            { en: "Sent To",                 ar: "مُرسل إلى" },
  ruleLabel:         { en: "Rule",                    ar: "القاعدة" },
  skipped:           { en: "Skipped",                 ar: "تخطي" },
  newRule:           { en: "+ New Rule",              ar: "+ قاعدة جديدة" },
  saveRule:          { en: "Save Rule",               ar: "حفظ القاعدة" },
  noRulesYet:        { en: "No reminder rules yet",   ar: "لا توجد قواعد تذكير بعد" },
  createFirstRule:   { en: "Click \"New Rule\" above to create your first automated reminder.", ar: "انقر على \"+ قاعدة جديدة\" لإنشاء أول تذكير تلقائي." },
  // ── Reports ─────────────────────────────────────────────────────────────────
  reportsTitle:      { en: "Reports",                 ar: "التقارير" },
  exportCSV:         { en: "Export CSV",              ar: "تصدير CSV" },
  activeBoats:       { en: "Active Boats",            ar: "القوارب النشطة" },
  unpaid:            { en: "Unpaid",                  ar: "غير مدفوعة" },
  ending30Days:      { en: "Ending in 30 Days",       ar: "تنتهي خلال 30 يوماً" },
  overdueReport:     { en: "Overdue",                 ar: "متأخرة" },
  monthlySummary:    { en: "Monthly Summary",         ar: "الملخص الشهري" },
  totalSessions:     { en: "Total Sessions",          ar: "إجمالي الجلسات" },
  totalOutstanding:  { en: "Total Outstanding",       ar: "الإجمالي المتبقي" },
  daysLeft:          { en: "Days Left",               ar: "الأيام المتبقية" },
  over:              { en: "over",                    ar: "تجاوز" },
  month:             { en: "Month",                   ar: "الشهر" },
  numberOfPayments:  { en: "Number of Payments",      ar: "عدد المدفوعات" },
  average:           { en: "Average",                 ar: "المتوسط" },
  allActiveSessions: { en: "All Active Boats",        ar: "جميع القوارب النشطة" },
  unpaidPartially:   { en: "Unpaid / Partially Paid", ar: "غير مدفوعة / مدفوعة جزئياً" },
  ending30Report:    { en: "Ending Within 30 Days",   ar: "تنتهي خلال 30 يوماً" },
  overdueSessionsReport: { en: "Overdue Sessions",    ar: "الجلسات المتأخرة" },
  monthlySummaryReport:  { en: "Monthly Payment Summary", ar: "ملخص المدفوعات الشهرية" },
  // ── Settings ────────────────────────────────────────────────────────────────
  systemSettings:    { en: "System Settings",         ar: "إعدادات النظام" },
  systemUsers:       { en: "System Users",            ar: "مستخدمو النظام" },
  inviteUser:        { en: "+ Invite User",           ar: "+ دعوة مستخدم" },
  systemInfo:        { en: "System Information",      ar: "معلومات النظام" },
  companyName:       { en: "Company Name",            ar: "اسم الشركة" },
  locationLabel:     { en: "Location",                ar: "الموقع" },
  timezoneLabel:     { en: "Timezone",                ar: "المنطقة الزمنية" },
  currencyLabel:     { en: "Currency",                ar: "العملة" },
  yardSpotsLabel:    { en: "Yard Spots",              ar: "مواقف الساحة" },
  dateFormatLabel:   { en: "Date Format",             ar: "تنسيق التاريخ" },
  appVersionLabel:   { en: "App Version",             ar: "إصدار التطبيق" },
  databaseLabel:     { en: "Database",                ar: "قاعدة البيانات" },
  toChangeSettings:  { en: "To change the company name or layout settings, edit", ar: "لتغيير اسم الشركة أو إعدادات التخطيط، عدّل" },
  // ── Common ──────────────────────────────────────────────────────────────────
  save:              { en: "Save",                    ar: "حفظ" },
  cancel:            { en: "Cancel",                  ar: "إلغاء" },
  edit:              { en: "Edit",                    ar: "تعديل" },
  delete:            { en: "Delete",                  ar: "حذف" },
  back:              { en: "← Back",                  ar: "→ رجوع" },
  backToOwners:      { en: "← Owners",                ar: "→ الملاك" },
  view:              { en: "View",                    ar: "عرض" },
  search:            { en: "Search",                  ar: "بحث" },
  filter:            { en: "Filter",                  ar: "تصفية" },
  clear:             { en: "Clear",                   ar: "مسح" },
  apply:             { en: "Apply",                   ar: "تطبيق" },
  loading:           { en: "Loading…",                ar: "جار التحميل…" },
  saving:            { en: "Saving…",                 ar: "جار الحفظ…" },
  status:            { en: "Status",                  ar: "الحالة" },
  name:              { en: "Name",                    ar: "الاسم" },
  role:              { en: "Role",                    ar: "الدور" },
  joined:            { en: "Joined",                  ar: "تاريخ الانضمام" },
  admin:             { en: "Admin",                   ar: "مدير" },
  staff:             { en: "Staff",                   ar: "موظف" },
  pay:               { en: "Pay",                     ar: "دفع" },
  total:             { en: "Total",                   ar: "الإجمالي" },
  date:              { en: "Date",                    ar: "التاريخ" },
  type:              { en: "Type",                    ar: "النوع" },
  sent:              { en: "Sent",                    ar: "مُرسل" },
  pending:           { en: "Pending",                 ar: "معلق" },
  failed:            { en: "Failed",                  ar: "فشل" },
  error:             { en: "Error",                   ar: "خطأ" },
  method:            { en: "Method",                  ar: "الطريقة" },
  session:           { en: "Session",                 ar: "الجلسة" },
  ownerName:         { en: "Owner Name",              ar: "اسم المالك" },
  pricing:           { en: "Pricing",                 ar: "التسعير" },
  vesselHeader:      { en: "Vessel",                  ar: "السفينة" },
  ownerHeader:       { en: "Owner",                   ar: "المالك" },
  startHeader:       { en: "Start",                   ar: "البداية" },
  endDateHeader:     { en: "End Date",                ar: "تاريخ الانتهاء" },
  daysHeader:        { en: "Days",                    ar: "الأيام" },
  totalDueHeader:    { en: "Total Due",               ar: "المستحق" },
  paidHeader:        { en: "Paid",                    ar: "المدفوع" },
  balanceHeader:     { en: "Balance",                 ar: "الرصيد" },
  paymentHeader:     { en: "Payment",                 ar: "الدفع" },
  spotHeader:        { en: "Spot",                    ar: "الموقف" },
  amountHeader:      { en: "Amount",                  ar: "المبلغ" },
  dateHeader:        { en: "Date",                    ar: "التاريخ" },
  typeHeader:        { en: "Type",                    ar: "النوع" },
  notesHeader:       { en: "Notes",                   ar: "الملاحظات" },
} as const;

export type TranslationKey = keyof typeof T;
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 2. LanguageContext.tsx — add cookie support for server components
# ═══════════════════════════════════════════════════════════════════════════════
print("\n2️⃣  Updating LanguageContext (adds cookie for server components)...")
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
    // Set cookie so server components can also read the language
    document.cookie = `al-seeb-lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
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

# ═══════════════════════════════════════════════════════════════════════════════
# 3. Server-side translation utility
# ═══════════════════════════════════════════════════════════════════════════════
print("\n3️⃣  Creating server-side translation utility...")
write("lib/i18n/server.ts", '''import { cookies } from "next/headers";
import { T, type TranslationKey, type Lang } from "./translations";

/**
 * Use this in server components (async pages) to get a t() function.
 * Reads the language preference from the cookie set by LanguageContext.
 *
 * Usage:
 *   const t = await getT();
 *   <h1>{t("dashboard")}</h1>
 */
export async function getT(): Promise<(key: TranslationKey) => string> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("al-seeb-lang")?.value as Lang) || "en";
  return (key: TranslationKey) => T[key]?.[lang] ?? T[key]?.en ?? key;
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 4. Dashboard page
# ═══════════════════════════════════════════════════════════════════════════════
print("\n4️⃣  Translating dashboard...")
write("app/(dashboard)/dashboard/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import { formatOMR, formatDate, getPaymentStatus } from "@/lib/utils";
import { StatCard, SessionStatusBadge, PaymentStatusBadge } from "@/components/ui";
import type { DashboardStats, ActiveSessionView } from "@/types";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const t = await getT();
  const supabase = await createClient();

  const [{ data: stats }, { data: sessions }, { data: reminders }] = await Promise.all([
    supabase.from("dashboard_stats").select("*").single(),
    supabase.from("active_sessions_view").select("*")
      .in("status", ["ending_soon", "overdue"])
      .order("days_remaining", { ascending: true }).limit(8),
    supabase.from("reminders").select("*, session:parking_sessions(id, parking_sessions_boat:boats(name))")
      .eq("status", "pending")
      .lte("scheduled_date", new Date().toISOString().split("T")[0]).limit(6),
  ]);

  const s = stats as DashboardStats | null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t("totalSpots")} value={s?.total_spots ?? "—"} icon="⚓" accent="#0E7490"
          sub={`${s?.occupied_spots ?? 0} ${t("occupied")}, ${s?.empty_spots ?? 0} ${t("available")}`} />
        <StatCard label={t("occupiedSpots")} value={s?.occupied_spots ?? "—"} icon="🚢" accent="#0369a1"
          sub={`${s?.total_spots ? Math.round(((s.occupied_spots ?? 0) / s.total_spots) * 100) : 0}${t("occupancyPct")}`} />
        <StatCard label={t("expiringSoon")} value={s?.ending_soon ?? "—"} icon="⏰" accent="#d97706"
          sub={t("withinNext7Days")} />
        <StatCard label={t("overdueSessionsLabel")} value={s?.overdue_count ?? "—"} icon="⚠️" accent="#dc2626"
          sub={t("requireImmediateAction")} />
        <StatCard label={t("unpaidBalance")} value={formatOMR(s?.total_unpaid ?? 0)} icon="💰" accent="#dc2626"
          sub={t("acrossAllSessions")} />
        <StatCard label={t("remindersToday")} value={s?.reminders_today ?? "—"} icon="🔔" accent="#7c3aed"
          sub={t("pendingToSend")} />
        <StatCard label={t("collectedThisMonth")} value={formatOMR(s?.collected_this_month ?? 0)} icon="📈" accent="#059669"
          sub={t("monthToDate")} />
        <StatCard label={t("availableSpots")} value={s?.empty_spots ?? "—"} icon="🟢" accent="#059669"
          sub={t("availableForNew")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display">{t("sessionsRequiringAttention")}</h2>
            <Link href="/sessions?status=overdue" className="text-xs text-teal-600 font-semibold hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            {sessions && sessions.length > 0 ? (
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>{t("vesselHeader")}</th>
                    <th>{t("spotHeader")}</th>
                    <th>{t("status")}</th>
                    <th>{t("endDateHeader")}</th>
                    <th>{t("balanceDue")}</th>
                    <th>{t("ownerHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(sessions as ActiveSessionView[]).map((s) => {
                    const payStatus = getPaymentStatus(s.total_due, s.total_paid, s.status);
                    return (
                      <tr key={s.session_id} className="cursor-pointer hover:bg-slate-50">
                        <td>
                          <Link href={`/boats/${s.boat_id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                            {s.boat_name}
                          </Link>
                          <p className="text-xs text-slate-400 font-mono">{s.registration_number}</p>
                        </td>
                        <td><span className="font-mono font-semibold text-slate-700">{s.spot_number}</span></td>
                        <td><SessionStatusBadge status={s.status} /></td>
                        <td>
                          <span className="text-sm text-slate-700">{formatDate(s.expected_end_date)}</span>
                          {s.days_overdue > 0 && <p className="text-xs text-red-600 font-semibold">{s.days_overdue}d {t("daysOverdueShort")}</p>}
                          {s.days_remaining > 0 && <p className="text-xs text-amber-600 font-semibold">{s.days_remaining}d {t("daysLeftShort")}</p>}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="num font-semibold text-slate-800">{formatOMR(s.remaining_balance)}</span>
                            <PaymentStatusBadge status={payStatus} />
                          </div>
                        </td>
                        <td>
                          <p className="text-sm text-slate-700">{s.owner_name || "—"}</p>
                          <p className="text-xs text-slate-400">{s.owner_phone}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <span className="text-4xl">✅</span>
                <p className="mt-3 text-sm font-semibold text-slate-600">{t("noUrgentSessions")}</p>
                <p className="text-xs text-slate-400">{t("allOnSchedule")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display">{t("pendingRemindersTitle")}</h2>
            <Link href="/reminders" className="text-xs text-teal-600 font-semibold hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {reminders && reminders.length > 0 ? (
              reminders.map((r: any) => (
                <div key={r.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {r.reminder_type?.replace(/_/g, " ").replace("reminder ", "")}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{r.recipient_type}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                      r.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{t("scheduledColon")} {formatDate(r.scheduled_date)}</p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <span className="text-3xl">✅</span>
                <p className="mt-2 text-sm text-slate-500">{t("noPendingReminders")}</p>
              </div>
            )}
          </div>
          {reminders && reminders.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <Link href="/api/reminders/send" className="btn-primary w-full justify-center text-xs py-2">
                {t("sendAllPending")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 5. Boats list page
# ═══════════════════════════════════════════════════════════════════════════════
print("\n5️⃣  Translating boats list...")
write("app/(dashboard)/boats/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export default async function BoatsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("boats").select(`
    *, boat_owners(is_primary, owner:owners(id, full_name, phone, email)),
    parking_sessions(id, status, expected_end_date, remaining_balance, parking_spot:parking_spots(spot_number))
  `).order("name");

  if (params.q) query = query.or(`name.ilike.%${params.q}%,registration_number.ilike.%${params.q}%`);
  if (params.status && params.status !== "all") query = query.eq("status", params.status);

  const { data: boats } = await query;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("boatRegistry")}</h1>
          <p className="text-sm text-slate-500">{boats?.length ?? 0} {t("vesselsRegistered")}</p>
        </div>
        <Link href="/boats/new" className="btn-primary">{t("registerBoat")}</Link>
      </div>

      <div className="card px-5 py-4 flex flex-wrap gap-3 items-center">
        <form method="get" className="flex-1 flex gap-3 flex-wrap">
          <input name="q" defaultValue={params.q} placeholder={t("searchByNameOrReg")} className="form-input flex-1 min-w-[200px]" />
          <select name="status" defaultValue={params.status || "all"} className="form-select w-40">
            <option value="all">{t("allStatus")}</option>
            <option value="parked">{t("parked")}</option>
            <option value="available">{t("available")}</option>
            <option value="maintenance">{t("maintenance")}</option>
          </select>
          <button type="submit" className="btn-primary px-5">{t("search")}</button>
          <Link href="/boats" className="btn-secondary px-4">{t("clear")}</Link>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t("vesselHeader")}</th><th>{t("registration")}</th><th>{t("type")}</th>
                <th>{t("ownerHeader")}</th><th>{t("spotHeader")}</th><th>{t("status")}</th>
                <th>{t("balanceHeader")}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {boats && boats.length > 0 ? (
                boats.map((boat: any) => {
                  const primaryOwner = boat.boat_owners?.find((bo: any) => bo.is_primary);
                  const activeSession = boat.parking_sessions?.find((s: any) => s.status !== "closed");
                  const statusColors: Record<string, string> = {
                    parked: "bg-teal-100 text-teal-800 border-teal-200",
                    available: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    maintenance: "bg-amber-100 text-amber-800 border-amber-200",
                  };
                  return (
                    <tr key={boat.id} className="cursor-pointer">
                      <td>
                        <Link href={`/boats/${boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700">{boat.name}</Link>
                        <p className="text-xs text-slate-400">{boat.color} · {boat.length_meters}m</p>
                      </td>
                      <td><span className="font-mono text-sm text-slate-600">{boat.registration_number}</span></td>
                      <td><span className="text-sm text-slate-600">{boat.type || "—"}</span></td>
                      <td>
                        {primaryOwner?.owner ? (
                          <Link href={`/owners/${primaryOwner.owner.id}`} className="text-sm font-medium text-slate-700 hover:text-teal-700">
                            {primaryOwner.owner.full_name}
                          </Link>
                        ) : "—"}
                      </td>
                      <td>
                        {activeSession?.parking_spot ? (
                          <span className="font-mono font-semibold text-slate-700">{activeSession.parking_spot.spot_number}</span>
                        ) : "—"}
                      </td>
                      <td>
                        <span className={`badge ${statusColors[boat.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {t((boat.status as any) || "available")}
                        </span>
                      </td>
                      <td>
                        {activeSession?.remaining_balance > 0 ? (
                          <span className="num text-sm font-semibold text-red-600">OMR {Number(activeSession.remaining_balance).toFixed(3)}</span>
                        ) : (
                          <span className="text-emerald-600 text-sm font-semibold">{t("paidShort")}</span>
                        )}
                      </td>
                      <td><Link href={`/boats/${boat.id}`} className="btn-ghost text-xs py-1.5">{t("view")} →</Link></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={8}>
                  <EmptyState icon="⛵" title={t("noBoatsFound")} description={t("tryAdjustingFilters")}
                    action={<Link href="/boats/new" className="btn-primary text-sm">{t("registerFirstBoat")}</Link>} />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 6. Owners list page
# ═══════════════════════════════════════════════════════════════════════════════
print("\n6️⃣  Translating owners list...")
write("app/(dashboard)/owners/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export default async function OwnersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("owners").select(`*, boat_owners(is_primary, boat:boats(id, name, registration_number, status))`).order("full_name");
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%,phone.ilike.%${params.q}%`);
  const { data: owners } = await query;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("boatOwners")}</h1>
          <p className="text-sm text-slate-500">{owners?.length ?? 0} {t("registeredOwners")}</p>
        </div>
        <Link href="/owners/new" className="btn-primary">{t("addOwner")}</Link>
      </div>
      <div className="card px-5 py-4 flex gap-3">
        <form method="get" className="flex-1 flex gap-3">
          <input name="q" defaultValue={params.q} placeholder={t("searchOwnerPlaceholder")} className="form-input flex-1" />
          <button type="submit" className="btn-primary">{t("search")}</button>
          <Link href="/owners" className="btn-secondary">{t("clear")}</Link>
        </form>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t("ownerHeader")}</th><th>{t("phone")}</th><th>{t("email")}</th>
                <th>{t("vessels")}</th><th>{t("memberSince")}</th><th>{t("notes")}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {owners && owners.length > 0 ? (
                owners.map((owner: any) => {
                  const boats = owner.boat_owners?.map((bo: any) => bo.boat).filter(Boolean) ?? [];
                  return (
                    <tr key={owner.id}>
                      <td>
                        <Link href={`/owners/${owner.id}`} className="font-semibold text-slate-900 hover:text-teal-700">{owner.full_name}</Link>
                      </td>
                      <td className="text-sm text-slate-600 font-mono">{owner.phone || "—"}</td>
                      <td className="text-sm text-slate-600">{owner.email || "—"}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {boats.length > 0 ? boats.map((b: any) => (
                            <Link key={b.id} href={`/boats/${b.id}`}
                              className="text-xs px-2 py-0.5 rounded-full font-semibold hover:opacity-80"
                              style={{ background:"#f0fdfc", color:"#0E7490", border:"1px solid #99f6f0" }}>
                              {b.name}
                            </Link>
                          )) : <span className="text-slate-400 text-sm">{t("noBoatsLabel")}</span>}
                        </div>
                      </td>
                      <td className="text-sm text-slate-600">{formatDate(owner.created_at)}</td>
                      <td className="text-xs text-slate-500 max-w-[200px] truncate">{owner.billing_notes || "—"}</td>
                      <td><Link href={`/owners/${owner.id}`} className="btn-ghost text-xs py-1">{t("view")} →</Link></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7}><EmptyState icon="👤" title={t("noOwnersFound")} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 7. Sessions list page
# ═══════════════════════════════════════════════════════════════════════════════
print("\n7️⃣  Translating sessions list...")
write("app/(dashboard)/sessions/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus, daysUntil } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge, EmptyState } from "@/components/ui";
import type { ActiveSessionView } from "@/types";
import { getT } from "@/lib/i18n/server";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; unpaid?: string }>;
}) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("active_sessions_view").select("*").order("expected_end_date", { ascending: true });
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  if (params.unpaid === "1") query = query.gt("remaining_balance", 0);
  if (params.q) query = query.or(`boat_name.ilike.%${params.q}%,registration_number.ilike.%${params.q}%,owner_name.ilike.%${params.q}%,spot_number.ilike.%${params.q}%`);

  const { data: sessions } = await query;

  let closedSessions: any[] = [];
  if (params.status === "closed") {
    const { data: closed } = await supabase.from("parking_sessions")
      .select(`*, boat:boats(name, registration_number), parking_spot:parking_spots(spot_number)`)
      .eq("status", "closed").order("actual_exit_date", { ascending: false }).limit(50);
    closedSessions = closed || [];
  }

  const allSessions = sessions as ActiveSessionView[] || [];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("parkingSessions")}</h1>
          <p className="text-sm text-slate-500">{allSessions.length} {t("activeSessionsLabel")}</p>
        </div>
        <Link href="/sessions/new" className="btn-primary">{t("newSession")}</Link>
      </div>

      <div className="card px-5 py-4">
        <form method="get" className="flex flex-wrap gap-3 items-center">
          <input name="q" defaultValue={params.q} placeholder={t("searchPlaceholder")} className="form-input flex-1 min-w-[220px]" />
          <select name="status" defaultValue={params.status || "all"} className="form-select w-40">
            <option value="all">{t("allActive")}</option>
            <option value="active">{t("active")}</option>
            <option value="ending_soon">{t("endingSoon")}</option>
            <option value="overdue">{t("overdue")}</option>
            <option value="closed">{t("closed")}</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" name="unpaid" value="1" defaultChecked={params.unpaid === "1"} className="rounded" />
            {t("unpaidOnly")}
          </label>
          <button type="submit" className="btn-primary">{t("apply")}</button>
          <Link href="/sessions" className="btn-secondary">{t("clear")}</Link>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t("vesselHeader")}</th><th>{t("spotHeader")}</th><th>{t("ownerHeader")}</th>
                <th>{t("status")}</th><th>{t("startHeader")}</th><th>{t("endDateHeader")}</th>
                <th>{t("daysHeader")}</th><th>{t("totalDueHeader")}</th><th>{t("paidHeader")}</th>
                <th>{t("balanceHeader")}</th><th>{t("paymentHeader")}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {allSessions.length > 0 ? (
                allSessions.map((s) => {
                  const payStatus = getPaymentStatus(s.total_due, s.total_paid, s.status);
                  const days = daysUntil(s.expected_end_date);
                  return (
                    <tr key={s.session_id}>
                      <td>
                        <Link href={`/boats/${s.boat_id}`} className="font-semibold text-slate-900 hover:text-teal-700">{s.boat_name}</Link>
                        <p className="text-xs font-mono text-slate-400">{s.registration_number}</p>
                      </td>
                      <td><span className="font-mono font-semibold text-slate-700">{s.spot_number}</span></td>
                      <td>
                        <p className="text-sm font-medium text-slate-700">{s.owner_name || "—"}</p>
                        <p className="text-xs text-slate-400">{s.owner_phone}</p>
                      </td>
                      <td><SessionStatusBadge status={s.status} /></td>
                      <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                      <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                      <td>
                        <span className={`num text-sm font-semibold ${days < 0 ? "text-red-600" : days <= 7 ? "text-amber-600" : "text-slate-600"}`}>
                          {days < 0 ? `+${Math.abs(days)}d` : `${days}d`}
                        </span>
                      </td>
                      <td className="num text-sm font-semibold text-slate-700">{formatOMR(s.total_due)}</td>
                      <td className="num text-sm font-semibold text-emerald-600">{formatOMR(s.total_paid)}</td>
                      <td>
                        <span className={`num text-sm font-bold ${s.remaining_balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {formatOMR(s.remaining_balance)}
                        </span>
                      </td>
                      <td><PaymentStatusBadge status={payStatus} /></td>
                      <td>
                        <div className="flex gap-1">
                          <Link href={`/sessions/${s.session_id}`} className="btn-ghost text-xs py-1">{t("view")}</Link>
                          <Link href={`/payments/new?session=${s.session_id}`} className="btn-ghost text-xs py-1 text-teal-600">{t("pay")}</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : params.status === "closed" && closedSessions.length > 0 ? (
                closedSessions.map((s: any) => (
                  <tr key={s.id}>
                    <td><span className="font-semibold text-slate-700">{s.boat?.name}</span></td>
                    <td><span className="font-mono font-semibold text-slate-700">{s.parking_spot?.spot_number}</span></td>
                    <td>—</td>
                    <td><SessionStatusBadge status={s.status} /></td>
                    <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                    <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                    <td>—</td>
                    <td className="num text-sm font-semibold">{formatOMR(s.total_due)}</td>
                    <td className="num text-sm font-semibold text-emerald-600">{formatOMR(s.total_paid)}</td>
                    <td className="num text-sm">{formatOMR(s.remaining_balance)}</td>
                    <td>—</td>
                    <td><Link href={`/sessions/${s.id}`} className="btn-ghost text-xs py-1">{t("view")}</Link></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={12}><EmptyState icon="📋" title={t("noSessionsFound")} description={t("tryAdjustingFilters")} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 8. Payments list page
# ═══════════════════════════════════════════════════════════════════════════════
print("\n8️⃣  Translating payments list...")
write("app/(dashboard)/payments/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; method?: string; from?: string; to?: string }>;
}) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("payments").select(`
    *, session:parking_sessions(id, status, total_due, total_paid, remaining_balance,
      boat:boats(id, name, registration_number), parking_spot:parking_spots(spot_number)),
    created_by_user:users(full_name)
  `).order("payment_date", { ascending: false }).order("created_at", { ascending: false });

  if (params.from) query = query.gte("payment_date", params.from);
  if (params.to)   query = query.lte("payment_date", params.to);

  const { data: payments } = await query;

  const totalCollected = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0;
  const adjustments    = payments?.filter((p: any) => p.is_adjustment) ?? [];
  const totalPayments  = payments?.filter((p: any) => !p.is_adjustment) ?? [];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("paymentsTitle")}</h1>
          <p className="text-sm text-slate-500">{payments?.length ?? 0} {t("paymentRecordsLabel")}</p>
        </div>
        <Link href="/payments/new" className="btn-primary">{t("newPayment")}</Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-2xl mb-1">💰</div>
          <p className="text-xl font-bold num text-slate-900">{formatOMR(totalCollected)}</p>
          <p className="text-sm font-semibold text-slate-600">{t("totalCollected")}</p>
          <p className="text-xs text-slate-400">{params.from || params.to ? t("filteredPeriod") : t("allTime")}</p>
        </div>
        <div className="stat-card">
          <div className="text-2xl mb-1">📄</div>
          <p className="text-xl font-bold num text-slate-900">{totalPayments.length}</p>
          <p className="text-sm font-semibold text-slate-600">{t("paymentRecordsCount")}</p>
        </div>
        <div className="stat-card">
          <div className="text-2xl mb-1">⚙️</div>
          <p className="text-xl font-bold num text-slate-900">{adjustments.length}</p>
          <p className="text-sm font-semibold text-slate-600">{t("adjustmentsCount")}</p>
        </div>
        <div className="stat-card">
          <div className="text-2xl mb-1">📊</div>
          <p className="text-xl font-bold num text-slate-900">
            {payments?.length ? formatOMR(totalCollected / payments.length) : "—"}
          </p>
          <p className="text-sm font-semibold text-slate-600">{t("avgPayment")}</p>
        </div>
      </div>

      <div className="card px-5 py-4">
        <form method="get" className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label>{t("fromLabel")}</label>
            <input type="date" name="from" defaultValue={params.from} className="form-input w-40" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label>{t("toLabel")}</label>
            <input type="date" name="to" defaultValue={params.to} className="form-input w-40" />
          </div>
          <button type="submit" className="btn-primary px-5">{t("filter")}</button>
          <Link href="/payments" className="btn-secondary">{t("clear")}</Link>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t("dateHeader")}</th><th>{t("vesselHeader")}</th><th>{t("spotHeader")}</th>
                <th>{t("amountHeader")}</th><th>{t("method")}</th><th>{t("reference")}</th>
                <th>{t("sessionBalanceAfter")}</th><th>{t("typeHeader")}</th><th>{t("notesHeader")}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {payments && payments.length > 0 ? (
                payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="text-sm text-slate-700 whitespace-nowrap">{formatDate(p.payment_date)}</td>
                    <td>
                      {p.session?.boat ? (
                        <Link href={`/boats/${p.session.boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">
                          {p.session.boat.name}
                        </Link>
                      ) : "—"}
                    </td>
                    <td><span className="font-mono text-sm font-semibold text-slate-700">{p.session?.parking_spot?.spot_number || "—"}</span></td>
                    <td>
                      <span className={`num font-bold text-sm ${p.is_adjustment && Number(p.amount) < 0 ? "text-red-600" : "text-emerald-700"}`}>
                        {p.is_adjustment && Number(p.amount) < 0 ? "-" : "+"}{formatOMR(Math.abs(p.amount))}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                    <td className="font-mono text-xs text-slate-500">{p.reference_number || "—"}</td>
                    <td>
                      <span className={`num text-sm font-semibold ${p.session?.remaining_balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {formatOMR(p.session?.remaining_balance)}
                      </span>
                    </td>
                    <td>
                      {p.is_adjustment ? (
                        <span className="badge bg-purple-100 text-purple-800 border-purple-200">{t("adjustment")}</span>
                      ) : (
                        <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">{t("payment")}</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500 max-w-[150px] truncate">{p.notes || p.adjustment_reason || "—"}</td>
                    <td>{p.session?.id && <Link href={`/sessions/${p.session.id}`} className="btn-ghost text-xs py-1">{t("view")}</Link>}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={10}><EmptyState icon="💳" title={t("noPaymentsFound")} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 9. Reports page
# ═══════════════════════════════════════════════════════════════════════════════
print("\n9️⃣  Translating reports...")
write("app/(dashboard)/reports/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge } from "@/components/ui";
import type { ActiveSessionView } from "@/types";
import ReportExportClient from "@/components/reports/ReportExportClient";
import { getT } from "@/lib/i18n/server";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const t = await getT();
  const params = await searchParams;
  const report = params.report || "active";
  const supabase = await createClient();

  let sessions: ActiveSessionView[] = [];
  let reportTitle = "";
  let reportDescription = "";
  const baseQuery = supabase.from("active_sessions_view").select("*");

  if (report === "active") {
    const { data } = await baseQuery.in("status", ["active", "ending_soon"]).order("expected_end_date");
    sessions = (data as ActiveSessionView[]) || [];
    reportTitle = t("allActiveSessions");
    reportDescription = `${sessions.length} ${t("vessels")}`;
  } else if (report === "unpaid") {
    const { data } = await baseQuery.gt("remaining_balance", 0).order("remaining_balance", { ascending: false });
    sessions = (data as ActiveSessionView[]) || [];
    reportTitle = t("unpaidPartially");
    reportDescription = `${sessions.length} ${t("sessions")}`;
  } else if (report === "ending30") {
    const future30 = new Date(); future30.setDate(future30.getDate() + 30);
    const { data } = await baseQuery
      .gte("expected_end_date", new Date().toISOString().split("T")[0])
      .lte("expected_end_date", future30.toISOString().split("T")[0]).order("expected_end_date");
    sessions = (data as ActiveSessionView[]) || [];
    reportTitle = t("ending30Report");
    reportDescription = `${sessions.length} ${t("sessions")}`;
  } else if (report === "overdue") {
    const { data } = await baseQuery.eq("status", "overdue").order("days_overdue", { ascending: false });
    sessions = (data as ActiveSessionView[]) || [];
    reportTitle = t("overdueSessionsReport");
    reportDescription = `${sessions.length} ${t("sessions")}`;
  }

  let monthlyData: any[] = [];
  if (report === "monthly") {
    const { data } = await supabase.from("payments").select("payment_date, amount, is_adjustment").order("payment_date", { ascending: false });
    const byMonth: Record<string, { month: string; total: number; count: number }> = {};
    (data || []).forEach((p: any) => {
      const month = p.payment_date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { month, total: 0, count: 0 };
      byMonth[month].total += Number(p.amount);
      byMonth[month].count += 1;
    });
    monthlyData = Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
    reportTitle = t("monthlySummaryReport");
    reportDescription = `${monthlyData.length} ${t("months")}`;
  }

  const totalBalance   = sessions.reduce((s, r) => s + Number(r.remaining_balance), 0);
  const totalCollected = sessions.reduce((s, r) => s + Number(r.total_paid), 0);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("reportsTitle")}</h1>
          <p className="text-sm text-slate-500">{reportDescription}</p>
        </div>
        <ReportExportClient sessions={sessions} monthlyData={monthlyData} reportType={report} />
      </div>

      <div className="card px-5 py-4 flex gap-2 flex-wrap">
        {[
          { key: "active",   label: t("activeBoats"),    icon: "🚢" },
          { key: "unpaid",   label: t("unpaid"),         icon: "💰" },
          { key: "ending30", label: t("ending30Days"),   icon: "⏰" },
          { key: "overdue",  label: t("overdueReport"),  icon: "⚠️" },
          { key: "monthly",  label: t("monthlySummary"), icon: "📊" },
        ].map((r) => (
          <Link key={r.key} href={`/reports?report=${r.key}`}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              report === r.key ? "bg-teal-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}>
            {r.icon} {r.label}
          </Link>
        ))}
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
            <p className="text-sm font-semibold text-slate-600">{t("totalSessions")}</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold text-emerald-600 num">{formatOMR(totalCollected)}</p>
            <p className="text-sm font-semibold text-slate-600">{t("totalCollected")}</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-bold text-red-600 num">{formatOMR(totalBalance)}</p>
            <p className="text-sm font-semibold text-slate-600">{t("totalOutstanding")}</p>
          </div>
        </div>
      )}

      {report !== "monthly" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>{t("vesselHeader")}</th><th>{t("ownerHeader")}</th><th>{t("spotHeader")}</th>
                  <th>{t("status")}</th><th>{t("startHeader")}</th><th>{t("endDateHeader")}</th>
                  <th>{t("daysLeft")}</th><th>{t("totalDueHeader")}</th><th>{t("paidHeader")}</th>
                  <th>{t("balanceHeader")}</th><th>{t("paymentHeader")}</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const payStatus = getPaymentStatus(s.total_due, s.total_paid, s.status);
                  return (
                    <tr key={s.session_id}>
                      <td>
                        <Link href={`/boats/${s.boat_id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{s.boat_name}</Link>
                        <p className="text-xs font-mono text-slate-400">{s.registration_number}</p>
                      </td>
                      <td>
                        <p className="text-sm text-slate-700">{s.owner_name || "—"}</p>
                        <p className="text-xs text-slate-400">{s.owner_phone}</p>
                      </td>
                      <td><span className="font-mono font-semibold text-sm">{s.spot_number}</span></td>
                      <td><SessionStatusBadge status={s.status} /></td>
                      <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                      <td className="text-sm text-slate-600">{formatDate(s.expected_end_date)}</td>
                      <td>
                        <span className={`num text-sm font-semibold ${s.days_remaining < 0 ? "text-red-600" : s.days_remaining <= 7 ? "text-amber-600" : "text-slate-600"}`}>
                          {s.days_remaining < 0 ? `+${Math.abs(s.days_remaining)}d ${t("over")}` : `${s.days_remaining}d`}
                        </span>
                      </td>
                      <td className="num text-sm font-semibold">{formatOMR(s.total_due)}</td>
                      <td className="num text-sm font-semibold text-emerald-600">{formatOMR(s.total_paid)}</td>
                      <td className={`num text-sm font-bold ${s.remaining_balance > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatOMR(s.remaining_balance)}</td>
                      <td><PaymentStatusBadge status={payStatus} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report === "monthly" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>{t("month")}</th><th>{t("numberOfPayments")}</th>
                  <th>{t("totalCollected")}</th><th>{t("average")}</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.month}>
                    <td className="font-semibold text-slate-800">{m.month}</td>
                    <td className="num text-sm">{m.count}</td>
                    <td className="num font-bold text-emerald-700">{formatOMR(m.total)}</td>
                    <td className="num text-sm text-slate-600">{formatOMR(m.total / m.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 10. Settings page
# ═══════════════════════════════════════════════════════════════════════════════
print("\n🔟  Translating settings...")
write("app/(dashboard)/settings/page.tsx", r'''import { MARINA_CONFIG } from "@/config/marina";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { getT } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const t = await getT();
  const supabase = await createClient();
  const { data: users } = await supabase.from("users").select("*, role:roles(name)").order("full_name");

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="page-title">{t("systemSettings")}</h1>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 font-display">{t("systemUsers")}</h2>
          <button className="btn-primary text-xs py-1.5">{t("inviteUser")}</button>
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>{t("name")}</th><th>{t("email")}</th><th>{t("role")}</th>
              <th>{t("status")}</th><th>{t("joined")}</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: any) => (
              <tr key={u.id}>
                <td className="font-semibold text-slate-800">{u.full_name || "—"}</td>
                <td className="text-sm text-slate-600">{u.email}</td>
                <td>
                  <span className={`badge text-xs ${u.role?.name === "admin" ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>
                    {u.role?.name === "admin" ? t("admin") : t("staff")}
                  </span>
                </td>
                <td>
                  <span className={`badge text-xs ${u.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                    {u.is_active ? t("activeStatus") : t("inactiveStatus")}
                  </span>
                </td>
                <td className="text-sm text-slate-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-slate-800 font-display mb-4">{t("systemInfo")}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: t("companyName"),   value: MARINA_CONFIG.name },
            { label: t("locationLabel"), value: MARINA_CONFIG.location },
            { label: t("timezoneLabel"), value: "Asia/Muscat (UTC+4)" },
            { label: t("currencyLabel"), value: "OMR (Omani Rial, 3 decimals)" },
            { label: t("yardSpotsLabel"),value: `${MARINA_CONFIG.totalSpots} (${MARINA_CONFIG.leftColumnCount} + ${MARINA_CONFIG.rightColumnCount})` },
            { label: t("dateFormatLabel"), value: "DD MMM YYYY" },
            { label: t("appVersionLabel"), value: MARINA_CONFIG.version },
            { label: t("databaseLabel"), value: "PostgreSQL (Supabase)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">{label}</span>
              <span className="font-semibold text-slate-800 font-mono text-xs">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          {t("toChangeSettings")} <code className="bg-slate-100 px-1 rounded">src/config/marina.ts</code>
        </p>
      </div>
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 11. Reminders page  
# ═══════════════════════════════════════════════════════════════════════════════
print("\n1️⃣1️⃣  Translating reminders...")
write("app/(dashboard)/reminders/page.tsx", r'''import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatDatetime } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import ReminderRulesManager from "@/components/reminders/ReminderRulesManager";
import { getT } from "@/lib/i18n/server";

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string }>;
}) {
  const t = await getT();
  const params = await searchParams;
  const tab = params.tab || "rules";
  const supabase = await createClient();

  const [{ data: rules }, { data: reminders }] = await Promise.all([
    supabase.from("reminder_rules").select("*").order("days_before_end", { ascending: false }),
    supabase.from("reminders").select(`*, session:parking_sessions(id, expected_end_date, status, boat:boats(id, name)), rule:reminder_rules(name)`)
      .order("scheduled_date", { ascending: false }).limit(150),
  ]);

  const statusColors: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-800 border-amber-200",
    sent:      "bg-emerald-100 text-emerald-800 border-emerald-200",
    failed:    "bg-red-100 text-red-800 border-red-200",
    skipped:   "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const today   = new Date().toISOString().split("T")[0];
  const overdue = reminders?.filter((r: any) => r.status === "pending" && r.scheduled_date <= today) ?? [];
  const failed  = reminders?.filter((r: any) => r.status === "failed") ?? [];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("remindersTitle")}</h1>
          <p className="text-sm text-slate-500">
            {rules?.length ?? 0} {t("rulesConfigured")} · {reminders?.length ?? 0} {t("emailsInHistory")}
          </p>
        </div>
        {tab === "history" && (
          <form action="/api/reminders/send" method="post">
            <button type="submit" className="btn-primary">{t("sendPendingNow")}</button>
          </form>
        )}
      </div>

      {overdue.length > 0 && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3 bg-amber-50 border border-amber-200">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-bold text-amber-800">{overdue.length} {t("remindersOverdueToSend")}</p>
            <p className="text-sm text-amber-600">{t("switchToHistory")}</p>
          </div>
        </div>
      )}
      {failed.length > 0 && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3 bg-red-50 border border-red-200">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-bold text-red-800">{failed.length} {t("remindersFailed")}</p>
            <p className="text-sm text-red-600">{t("checkHistoryTab")}</p>
          </div>
        </div>
      )}

      <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm w-fit">
        <Link href="/reminders?tab=rules"
          className={`px-5 py-2.5 text-sm font-semibold transition-colors ${tab === "rules" ? "bg-[#0A1628] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          {t("rulesSettings")}
        </Link>
        <Link href="/reminders?tab=history"
          className={`px-5 py-2.5 text-sm font-semibold transition-colors border-l border-slate-200 ${tab === "history" ? "bg-[#0A1628] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
          {t("emailHistory")}
        </Link>
      </div>

      {tab === "rules" && <ReminderRulesManager initialRules={(rules as any) || []} />}

      {tab === "history" && (
        <div className="space-y-4">
          <div className="card px-5 py-4">
            <form method="get" className="flex gap-3 flex-wrap items-center">
              <input type="hidden" name="tab" value="history" />
              <select name="status" defaultValue={params.status || "all"} className="form-select w-36">
                <option value="all">{t("allStatus")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="sent">{t("sent")}</option>
                <option value="failed">{t("failed")}</option>
                <option value="skipped">{t("skipped")}</option>
              </select>
              <button type="submit" className="btn-primary">{t("filter")}</button>
              <Link href="/reminders?tab=history" className="btn-secondary">{t("clear")}</Link>
            </form>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>{t("vesselHeader")}</th><th>{t("ruleLabel")}</th><th>{t("sentTo")}</th>
                    <th>{t("scheduledStatus")}</th><th>{t("sent")}</th><th>{t("status")}</th><th>{t("error")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders && reminders.length > 0 ? (
                    reminders.filter((r: any) => !params.status || params.status === "all" || r.status === params.status)
                      .map((r: any) => (
                        <tr key={r.id}>
                          <td>
                            {r.session?.boat ? (
                              <Link href={`/boats/${r.session.boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">
                                {r.session.boat.name}
                              </Link>
                            ) : "—"}
                          </td>
                          <td className="text-sm text-slate-600">{r.rule?.name || r.reminder_type?.replace(/_/g, " ") || "—"}</td>
                          <td>
                            <span className={`badge text-xs ${r.recipient_type === "customer" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-purple-100 text-purple-800 border-purple-200"}`}>
                              {r.recipient_type}
                            </span>
                            <p className="text-xs font-mono text-slate-400 mt-0.5 truncate max-w-[140px]">{r.recipient_email || ""}</p>
                          </td>
                          <td className="text-sm text-slate-600 whitespace-nowrap">{formatDate(r.scheduled_date)}</td>
                          <td className="text-xs text-slate-500 whitespace-nowrap">{r.sent_at ? formatDatetime(r.sent_at) : "—"}</td>
                          <td>
                            <span className={`badge text-xs ${statusColors[r.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>{r.status}</span>
                          </td>
                          <td>{r.error_message ? <span className="text-xs text-red-600 truncate block max-w-[130px]" title={r.error_message}>{r.error_message}</span> : "—"}</td>
                        </tr>
                      ))
                  ) : (
                    <tr><td colSpan={7}><EmptyState icon="🔔" title={t("noReminderHistory")} /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 12. New session page (client component — use useLanguage)
# ═══════════════════════════════════════════════════════════════════════════════
print("\n1️⃣2️⃣  Translating new session form...")
write("app/(dashboard)/sessions/new/page.tsx", r'''"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { todayMuscat, formatOMR } from "@/lib/utils";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBoat = searchParams.get("boat");
  const supabase = createClient();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boats, setBoats] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);

  const [form, setForm] = useState({
    boat_id: preselectedBoat || "",
    parking_spot_id: "",
    start_date: todayMuscat(),
    expected_end_date: "",
    pricing_model: "monthly",
    base_fee: "",
    total_due: "",
    notes: "",
  });

  useEffect(() => {
    async function fetchData() {
      const [{ data: boatsData }, { data: spotsData }] = await Promise.all([
        supabase.from("boats").select("id, name, registration_number, status").order("name"),
        supabase.from("parking_spots").select("id, spot_number, status").eq("status", "empty").order("spot_number"),
      ]);
      setBoats(boatsData || []);
      setSpots(spotsData || []);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!form.start_date || !form.expected_end_date || !form.base_fee) return;
    const start = new Date(form.start_date);
    const end   = new Date(form.expected_end_date);
    const days  = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const fee   = parseFloat(form.base_fee);
    if (isNaN(fee)) return;
    let total = 0;
    if (form.pricing_model === "daily")   total = fee * days;
    else if (form.pricing_model === "weekly")  total = fee * Math.ceil(days / 7);
    else if (form.pricing_model === "monthly") total = fee * Math.ceil(days / 30);
    else total = fee;
    setForm((f) => ({ ...f, total_due: total.toFixed(3) }));
  }, [form.start_date, form.expected_end_date, form.base_fee, form.pricing_model]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.boat_id || !form.parking_spot_id) {
      setError(t("pleaseSelectBoatAndSpot"));
      setLoading(false);
      return;
    }
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boat_id: form.boat_id, parking_spot_id: form.parking_spot_id,
        start_date: form.start_date, expected_end_date: form.expected_end_date,
        pricing_model: form.pricing_model, base_fee: parseFloat(form.base_fee) || 0,
        total_due: parseFloat(form.total_due) || 0, notes: form.notes || undefined,
      }),
    });
    const result = await res.json();
    if (!res.ok) { setError(result.error?.message || result.error || "Failed"); setLoading(false); return; }
    router.push(`/boats/${form.boat_id}`);
    router.refresh();
  }

  const days = form.start_date && form.expected_end_date
    ? Math.max(0, Math.round((new Date(form.expected_end_date).getTime() - new Date(form.start_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sessions" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("newParkingSession")}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("vesselAndSpot")}</h2>
          <div>
            <label className="form-label">{t("vessel_star")}</label>
            <select value={form.boat_id} onChange={(e) => setForm((f) => ({ ...f, boat_id: e.target.value }))} className="form-select" required>
              <option value="">{t("selectVessel")}</option>
              {boats.map((b) => (
                <option key={b.id} value={b.id} disabled={b.status === "parked"}>
                  {b.name} ({b.registration_number}){b.status === "parked" ? ` ${t("currentlyParkedNote")}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">{t("parkingSpot_star")}</label>
            <select value={form.parking_spot_id} onChange={(e) => setForm((f) => ({ ...f, parking_spot_id: e.target.value }))} className="form-select" required>
              <option value="">{t("selectSpot")}</option>
              {spots.map((s) => <option key={s.id} value={s.id}>{t("spot")} {s.spot_number}</option>)}
            </select>
            {spots.length === 0 && <p className="text-xs text-amber-600 mt-1">{t("noEmptySpotsNote")}</p>}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("sessionDates")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t("startDate_star")}</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className="form-input" required />
            </div>
            <div>
              <label className="form-label">{t("expectedEndDate_star")}</label>
              <input type="date" value={form.expected_end_date} min={form.start_date} onChange={(e) => setForm((f) => ({ ...f, expected_end_date: e.target.value }))} className="form-input" required />
              {days > 0 && <p className="text-xs text-slate-400 mt-1">{days} {t("daysDuration")}</p>}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-800 font-display">{t("pricing")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">{t("pricingModel")}</label>
              <select value={form.pricing_model} onChange={(e) => setForm((f) => ({ ...f, pricing_model: e.target.value }))} className="form-select">
                <option value="daily">{t("daily")}</option>
                <option value="weekly">{t("weekly")}</option>
                <option value="monthly">{t("monthly")}</option>
                <option value="custom">{t("custom")}</option>
              </select>
            </div>
            <div>
              <label className="form-label">{t("baseFee")} (OMR / {form.pricing_model === "custom" ? "total" : form.pricing_model})</label>
              <input type="number" step="0.001" min="0" value={form.base_fee} onChange={(e) => setForm((f) => ({ ...f, base_fee: e.target.value }))} placeholder="0.000" className="form-input font-mono" />
            </div>
            <div>
              <label className="form-label">{t("totalDueOMR")}</label>
              <input type="number" step="0.001" min="0" value={form.total_due} onChange={(e) => setForm((f) => ({ ...f, total_due: e.target.value }))} placeholder="0.000" className="form-input font-mono" />
              <p className="text-xs text-slate-400 mt-1">{t("autoCalculated")}</p>
            </div>
          </div>
          {form.total_due && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <p className="text-sm text-teal-700 font-medium">{t("totalAmountToCharge")}</p>
              <p className="text-3xl font-black text-teal-900 num mt-1">{formatOMR(parseFloat(form.total_due) || 0)}</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <label className="form-label">{t("notes")}</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} className="form-textarea" placeholder={t("anyAdditionalNotes")} />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("creatingSession") : t("createParkingSession")}
          </button>
          <Link href="/sessions" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
''')

# ═══════════════════════════════════════════════════════════════════════════════
# 13. New payment page (client component)
# ═══════════════════════════════════════════════════════════════════════════════
print("\n1️⃣3️⃣  Translating new payment form...")
write("app/(dashboard)/payments/new/page.tsx", r'''"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { formatOMR, formatDate, todayMuscat } from "@/lib/utils";
import { Alert } from "@/components/ui";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSession = searchParams.get("session");
  const supabase = createClient();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const [form, setForm] = useState({
    session_id: preselectedSession || "",
    amount: "",
    payment_date: todayMuscat(),
    payment_method: "Bank Transfer",
    reference_number: "",
    notes: "",
    is_adjustment: false,
    adjustment_reason: "",
  });

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase.from("active_sessions_view").select("*")
        .in("status", ["active", "ending_soon", "overdue"]).order("boat_name");
      setSessions(data || []);
      if (preselectedSession) {
        const found = data?.find((s: any) => s.session_id === preselectedSession);
        if (found) setSelectedSession(found);
      }
    }
    fetchSessions();
  }, []);

  function handleSessionChange(id: string) {
    const s = sessions.find((s) => s.session_id === id);
    setSelectedSession(s || null);
    setForm((f) => ({ ...f, session_id: id }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!form.session_id) { setError(t("pleaseSelectBoatAndSpot")); setLoading(false); return; }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setError("Please enter a valid amount"); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error: dbError } = await supabase.from("payments").insert({
      session_id: form.session_id, amount, payment_date: form.payment_date,
      payment_method: form.payment_method || null, reference_number: form.reference_number || null,
      notes: form.notes || null, is_adjustment: form.is_adjustment,
      adjustment_reason: form.is_adjustment ? form.adjustment_reason : null, created_by: user?.id,
    });
    if (dbError) { setError(dbError.message); setLoading(false); return; }
    await supabase.from("audit_logs").insert({
      user_id: user?.id, action: "payment_recorded", table_name: "payments",
      description: `Payment of ${formatOMR(amount)} recorded for session ${form.session_id}`,
    });
    router.push(selectedSession ? `/boats/${selectedSession.boat_id}` : "/payments");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/payments" className="btn-ghost text-xs">{t("back")}</Link>
        <h1 className="page-title">{t("recordPaymentTitle")}</h1>
      </div>

      {selectedSession && (
        <div className="card p-5" style={{ background:"linear-gradient(135deg,#f0fdfc,#fff)", borderColor:"#99f6f0" }}>
          <h2 className="font-bold text-teal-900 mb-3">{t("sessionSummary")}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-500">{t("vessel")}</p><p className="font-bold text-slate-900">{selectedSession.boat_name}</p></div>
            <div><p className="text-slate-500">{t("spot")}</p><p className="font-mono font-bold text-slate-900">{selectedSession.spot_number}</p></div>
            <div><p className="text-slate-500">{t("totalDue")}</p><p className="num font-bold text-slate-900">{formatOMR(selectedSession.total_due)}</p></div>
            <div><p className="text-slate-500">{t("alreadyPaid")}</p><p className="num font-bold text-emerald-600">{formatOMR(selectedSession.total_paid)}</p></div>
          </div>
          <div className="mt-3 pt-3 border-t border-teal-100 flex justify-between items-center">
            <span className="font-bold text-slate-700">{t("outstandingBalance")}</span>
            <span className="num text-2xl font-black text-red-600">{formatOMR(selectedSession.remaining_balance)}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="form-label">{t("parkingSessionStar")}</label>
          <select value={form.session_id} onChange={(e) => handleSessionChange(e.target.value)} className="form-select" required>
            <option value="">{t("selectSession")}</option>
            {sessions.map((s: any) => (
              <option key={s.session_id} value={s.session_id}>
                {s.boat_name} — {t("spot")} {s.spot_number} — {t("balance")}: {formatOMR(s.remaining_balance)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("amountOMRStar")}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">OMR</span>
              <input type="number" step="0.001" min="0.001" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.000" className="form-input pl-12 font-mono" required />
            </div>
            {selectedSession && form.amount && (
              <p className="text-xs text-slate-400 mt-1">{t("remainingAfter")} {formatOMR(selectedSession.remaining_balance - parseFloat(form.amount || "0"))}</p>
            )}
          </div>
          <div>
            <label className="form-label">{t("paymentDateStar")}</label>
            <input type="date" value={form.payment_date} onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))} className="form-input" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">{t("paymentMethodLabel")}</label>
            <select value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))} className="form-select">
              <option>{t("bankTransfer")}</option>
              <option>{t("cash")}</option>
              <option>{t("cheque")}</option>
              <option>{t("onlinePayment")}</option>
              <option>{t("other")}</option>
            </select>
          </div>
          <div>
            <label className="form-label">{t("referenceNumber")}</label>
            <input type="text" value={form.reference_number} onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))} placeholder="TXN-2024-001" className="form-input font-mono" />
          </div>
        </div>

        <div>
          <label className="form-label">{t("notes")}</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="form-textarea" placeholder={t("optionalNotes")} />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_adjustment} onChange={(e) => setForm((f) => ({ ...f, is_adjustment: e.target.checked }))} className="rounded" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">{t("manualAdjustment")}</p>
              <p className="text-xs text-amber-600">{t("adjustmentNote")}</p>
            </div>
          </label>
          {form.is_adjustment && (
            <div className="mt-3">
              <label className="form-label">{t("adjustmentReasonLabel")}</label>
              <input type="text" value={form.adjustment_reason} onChange={(e) => setForm((f) => ({ ...f, adjustment_reason: e.target.value }))} className="form-input" placeholder={t("reasonPlaceholder")} required={form.is_adjustment} />
            </div>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? t("recording") : t("recordPaymentTitle")}
          </button>
          <Link href="/payments" className="btn-secondary px-6">{t("cancel")}</Link>
        </div>
      </form>
    </div>
  );
}
''')

print("\n✅  Done! Run: npm run dev  then refresh your browser.")
print("    Switch languages with the EN/ع button in the top bar.")
