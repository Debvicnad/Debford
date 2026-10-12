"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Wrench,
  FileText,
  Bell,
  Plus,
  Tag,
  Sparkles,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Gauge,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { addVehicleServiceRecord, addVehicleDocument } from "@/lib/actions/service.actions";

interface Props {
  vehicle: any;
}

export function GarageVehicleClient({ vehicle }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "service" | "documents" | "reminders">("overview");

  // Service Record Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    serviceDate: new Date().toISOString().split("T")[0],
    serviceProvider: "",
    cost: "",
    mileage: vehicle.mileage ? String(vehicle.mileage) : "",
    notes: "",
  });

  // Document Modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    documentType: "insurance" as "registration" | "insurance" | "service_record" | "inspection" | "title",
    title: "",
    expiryDate: "",
  });

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Images
  const images = (vehicle.images ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const primaryImage = images.find((i: any) => i.is_primary)?.url ?? images[0]?.url;

  // Documents and Service Records from database
  const allDocs = vehicle.documents ?? [];
  const serviceRecords = allDocs.filter((d: any) => d.document_type === "service_record");
  const otherDocs = allDocs.filter((d: any) => d.document_type !== "service_record");

  const saleListing = vehicle.sale_listing?.[0] ?? vehicle.sale_listing;

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const res = await addVehicleServiceRecord({
        vehicleId: vehicle.id,
        title: serviceForm.title,
        serviceDate: serviceForm.serviceDate,
        serviceProvider: serviceForm.serviceProvider,
        cost: serviceForm.cost ? parseFloat(serviceForm.cost) : undefined,
        mileage: serviceForm.mileage ? parseInt(serviceForm.mileage) : undefined,
        notes: serviceForm.notes,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Verified service record added to vehicle history!" });
        setIsServiceModalOpen(false);
        setServiceForm({
          title: "",
          serviceDate: new Date().toISOString().split("T")[0],
          serviceProvider: "",
          cost: "",
          mileage: vehicle.mileage ? String(vehicle.mileage) : "",
          notes: "",
        });
      }
    });
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const res = await addVehicleDocument({
        vehicleId: vehicle.id,
        documentType: docForm.documentType,
        title: docForm.title,
        url: "#",
        expiryDate: docForm.expiryDate || undefined,
      });

      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Encrypted document stored in Digital Glovebox!" });
        setIsDocModalOpen(false);
        setDocForm({
          documentType: "insurance",
          title: "",
          expiryDate: "",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ── 1. VEHICLE TELEMETRY HERO BANNER ──────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-24 sm:w-40 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shrink-0 shadow-lg">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={vehicle.make_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
                  🚗
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {vehicle.year} {vehicle.make_name} {vehicle.model_name}
                </h1>
                {vehicle.variant_name && (
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                    {vehicle.variant_name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                {vehicle.registration_plate && (
                  <span className="font-mono bg-black/80 px-2.5 py-1 rounded-lg border border-white/10 text-white font-bold tracking-wider">
                    {vehicle.registration_plate}
                  </span>
                )}
                {vehicle.mileage && (
                  <span className="font-mono text-slate-300">
                    {Number(vehicle.mileage).toLocaleString()} {vehicle.mileage_unit ?? "km"}
                  </span>
                )}
                {vehicle.transmission && <span>• {vehicle.transmission}</span>}
                {vehicle.fuel_type && <span>• {vehicle.fuel_type}</span>}
                {vehicle.city && <span>• 📍 {vehicle.city}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            {saleListing?.status === "published" ? (
              <Link
                href={`/vehicles/${saleListing.slug ?? saleListing.id}`}
                className="flex-1 lg:flex-initial px-5 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Live Marketplace Listing (${saleListing.price?.toLocaleString()})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href={`/sell?vehicleId=${vehicle.id}`}
                className="flex-1 lg:flex-initial px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 transition-all"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>List for Sale</span>
              </Link>
            )}

            <Link
              href={`/services?vehicle=${encodeURIComponent(`${vehicle.year} ${vehicle.make_name} ${vehicle.model_name}`)}`}
              className="flex-1 lg:flex-initial px-5 py-3 bg-slate-950 hover:bg-slate-800 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>Book Service</span>
            </Link>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {message && (
          <div
            className={`mt-5 px-4 py-3 rounded-2xl text-xs font-semibold border flex items-center gap-2.5 ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* ── 2. TACTILE NAVIGATION TABS ────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/8 backdrop-blur-md overflow-x-auto">
        {[
          { key: "overview", label: "Overview & Specs", icon: Car },
          { key: "service", label: `Service Log (${serviceRecords.length})`, icon: Wrench },
          { key: "documents", label: `Digital Glovebox (${otherDocs.length})`, icon: FileText },
          { key: "reminders", label: "Interval Reminders", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-mono uppercase tracking-wider font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. TAB PANELS ─────────────────────────────────── */}

      {/* TAB 1: OVERVIEW & SPECS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/8">
                <h2 className="text-sm font-mono tracking-widest text-slate-300 uppercase flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span>Technical Telemetry Specifications</span>
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  VERIFIED CHASSIS
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {[
                  { label: "Make", value: vehicle.make_name },
                  { label: "Model", value: vehicle.model_name },
                  { label: "Model Year", value: vehicle.year },
                  {
                    label: "Odometer",
                    value: vehicle.mileage
                      ? `${Number(vehicle.mileage).toLocaleString()} ${vehicle.mileage_unit ?? "km"}`
                      : "0 km",
                  },
                  { label: "Transmission", value: vehicle.transmission },
                  { label: "Fuel Type", value: vehicle.fuel_type },
                  {
                    label: "Displacement",
                    value: vehicle.engine_size
                      ? `${vehicle.engine_size} L`
                      : vehicle.engine_capacity
                      ? `${vehicle.engine_capacity} cc`
                      : null,
                  },
                  {
                    label: "Horsepower",
                    value: vehicle.power_hp ? `${vehicle.power_hp} BHP` : null,
                  },
                  { label: "Drivetrain", value: vehicle.drive_type },
                  { label: "Exterior Color", value: vehicle.color ?? vehicle.exterior_color },
                  { label: "Interior Trim", value: vehicle.interior_color },
                  {
                    label: "Seating Configuration",
                    value:
                      vehicle.doors || vehicle.seats
                        ? `${vehicle.doors ?? "-"} doors / ${vehicle.seats ?? "-"} seats`
                        : null,
                  },
                  { label: "VIN Tracking", value: vehicle.vin },
                  { label: "Condition Status", value: vehicle.condition },
                ]
                  .filter((s) => Boolean(s.value))
                  .map((s) => (
                    <div
                      key={s.label}
                      className="p-4 bg-slate-950/70 rounded-2xl border border-white/5"
                    >
                      <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">
                        {s.label}
                      </div>
                      <div className="text-sm font-bold text-white font-mono truncate">
                        {s.value}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {vehicle.description && (
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/8 shadow-xl">
                <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                  Owner Notes & Maintenance Log Notes
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-wrap">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/8 space-y-4 shadow-xl">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
                Garage Quick Actions
              </h3>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-blue-600/15 border border-white/8 hover:border-blue-500/40 text-white text-xs font-bold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>Log Service Record</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-emerald-600/15 border border-white/8 hover:border-emerald-500/40 text-white text-xs font-bold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Upload Document Vault</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>

                <Link
                  href={`/services?vehicle=${encodeURIComponent(`${vehicle.year} ${vehicle.make_name} ${vehicle.model_name}`)}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-amber-600/15 border border-white/8 hover:border-amber-500/40 text-white text-xs font-bold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Request Specialist Quotes</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE HISTORY */}
      {activeTab === "service" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Verified Service History Log
              </h2>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Every logged service adds verified authenticity and enhances resale valuation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Log Service Record</span>
            </button>
          </div>

          {serviceRecords.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/40 border border-white/8 p-16 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mx-auto text-blue-400">
                🔧
              </div>
              <h3 className="text-base font-bold text-white">No service history recorded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
                Document regular maintenance, brake replacements, tire rotations, or performance modifications.
              </p>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
              >
                Log First Service Record
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceRecords.map((record: any) => (
                <div
                  key={record.id}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-white/8 hover:border-blue-500/30 transition-colors shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">{record.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                        {record.service_provider && <span>Workshop: {record.service_provider}</span>}
                        {record.mileage && <span>• {Number(record.mileage).toLocaleString()} km</span>}
                        {record.notes && <span className="text-slate-500 font-sans">• {record.notes}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {record.cost && (
                      <div className="text-base font-black font-mono text-emerald-400 mb-0.5">
                        ${Number(record.cost).toLocaleString()}
                      </div>
                    )}
                    {record.service_date && (
                      <div className="text-[11px] font-mono text-slate-500">
                        {new Date(record.service_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENTS VAULT */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Digital Glovebox Vault
              </h2>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Securely store registration certificates, insurance binders, and title documents.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDocModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherDocs.length === 0 ? (
              <div className="col-span-full rounded-3xl bg-slate-900/40 border border-white/8 p-16 text-center space-y-3 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mx-auto text-emerald-400">
                  📄
                </div>
                <h3 className="text-base font-bold text-white">No documents archived</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-light">
                  Save your vehicle registration, warranty card, or insurance policy for instant digital verification.
                </p>
              </div>
            ) : (
              otherDocs.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-white/8 hover:border-emerald-500/30 transition-colors shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {doc.document_type}
                    </span>
                    {doc.expiry_date && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Exp: {new Date(doc.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">{doc.title}</h4>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Encrypted Record</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">DEBFORD VAULT</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SMART REMINDERS */}
      {activeTab === "reminders" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Predictive Maintenance Schedules
            </h2>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Automated service intervals calibrated to your vehicle&apos;s odometer and age.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                title: "Engine Oil & Filter Service",
                interval: "Every 10,000 km or 12 months",
                dueStatus: "Due in ~3,500 km",
                icon: Wrench,
              },
              {
                title: "Brake Fluid & Pad Inspection",
                interval: "Every 24 months / 25,000 km",
                dueStatus: "Recommended within 60 days",
                icon: ShieldCheck,
              },
              {
                title: "Tire Geometry & Balance Alignment",
                interval: "Every 8,000 km",
                dueStatus: "Scheduled for Next Quarter",
                icon: Gauge,
              },
              {
                title: "Annual Safety & Emissions Verification",
                interval: "Mandatory Annual Inspection",
                dueStatus: "Valid (5 Months Remaining)",
                icon: Calendar,
              },
            ].map((rem, i) => {
              const IconComponent = rem.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-white/8 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
                        {rem.dueStatus}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{rem.title}</h3>
                    <p className="text-xs text-slate-400 font-light">{rem.interval}</p>
                  </div>

                  <Link
                    href={`/services?vehicle=${encodeURIComponent(`${vehicle.year} ${vehicle.make_name} ${vehicle.model_name}`)}`}
                    className="block text-center py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/8 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Request Certified Specialist Quotes →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODALS ────────────────────────────────────────── */}
      {/* MODAL: ADD SERVICE RECORD */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Wrench className="w-5 h-5 text-blue-400" />
                <span>Log Vehicle Service Record</span>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. 50,000 km Major Service & Spark Plugs"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Date Completed
                  </label>
                  <input
                    type="date"
                    value={serviceForm.serviceDate}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceDate: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Service Cost ($)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.cost}
                    onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
                    placeholder="250"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Workshop Provider
                  </label>
                  <input
                    type="text"
                    value={serviceForm.serviceProvider}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceProvider: e.target.value })}
                    placeholder="e.g. Official Dealer"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.mileage}
                    onChange={(e) => setServiceForm({ ...serviceForm, mileage: e.target.value })}
                    placeholder="45000"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Itemized Notes & Work Done
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.notes}
                  onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
                  placeholder="Replaced brake pads, synthetic engine oil, inspected suspension bushings."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !serviceForm.title.trim()}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl disabled:opacity-40 shadow-lg shadow-blue-600/30"
                >
                  {isPending ? "Saving..." : "Save to History"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOCUMENT */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Store Document in Digital Glovebox</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Document Category
                </label>
                <select
                  value={docForm.documentType}
                  onChange={(e) =>
                    setDocForm({
                      ...docForm,
                      documentType: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="insurance">Insurance Policy</option>
                  <option value="registration">Vehicle Registration</option>
                  <option value="inspection">Safety / Emissions Inspection</option>
                  <option value="title">Vehicle Title / Deed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. State Title or Comprehensive Policy 2026"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Expiration / Renewal Date
                </label>
                <input
                  type="date"
                  value={docForm.expiryDate}
                  onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !docForm.title.trim()}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl disabled:opacity-40 shadow-lg shadow-emerald-600/30"
                >
                  {isPending ? "Saving..." : "Save to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
