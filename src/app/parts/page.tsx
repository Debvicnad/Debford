import type { Metadata } from "next";
import Link from "next/link";
import { PartsClient } from "@/components/parts/PartsClient";
import { Navbar } from "@/components/layout/Navbar";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Package,
  Zap,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "OEM & Performance Parts Marketplace — Debford",
  description:
    "Shop genuine OEM, performance, and aftermarket auto parts with 100% vehicle fitment guarantee, fast express shipping, and verified seller protection on Debford.",
};

const TELEMETRY = [
  { label: "Parts In Stock", value: "12,400+", icon: Package, color: "text-blue-400" },
  { label: "Verified Sellers", value: "340+", icon: Award, color: "text-purple-400" },
  { label: "Fitment Guarantee", value: "100%", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Express Dispatch", value: "24h", icon: Zap, color: "text-amber-400" },
];

export default function PartsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* Cinematic Hero Header */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Ambient background layers */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #06090e 0%, #0a0f1d 50%, #06090e 100%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[700px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(99,102,241,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(16,185,129,0.05) 0%, transparent 70%)",
          }}
        />
        {/* Fine scan-line grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="container-debford relative z-10 pt-12 pb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(148,163,184,0.6)" }}>
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" style={{ color: "rgba(148,163,184,0.3)" }} />
            <span className="text-slate-300 font-semibold">Parts Marketplace</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              {/* System badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border"
                style={{
                  backgroundColor: "rgba(99,102,241,0.1)",
                  borderColor: "rgba(99,102,241,0.25)",
                  color: "#a5b4fc",
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OEM · Performance · Aftermarket · Pre-Owned Spares</span>
              </div>

              <h1
                className="font-black tracking-tight mb-4"
                style={{ fontSize: "clamp(2rem,5vw,3.25rem)", color: "#f8fafc", lineHeight: 1.05 }}
              >
                Parts &amp;{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #818cf8 0%, #38bdf8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Components
                </span>{" "}
                Vault
              </h1>

              <p className="text-base leading-relaxed" style={{ color: "rgba(148,163,184,0.8)" }}>
                Source genuine OEM replacements, high-performance upgrades, and rigorously tested pre-owned
                components from our global network of certified merchants — with guaranteed direct-fit or
                your money back.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/cart"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                }}
              >
                <Package className="w-4 h-4" />
                <span>My Cart</span>
              </Link>
              <Link
                href="/services/request"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                  color: "#fff",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
                }}
              >
                <span>Request Hard-to-Find Part →</span>
              </Link>
            </div>
          </div>

          {/* Telemetry ribbon */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10 pt-8 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {TELEMETRY.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className="flex items-center gap-3 p-4 rounded-2xl border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <Icon className={`w-4 h-4 ${t.color}`} />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white">{t.value}</div>
                    <div className="text-[11px] font-semibold" style={{ color: "rgba(148,163,184,0.6)" }}>
                      {t.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust perks strip */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { icon: Truck, label: "Free Express Delivery on orders over $150", color: "text-blue-400" },
              { icon: ShieldCheck, label: "Guaranteed Direct-Fit or Free Return", color: "text-emerald-400" },
              { icon: RotateCcw, label: "30-Day Hassle-Free Replacement Policy", color: "text-purple-400" },
            ].map((perk) => {
              const Icon = perk.icon;
              return (
                <div key={perk.label} className="flex items-center gap-2 text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
                  <Icon className={`w-4 h-4 ${perk.color} shrink-0`} />
                  <span>{perk.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Catalog */}
      <div className="container-debford py-10">
        <PartsClient />
      </div>
    </div>
  );
}
