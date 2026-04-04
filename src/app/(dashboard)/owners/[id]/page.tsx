import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatOMR } from "@/lib/utils";
import { SessionStatusBadge, Badge } from "@/components/ui";
import { getT } from "@/lib/i18n/server";

export default async function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const supabase = await createClient();

  const { data: owner } = await supabase.from("owners").select(`
    *, boat_owners(is_primary, since_date, boat:boats(
      id, name, registration_number, type, color, length_meters, status,
      parking_sessions(id, status, expected_end_date, total_due, total_paid, remaining_balance,
        parking_spot:parking_spots(spot_number))
    ))
  `).eq("id", id).single();

  if (!owner) notFound();

  const allBoats = owner.boat_owners?.map((bo: any) => ({ ...bo.boat, is_primary: bo.is_primary, since_date: bo.since_date })) ?? [];
  const totalBalance = allBoats.reduce((sum: number, b: any) => {
    const active = b.parking_sessions?.find((s: any) => s.status !== "closed");
    return sum + (active?.remaining_balance ? Number(active.remaining_balance) : 0);
  }, 0);

  const isCompany = owner.owner_type === "company";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/owners" className="btn-ghost text-xs">{t("backToOwners")}</Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-slate-900">{owner.full_name}</h1>
              <Badge variant={isCompany ? "info" : "default"} className="text-[10px]">
                {isCompany ? t("company") : t("individual")}
              </Badge>
            </div>
            {isCompany && (owner.company_name_ar || owner.company_name_en) && (
              <p className="text-sm text-slate-600 font-semibold mt-0.5">
                {owner.company_name_en}{owner.company_name_ar ? ` — ${owner.company_name_ar}` : ""}
              </p>
            )}
            <p className="text-sm text-slate-500">{t("ownerSince")} {formatDate(owner.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/owners/${id}/edit`} className="btn-secondary text-sm">{t("edit")}</Link>
          <Link href={`/boats/new?owner=${id}`} className="btn-primary text-sm">{t("registerBoat")}</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Contact & Identity Card */}
        <div className="card p-5 col-span-1 space-y-3">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("contactLabel")}</h2>
          {[
            { label: t("phone"),      value: owner.phone },
            { label: t("email"),      value: owner.email },
            { label: t("altContact"), value: owner.alternate_contact },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400 font-semibold">{label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
            </div>
          ))}

          {/* Civil ID */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-semibold">{t("civilId")}</p>
            <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">{owner.civil_id || "—"}</p>
          </div>

          {/* Company details */}
          {isCompany && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("companyDetails")}</p>
              <div>
                <p className="text-xs text-slate-400 font-semibold">{t("commercialRegisterNumber")}</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">{owner.commercial_register_number || "—"}</p>
              </div>
              {owner.commercial_register_expiry && (
                <div>
                  <p className="text-xs text-slate-400 font-semibold">{t("crExpiryDate")}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{formatDate(owner.commercial_register_expiry)}</p>
                </div>
              )}
            </div>
          )}

          {owner.billing_notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{t("billingNotes")}</p>
              <p className="text-sm text-slate-600 mt-1">{owner.billing_notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 col-span-2">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide mb-4">{t("accountSummary")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{allBoats.length}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{t("vessels")}</p>
            </div>
            <div className={`rounded-xl p-4 text-center ${totalBalance > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
              <p className={`text-2xl font-bold num ${totalBalance > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatOMR(totalBalance)}</p>
              <p className={`text-xs font-semibold mt-1 ${totalBalance > 0 ? "text-red-500" : "text-emerald-500"}`}>{t("outstandingBalance")}</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-teal-900">{allBoats.filter((b: any) => b.status === "parked").length}</p>
              <p className="text-xs font-semibold text-teal-600 mt-1">{t("currentlyParked")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 font-display">{t("registeredVessels")}</h2>
        </div>
        {allBoats.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {allBoats.map((boat: any) => {
              const active = boat.parking_sessions?.find((s: any) => s.status !== "closed");
              return (
                <div key={boat.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-teal-50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E7490" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="2" x2="12" y2="13" />
                        <path d="M12 3l7 10H12V3z" />
                        <path d="M4 17c0 0 2-4 8-4s8 4 8 4" />
                        <path d="M6 17l1.5 2.5h9L18 17" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/boats/${boat.id}`} className="font-bold text-slate-900 hover:text-teal-700">{boat.name}</Link>
                        {boat.is_primary && <Badge variant="gold" className="text-[10px]">{t("primaryOwner")}</Badge>}
                      </div>
                      <p className="text-xs font-mono text-slate-500">{boat.registration_number}</p>
                      <p className="text-xs text-slate-400">{boat.type} · {boat.color} · {boat.length_meters}m</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {active ? (
                      <div className="space-y-1">
                        <SessionStatusBadge status={active.status} />
                        <p className="text-xs font-mono text-slate-600">{t("spot")} {active.parking_spot?.spot_number}</p>
                        {active.remaining_balance > 0
                          ? <p className="text-xs font-bold text-red-600 num">{formatOMR(active.remaining_balance)} {t("due")}</p>
                          : <p className="text-xs font-bold text-emerald-600">{t("paidShort")}</p>}
                        <p className="text-xs text-slate-400">{t("until")} {formatDate(active.expected_end_date)}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">{t("noActiveSession")}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-slate-400">{t("noVesselsRegistered")}</p>
            <Link href={`/boats/new?owner=${id}`} className="btn-primary text-xs mt-3">{t("registerFirstVessel")}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
