import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus, daysUntil } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge, EmptyState } from "@/components/ui";
import type { ActiveSessionView } from "@/types";
import { getT } from "@/lib/i18n/server";
import { IconSessions } from "@/components/ui/Icons";
import ServerPagination from "@/components/ui/ServerPagination";

const PAGE_SIZE = 25;

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; unpaid?: string; page?: string }>;
}) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page || "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build filters
  const filterParams: Record<string, string> = {};
  if (params.q) filterParams.q = params.q;
  if (params.status) filterParams.status = params.status;
  if (params.unpaid) filterParams.unpaid = params.unpaid;

  let allSessions: ActiveSessionView[] = [];
  let totalCount = 0;
  let closedSessions: any[] = [];

  if (params.status === "closed") {
    const { data: closed, count } = await supabase.from("parking_sessions")
      .select(`*, boat:boats(name, registration_number), parking_spot:parking_spots(spot_number)`, { count: "exact" })
      .eq("status", "closed").order("actual_exit_date", { ascending: false })
      .range(from, to);
    closedSessions = closed || [];
    totalCount = count || 0;
  } else {
    let query = supabase.from("active_sessions_view").select("*", { count: "exact" })
      .order("expected_end_date", { ascending: true });
    if (params.status && params.status !== "all") query = query.eq("status", params.status);
    if (params.unpaid === "1") query = query.gt("remaining_balance", 0);
    if (params.q) query = query.or(`boat_name.ilike.%${params.q}%,registration_number.ilike.%${params.q}%,owner_name.ilike.%${params.q}%,spot_number.ilike.%${params.q}%`);
    query = query.range(from, to);

    const { data, count } = await query;
    allSessions = (data as ActiveSessionView[]) || [];
    totalCount = count || 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("parkingSessions")}</h1>
          <p className="text-sm text-slate-500">{totalCount} {t("activeSessionsLabel")}</p>
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
                <tr><td colSpan={12}><EmptyState icon={<IconSessions size={40} className="opacity-40" />} title={t("noSessionsFound")} description={t("tryAdjustingFilters")} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <ServerPagination page={page} totalPages={totalPages} baseUrl="/sessions" searchParams={filterParams} totalItems={totalCount} pageSize={PAGE_SIZE} />
      </div>
    </div>
  );
}
