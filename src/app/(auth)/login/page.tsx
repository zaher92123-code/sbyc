"use client";
import { IconAnchor, IconBoat, IconPayment, IconReports, IconBell, IconLock } from "@/components/ui/Icons";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { SITE_CONFIG } from "@/config/site";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 5;

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const remainingSeconds = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 1000) : 0;
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (isLocked) {
      setError(`Too many attempts. Try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`);
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
        setLockedUntil(lockTime);
        setError(`Account locked for ${LOCKOUT_MINUTES} minutes after ${MAX_ATTEMPTS} failed attempts.`);
        setTimeout(() => { setLockedUntil(null); setAttempts(0); }, LOCKOUT_MINUTES * 60 * 1000);
      } else {
        setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining.`);
      }
      setLoading(false);
    } else {
      setAttempts(0);
      setLockedUntil(null);
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0A1628 0%, #082832 60%, #0A1628 100%)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Wave decorations */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <svg key={i} className="absolute w-full" style={{ top: `${i * 14}%`, opacity: 0.6 }} viewBox="0 0 1200 60" preserveAspectRatio="none">
              <path d={`M0 30 Q300 ${10 + i * 3} 600 30 Q900 ${50 - i * 3} 1200 30`} stroke="#0E7490" strokeWidth="1.5" fill="none" />
            </svg>
          ))}
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="mb-6 drop-shadow-2xl flex justify-center"><IconAnchor size={80} className="text-teal-400" /></div>
          <h1 className="text-5xl font-display font-bold text-white mb-3">
            {SITE_CONFIG.companyName}
          </h1>
          <p className="text-xl text-teal-300 mb-2 font-light tracking-wide">{SITE_CONFIG.tagline}</p>
          <p className="text-slate-400 text-sm">{SITE_CONFIG.location}</p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { icon: <IconBoat size={20} className="text-teal-400" />, label: "Boat Registry" },
              { icon: <IconAnchor size={20} className="text-teal-400" />, label: "Interactive Map" },
              { icon: <IconPayment size={20} className="text-teal-400" />, label: "Payments" },
              { icon: <IconReports size={20} className="text-teal-400" />, label: "Reports" },
              { icon: <IconBell size={20} className="text-teal-400" />, label: "Reminders" },
              { icon: <IconLock size={20} className="text-teal-400" />, label: "Secure Access" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 p-4 rounded-xl" style={{ background: "rgba(14, 116, 144, 0.15)", border: "1px solid rgba(14, 116, 144, 0.3)" }}>
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-slate-300 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <IconAnchor size={32} className="text-teal-400" />
            <h1 className="text-2xl font-display font-bold text-white mt-2">{SITE_CONFIG.companyFullName}</h1>
          </div>

          <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-8">Sign in to your marina account</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@alseebboatclub.om"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#fca5a5" }}>
                  <span className="flex items-center gap-1.5"><IconWarning size={14} />{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isLocked}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0E7490 0%, #0369a1 100%)", boxShadow: "0 4px 16px rgba(14, 116, 144, 0.4)" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                    Signing in…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs text-slate-500 text-center">
                Access restricted to authorized marina staff only.<br />
                Contact your system administrator for access.
              </p>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            © {new Date().getFullYear()} Al Seeb Boat Club · Muscat, Oman
          </p>
        </div>
      </div>
    </div>
  );
}
