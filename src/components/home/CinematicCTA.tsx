import Link from "next/link";
import { ArrowUpRight, PlusCircle, Compass } from "lucide-react";

export function CinematicCTA() {
  return (
    <section className="relative py-32 bg-[#080a0f] overflow-hidden border-t border-white/10">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-debford relative z-10">
        <div className="relative rounded-3xl p-10 sm:p-16 lg:p-20 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border border-white/15 shadow-2xl overflow-hidden text-center">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-widest uppercase mb-6">
              <span>Ready for the road</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
              Your Next Journey Starts Here.
            </h2>

            <p className="text-base sm:text-xl text-slate-300 font-light mb-10 leading-relaxed max-w-2xl mx-auto">
              Discover the vehicles, services, auctions, and possibilities waiting
              for you at Debford. Join private owners, collectors, and verified
              dealers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/vehicles"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Compass className="w-4 h-4 text-blue-200" />
                <span>Explore Debford</span>
                <ArrowUpRight className="w-4 h-4 text-blue-200" />
              </Link>

              <Link
                href="/sell"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-slate-200 font-semibold text-sm bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>List Your Vehicle</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
