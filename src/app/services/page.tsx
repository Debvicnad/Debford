import type { Metadata } from "next";
import Link from "next/link";
import {
  Wrench,
  Zap,
  Cpu,
  Car,
  Disc,
  Sparkles,
  Palette,
  Flame,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Star,
  ArrowRight,
  ArrowUpRight,
  Send,
  SlidersHorizontal,
  FileCheck2,
} from "lucide-react";
import { ServiceRequestWizard } from "@/components/services/ServiceRequestWizard";
import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Automotive Services & Specialist Hub | Debford",
  description:
    "Connect with accredited automotive technicians, master diagnosticians, detailing studios, and performance tuners for cars, motorcycles, and trucks.",
};

const FEATURED_PROVIDERS = [
  {
    id: "sp1",
    name: "AutoCare Pro NYC",
    type: "Master Mechanic & Diagnostics",
    rating: 4.9,
    reviews: 312,
    price: "From $80",
    location: "Brooklyn, NY",
    badges: ["Verified Pro", "Top Rated"],
    specialties: ["Engine Rebuilds", "Performance Brakes", "Suspension", "OEM Oil Service"],
    initials: "AC",
  },
  {
    id: "sp2",
    name: "EliteBody & Paint",
    type: "Body, Paint & Carbon Studio",
    rating: 4.8,
    reviews: 187,
    price: "From $200",
    location: "Queens, NY",
    badges: ["Verified Pro", "Featured Studio"],
    specialties: ["Precision Dent Repair", "Full Respray", "PPF Clear Bra", "Ceramic Coating"],
    initials: "EB",
  },
  {
    id: "sp3",
    name: "TurboTech Performance",
    type: "Dyno Tuning & Engine Overhauls",
    rating: 5.0,
    reviews: 94,
    price: "From $350",
    location: "Manhattan, NY",
    badges: ["Verified Pro", "Factory Trained"],
    specialties: ["Custom ECU Mapping", "Exhaust Fabrication", "Track Suspension", "AWD Dyno"],
    initials: "TT",
  },
  {
    id: "sp4",
    name: "ShineDetail Studio",
    type: "Concours Detailing & Valeting",
    rating: 4.9,
    reviews: 408,
    price: "From $120",
    location: "Bronx, NY",
    badges: ["Verified Pro"],
    specialties: ["Multi-Stage Paint Correction", "Ceramic Pro", "Self-Healing PPF", "Interior Restoration"],
    initials: "SD",
  },
];

const SERVICE_CATEGORIES = [
  { icon: Wrench, label: "Mechanic", count: 142, href: "/services/providers?category=mechanic", desc: "Engine, transmission, brakes & routine" },
  { icon: Zap, label: "Auto Electrician", count: 67, href: "/services/providers?category=diagnostic", desc: "Wiring harnesses, alternators & EV" },
  { icon: Cpu, label: "Diagnostics", count: 89, href: "/services/providers?category=diagnostic", desc: "OBD-II, ECU scanning & fault tracking" },
  { icon: Car, label: "Body & Paint", count: 54, href: "/services/providers?category=bodywork", desc: "Respraying, panel beating & PPF" },
  { icon: Disc, label: "Tires & Wheels", count: 78, href: "/services/providers?category=mechanic", desc: "Mounting, balancing & track geometry" },
  { icon: Sparkles, label: "Detailing", count: 203, href: "/services/providers?category=detailing", desc: "Ceramic coats, paint correction & valet" },
  { icon: Palette, label: "Customisation", count: 31, href: "/services/providers?category=performance", desc: "Wraps, aero kits, interiors & lighting" },
  { icon: Flame, label: "Performance", count: 22, href: "/services/providers?category=performance", desc: "ECU tunes, forced induction & exhausts" },
];

export default async function ServicesPage() {
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

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── CINEMATIC SERVICES HERO ───────────────────────── */}
      <div className="relative pt-28 pb-16 overflow-hidden border-b border-white/8 bg-[#0a0d14]">
        {/* Background Glows & Grid */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[300px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="container-debford relative z-10">
          <div className="max-w-3xl">
            {/* Telemetry Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/12 backdrop-blur-md mb-6 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
                DEBFORD SERVICE NETWORK · CERTIFIED WORKSHOPS
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] mb-5">
              Precision Care.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-300 to-amber-300">
                Uncompromised Engineering.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed mb-8 max-w-2xl">
              Connect directly with verified independent workshops, mobile mechanics,
              paint studios, and tuning houses. Submit requirements, receive competitive
              itemized quotes, and automatically record verified service logs in your Garage.
            </p>

            <div className="flex flex-wrap gap-3.5">
              <Link
                href="#request"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Request a Service</span>
              </Link>

              <Link
                href="/services/requests"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:text-white text-xs sm:text-sm font-semibold backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>⚡</span>
                <span>Requests &amp; Quotes Hub</span>
              </Link>

              <Link
                href="/services/providers"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/12 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span>Browse Specialists</span>
              </Link>
            </div>
          </div>

          {/* Telemetry Status Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 pt-8 border-t border-white/8">
            {[
              { label: "QUOTE TURNAROUND", val: "< 15 Min Avg Response", icon: Clock },
              { label: "ACCREDITATION", val: "100% Vetted Technicians", icon: ShieldCheck },
              { label: "BILLING INTEGRITY", val: "Itemized Parts & Labor", icon: FileCheck2 },
              { label: "GARAGE SYNC", val: "Auto-Logged Service History", icon: CheckCircle2 },
            ].map((stat) => {
              const IconComp = stat.icon;
              return (
                <div key={stat.label} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">{stat.label}</div>
                    <div className="text-xs font-semibold text-white tracking-tight">{stat.val}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-debford py-16 space-y-16">
        {/* ── LIVE QUOTES HUB CALLOUT BANNER ──────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-950 border border-blue-500/25 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-2xl shrink-0 shadow-lg shadow-blue-600/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-lg font-bold text-white">Live Requests &amp; Quotes Hub</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME BIDDING
                </span>
              </div>
              <p className="text-sm text-slate-300 max-w-2xl font-light leading-relaxed">
                Review incoming bids from vetted workshops, compare breakdown of parts vs. labor costs,
                and authorize work with instant digital booking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/services/requests"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Open Requests Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── BROWSE BY SERVICE CATEGORIES ───────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-1">
                Specializations
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Browse by Automotive Service
              </h2>
            </div>
            <Link
              href="/services/providers"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <span>All disciplines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group p-5 rounded-2xl bg-slate-900/60 border border-white/8 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                      {cat.count} Pros
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── HOW THE SERVICE ENGINE WORKS ───────────────── */}
        <div className="py-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-2">
              Transparent Lifecycle
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How the Debford Service Network Operates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: "01",
                title: "Detail Your Requirements",
                desc: "Specify your vehicle make, model, service category, urgency, and optional photos.",
              },
              {
                n: "02",
                title: "Receive Verified Quotes",
                desc: "Independent certified shops in your radius review and submit itemized parts & labor bids.",
              },
              {
                n: "03",
                title: "Approve & Schedule",
                desc: "Review mechanic reputations, past client ratings, and confirm booking slot.",
              },
              {
                n: "04",
                title: "Automatic Garage Log",
                desc: "Completed service records and receipts automatically sync to your vehicle's digital glovebox.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="p-6 rounded-2xl bg-slate-900/40 border border-white/8 backdrop-blur-sm relative flex flex-col justify-between"
              >
                <div className="text-3xl font-black font-mono text-white/15 mb-4">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOP SPECIALISTS NEAR YOU ───────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-mono tracking-widest text-blue-400 uppercase mb-1">
                Accredited Specialists
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Top Rated Workplaces Near You
              </h2>
            </div>
            <Link
              href="/services/providers"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <span>View full directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURED_PROVIDERS.map((p) => (
              <Link
                key={p.id}
                href={`/services/${p.id}`}
                className="group p-6 rounded-3xl bg-slate-900/60 border border-white/8 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-600/30 shrink-0">
                      {p.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                          {p.name}
                        </h3>
                        {p.badges.map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-400 font-light">
                        {p.type} · 📍 {p.location}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-white">{p.rating}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{p.reviews} reviews</div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.specialties.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 text-[11px] text-slate-300 bg-slate-950 border border-white/8 rounded-lg"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/8 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Baseline Rate</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{p.price}</span>
                  </div>

                  <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                    <span>View Workshop Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── SERVICE REQUEST WIZARD ─────────────────────── */}
        <div id="request" className="scroll-mt-24 pt-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-white/12 backdrop-blur-xl shadow-2xl max-w-3xl mx-auto">
            <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl">
                📝
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Dispatch a Service Request</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Receive verified competitive quotes from nearby specialists
                </p>
              </div>
            </div>

            <ServiceRequestWizard />
          </div>
        </div>
      </div>
    </main>
  );
}
