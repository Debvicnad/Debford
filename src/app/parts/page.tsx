import type { Metadata } from "next";
import Link from "next/link";
import { PartsClient } from "@/components/parts/PartsClient";
import { ShieldCheck, Truck, RotateCcw, Wrench, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Auto Parts Marketplace & OEM Spares — Debford",
  description: "Shop genuine, OEM, and aftermarket auto parts with 100% vehicle fitment guarantee, fast shipping, and verified seller protection on Debford.",
};

export default function PartsPage() {
  return (
    <div className="min-h-screen surface-base">
      {/* Hero Header */}
      <div className="relative overflow-hidden surface-raised border-b border-subtle pt-10 pb-12">
        <div className="absolute inset-0 gradient-hero opacity-75" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-debford relative z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-300">Parts Marketplace</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Guaranteed Fitment or Your Money Back</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
                Auto Parts & Performance
              </h1>
              <p className="text-slate-400 text-base sm:text-lg">
                Discover OEM genuine replacements, performance upgrades, and tested pre-owned spares from certified merchants worldwide.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="px-5 py-3 glass border border-white/15 text-slate-200 text-xs font-bold rounded-xl hover:border-white/30 hover:text-white transition-all flex items-center gap-2 shadow-lg"
              >
                <span>View My Cart</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services/request"
                className="px-5 py-3 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all"
              >
                Request Hard-to-Find Part
              </Link>
            </div>
          </div>

          {/* Quick Perks Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Free Express Delivery on orders over $150</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Guaranteed Direct-Fit or Free Return</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
              <span>30-Day Hassle-Free Replacement Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="container-debford py-10">
        <PartsClient />
      </div>
    </div>
  );
}
