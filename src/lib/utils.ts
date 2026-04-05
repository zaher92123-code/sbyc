import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { toZonedTime, format as formatTZ } from "date-fns-tz";
import type { SessionStatus, SpotStatus, PaymentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// Currency
// =============================================================================

export function formatOMR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "OMR 0.000";
  return `OMR ${amount.toFixed(3)}`;
}

export function parseOMR(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

// =============================================================================
// Date / Time (Oman timezone)
// =============================================================================

export const MUSCAT_TZ = "Asia/Muscat";

export function nowInMuscat(): Date {
  return toZonedTime(new Date(), MUSCAT_TZ);
}

export function formatDate(dateStr: string | null | undefined, fmt = "dd/MM/yyyy"): string {
  if (!dateStr) return "—";
  try {
    const date = parseISO(dateStr);
    return format(date, fmt);
  } catch {
    return dateStr;
  }
}

export function formatDatetime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const date = toZonedTime(new Date(dateStr), MUSCAT_TZ);
    return formatTZ(date, "dd/MM/yyyy, HH:mm", { timeZone: MUSCAT_TZ });
  } catch {
    return dateStr;
  }
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function todayMuscat(): string {
  return formatTZ(toZonedTime(new Date(), MUSCAT_TZ), "yyyy-MM-dd", { timeZone: MUSCAT_TZ });
}

export function daysUntil(dateStr: string): number {
  const target = parseISO(dateStr);
  const today = nowInMuscat();
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function daysOverdue(dateStr: string): number {
  return Math.max(0, -daysUntil(dateStr));
}

export function isDatePast(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), nowInMuscat());
}

export function isDateSoon(dateStr: string, days = 7): boolean {
  const target = parseISO(dateStr);
  const today = nowInMuscat();
  const soon = addDays(today, days);
  return isAfter(target, today) && isBefore(target, soon);
}

export function addDaysToDate(dateStr: string, days: number): string {
  return format(addDays(parseISO(dateStr), days), "yyyy-MM-dd");
}

// =============================================================================
// Status helpers
// =============================================================================

export function getSessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case "active":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "ending_soon":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "closed":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

export function getSpotStatusColor(status: SpotStatus): string {
  switch (status) {
    case "empty":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "occupied":
      return "bg-navy-100 text-navy-800 border-navy-200";
    case "maintenance":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "reserved":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

export function getPaymentStatus(totalDue: number, totalPaid: number, sessionStatus: SessionStatus): PaymentStatus {
  if (sessionStatus === "overdue" || (totalDue > totalPaid && sessionStatus !== "closed")) {
    if (totalPaid === 0) return "unpaid";
    if (sessionStatus === "overdue") return "overdue";
    return "partial";
  }
  if (totalPaid >= totalDue) return "paid";
  if (totalPaid > 0) return "partial";
  return "unpaid";
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "partial":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "unpaid":
      return "bg-red-100 text-red-800 border-red-200";
    case "overdue":
      return "bg-red-200 text-red-900 border-red-300";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

export function getSpotMarkerColor(status: SpotStatus): string {
  switch (status) {
    case "empty":
      return "#10b981"; // emerald
    case "occupied":
      return "#0E7490"; // teal
    case "maintenance":
      return "#f59e0b"; // amber
    case "reserved":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280";
  }
}

// =============================================================================
// CSV Export
// =============================================================================

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// =============================================================================
// Misc
// =============================================================================

export function truncate(str: string, length = 30): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function generateReminderSchedule(
  expectedEndDate: string
): Array<{ date: string; type: string; label: string }> {
  const intervals = [30, 20, 10, 7, 3, 1, 0, -7];
  return intervals.map((days) => ({
    date: addDaysToDate(expectedEndDate, -days),
    type: days >= 0 ? `reminder_${days}d` : "reminder_overdue",
    label: days > 0 ? `${days} days before` : days === 0 ? "Due date" : `${Math.abs(days)} days after`,
  }));
}
