import React from "react";
import { cn, getSessionStatusColor, getSpotStatusColor, getPaymentStatusColor } from "@/lib/utils";
import { IconWarning, IconCheck, IconInfo, IconX } from "@/components/ui/Icons";
import type { SessionStatus, SpotStatus, PaymentStatus } from "@/types";

// =============================================================================
// Badge
// =============================================================================
export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gold";
}) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    gold: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span className={cn("badge", variants[variant], className)}>
      {children}
    </span>
  );
}

// =============================================================================
// Session Status Badge
// =============================================================================
const SESSION_ICON_ELS: Record<SessionStatus, React.ReactNode> = {
  active:      <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />,
  ending_soon: <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />,
  overdue:     <IconWarning size={12} />,
  closed:      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />,
};

const SESSION_LABELS: Record<SessionStatus, string> = {
  active: "Active",
  ending_soon: "Ending Soon",
  overdue: "Overdue",
  closed: "Closed",
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={cn("badge", getSessionStatusColor(status))}>
      {SESSION_ICON_ELS[status]}
      {SESSION_LABELS[status]}
    </span>
  );
}

// =============================================================================
// Spot Status Badge
// =============================================================================
const SPOT_ICONS: Record<SpotStatus, string> = {
  empty: "○",
  occupied: "●",
  maintenance: "!",
  reserved: "◇",
};

const SPOT_LABELS: Record<SpotStatus, string> = {
  empty: "Empty",
  occupied: "Occupied",
  maintenance: "Maintenance",
  reserved: "Reserved",
};

export function SpotStatusBadge({ status }: { status: SpotStatus }) {
  return (
    <span className={cn("badge", getSpotStatusColor(status))}>
      <span className="text-[10px]">{SPOT_ICONS[status]}</span>
      {SPOT_LABELS[status]}
    </span>
  );
}

// =============================================================================
// Payment Status Badge
// =============================================================================
const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  overdue: "Overdue",
};

const PAYMENT_ICON_ELS: Record<PaymentStatus, React.ReactNode> = {
  paid:    <IconCheck size={12} />,
  partial: <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />,
  unpaid:  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />,
  overdue: <IconWarning size={12} />,
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("badge", getPaymentStatusColor(status))}>
      {PAYMENT_ICON_ELS[status]}
      {PAYMENT_LABELS[status]}
    </span>
  );
}

// =============================================================================
// Stat Card
// =============================================================================
export function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: { value: string; up?: boolean };
}) {
  return (
    <div className="stat-card group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: accent ? `${accent}18` : "#f0fdfc" }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.up
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            )}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 num mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-slate-200", className)} />
  );
}

// =============================================================================
// Empty State
// =============================================================================
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <span className="flex justify-center mb-4 opacity-50">{icon}</span>}
      <h3 className="text-base font-bold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// =============================================================================
// Modal
// =============================================================================
export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden", width)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconX size={14} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// =============================================================================
// Alert
// =============================================================================
export function Alert({
  variant = "info",
  children,
}: {
  variant?: "info" | "warning" | "danger" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };

  const icons = { info: <IconInfo size={16} />, warning: <IconWarning size={16} />, danger: <IconWarning size={16} />, success: <IconCheck size={16} /> };

  return (
    <div className={cn("flex gap-3 px-4 py-3 rounded-xl border text-sm font-medium", styles[variant])}>
      <span className="flex-shrink-0 mt-0.5">{icons[variant]}</span>
      <div>{children}</div>
    </div>
  );
}

// =============================================================================
// Divider
// =============================================================================
export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-slate-200" />
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}
