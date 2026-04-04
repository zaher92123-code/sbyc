import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatOMR, getPaymentStatus } from "@/lib/utils";
import { SessionStatusBadge, PaymentStatusBadge, Badge, Alert } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { IconCheck, IconBoat, IconMail, IconSearch } from "@/components/ui/Icons";

export default async function BoatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getT();
  const supabase = await createClient();

  const [{ data: boat }, { data: sessions }] = await Promise.all([
    supabase.from("boats").select(`*, boat_owners(is_primary, since_date, owner:owners(*))`).eq("id", id).single(),
    supabase.from("parking_sessions").select(`*, parking_spot:parking_spots(spot_number), payments(id, amount, payment_date, payment_method, reference_number, notes)`)
      .eq("boat_id", id).order("created_at", { ascending: false }),
  ]);

  if (!boat) notFound();

  const activeSession = sessions?.find((s: any) => s.status !== "closed");
  const histSessions  = sessions?.filter((s: any) => s.status === "closed");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/boats" className="btn-ghost text-xs">{t("back")}</Link>
          {boat.photo_url && (
            <img src={boat.photo_url} alt={boat.name} className="w-14 h-14 rounded-xl object-cover border-2 border-teal-200 shadow-sm" />
          )}
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900">{boat.name}</h1>
            <p className="font-mono text-slate-500">{boat.registration_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/boats/${id}/edit`} className="btn-secondary text-sm">{t("edit")}</Link>
          {activeSession && (
            <Link href={`/payments/new?session=${activeSession.id}`} className="btn-primary text-sm">
              + {t("recordPaymentBtn").replace("+ ", "")}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 col-span-1 space-y-4">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("vesselDetails")}</h2>
          {boat.photo_url && (
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <img src={boat.photo_url} alt={boat.name} className="w-full h-40 object-cover" />
            </div>
          )}
          {[
            { label: t("boatType"),    value: boat.type },
            { label: t("color"),       value: boat.color },
            { label: t("length"),      value: boat.length_meters ? `${boat.length_meters}m` : null },
            { label: t("boatWidth"),   value: boat.width_meters ? `${boat.width_meters}m` : null },
            { label: t("status"),      value: boat.status, isStatus: true },
            { label: t("registeredDate"), value: formatDate(boat.created_at) },
            { label: t("insuranceCompany"), value: boat.insurance_company },
            { label: t("insuranceExpiry"),  value: boat.insurance_expiry ? formatDate(boat.insurance_expiry) : null },
          ].map(({ label, value, isStatus }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-500">{label}</span>
              {isStatus ? (
                <span className={`badge text-xs ${value === "parked" ? "bg-teal-100 text-teal-800 border-teal-200" : value === "available" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}`}>
                  {t((value as any) || "available")}
                </span>
              ) : (
                <span className="font-semibold text-slate-800">{value || "—"}</span>
              )}
            </div>
          ))}
          {boat.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">{t("notes")}</p>
              <p className="text-sm text-slate-600">{boat.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 col-span-1 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide">{t("ownerHeader")}</h2>
            <Link href={`/boats/${id}/owners`} className="text-xs text-teal-600 hover:underline">{t("manage")}</Link>
          </div>
          {boat.boat_owners?.map((bo: any) => (
            <div key={bo.owner.id} className="p-3 rounded-xl bg-slate-50 space-y-1">
              <div className="flex items-center gap-2">
                <Link href={`/owners/${bo.owner.id}`} className="font-semibold text-slate-900 hover:text-teal-700 text-sm">{bo.owner.full_name}</Link>
                {bo.is_primary && <Badge variant="gold" className="text-[10px]">{t("primary")}</Badge>}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1"><IconSearch size={10} />{bo.owner.phone || "—"}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><IconMail size={10} />{bo.owner.email || "—"}</p>
              {bo.since_date && <p className="text-xs text-slate-400">{t("since")} {formatDate(bo.since_date)}</p>}
            </div>
          ))}
        </div>

        <div className="card p-5 col-span-1">
          <h2 className="font-bold text-slate-800 font-display text-sm uppercase tracking-wide mb-3">{t("currentSession")}</h2>
          {activeSession ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SessionStatusBadge status={activeSession.status} />
                <span className="font-mono font-bold text-slate-700">{activeSession.parking_spot?.spot_number}</span>
              </div>
              {[
                { label: t("checkIn"),      value: formatDate(activeSession.start_date) },
                { label: t("expectedEnd"),  value: formatDate(activeSession.expected_end_date) },
                { label: t("pricingModel"), value: activeSession.pricing_model },
                { label: t("totalDue"),     value: formatOMR(activeSession.total_due) },
                { label: t("totalPaid"),    value: formatOMR(activeSession.total_paid) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold">
                <span className="text-slate-700">{t("balanceDue")}</span>
                <span className={activeSession.remaining_balance > 0 ? "text-red-600 num" : "text-emerald-600 num"}>
                  {formatOMR(activeSession.remaining_balance)}
                </span>
              </div>
              <Link href={`/sessions/${activeSession.id}`} className="btn-secondary text-xs w-full justify-center mt-2">
                {t("viewFullSession")}
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm">{t("noActiveSession")}</p>
              <Link href={`/sessions/new?boat=${id}`} className="btn-primary text-xs mt-3">+ {t("startSession").replace("+ ","")}</Link>
            </div>
          )}
        </div>
      </div>

      {activeSession && activeSession.payments?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display">{t("paymentHistory")}</h2>
            <Link href={`/payments/new?session=${activeSession.id}`} className="btn-primary text-xs py-1.5">+ {t("addPayment").replace("+ ","")}</Link>
          </div>
          <table className="w-full data-table">
            <thead><tr><th>{t("dateHeader")}</th><th>{t("amountHeader")}</th><th>{t("method")}</th><th>{t("reference")}</th><th>{t("notesHeader")}</th></tr></thead>
            <tbody>
              {activeSession.payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="text-sm text-slate-700">{formatDate(p.payment_date)}</td>
                  <td className="num font-semibold text-emerald-700">{formatOMR(p.amount)}</td>
                  <td className="text-sm text-slate-600">{p.payment_method || "—"}</td>
                  <td className="text-sm font-mono text-slate-500">{p.reference_number || "—"}</td>
                  <td className="text-sm text-slate-500">{p.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {histSessions && histSessions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 font-display">{t("parkingHistory")}</h2>
          </div>
          <table className="w-full data-table">
            <thead><tr><th>{t("spotHeader")}</th><th>{t("checkIn")}</th><th>{t("checkOut")}</th><th>{t("duration")}</th><th>{t("totalPaid")}</th><th>{t("status")}</th></tr></thead>
            <tbody>
              {histSessions.map((s: any) => {
                const dur = s.actual_exit_date
                  ? Math.round((new Date(s.actual_exit_date).getTime() - new Date(s.start_date).getTime()) / (1000*60*60*24))
                  : null;
                return (
                  <tr key={s.id}>
                    <td className="font-mono font-semibold text-slate-700">{s.parking_spot?.spot_number}</td>
                    <td className="text-sm text-slate-600">{formatDate(s.start_date)}</td>
                    <td className="text-sm text-slate-600">{formatDate(s.actual_exit_date)}</td>
                    <td className="text-sm text-slate-600">{dur ? `${dur} ${t("days")}` : "—"}</td>
                    <td className="num text-sm font-semibold text-slate-700">{formatOMR(s.total_paid)}</td>
                    <td><SessionStatusBadge status={s.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
