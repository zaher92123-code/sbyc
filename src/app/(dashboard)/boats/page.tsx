import { IconBoat } from "@/components/ui/Icons";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import ServerPagination from "@/components/ui/ServerPagination";

const PAGE_SIZE = 25;

export default async function BoatsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const filterParams: Record<string, string> = {};
  if (params.q) filterParams.q = params.q;
  if (params.status) filterParams.status = params.status;

  let query = supabase.from("boats").select(`*, boat_owners(is_primary, owner:owners(id, full_name, phone, email)), parking_sessions(id, status, expected_end_date, remaining_balance, parking_spot:parking_spots(spot_number))`, { count: "exact" }).order("name");
  if (params.q) query = query.or(`name.ilike.%${params.q}%,registration_number.ilike.%${params.q}%`);
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  query = query.range(from, to);

  const { data: boats, count } = await query;
  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("boatRegistry")}</h1>
          <p className="text-sm text-slate-500">{totalCount} {t("vesselsRegistered")}</p>
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
              {boats && boats.length > 0 ? boats.map((boat: any) => {
                const primaryOwner = boat.boat_owners?.find((bo: any) => bo.is_primary);
                const activeSession = boat.parking_sessions?.find((s: any) => s.status !== "closed");
                const statusColors: Record<string, string> = { parked: "bg-teal-100 text-teal-800 border-teal-200", available: "bg-emerald-100 text-emerald-800 border-emerald-200", maintenance: "bg-amber-100 text-amber-800 border-amber-200" };
                return (
                  <tr key={boat.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {boat.photo_url ? <img src={boat.photo_url} alt={boat.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0"><IconBoat size={20} className="text-slate-300" /></div>}
                        <div>
                          <Link href={`/boats/${boat.id}`} className="font-semibold text-slate-900 hover:text-teal-700">{boat.name}</Link>
                          <p className="text-xs text-slate-400">{boat.color} · {boat.length_meters}m</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono text-sm text-slate-600">{boat.registration_number}</span></td>
                    <td><span className="text-sm text-slate-600">{boat.type || "—"}</span></td>
                    <td>{primaryOwner?.owner ? <Link href={`/owners/${primaryOwner.owner.id}`} className="text-sm font-medium text-slate-700 hover:text-teal-700">{primaryOwner.owner.full_name}</Link> : "—"}</td>
                    <td>{activeSession?.parking_spot ? <span className="font-mono font-semibold text-slate-700">{activeSession.parking_spot.spot_number}</span> : "—"}</td>
                    <td><span className={`badge ${statusColors[boat.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>{t((boat.status as any) || "available")}</span></td>
                    <td>{activeSession?.remaining_balance > 0 ? <span className="num text-sm font-semibold text-red-600">OMR {Number(activeSession.remaining_balance).toFixed(3)}</span> : <span className="text-emerald-600 text-sm font-semibold">{t("paidShort")}</span>}</td>
                    <td><Link href={`/boats/${boat.id}`} className="btn-ghost text-xs py-1.5">{t("view")} →</Link></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8}><EmptyState icon={<IconBoat size={40} className="opacity-40" />} title={t("noBoatsFound")} description={t("tryAdjustingFilters")} action={<Link href="/boats/new" className="btn-primary text-sm">{t("registerFirstBoat")}</Link>} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <ServerPagination page={page} totalPages={totalPages} baseUrl="/boats" searchParams={filterParams} totalItems={totalCount} pageSize={PAGE_SIZE} />
      </div>
    </div>
  );
}
