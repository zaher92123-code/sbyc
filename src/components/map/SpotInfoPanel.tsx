"use client";

import { useState } from "react";
import type { YardSpot, SpotStatus } from "@/data/yardSpots";
import { formatDate } from "@/lib/utils";
import { IconBoat, IconPlus, IconWarning, IconClock, IconCheck } from "@/components/ui/Icons";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  spot: YardSpot;
  onClose: () => void;
  inline?: boolean;
  onRefresh?: () => void;
}

const CFG: Record<SpotStatus, { grad: string; accent: string; dot: string }> = {
  occupied: { grad:"linear-gradient(148deg,#061828 0%,#0b3c52 100%)", accent:"#0e7490", dot:"#22d3ee" },
  empty:    { grad:"linear-gradient(148deg,#030d06 0%,#054028 100%)", accent:"#059669", dot:"#34d399" },
  expired:  { grad:"linear-gradient(148deg,#160404 0%,#5a1010 100%)", accent:"#dc2626", dot:"#f87171" },
  reserved: { grad:"linear-gradient(148deg,#0a0620 0%,#2e1060 100%)", accent:"#7c3aed", dot:"#a78bfa" },
};

function daysUntil(d?: string): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mt-4 mb-1.5 first:mt-0">
      {children}
    </p>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value?: string|number|null; mono?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between py-[6px] border-b border-white/[0.06] last:border-0 gap-3">
      <span className="text-[11px] text-white/70 font-medium shrink-0">{label}</span>
      <span className={`text-[11px] font-semibold text-right leading-snug max-w-[175px] text-white ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default function SpotInfoPanel({ spot, onClose, inline = false, onRefresh }: Props) {
  const { t } = useLanguage();

  const statusLabel = t(spot.status === "expired" ? "overdue" : spot.status as any) || spot.status;
  const cfg = CFG[spot.status];
  const days = daysUntil(spot.expiryDate);
  const isExpired = days !== null && days < 0;
  const isSoon    = days !== null && days >= 0 && days <= 7;
  const balance   = spot.totalDue !== undefined && spot.totalPaid !== undefined
    ? +(spot.totalDue - spot.totalPaid).toFixed(3) : undefined;

  const photoUrl = spot.boatPhotoUrl || null;

  const wrapClass = inline
    ? "flex flex-col h-full rounded-2xl overflow-hidden shadow-xl"
    : "absolute top-4 right-4 z-[1000] w-[314px] rounded-2xl overflow-hidden shadow-2xl";

  return (
    <div className={wrapClass} style={{ border:`1px solid ${cfg.accent}40` }}>
      {/* Header */}
      <div style={{ background: cfg.grad }} className="px-5 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }}/>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
              {statusLabel}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/60 hover:text-white/75 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[28px] font-black leading-none text-white" style={{ fontFamily:"DM Sans, sans-serif" }}>
              {t("spot")} {spot.id}
            </p>
            {spot.boatName
              ? <p className="text-sm font-bold mt-1 flex items-center gap-1.5" style={{ color: cfg.dot }}><IconBoat size={13} />{spot.boatName}</p>
              : spot.status === "reserved" && spot.reservedForName
                ? <p className="text-sm font-bold mt-1" style={{ color: cfg.dot }}>{spot.reservedForName}</p>
                : <p className="text-sm font-medium mt-1 text-white/60">{t("noVesselAssigned")}</p>}
          </div>
          {balance !== undefined && (
            <div className={`shrink-0 px-3 py-2 rounded-xl text-center border ${
              balance > 0 ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}>
              <p className="text-[8px] font-bold uppercase tracking-wider text-white/45 mb-0.5">{t("balance")}</p>
              <p className="text-[13px] font-black font-mono leading-tight">
                {balance > 0 ? `OMR ${balance.toFixed(3)}` : t("paid")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="bg-[#060c18] px-5 py-4 flex-1 overflow-y-auto">
        {/* ── EMPTY: Show reserve button ──────────────────────────────── */}
        {spot.status === "empty" && (
          <EmptySpotContent spotId={spot.spotDbId} spotNumber={spot.id} t={t} onRefresh={onRefresh} />
        )}

        {/* ── RESERVED: Show reservation details + unreserve ─────────── */}
        {spot.status === "reserved" && (
          <ReservedSpotContent spot={spot} t={t} onRefresh={onRefresh} />
        )}

        {/* ── OCCUPIED / EXPIRED: Show vessel + billing details ──────── */}
        {(spot.status === "occupied" || spot.status === "expired") && (
          <>
            {photoUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10 mb-3">
                <img src={photoUrl} alt={spot.boatName || ""} className="w-full h-32 object-cover" />
              </div>
            )}

            <SectionLabel>{t("vessel")}</SectionLabel>
            <InfoRow label={t("boatName")}    value={spot.boatName} />
            <InfoRow label={t("boatType")}    value={spot.boatType} />
            <InfoRow label={t("boatLength")}  value={spot.boatLength} />
            <InfoRow label={t("boatWidth")}   value={spot.boatWidth} />
            <InfoRow label={t("registration")} value={spot.registrationNumber} mono />

            <SectionLabel>{t("insurance")}</SectionLabel>
            <InfoRow label={t("insuranceCompany")} value={spot.insuranceCompany} />
            <InfoRow label={t("insuranceExpiry")}  value={spot.insuranceExpiry} />

            <SectionLabel>{t("owner")}</SectionLabel>
            <InfoRow label={t("ownerName")} value={spot.ownerName} />
            <InfoRow label={t("phone")}     value={spot.ownerPhone} mono />
            <InfoRow label={t("email")}     value={spot.ownerEmail} mono />

            <SectionLabel>{t("storagePeriod")}</SectionLabel>
            <InfoRow label={t("entryDate")}  value={spot.entryDate  ? formatDate(spot.entryDate)  : undefined} />
            <InfoRow label={t("expiryDate")} value={spot.expiryDate ? formatDate(spot.expiryDate) : undefined} />

            {days !== null && (
              <div className={`mt-2.5 rounded-xl px-3 py-2.5 text-center text-[11px] font-bold border ${
                isExpired ? "bg-red-500/18 text-red-300 border-red-500/25"
                : isSoon  ? "bg-amber-500/18 text-amber-300 border-amber-500/25"
                          : "bg-teal-500/15 text-teal-300 border-teal-500/20"
              }`}>
                <span className="flex items-center justify-center gap-1.5">
                  {isExpired ? (
                    <>
                      <IconWarning size={12} />
                      {t("expiredLabel")} {Math.abs(days)} {t("expiredDaysAgo")}
                    </>
                  ) : days === 0 ? (
                    <>
                      <IconClock size={12} />
                      {t("expiresToday")}
                    </>
                  ) : days <= 7 ? (
                    <>
                      <IconClock size={12} />
                      {t("expiresIn")} {days} {t("days")}
                    </>
                  ) : (
                    <>
                      <IconCheck size={12} />
                      {days} {t("expiresInDays")}
                    </>
                  )}
                </span>
              </div>
            )}

            {spot.totalDue !== undefined && (
              <>
                <SectionLabel>{t("billing")}</SectionLabel>
                <InfoRow label={t("totalDue")}  value={`OMR ${spot.totalDue.toFixed(3)}`}           mono />
                <InfoRow label={t("totalPaid")} value={`OMR ${(spot.totalPaid??0).toFixed(3)}`}     mono />
                {balance !== undefined && balance !== 0 && (
                  <div className="flex justify-between items-center pt-2 mt-1.5 border-t border-white/[0.06]">
                    <span className="text-[11px] font-semibold text-white/70">{t("outstanding")}</span>
                    <span className={`text-sm font-black font-mono ${balance>0?"text-red-300":"text-emerald-300"}`}>
                      OMR {balance.toFixed(3)}
                    </span>
                  </div>
                )}
              </>
            )}

            {spot.notes && (
              <>
                <SectionLabel>{t("notes")}</SectionLabel>
                <div className="bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.05]">
                  <p className="text-white/80 text-[11px] leading-relaxed">{spot.notes}</p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Empty spot: reserve form ─────────────────────────────────────────────────

function EmptySpotContent({ spotId, spotNumber, t, onRefresh }: {
  spotId?: string; spotNumber: number; t: (k: any) => string; onRefresh?: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", until: "", notes: "" });

  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!spotId) { setError("Spot ID not found"); return; }
    setSaving(true);
    setError("");

    const res = await fetch(`/api/spots/${spotId}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reserved_for_name: form.name,
        reserved_for_phone: form.phone,
        reserved_until: form.until,
        reserved_notes: form.notes,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const result = await res.json();
      setError(result.error?.message || result.error || "Failed to reserve");
      return;
    }

    setShowForm(false);
    onRefresh?.();
  }

  return (
    <div className="text-center py-4">
      <div className="mb-3 opacity-70"><IconCheck size={40} className="text-emerald-400 mx-auto" /></div>
      <p className="text-white/75 text-sm font-semibold">{t("spotAvailable")}</p>
      <p className="text-white/60 text-xs mt-1">{t("noVesselStored")}</p>

      {!showForm ? (
        <div className="flex flex-col gap-2 mt-5">
          <Link href="/sessions/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-80 transition-opacity"
            style={{ background:"#059669" }}>
            + {t("createSession")}
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-80 transition-opacity"
            style={{ background:"#7c3aed" }}>
            {t("reserved") || "Reserve Spot"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleReserve} className="mt-4 text-left space-y-3">
          <div>
            <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">{t("ownerName")} *</label>
            <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg text-xs text-white bg-white/[0.06] border border-white/[0.12] focus:border-purple-400 focus:outline-none"
              placeholder="Mohammed Al Balushi" required />
          </div>
          <div>
            <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">{t("phone")}</label>
            <input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg text-xs text-white font-mono bg-white/[0.06] border border-white/[0.12] focus:border-purple-400 focus:outline-none"
              placeholder="+968 9100 0000" />
          </div>
          <div>
            <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">{t("expiryDate")}</label>
            <input type="date" value={form.until} onChange={(e) => setForm(f => ({ ...f, until: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg text-xs text-white bg-white/[0.06] border border-white/[0.12] focus:border-purple-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">{t("notes")}</label>
            <input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-lg text-xs text-white bg-white/[0.06] border border-white/[0.12] focus:border-purple-400 focus:outline-none"
              placeholder="Vessel arriving next week" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-opacity disabled:opacity-50"
              style={{ background:"#7c3aed" }}>
              {saving ? t("saving") : t("reserved")}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white/60 bg-white/[0.06] hover:bg-white/[0.1] transition-colors">
              {t("cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Reserved spot: show details + unreserve ──────────────────────────────────

function ReservedSpotContent({ spot, t, onRefresh }: {
  spot: YardSpot; t: (k: any) => string; onRefresh?: () => void;
}) {
  const [unreserving, setUnreserving] = useState(false);

  async function handleUnreserve() {
    if (!spot.spotDbId) return;
    setUnreserving(true);
    await fetch(`/api/spots/${spot.spotDbId}/reserve`, { method: "DELETE" });
    setUnreserving(false);
    onRefresh?.();
  }

  const daysLeft = spot.reservedUntil ? daysUntil(spot.reservedUntil) : null;

  return (
    <div className="space-y-3">
      <SectionLabel>{t("reserved")}</SectionLabel>
      <InfoRow label={t("ownerName")} value={spot.reservedForName} />
      <InfoRow label={t("phone")} value={spot.reservedForPhone} mono />
      {spot.reservedUntil && (
        <InfoRow label={t("expiryDate")} value={formatDate(spot.reservedUntil)} />
      )}
      {spot.reservedNotes && (
        <>
          <SectionLabel>{t("notes")}</SectionLabel>
          <div className="bg-white/[0.04] rounded-xl px-3.5 py-2.5 border border-white/[0.05]">
            <p className="text-white/80 text-[11px] leading-relaxed">{spot.reservedNotes}</p>
          </div>
        </>
      )}

      {daysLeft !== null && (
        <div className={`rounded-xl px-3 py-2.5 text-center text-[11px] font-bold border ${
          daysLeft < 0 ? "bg-red-500/18 text-red-300 border-red-500/25"
          : daysLeft <= 3 ? "bg-amber-500/18 text-amber-300 border-amber-500/25"
          : "bg-purple-500/15 text-purple-300 border-purple-500/20"
        }`}>
          {daysLeft < 0
            ? `Reservation expired ${Math.abs(daysLeft)} days ago`
            : daysLeft === 0
              ? "Expected arrival today"
              : `Expected in ${daysLeft} days`}
        </div>
      )}

      <div className="flex gap-2 pt-3">
        <Link href="/sessions/new"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white hover:opacity-80 transition-opacity"
          style={{ background:"#059669" }}>
          + {t("createSession")}
        </Link>
        <button onClick={handleUnreserve} disabled={unreserving}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-300 bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 transition-colors disabled:opacity-50">
          {unreserving ? "..." : t("cancel")}
        </button>
      </div>
    </div>
  );
}
