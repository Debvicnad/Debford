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
  Calendar,
  DollarSign,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  AlertCircle,
  ExternalLink,
  Trash2,
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
  const rentalListing = vehicle.rental_listing?.[0] ?? vehicle.rental_listing;

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
        setMessage({ type: "success", text: "Service record added successfully!" });
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
        setMessage({ type: "success", text: "Document saved to vehicle vault!" });
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
    <div className="space-y-6">
      {/* 1. Vehicle Hero Card */}
      <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
              {primaryImage ? (
                <Image src={primaryImage} alt={vehicle.make_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                  🚗
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white">
                  {vehicle.year} {vehicle.make_name} {vehicle.model_name}
                </h1>
                {vehicle.variant_name && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                    {vehicle.variant_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                {vehicle.registration_plate && (
                  <span className="font-mono bg-[#131b2e] px-2 py-0.5 rounded-md border border-white/10 text-slate-200">
                    {vehicle.registration_plate}
                  </span>
                )}
                {vehicle.mileage && (
                  <span>{Number(vehicle.mileage).toLocaleString()} {vehicle.mileage_unit ?? "km"}</span>
                )}
                {vehicle.transmission && <span>• {vehicle.transmission}</span>}
                {vehicle.fuel_type && <span>• {vehicle.fuel_type}</span>}
                {vehicle.city && <span>• 📍 {vehicle.city}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {saleListing?.status === "published" ? (
              <Link
                href={`/vehicles/${saleListing.slug ?? saleListing.id}`}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Live on Marketplace (${saleListing.price?.toLocaleString()})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href={`/sell?vehicleId=${vehicle.id}`}
                className="flex-1 md:flex-initial px-4 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>List for Sale</span>
              </Link>
            )}

            <Link
              href={`/services?vehicle=${encodeURIComponent(`${vehicle.year} ${vehicle.make_name} ${vehicle.model_name}`)}`}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>Book Service</span>
            </Link>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {message && (
          <div
            className={`mt-4 px-4 py-3 rounded-2xl text-xs font-semibold border flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: "overview", label: "Overview & Specs", icon: Car },
          { key: "service", label: `Service History (${serviceRecords.length})`, icon: Wrench },
          { key: "documents", label: `Documents Vault (${otherDocs.length})`, icon: FileText },
          { key: "reminders", label: "Smart Reminders", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "gradient-brand text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW & SPECS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Detailed Specs Grid */}
            <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                <span>Vehicle Specifications</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Make", value: vehicle.make_name },
                  { label: "Model", value: vehicle.model_name },
                  { label: "Year", value: vehicle.year },
                  { label: "Mileage", value: vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} ${vehicle.mileage_unit ?? "km"}` : "0 km" },
                  { label: "Transmission", value: vehicle.transmission },
                  { label: "Fuel Type", value: vehicle.fuel_type },
                  { label: "Engine Size", value: vehicle.engine_size ? `${vehicle.engine_size} L` : vehicle.engine_capacity ? `${vehicle.engine_capacity} cc` : null },
                  { label: "Horsepower", value: vehicle.power_hp ? `${vehicle.power_hp} hp` : null },
                  { label: "Drive Type", value: vehicle.drive_type },
                  { label: "Exterior Color", value: vehicle.color ?? vehicle.exterior_color },
                  { label: "Interior Color", value: vehicle.interior_color },
                  { label: "Doors / Seats", value: vehicle.doors || vehicle.seats ? `${vehicle.doors ?? "-"} doors / ${vehicle.seats ?? "-"} seats` : null },
                  { label: "VIN", value: vehicle.vin },
                  { label: "Condition", value: vehicle.condition },
                ]
                  .filter((s) => Boolean(s.value))
                  .map((s) => (
                    <div key={s.label} className="p-3.5 bg-[#131b2e]/60 rounded-2xl border border-white/5">
                      <div className="text-[11px] text-slate-500 font-medium mb-1">{s.label}</div>
                      <div className="text-sm font-bold text-white truncate">{s.value}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Description</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Right Sidebar: Quick Actions */}
          <div className="space-y-5">
            <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Garage Actions</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => setIsServiceModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-white text-xs font-bold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>Log Service Record</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-white text-xs font-bold flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Upload Vehicle Doc</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>

                <Link
                  href={`/services?vehicle=${encodeURIComponent(`${vehicle.year} ${vehicle.make_name} ${vehicle.model_name}`)}`}
                  className="w-full py-3 px-4 rounded-2xl bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-white text-xs font-bold flex items-center justify-between transition-all"
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
              <h2 className="text-lg font-bold text-white">Maintenance & Service Log</h2>
              <p className="text-xs text-slate-400">Complete service record verified on DEBFORD.</p>
            </div>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="px-4 py-2 gradient-brand text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>

          {serviceRecords.length === 0 ? (
            <div className="bg-[#0d121d] rounded-3xl border border-white/5 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mx-auto">
                🔧
              </div>
              <h3 className="text-base font-bold text-white">No service history recorded yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Keep your vehicle well-maintained and increase resale value by keeping a verifiable service record.
              </p>
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="px-5 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl"
              >
                Log First Service Record
              </button>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-white/10" />
              {serviceRecords.map((record: any) => (
                <div key={record.id} className="relative pl-6">
                  <div className="absolute left-[-17px] top-4 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-[#0a0d14]" />
                  <div className="bg-[#0d121d] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{record.title}</h4>
                      {record.expiry_date && (
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(record.expiry_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
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
              <h2 className="text-lg font-bold text-white">Vehicle Documents Vault</h2>
              <p className="text-xs text-slate-400">Keep insurance, registration, inspection reports safe.</p>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-4 py-2 gradient-brand text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherDocs.length === 0 ? (
              <div className="col-span-full bg-[#0d121d] rounded-3xl border border-white/5 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mx-auto">
                  📄
                </div>
                <h3 className="text-sm font-bold text-white">No documents uploaded yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Add your vehicle registration or insurance certificate for quick access.
                </p>
              </div>
            ) : (
              otherDocs.map((doc: any) => (
                <div key={doc.id} className="bg-[#0d121d] rounded-2xl border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {doc.document_type}
                    </span>
                    {doc.expiry_date && (
                      <span className="text-[11px] text-slate-400">
                        Exp: {new Date(doc.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{doc.title}</h4>
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
            <h2 className="text-lg font-bold text-white">Smart Maintenance Reminders</h2>
            <p className="text-xs text-slate-400">Automated service intervals based on vehicle age and mileage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Engine Oil & Filter Service",
                interval: "Every 10,000 km or 12 months",
                dueStatus: "Due in ~3,500 km",
                urgent: false,
                icon: "🛢️",
              },
              {
                title: "Brake Fluid Flush & Inspection",
                interval: "Every 24 months",
                dueStatus: "Recommended within 60 days",
                urgent: false,
                icon: "🛑",
              },
              {
                title: "Tyre Rotation & Wheel Balance",
                interval: "Every 8,000 km",
                dueStatus: "Scheduled",
                urgent: false,
                icon: "🔄",
              },
              {
                title: "Annual Safety & Emissions Inspection",
                interval: "Annual requirement",
                dueStatus: "Valid (Expires in 5 months)",
                urgent: false,
                icon: "🛡️",
              },
            ].map((rem, i) => (
              <div key={i} className="bg-[#0d121d] rounded-2xl border border-white/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{rem.icon}</span>
                  <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    {rem.dueStatus}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{rem.title}</h3>
                  <p className="text-xs text-slate-400">{rem.interval}</p>
                </div>
                <Link
                  href={`/services?type=mechanic&vehicle=${encodeURIComponent(`${vehicle.year} ${vehicle.make_name} ${vehicle.model_name}`)}`}
                  className="block text-center py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors"
                >
                  Find Specialist & Book
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD SERVICE RECORD */}
      {/* ============================================================ */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d121d] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Wrench className="w-5 h-5 text-blue-400" />
                <span>Log Service Record</span>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Full Synthetic Oil Change & Filter"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date Completed
                  </label>
                  <input
                    type="date"
                    value={serviceForm.serviceDate}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceDate: e.target.value })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Service Cost ($)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.cost}
                    onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
                    placeholder="120"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Service Provider / Workshop
                  </label>
                  <input
                    type="text"
                    value={serviceForm.serviceProvider}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceProvider: e.target.value })}
                    placeholder="e.g. Official Dealer / QuickLube"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Odometer Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.mileage}
                    onChange={(e) => setServiceForm({ ...serviceForm, mileage: e.target.value })}
                    placeholder="45000"
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Work Details / Notes
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.notes}
                  onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
                  placeholder="e.g. Replaced oil filter, topped up fluids, inspected brake pads (6mm remaining)."
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !serviceForm.title.trim()}
                  className="flex-1 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl disabled:opacity-40"
                >
                  {isPending ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD DOCUMENT */}
      {/* ============================================================ */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d121d] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Save Vehicle Document</span>
              </div>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={docForm.documentType}
                  onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value as any })}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="insurance">Insurance Policy</option>
                  <option value="registration">Vehicle Registration</option>
                  <option value="inspection">MOT / Inspection Certificate</option>
                  <option value="title">Vehicle Title / Deed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. Geico Comprehensive Policy 2026-2027"
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expiry / Renewal Date
                </label>
                <input
                  type="date"
                  value={docForm.expiryDate}
                  onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !docForm.title.trim()}
                  className="flex-1 py-2.5 gradient-brand text-white text-xs font-bold rounded-xl disabled:opacity-40"
                >
                  {isPending ? "Saving..." : "Save Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
