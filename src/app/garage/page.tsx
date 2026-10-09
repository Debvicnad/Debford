import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Car,
  Plus,
  Wrench,
  Tag,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  Gauge,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyVehicles, isSupabaseConfigured } from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "My Digital Garage | Debford",
  description:
    "Private vehicle command center. Track service history, digital glovebox documents, maintenance intervals, and marketplace listings on Debford.",
};

export default async function GaragePage() {
  if (!isSupabaseConfigured()) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/garage");

  const { vehicles, error } = await getMyVehicles();
  const totalMileage = vehicles.reduce(
    (sum: number, v: any) => sum + (v.mileage || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#080a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── CINEMATIC GARAGE COMMAND HEADER ───────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#0a0d14]">
        {/* Hexagon & Cyan Ambient Sanctuary Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-cyan-600/8 rounded-full blur-[120px] pointer-events-none" />

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
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              DASHBOARD
            </Link>
            <span>/</span>
            <span className="text-blue-400">DIGITAL GARAGE</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-slate-300 text-[11px] font-mono tracking-widest uppercase mb-3 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PRIVATE FLEET COMMAND · ACTIVE VAULT</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Debford Digital Garage
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xl font-light leading-relaxed">
                Manage maintenance logs, vehicle registration vaults, scheduled service
                reminders, and instant marketplace consignment.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Book Service</span>
              </Link>

              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Register Vehicle</span>
              </Link>
            </div>
          </div>

          {/* Telemetry Status Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-white/8">
            {[
              {
                label: "REGISTERED FLEET",
                value: `${vehicles.length} Vehicle${vehicles.length !== 1 ? "s" : ""}`,
                icon: Car,
                color: "text-blue-400",
              },
              {
                label: "LOGGED DISTANCE",
                value: `${totalMileage.toLocaleString()} km`,
                icon: Gauge,
                color: "text-amber-400",
              },
              {
                label: "GLOVEBOX VAULT",
                value: "Encrypted & Active",
                icon: ShieldCheck,
                color: "text-emerald-400",
              },
              {
                label: "SERVICE SCHEDULE",
                value: "Intervals Synced",
                icon: Sparkles,
                color: "text-cyan-400",
              },
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
                    <div className={`text-sm font-black font-mono tracking-tight ${stat.color}`}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN VEHICLE GRID ────────────────────────────── */}
      <div className="container-debford py-12">
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Unable to stream garage database records. Verify network connection.</span>
          </div>
        )}

        {vehicles.length === 0 && !error ? (
          <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-16 text-center space-y-5 max-w-lg mx-auto my-12 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-3xl mx-auto text-blue-400">
              🏎️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Your Digital Garage is Empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                Register your personal or commercial vehicle to track maintenance intervals,
                store registration documents in your digital glovebox, or consign to the marketplace.
              </p>
            </div>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Your First Vehicle</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle: any) => {
              const primaryImage =
                vehicle.images?.find((i: any) => i.is_primary)?.url ??
                vehicle.images?.[0]?.url;

              const statusBadgeColors: Record<string, string> = {
                active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                listed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                sold: "bg-slate-500/10 text-slate-400 border-slate-500/30",
                rented: "bg-amber-500/10 text-amber-400 border-amber-500/30",
              };

              return (
                <div
                  key={vehicle.id}
                  className="rounded-3xl bg-slate-900/60 border border-white/8 overflow-hidden hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={`${vehicle.make_name} ${vehicle.model_name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                        🚗
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3.5 left-3.5 flex gap-2">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-full backdrop-blur-md ${
                          statusBadgeColors[vehicle.status] ?? statusBadgeColors.active
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>

                    {vehicle.registration_plate && (
                      <div className="absolute bottom-3.5 left-3.5">
                        <span className="font-mono text-xs font-bold bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-slate-200">
                          {vehicle.registration_plate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Specs & Quick Actions */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">
                        {vehicle.year} {vehicle.make_name} {vehicle.model_name}
                      </h3>
                      {vehicle.variant_name && (
                        <p className="text-xs font-mono text-blue-400 mt-0.5">
                          {vehicle.variant_name}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-3">
                        {vehicle.mileage && (
                          <span className="font-mono">
                            {Number(vehicle.mileage).toLocaleString()}{" "}
                            {vehicle.mileage_unit ?? "km"}
                          </span>
                        )}
                        {vehicle.color && <span>• {vehicle.color}</span>}
                        {vehicle.condition && (
                          <span>
                            • <span className="capitalize">{vehicle.condition}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-white/8">
                      <Link
                        href={`/garage/${vehicle.id}`}
                        className="py-2.5 px-3 text-xs font-semibold text-center bg-slate-950 hover:bg-slate-800 text-slate-200 rounded-xl border border-white/8 hover:border-white/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5 text-blue-400" />
                        <span>Command Hub</span>
                      </Link>

                      <Link
                        href={`/sell?vehicleId=${vehicle.id}`}
                        className="py-2.5 px-3 text-xs font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Consign / Sell</span>
                      </Link>

                      <Link
                        href={`/checkout?type=boost&id=${vehicle.id}&plan=featured`}
                        className="col-span-2 py-2 px-3 text-[11px] font-mono font-bold text-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Boost Marketplace Visibility ($9.99)</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Another Machine */}
            <Link
              href="/sell"
              className="min-h-[300px] rounded-3xl border-2 border-dashed border-white/10 hover:border-blue-500/40 hover:bg-blue-600/5 transition-all flex flex-col items-center justify-center p-8 text-center text-slate-500 hover:text-blue-400 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform text-white">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-white mb-1">Add Another Vehicle</span>
              <span className="text-xs text-slate-400 max-w-xs font-light">
                Register a new car, motorcycle, or commercial hauler to track maintenance or publish listings.
              </span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
