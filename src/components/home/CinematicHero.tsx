import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Warehouse, Compass } from "lucide-react";
import { HeroVideo } from "./HeroVideo";

interface CinematicHeroProps {
  userInitial?: string | null;
}

export function CinematicHero({ userInitial }: CinematicHeroProps) {
  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background Media Engine */}
      <HeroVideo />

      {/* Atmospheric Vignette & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/75 via-transparent to-[#0a0d14] pointer-events-none z-10" />

      {/* Hero Foreground Content */}
      <div className="container-debford relative z-20 w-full pt-12 md:pt-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Automotive Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/12 backdrop-blur-md mb-8 animate-fade-in shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-xs uppercase tracking-[0.22em] text-slate-300 font-semibold">
              Welcome to Debford
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-xs text-blue-400 font-mono tracking-wider">
              EST. 2026
            </span>
          </div>

          {/* Editorial Display Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.04] mb-6 drop-shadow-2xl">
            Your Automotive World.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-amber-300">
              Beyond the Ordinary.
            </span>
          </h1>

          {/* Supporting Narrative */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed drop-shadow-md">
            Discover, buy, sell, rent, and care for cars, motorcycles, and
            trucks—all in one connected, high-performance automotive ecosystem.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/vehicles"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold text-sm tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Compass className="w-4 h-4 text-blue-200" />
              <span>Explore Vehicles</span>
              <ArrowUpRight className="w-4 h-4 text-blue-200" />
            </Link>

            <Link
              href="/garage"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-slate-200 font-semibold text-sm tracking-wide bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-white/30 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Warehouse className="w-4 h-4 text-amber-400" />
              <span>Enter Debford Garage</span>
            </Link>
          </div>

          {/* Telemetry Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-white/10">
            {[
              {
                label: "ECOSYSTEM",
                val: "Cars · Bikes · Trucks",
                icon: "⚡",
              },
              {
                label: "AUTHENTICITY",
                val: "Verified Providers",
                icon: "🛡️",
              },
              {
                label: "GARAGE SUITE",
                val: "Lifecycle Tracking",
                icon: "🏎️",
              },
              {
                label: "AUCTIONS & MARKET",
                val: "Live Transparent Bidding",
                icon: "🔨",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm text-left flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1">
                  <span>{item.label}</span>
                  <span>{item.icon}</span>
                </div>
                <div className="text-xs font-semibold text-white tracking-tight">
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refined Cinematic Scroll Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none opacity-60">
        <span className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase">
          Scroll to explore
        </span>
        <div className="w-[1.5px] h-8 bg-gradient-to-b from-blue-400 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
