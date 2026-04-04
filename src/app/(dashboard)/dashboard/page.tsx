import { createClient } from "@/lib/supabase/server";
import { formatOMR, formatDate, getPaymentStatus } from "@/lib/utils";
import { StatCard, SessionStatusBadge, PaymentStatusBadge } from "@/components/ui";
import type { DashboardStats, ActiveSessionView } from "@/types";
import { getT } from "@/lib/i18n/server";
import {
  IconAnchor, IconBoat, IconClock, IconWarning, IconCurrency, IconBell,
  IconTrendingUp, IconSpotEmpty, IconEmployee, IconExpense, IconServices,
} from "@/components/ui/Icons";
import Link from "next/link";

export default async function DashboardPage() {
  const t = await getT();
  const supabase = await createClient();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [
    { data: stats },
    { data: sessions },
    { data: reminders },
    { data: employeeData },
    { data: expenseData },
    { data: penaltyData },
    { data: serviceOrderData },
    { data: rentalData },
    { data: notifData },
  ] = await Promise.all([
    supabase.from("dashboard_stats").select("*").single(),
    supabase.from("active_sessions_view").select("*")
      .in("status", ["ending_soon", "overdue"]).order("days_remaining", { ascending: true }).limit(8),
    supabase.from("reminders").select("*, session:parking_sessions(id, parking_sessions_boat:boats(name))")
      .eq("status", "pending").lte("scheduled_date", new Date().toISOString().split("T")[0]).limit(6),
    supabase.from("employees").select("id, base_salary_omr, allowances_omr, deductions_omr")
      .eq("employment_status", "active"),
    supabase.from("expenses").select("amount_omr")
      .gte("expense_date", `${currentMonth}-01`).lte("expense_date", `${currentMonth}-31`),
    supabase.from("penalties").select("final_penalty_omr").eq("is_paid", false),
    supabase.from("service_orders").select("id, status").in("status", ["pending", "in_progress"]),
    supabase.from("rentals").select("id, monthly_rate_omr").eq("status", "active"),
    supabase.from("notification_queue").select("id").eq("status", "pending"),
  ]);

  const s = stats as DashboardStats | null;

  // Computed values
  const activeEmployees = employeeData?.length ?? 0;
  const totalSalary = employeeData?.reduce((sum, e) =>
    sum + Number(e.base_salary_omr) + Number(e.allowances_omr) - Number(e.deductions_omr), 0) ?? 0;
  const monthlyExpenses = expenseData?.reduce((sum, e) => sum + Number(e.amount_omr), 0) ?? 0;
  const unpaidPenalties = penaltyData?.reduce((sum, p) => sum + Number(p.final_penalty_omr), 0) ?? 0;
  const activeServiceOrders = serviceOrderData?.length ?? 0;
  const monthlyRentalIncome = rentalData?.reduce((sum, r) => sum + Number(r.monthly_rate_omr), 0) ?? 0;
  const pendingNotifications = notifData?.length ?? 0;
  const totalRevenue = (s?.collected_this_month ?? 0) + monthlyRentalIncome;
  const netProfit = totalRevenue - monthlyExpenses - totalSalary;

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t("totalSpots")} value={s?.total_spots ?? "—"} icon={<IconAnchor size={22} />}
          accent="#0E7490" sub={`${s?.occupied_spots ?? 0} ${t("occupied")}, ${s?.empty_spots ?? 0} ${t("available")}`} />
        <StatCard label={t("collectedThisMonth")} value={formatOMR(totalRevenue)} icon={<IconTrendingUp size={22} />}
          accent="#059669" sub={`${t("parking")}: ${formatOMR(s?.collected_this_month ?? 0)} + ${t("rentalsLabel")}: ${formatOMR(monthlyRentalIncome)}`} />
        <StatCard label={t("monthlyExpensesLabel")} value={formatOMR(monthlyExpenses + totalSalary)} icon={<IconExpense size={22} />}
          accent="#dc2626" sub={`${t("expenses")}: ${formatOMR(monthlyExpenses)} + ${t("salaries")}: ${formatOMR(totalSalary)}`} />
        <StatCard label={t("netProfitLabel")} value={formatOMR(netProfit)}
          icon={<IconCurrency size={22} />}
          accent={netProfit >= 0 ? "#059669" : "#dc2626"}
          sub={t("revenueMinusExpenses")} />
        <StatCard label={t("overduesessions")} value={s?.overdue_count ?? "—"} icon={<IconWarning size={22} />}
          accent="#dc2626" sub={unpaidPenalties > 0 ? `${t("penalties")}: ${formatOMR(unpaidPenalties)}` : t("requireImmediateAction")} />
        <StatCard label={t("employees")} value={activeEmployees} icon={<IconEmployee size={22} />}
          accent="#7c3aed" sub={`${t("totalMonthlySalary")}: ${formatOMR(totalSalary)}`} />
        <StatCard label={t("activeServicesLabel")} value={activeServiceOrders} icon={<IconServices size={22} />}
          accent="#0369a1" sub={`${rentalData?.length ?? 0} ${t("activeRentalsLabel")}`} />
        <StatCard label={t("pendingNotifLabel")} value={pendingNotifications} icon={<IconBell size={22} />}
          accent="#d97706" sub={t("awaitingApproval")} />
      </div>

    </div>
  );
}