import type { Metadata } from "next";
import Link from "next/link";
import { getServiceRequests, getUserBookings } from "@/lib/actions/service.actions";
import { ServiceRequestsHubClient } from "@/components/services/ServiceRequestsHubClient";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import {
  Zap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Send,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Service Requests & Quotes Hub | Debford",
  description:
    "Track active automotive service requests, compare itemized quotes from certified workshops, and manage confirmed appointments.",
};

export default async function ServiceRequestsPage() {
  let user = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }
  }

  const [requests, bookings] = await Promise.all([
    getServiceRequests("all"),
    getUserBookings(),
  ]);

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── CINEMATIC REQUESTS HUB HEADER ─────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#0a0d14]">
        {/* Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="container-debford relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-3">
            <Link href="/services" className="hover:text-slate-300 transition-colors">
              SERVICES
            </Link>
            <span>/</span>
            <span className="text-blue-400">REQUESTS &amp; QUOTES HUB</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 text-[11px] font-mono tracking-widest uppercase mb-3 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>REAL-TIME QUOTE &amp; BID EXCHANGE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Service Requests &amp; Quotes Hub
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xl font-light leading-relaxed">
                Compare competitive itemized quotes from certified automotive specialists, book
                appointments with zero upfront deposit, and track progress through completion.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/services#request"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Post Service Request</span>
              </Link>

              <Link
                href="/services/providers"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span>Browse Specialists</span>
              </Link>
            </div>
          </div>

          {/* Telemetry Status Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-white/8">
            {[
              { label: "AUCTION PROTOCOL", value: "Verified Competitive Bids", icon: Zap, color: "text-amber-400" },
              { label: "DEPOSIT POLICY", value: "Zero Upfront Obligation", icon: ShieldCheck, color: "text-emerald-400" },
              { label: "AVERAGE RESPONSE", value: "< 15 Minutes Response", icon: Clock, color: "text-blue-400" },
              { label: "LIFECYCLE LOGGING", value: "Automatic Garage History", icon: CheckCircle2, color: "text-cyan-400" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-4 bg-slate-950/70 rounded-2xl border border-white/5 flex items-center gap-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className={`text-xs font-bold text-white tracking-tight`}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CLIENT HUB ───────────────────────────────── */}
      <div className="container-debford py-10">
        <ServiceRequestsHubClient
          initialRequests={requests}
          initialBookings={bookings}
        />
      </div>
    </main>
  );
}
