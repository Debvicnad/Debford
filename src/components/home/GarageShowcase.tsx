import Image from "next/image";
import Link from "next/link";
import {
  Wrench,
  FileText,
  BellRing,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

export function GarageShowcase() {
  return (
    <section className="relative py-32 bg-[#0a0d14] overflow-hidden border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-debford relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative & Feature Matrix */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase mb-4">
                <span>The Connected Ownership Hub</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Every Vehicle Has a Story.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                  Keep Yours in One Place.
                </span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
                Debford Garage is your private automotive command center. Manage your
                entire fleet—cars, motorcycles, and commercial haulers—from inspection
                to maintenance, valuation, and verified resale documentation.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Wrench,
                  title: "Service Logs & History",
                  desc: "Log maintenance, parts replacements, and verified garage receipts.",
                },
                {
                  icon: FileText,
                  title: "Digital Glovebox",
                  desc: "Store vehicle registration, title records, insurance, and inspection slips.",
                },
                {
                  icon: BellRing,
                  title: "Predictive Reminders",
                  desc: "Timely alerts for oil changes, brake pads, tire rotations, and MOT renewals.",
                },
                {
                  icon: TrendingUp,
                  title: "Market Valuation",
                  desc: "Track real-time market value and appreciation curves across your vehicles.",
                },
              ].map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/8 backdrop-blur-sm hover:border-blue-500/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <Link
                href="/garage"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 hover:shadow-blue-500/40 transition-all duration-200 group"
              >
                <span>Explore My Garage</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Sanctuary Preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-slate-900 shadow-2xl group">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/images/home/garage-interior.jpg"
                  alt="Debford Garage Architecture — Modern Private Automotive Sanctuary"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Holographic Telemetry Card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
                      GARAGE TELEMETRY · ACTIVE
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    DEBFORD OS
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      HEALTH STATUS
                    </div>
                    <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>OPTIMAL</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      NEXT SERVICE
                    </div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      4,200 KM
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      DOCUMENTS
                    </div>
                    <div className="text-xs font-bold text-blue-400 mt-0.5 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>100% VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
