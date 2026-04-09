"use client";
/**
 * YardMapSVG — Landscape interactive yard map
 * The SVG (portrait 500×1040) is rotated -90° and scaled to fill
 * the available width, giving a natural top-down aerial feel.
 * Info panel sits beside the map on the right.
 */

import { useState, useCallback, useEffect } from "react";
import {
  getSpotSVGPosition, SVG_LAYOUT,
  type YardSpot, type SpotStatus,
} from "@/data/yardSpots";
import { MARINA_CONFIG } from "@/config/marina";
import SpotInfoPanel from "@/components/map/SpotInfoPanel";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

// ── Colour palette ────────────────────────────────────────────────────────────
type Pal = { slotBg:string; slotBorder:string; slotDash?:string; hullFill:string; hullStroke:string; numColor:string };
const PAL: Record<SpotStatus, Pal> = {
  occupied: { slotBg:"#061828", slotBorder:"#0e7490", hullFill:"#0b4060", hullStroke:"#22d3ee", numColor:"#7dd3fc" },
  empty:    { slotBg:"#040e0a", slotBorder:"#059669", slotDash:"5 3",    hullFill:"none",   hullStroke:"none",   numColor:"#34d399" },
  expired:  { slotBg:"#160404", slotBorder:"#dc2626", hullFill:"#3d0a0a", hullStroke:"#f87171", numColor:"#fca5a5" },
  reserved: { slotBg:"#0a0620", slotBorder:"#7c3aed", slotDash:"5 3",   hullFill:"#180848", hullStroke:"#a78bfa", numColor:"#c4b5fd" },
};
const SW = SVG_LAYOUT.slotW;
const SH = SVG_LAYOUT.slotH;

// ── Boat silhouette ───────────────────────────────────────────────────────────
function BoatSilhouette({ side, status }: { side:"left"|"right"; status:SpotStatus }) {
  if (status === "empty") return null;
  const p = PAL[status];
  const mx=2, my=2, iw=SW-4, ih=SH-4, mid=ih/2;
  const hull = side === "left"
    ? `M ${mx+8},${my} L ${mx+iw-22},${my} L ${mx+iw},${my+mid} L ${mx+iw-22},${my+ih} L ${mx+8},${my+ih} Q ${mx},${my+ih} ${mx},${my+mid} Q ${mx},${my} ${mx+8},${my} Z`
    : `M ${mx+iw-8},${my} L ${mx+22},${my} L ${mx},${my+mid} L ${mx+22},${my+ih} L ${mx+iw-8},${my+ih} Q ${mx+iw},${my+ih} ${mx+iw},${my+mid} Q ${mx+iw},${my} ${mx+iw-8},${my} Z`;
  const cabX = side === "left" ? mx+4 : mx+iw-4-36;
  const nock  = side === "left"
    ? `M ${mx+iw-14},${my+4} L ${mx+iw-3},${my+mid} L ${mx+iw-14},${my+ih-4}`
    : `M ${mx+14},${my+4} L ${mx+3},${my+mid} L ${mx+14},${my+ih-4}`;
  return (
    <g>
      <path d={hull} fill={p.hullFill} stroke={p.hullStroke} strokeWidth="1.2"/>
      <rect x={cabX} y={my+4} width={36} height={ih-8} rx="3"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
      <path d={nock} fill="none" stroke={p.hullStroke} strokeWidth="1"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      {status==="expired" && (
        <g opacity="0.7">
          <line x1={mx+6} y1={my+4} x2={mx+iw-6} y2={my+ih-4} stroke="#ff4444" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1={mx+iw-6} y1={my+4} x2={mx+6} y2={my+ih-4} stroke="#ff4444" strokeWidth="1.8" strokeLinecap="round"/>
        </g>
      )}
      {status==="reserved" && (
        <rect x={mx+2} y={my+2} width={iw-4} height={ih-4} rx="5"
          fill="none" stroke="#a78bfa" strokeWidth="0.9" strokeDasharray="3 2" opacity="0.5"/>
      )}
    </g>
  );
}

// ── Single spot ───────────────────────────────────────────────────────────────
function Spot({ spot, selected, onClick }: { spot:YardSpot; selected:boolean; onClick:()=>void }) {
  const [hov, setHov] = useState(false);
  const { cx, cy, side } = getSpotSVGPosition(spot.id);
  const p = PAL[spot.status];
  const x = cx-SW/2, y = cy-SH/2;
  const lit = hov || selected;
  return (
    <g onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{cursor:"pointer"}}>
      {lit && (
        <rect x={x-5} y={y-5} width={SW+10} height={SH+10} rx="7"
          fill={selected?"#d4a85320":"#ffffff08"}
          stroke={selected?"#d4a853":"#ffffff22"}
          strokeWidth={selected?2:1}/>
      )}
      <rect x={x} y={y} width={SW} height={SH} rx="4"
        fill={p.slotBg}
        stroke={selected?"#d4a853":lit?p.hullStroke:p.slotBorder}
        strokeWidth={lit||selected?1.6:1}
        strokeDasharray={selected?undefined:p.slotDash}
        opacity={lit?1:0.84}/>
      <g transform={`translate(${x},${y})`}>
        <BoatSilhouette side={side} status={spot.status}/>
      </g>
      <g transform={`rotate(90, ${side==="left"?x+SW+11:x-11}, ${cy})`}>
        <rect x={side==="left"?x+SW+4:x-18} y={cy-6} width={14} height={12} rx="2"
          fill="rgba(0,0,0,0.5)" opacity={lit?1:0.65}/>
        <text x={side==="left"?x+SW+11:x-11} y={cy+3}
          fontSize="8.5" fontFamily="DM Mono, Courier New, monospace" fontWeight="700"
          fill={p.numColor} textAnchor="middle" opacity={lit?1:0.7}>
          {spot.id}
        </text>
      </g>
    </g>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend({ spots }: { spots: YardSpot[] }) {
  const counts = spots.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] ?? 0) + 1; return acc; },
    {} as Record<SpotStatus, number>
  );
  const { lang } = useLanguage();
  const statusLabels: Record<SpotStatus, string> = {
    occupied: T.occupied[lang],
    empty: T.available[lang],
    reserved: T.reserved[lang],
    expired: T.expired[lang],
  };
  return (
    <div className="flex flex-wrap gap-2">
      {(["occupied","empty","reserved","expired"] as SpotStatus[]).map(st => {
        const p = PAL[st];
        return (
          <div key={st} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold select-none"
            style={{ background:p.slotBg, border:`1px solid ${p.slotBorder}70`, color:p.numColor }}>
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background:p.slotBorder }}/>
            {statusLabels[st]}
            <span className="font-mono font-black opacity-70">{counts[st]??0}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function YardMapSVG() {
  const [selected, setSelected] = useState<YardSpot|null>(null);
  const [spots, setSpots] = useState<YardSpot[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const toggle = useCallback((spot:YardSpot):void => {
    setSelected(prev => prev?.id===spot.id ? null : spot);
  }, []);
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];

  // Fetch live data from API
  useEffect(() => {
    async function fetchMapData() {
      try {
        const res = await fetch("/api/map");
        const json = await res.json();
        const mapData = json.data || {};

        // Build 45 spots from layout + live data
        const liveSpots: YardSpot[] = [];
        for (let id = 1; id <= 45; id++) {
          const side = id <= 24 ? "left" : "right";
          const dbSpot = mapData[String(id)];
          if (dbSpot && dbSpot.status !== "empty") {
            liveSpots.push({
              id,
              side: side as "left" | "right",
              status: dbSpot.status as SpotStatus,
              spotDbId: dbSpot.spotDbId,
              boatName: dbSpot.boatName,
              boatType: dbSpot.boatType,
              boatLength: dbSpot.boatLength,
              registrationNumber: dbSpot.registrationNumber,
              ownerName: dbSpot.ownerName,
              ownerPhone: dbSpot.ownerPhone,
              ownerEmail: dbSpot.ownerEmail,
              entryDate: dbSpot.entryDate,
              expiryDate: dbSpot.expiryDate,
              totalDue: dbSpot.totalDue,
              totalPaid: dbSpot.totalPaid,
              notes: dbSpot.notes,
              photoUrl: dbSpot.photoUrl,
              boatWidth: dbSpot.boatWidth,
              insuranceCompany: dbSpot.insuranceCompany,
              insuranceExpiry: dbSpot.insuranceExpiry,
              insurancePolicyNumber: dbSpot.insurancePolicyNumber,
              reservedForName: dbSpot.reservedForName,
              reservedForPhone: dbSpot.reservedForPhone,
              reservedUntil: dbSpot.reservedUntil,
              reservedNotes: dbSpot.reservedNotes,
            });
          } else {
            liveSpots.push({ id, side: side as "left" | "right", status: "empty", spotDbId: dbSpot?.spotDbId });
          }
        }
        setSpots(liveSpots);
      } catch {
        // Fallback: all empty
        const fallback: YardSpot[] = [];
        for (let id = 1; id <= 45; id++) {
          fallback.push({ id, side: id <= 24 ? "left" : "right", status: "empty" });
        }
        setSpots(fallback);
      } finally {
        setLoading(false);
      }
    }
    fetchMapData();
  }, [refreshKey]);

  const L = SVG_LAYOUT;
  const bX=L.rightX-2, bY=L.buildingTopY, bW=L.slotW+36, bH=L.buildingHeight;

  // Landscape rotation math:
  //   SVG viewBox is 500 wide × 1040 tall (portrait).
  //   We rotate it -90° so it appears 1040 wide × 500 tall (landscape).
  //   The container uses padding-bottom trick: height = width × (500/1040).
  //   Inside, the SVG is positioned absolutely at 48.08% width (=500/1040×100%)
  //   and 100% height of its unrotated self, then rotated around centre.

  return (
    <div className="flex flex-col gap-3 h-full">

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-slate-400">{t("loading")}</div>
        </div>
      )}

      {!loading && <>
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 flex-shrink-0">
        <p className="text-sm text-slate-500">
          {t("clickSpot")} ·{" "}
          <span className="font-semibold text-slate-700">{spots.length} {t("spotsTotal")}</span>
        </p>
        <Legend spots={spots} />
      </div>

      {/* Map + side panel */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">

        {/* Landscape map — grows to fill space */}
        <div className="flex-1 min-w-0 flex flex-col justify-start overflow-x-auto">
          {/*
            Outer wrapper: sets the landscape aspect ratio.
            padding-bottom = 500/1040 × 100% ≈ 48.08%
          */}
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-xl"
            style={{
              paddingBottom:"calc(500 / 1040 * 100%)",
              background:"#05080f",
              border:"1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/*
              SVG wrapper: absolutely fills the outer container.
              The SVG is rendered at 48.08% of the container width (portrait),
              centred, then rotated -90°.
            */}
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg
                viewBox="0 0 500 1040"
                style={{
                  width:"calc(500 / 1040 * 100%)",
                  height:"auto",
                  transform:"rotate(-90deg)",
                  transformOrigin:"center center",
                  display:"block",
                  // after rotation this fills the full landscape container
                  maxWidth:"none",
                }}
                preserveAspectRatio="xMidYMid meet"
              >
            <defs>
              <pattern id="p_sand" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#b89060"/>
                <circle cx="3" cy="4" r="1.2" fill="#a07838" opacity="0.45"/>
                <circle cx="9" cy="9" r="0.8" fill="#cca870" opacity="0.35"/>
              </pattern>
              <pattern id="p_asphalt" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#212121"/>
                <rect x="0" y="0" width="4" height="4" fill="#252525" opacity="0.6"/>
                <rect x="4" y="4" width="3" height="3" fill="#1c1c1c" opacity="0.5"/>
              </pattern>
              <pattern id="p_aisle" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#181818"/>
              </pattern>
              <pattern id="p_rocks" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#483424"/>
                <rect x="1" y="1" width="7" height="6" rx="1.5" fill="#5c4630" opacity="0.65"/>
                <rect x="8" y="8" width="6" height="7" rx="1.5" fill="#3c2c18" opacity="0.55"/>
              </pattern>
              <pattern id="p_road" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="10" height="10" fill="#282828"/>
                <rect x="0" y="5" width="10" height="1" fill="#222" opacity="0.4"/>
              </pattern>
              <filter id="f_bshadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.6"/>
              </filter>
            </defs>

            <rect width="500" height="1040" fill="url(#p_sand)"/>
            <path d="M 0,0 L 30,30 C 38,88 32,158 22,256 L 16,384 16,544 22,726 L 34,856 54,914 80,950 L 0,1040 Z"
              fill="url(#p_rocks)" opacity="0.9"/>
            <path d="M 30,30 C 38,88 32,158 22,256 L 16,384 16,544 22,726 L 34,856 54,914 80,950"
              fill="none" stroke="#8b6a46" strokeWidth="2.5" opacity="0.6"/>
            {[[4,72,22,9],[8,130,18,8],[2,196,24,10],[6,258,20,9],[4,318,19,8],[2,380,22,10],
              [4,444,18,9],[6,506,20,8],[2,566,24,9],[4,628,20,10],[6,688,18,8],[4,748,22,9],[8,806,20,9],[6,856,18,8]]
              .map(([rx,ry,rw,rh],i)=><rect key={i} x={rx} y={ry} width={rw} height={rh} rx="2" fill="#7a5c38" opacity="0.38"/>)}
            <path d="M 500,0 L 462,54 L 464,506 462,706 458,806 L 444,882 430,950 L 500,1040 Z"
              fill="url(#p_road)" opacity="0.8"/>
            <path d="M 462,54 L 464,506 462,706 L 458,806 444,882 430,950"
              fill="none" stroke="#383838" strokeWidth="2" opacity="0.6"/>
            <path d="M 30,30 C 175,14 295,6 380,8 L 430,16 L 452,40 L 458,80 L 460,286 L 464,506 L 462,706 L 458,806 L 444,882 L 430,950 L 80,950 L 54,914 L 34,856 L 22,726 L 16,544 L 16,384 L 22,256 L 32,158 L 38,88 L 30,30 Z"
              fill="url(#p_asphalt)" stroke="#363636" strokeWidth="2"/>
            <rect x="164" y="28" width="166" height="922" fill="url(#p_aisle)" opacity="0.55"/>
            <line x1="164" y1="30" x2="164" y2="946" stroke="#ffffff07" strokeWidth="1"/>
            <line x1="330" y1="30" x2="330" y2="946" stroke="#ffffff07" strokeWidth="1"/>
            <line x1="247" y1="36" x2="247" y2="940" stroke="#ffffff05" strokeWidth="1.5" strokeDasharray="20 13"/>
            {[140,230,330,430,530,640,740,840].map(ty=>(
              <ellipse key={ty} cx={247} cy={ty} rx={28} ry={5} fill="#0d0d0d" opacity="0.22"/>
            ))}
            <g opacity="0.82">
              <rect x="40" y="38" width="64" height="50" rx="3" fill="#131d2d" stroke="#1d2e48" strokeWidth="1.5"/>
              <line x1="72" y1="38" x2="72" y2="88" stroke="#1d2e48" strokeWidth="1"/>
              <line x1="41" y1="52" x2="103" y2="52" stroke="#1d2e48" strokeWidth="0.8"/>
              <line x1="41" y1="63" x2="103" y2="63" stroke="#1d2e48" strokeWidth="0.8"/>
              <line x1="41" y1="75" x2="103" y2="75" stroke="#1d2e48" strokeWidth="0.8"/>
              <rect x="62" y="72" width="20" height="16" rx="1" fill="#0a1020" stroke="#1d2e48" strokeWidth="0.7"/>
              <text x="72" y="58" fontSize="5" fill="#2e4868" fontFamily="DM Mono, monospace" fontWeight="700" textAnchor="middle">{t("workshop")}</text>
            </g>

            <g filter="url(#f_bshadow)">
              <rect x={bX} y={bY} width={bW} height={bH} rx="5" fill="#0d1626" stroke="#182840" strokeWidth="2"/>
              <line x1={bX+6} y1={bY+bH/2} x2={bX+bW-6} y2={bY+bH/2} stroke="#1a3050" strokeWidth="1.5"/>
              <rect x={bX+5} y={bY+5} width={bW-10} height={bH-10} rx="3" fill="none" stroke="#1a3050" strokeWidth="1" strokeDasharray="5 2"/>
              {[0.2,0.35,0.65,0.8].map((frac,i)=>(
                <line key={i} x1={bX+5} y1={bY+bH*frac} x2={bX+bW-5} y2={bY+bH*frac} stroke="#162236" strokeWidth="0.8"/>
              ))}
              {[0.25,0.62].map((fx,i)=>(
                <rect key={i} x={bX+bW*fx-12} y={bY+12} width={24} height={16} rx="2" fill="#080f1c" stroke="#1a3050" strokeWidth="0.8"/>
              ))}
              <rect x={bX+bW/2-16} y={bY+bH-28} width={32} height={24} rx="2" fill="#060c18" stroke="#1a3050" strokeWidth="1"/>
              <circle cx={bX+bW/2+10} cy={bY+bH-17} r="2" fill="#1a3050"/>
              <text x={bX+bW/2} y={bY+bH/2+4} fontSize="7.5" fill="#22375a"
                fontFamily="DM Mono, monospace" fontWeight="700" textAnchor="middle">{t("serviceBuilding")}</text>
            </g>
            <text x={L.leftX+SW/2} y={975} fontSize="6.5" fill="#ffffff12"
              fontFamily="DM Mono, monospace" fontWeight="700" textAnchor="middle" letterSpacing="2">COL-A · 1–24</text>
            <text x={L.rightX+SW/2} y={975} fontSize="6.5" fill="#ffffff12"
              fontFamily="DM Mono, monospace" fontWeight="700" textAnchor="middle" letterSpacing="2">COL-B · 25–45</text>

            <g transform="translate(473,992)" opacity="0.42">
              <circle r="16" fill="#05080f" stroke="#182840" strokeWidth="1.2"/>
              <path d="M 0,-13 L 3.5,-3 L 0,1 L -3.5,-3 Z" fill="#22d3ee"/>
              <path d="M 0,13 L 3.5,3 L 0,-1 L -3.5,3 Z" fill="#1a3028"/>
              <text y="-5.5" fontSize="6.5" fill="#22d3ee" textAnchor="middle" fontWeight="800">N</text>
            </g>
            <text x="247" y="1028" fontSize="8" fill="#ffffff06"
              fontFamily="DM Sans, sans-serif" textAnchor="middle" letterSpacing="3">
              {MARINA_CONFIG.name.toUpperCase()}
            </text>
            {spots.map(spot=>(
              <Spot key={spot.id} spot={spot} selected={selected?.id===spot.id}
                onClick={():void=>toggle(spot)}/>
            ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Info panel — slides in beside map */}
        <div className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${
          selected ? "w-full lg:w-[300px] opacity-100" : "w-0 lg:w-0 opacity-0"
        }`}>
          {selected && (
            <div className="w-full lg:w-[300px] h-full">
              <SpotInfoPanel spot={selected} onClose={()=>setSelected(null)} inline onRefresh={() => { setSelected(null); setRefreshKey(k => k + 1); }}/>
            </div>
          )}
        </div>

      </div>
      </>}
    </div>
  );
}
