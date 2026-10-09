"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle2,
  Car,
  Gavel,
  Wrench,
  Sparkles,
} from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  // Hide on dedicated full-screen interactive routes
  if (
    pathname.startsWith("/sell") ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/messages")
  ) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#05070a] border-t border-white/8 pt-20 pb-24 lg:pb-12 text-slate-300">
      <div className="container-debford">
        {/* Top Newsletter & Concierge Dispatch Ribbon */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-purple-950/20 border border-white/8 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono uppercase tracking-wider font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Private Dispatch &amp; VIP Consignments</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Stay Ahead of Rare Drops &amp; Live Arenas
              </h2>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Receive curated supercar allocations, off-market commercial disposals, and verified auction countdown bulletins directly to your inbox.
              </p>
            </div>

            <div className="w-full lg:w-auto min-w-[320px] max-w-md">
              {subscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>VIP subscription active. You are registered for private market alerts.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your VIP email address…"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
              <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2.5">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-600" /> Zero spam
                </span>
                <span>•</span>
                <span>Unsubscribe anytime</span>
                <span>•</span>
                <span>Escrow privacy guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Column Navigation Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <span className="text-white font-extrabold text-sm tracking-tighter">D</span>
              </div>
              <span className="text-white font-black text-xl tracking-tight">DEBFORD</span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6 font-light">
              The premier digital ecosystem for high-performance supercars, collector machines,
              commercial fleet management, and certified automotive artisans.
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>GLOBAL PLATFORM STATUS: OPERATIONAL</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Escrow Insured
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> Multi-Currency Ready
                </span>
              </div>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5 font-bold">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Marketplace</span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/vehicles" className="text-slate-400 hover:text-white transition-colors">
                  Browse All Vehicles
                </Link>
              </li>
              <li>
                <Link href="/vehicles?bodyType=Coupe" className="text-slate-400 hover:text-white transition-colors">
                  Supercars &amp; GTs
                </Link>
              </li>
              <li>
                <Link href="/vehicles?bodyType=Motorcycle" className="text-slate-400 hover:text-white transition-colors">
                  Collector Motorcycles
                </Link>
              </li>
              <li>
                <Link href="/vehicles?bodyType=Truck" className="text-slate-400 hover:text-white transition-colors">
                  Commercial Fleet
                </Link>
              </li>
              <li>
                <Link href="/rentals" className="text-slate-400 hover:text-white transition-colors">
                  Luxury Rentals
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-slate-400 hover:text-white transition-colors">
                  Compare Specs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Live Arenas & Auctions */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5 font-bold">
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
              <span>Auctions</span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/auctions?tab=live" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>Live Bidding Arenas</span>
                </Link>
              </li>
              <li>
                <Link href="/auctions?tab=upcoming" className="text-slate-400 hover:text-white transition-colors">
                  Upcoming Catalog
                </Link>
              </li>
              <li>
                <Link href="/auctions?tab=ended" className="text-slate-400 hover:text-white transition-colors">
                  Past Auction Results
                </Link>
              </li>
              <li>
                <Link href="/auctions/create" className="text-slate-400 hover:text-white transition-colors">
                  Launch Consignment
                </Link>
              </li>
              <li>
                <Link href="/auctions/manage" className="text-slate-400 hover:text-white transition-colors">
                  Operator Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services & Ownership */}
          <div>
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5 font-bold">
              <Wrench className="w-3.5 h-3.5 text-sky-400" />
              <span>Services &amp; Garage</span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services" className="text-slate-400 hover:text-white transition-colors">
                  Certified Workshops
                </Link>
              </li>
              <li>
                <Link href="/services/providers" className="text-slate-400 hover:text-white transition-colors">
                  Provider Directory
                </Link>
              </li>
              <li>
                <Link href="/parts" className="text-slate-400 hover:text-white transition-colors">
                  OEM &amp; Performance Parts
                </Link>
              </li>
              <li>
                <Link href="/customisation" className="text-slate-400 hover:text-white transition-colors">
                  Bespoke Studio
                </Link>
              </li>
              <li>
                <Link href="/garage" className="text-slate-400 hover:text-white transition-colors">
                  My Digital Glovebox
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="text-slate-400 hover:text-white transition-colors">
                  Activity Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-white/6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Debford Automotive Technologies Ltd. All rights reserved.</p>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Owner Console
            </Link>
            <Link href="/membership" className="hover:text-slate-300 transition-colors">
              Membership VIP
            </Link>
            <Link href="/verification" className="hover:text-slate-300 transition-colors">
              Dealer Verification
            </Link>
            <Link href="/ai" className="hover:text-slate-300 transition-colors">
              DEBA AI Assistant
            </Link>
            <Link href="/admin" className="hover:text-slate-300 transition-colors">
              Operator Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
