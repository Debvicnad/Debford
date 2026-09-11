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
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyVehicles, isSupabaseConfigured } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "My Digital Garage | DEBFORD",
  description: "Track your vehicles, service history, maintenance records, and listings on DEBFORD.",
};

export default async function GaragePage() {
  if (!isSupabaseConfigured()) redirect("/dashboard");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/garage");

  const { vehicles, error } = await getMyVehicles();

  const totalMileage = vehicles.reduce((sum: number, v: any) => sum + (v.mileage || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      {/* Top Banner Header */}
      <div className="bg-[#0d121d] border-b border-white/5">
        <div className="container-debford py-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-slate-300 font-medium">Digital Garage</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    My Digital Garage
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Manage maintenance logs, document vaults, service reminders, and marketplace listings.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/services"
                className="px-4 py-2.5 bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                <span>Book Service</span>
              </Link>
              <Link
                href="/sell"
                className="px-4 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Fleet Size", value: `${vehicles.length} Vehicles`, icon: Car },
              { label: "Total Distance", value: `${totalMileage.toLocaleString()} km`, icon: Calendar },
              { label: "Marketplace Status", value: "Verified Vault", icon: ShieldCheck },
              { label: "Upcoming Services", value: "All Clear", icon: Sparkles },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-3.5 bg-[#131b2e]/60 rounded-2xl border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
                    <div className="text-xs font-bold text-white">{stat.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container-debford py-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Failed to load vehicles from database. Please verify your connection.</span>
          </div>
        )}

        {vehicles.length === 0 && !error ? (
          <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-16 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl mx-auto text-blue-400">
              🏠
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Your garage is currently empty</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add your personal or dealership vehicles to track oil changes, brake services, upload registration documents, or list them for sale.
              </p>
            </div>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Vehicle</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle: any) => {
              const primaryImage =
                vehicle.images?.find((i: any) => i.is_primary)?.url ?? vehicle.images?.[0]?.url;

              const statusBadgeColors: Record<string, string> = {
                active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                listed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                sold: "bg-slate-500/10 text-slate-400 border-slate-500/30",
                rented: "bg-amber-500/10 text-amber-400 border-amber-500/30",
              };

              return (
                <div
                  key={vehicle.id}
                  className="bg-[#0d121d] rounded-3xl border border-white/5 overflow-hidden hover:border-white/15 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 flex flex-col group"
                >
                  {/* Image container */}
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-900 to-black overflow-hidden">
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

                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold border rounded-xl backdrop-blur-md capitalize ${
                          statusBadgeColors[vehicle.status] ?? statusBadgeColors.active
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>

                    {vehicle.registration_plate && (
                      <div className="absolute bottom-3 left-3">
                        <span className="font-mono text-[11px] font-bold bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-slate-200">
                          {vehicle.registration_plate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                          {vehicle.year} {vehicle.make_name} {vehicle.model_name}
                        </h3>
                      </div>
                      {vehicle.variant_name && (
                        <p className="text-xs text-slate-400 mb-2">{vehicle.variant_name}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        {vehicle.mileage && (
                          <span>{Number(vehicle.mileage).toLocaleString()} {vehicle.mileage_unit ?? "km"}</span>
                        )}
                        {vehicle.color && <span>• {vehicle.color}</span>}
                        {vehicle.condition && <span>• <span className="capitalize">{vehicle.condition}</span></span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <Link
                        href={`/garage/${vehicle.id}`}
                        className="py-2.5 px-3 text-xs font-semibold text-center bg-[#131b2e] hover:bg-white/10 text-slate-200 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-1"
                      >
                        <Wrench className="w-3 h-3 text-blue-400" />
                        <span>Maintenance</span>
                      </Link>

                      <Link
                        href={`/sell?vehicleId=${vehicle.id}`}
                        className="py-2.5 px-3 text-xs font-bold text-center gradient-brand text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
                      >
                        <Tag className="w-3 h-3" />
                        <span>List Vehicle</span>
                      </Link>

                      <Link
                        href={`/checkout?type=boost&id=${vehicle.id}&plan=featured`}
                        className="col-span-2 py-2 px-3 text-[11px] font-bold text-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-xl border border-blue-500/20 transition-all flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>Boost Listing Visibility ($9.99)</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Vehicle Card */}
            <Link
              href="/sell"
              className="min-h-[300px] bg-[#0d121d]/40 rounded-3xl border-2 border-dashed border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center p-8 text-center text-slate-500 hover:text-blue-400 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform text-white">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-white mb-1">Add Another Vehicle</span>
              <span className="text-xs text-slate-500 max-w-xs">
                Register a new car, bike, or truck to track maintenance or publish listings.
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
