import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate, formatOMR } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { IconCurrency, IconDocument, IconSettings, IconReports, IconPayment } from "@/components/ui/Icons";
import ServerPagination from "@/components/ui/ServerPagination";
import DateField from "@/components/DateField";

const PAGE_SIZE = 25;

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ q?: string; method?: string; from?: string; to?: string; page?: string }> }) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page || "1"));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const filterParams: Record<string, string> = {};
  if (params.from) filterParams.from = params.from;
  if (params.to) filterParams.to = params.to;

  let query = supabase.from("payments").select(`*, session:parking_sessions(id, status, total_due, total_paid, remaining_balance, boat:boats(id, name, registration_number), parking_spot:parking_spots(spot_number)), created_by_user:users(full_name)`, { count: "exact" })
    .order("payment_date", { ascending: false }).order("created_at", { ascending: false });

  if (params.from) query = query.gte("payment_date", params.from);
  if (params.to) query = query.lte("payment_date", params.to);
  query = query.range(from, to);

  const { data: payments, count } = await query;
  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Stats from current page (approximate for filtered view)
  const totalCollected = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0;
  const adjustments = payments?.filter((p: any) => p.is_adjustment) ?? [];
  const totalPayments = payments?.filter((p: any) => !p.is_adjustment) ?? [];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("paymentsTitle")}</h1>
          <p className="text-sm text-slate-500">{totalCount} {t("paymentRecordsLabel")}</p>
        </div>
        <Link href="/payments/new" className="btn-primary">{t("newPayment")}</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card">
          <div className="mb-1"><IconCurrency size={24} /></div>
          <p className="text-xl font-bold num text-slate-900">{formatOMR(totalCollected)}</p>
          <p className="text-sm font-semibold text-slate-600">{t("totalCollected")}</p>
          <p className="text-xs text-slate-400">{params.from || params.to ? t("filteredPeriod") : t("thisPage")}</p>
        </div>
        <div className="stat-card">
          <div className="mb-1"><IconDocument size={24} /></div>
          <p className="text-xl font-bold num text-slate-900">{totalPayments.length}</p>
          <p className="text-sm font-semibold text-slate-600">{t("paymentRecordsCount")}</p>
        </div>
        <div className="stat-card">
          <div className="mb-1"><IconSettings size={24} /></div>
          <p className="text-xl font-bold num text-slate-900">{adjustments.length}</p>
          <p className="text-sm font-semibold text-slate-600">{t("adjustmentsCount")}</p>
        </div>
        <div className="stat-card">
          <div className="mb-1"><IconReports size={24} /></div>
          <p className="text-xl font-bold num text-slate-900">{payments?.length ? formatOMR(totalCollected / payments.length) : "—"}</p>
          <p className="text-sm font-semibold text-slate-600">{t("avgPayment")}</p>
        </div>
      </div>

      <div className="card px-5 py-4">
        <form method="get" className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label>{t("fromLabel")}</label>
            <DateField name="from" defaultValue={params.from} className="form-input w-40" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <label>{t("toLabel")}</label>
            <DateField name="to" defaultValue={params.to} className="form-input w-40" />
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
              {payments && payments.length > 0 ? payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="text-sm text-slate-700 whitespace-nowrap">{formatDate(p.payment_date)}</td>
                  <td>{p.session?.boat ? <Link href={`/boats/${p.session.boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{p.session.boat.name}</Link> : "—"}</td>
                  <td><span className="font-mono text-sm font-semibold text-slate-700">{p.session?.parking_spot?.spot_number || "—"}</span></td>
                  <td><span className={`num font-bold text-sm ${p.is_adjustment && Number(p.amount) < 0 ? "text-red-600" : "text-emerald-700"}`}>{p.is_adjustment && Number(p.amount) < 0 ? "-" : "+"}{formatOMR(Math.abs(p.amount))}</span></td>
                  <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                  <td className="font-mono text-xs text-slate-500">{p.reference_number || "—"}</td>
                  <td><span className={`num text-sm font-semibold ${p.session?.remaining_balance > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatOMR(p.session?.remaining_balance)}</span></td>
                  <td>{p.is_adjustment ? <span className="badge bg-purple-100 text-purple-800 border-purple-200">{t("adjustment")}</span> : <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">{t("payment")}</span>}</td>
                  <td className="text-xs text-slate-500 max-w-[150px] truncate">{p.notes || p.adjustment_reason || "—"}</td>
                  <td>{p.session?.id && <Link href={`/sessions/${p.session.id}`} className="btn-ghost text-xs py-1">{t("view")}</Link>}</td>
                </tr>
              )) : (
                <tr><td colSpan={10}><EmptyState icon={<IconPayment size={40} className="opacity-40" />} title={t("noPaymentsFound")} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <ServerPagination page={page} totalPages={totalPages} baseUrl="/payments" searchParams={filterParams} totalItems={totalCount} pageSize={PAGE_SIZE} />
      </div>
    </div>
  );
}
