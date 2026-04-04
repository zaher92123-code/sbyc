"use client";
import { IconBoat, IconOwner, IconSessions, IconSearch, IconEmployee } from "@/components/ui/Icons";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { T } from "@/lib/i18n/translations";

export default function GlobalSearch() {
  const { lang } = useLanguage();
  const t = (key: keyof typeof T) => T[key][lang];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 280);
  }, [query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const totalResults =
    (results?.boats?.length || 0) +
    (results?.owners?.length || 0) +
    (results?.sessions?.length || 0) +
    (results?.employees?.length || 0);

  return (
    <div ref={containerRef} className="relative w-72">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><IconSearch size={16} /></span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">{t("searching")}</div>
          ) : totalResults === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              {t("noResultsFor")} &quot;{query}&quot;
            </div>
          ) : (
            <div>
              {results?.boats?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                    {t("vessels")}
                  </p>
                  {results.boats.map((b: any) => (
                    <Link key={b.id} href={`/boats/${b.id}`}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <IconBoat size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{b.registration_number}</p>
                      </div>
                      <span className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold",
                        b.status === "parked" ? "bg-teal-100 text-teal-700" :
                        b.status === "maintenance" ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                      )}>{b.status}</span>
                    </Link>
                  ))}
                </div>
              )}

              {results?.owners?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-y border-slate-100">
                    {t("owners")}
                  </p>
                  {results.owners.map((o: any) => (
                    <Link key={o.id} href={`/owners/${o.id}`}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <IconOwner size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{o.full_name}</p>
                        <p className="text-xs text-slate-400">{o.phone} · {o.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results?.sessions?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-y border-slate-100">
                    {t("activeSessionsSearch")}
                  </p>
                  {results.sessions.map((s: any) => (
                    <Link key={s.session_id} href={`/sessions/${s.session_id}`}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <IconSessions size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.boat_name}</p>
                        <p className="text-xs text-slate-400">{t("spot")} {s.spot_number} · {s.owner_name}</p>
                      </div>
                      <span className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold",
                        s.status === "overdue" ? "bg-red-100 text-red-700" :
                        s.status === "ending_soon" ? "bg-amber-100 text-amber-700" :
                        "bg-teal-100 text-teal-700"
                      )}>{s.status.replace("_", " ")}</span>
                    </Link>
                  ))}
                </div>
              )}

              {results?.employees?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-y border-slate-100">
                    {t("employees")}
                  </p>
                  {results.employees.map((e: any) => (
                    <Link key={e.id} href={`/employees/${e.id}`}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <IconEmployee size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{e.name_en}</p>
                        <p className="text-xs text-slate-400">{e.position_en}{e.phone ? ` · ${e.phone}` : ""}</p>
                      </div>
                      <span className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full font-semibold",
                        e.employment_status === "active" ? "bg-emerald-100 text-emerald-700" :
                        e.employment_status === "on_leave" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-500"
                      )}>{e.employment_status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
