import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { EmptyState, Badge } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { IconOwner } from "@/components/ui/Icons";
import ServerPagination from "@/components/ui/ServerPagination";

const PAGE_SIZE = 25;

export default async function OwnersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const t = await getT();
  const params = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const filterParams: Record<string, string> = {};
  if (params.q) filterParams.q = params.q;

  let query = supabase.from("owners").select(`*, boat_owners(is_primary, boat:boats(id, name, registration_number, status))`, { count: "exact" }).order("full_name");
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%,phone.ilike.%${params.q}%`);
  query = query.range(from, to);

  const { data: owners, count } = await query;
  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("boatOwners")}</h1>
          <p className="text-sm text-slate-500">{totalCount} {t("registeredOwners")}</p>
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
                <th>{t("ownerHeader")}</th><th>{t("typeLabel")}</th><th>{t("civilId")}</th><th>{t("phone")}</th>
                <th>{t("vessels")}</th><th>{t("memberSince")}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {owners && owners.length > 0 ? owners.map((owner: any) => {
                const boats = owner.boat_owners?.map((bo: any) => bo.boat).filter(Boolean) ?? [];
                const isCompany = owner.owner_type === "company";
                return (
                  <tr key={owner.id}>
                    <td>
                      <Link href={`/owners/${owner.id}`} className="font-semibold text-slate-900 hover:text-teal-700">{owner.full_name}</Link>
                      {isCompany && owner.company_name_en && <p className="text-xs text-slate-400">{owner.company_name_en}</p>}
                    </td>
                    <td><Badge variant={isCompany ? "info" : "default"} className="text-[10px]">{isCompany ? t("company") : t("individual")}</Badge></td>
                    <td className="text-sm text-slate-600 font-mono">{owner.civil_id || "—"}</td>
                    <td className="text-sm text-slate-600 font-mono">{owner.phone || "—"}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {boats.length > 0 ? boats.map((b: any) => (
                          <Link key={b.id} href={`/boats/${b.id}`} className="text-xs px-2 py-0.5 rounded-full font-semibold hover:opacity-80" style={{ background:"#f0fdfc", color:"#0E7490", border:"1px solid #99f6f0" }}>{b.name}</Link>
                        )) : <span className="text-slate-400 text-sm">{t("noBoatsLabel")}</span>}
                      </div>
                    </td>
                    <td className="text-sm text-slate-600">{formatDate(owner.created_at)}</td>
                    <td><Link href={`/owners/${owner.id}`} className="btn-ghost text-xs py-1">{t("view")} →</Link></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7}><EmptyState icon={<IconOwner size={40} className="opacity-40" />} title={t("noOwnersFound")} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <ServerPagination page={page} totalPages={totalPages} baseUrl="/owners" searchParams={filterParams} totalItems={totalCount} pageSize={PAGE_SIZE} />
      </div>
    </div>
  );
}
