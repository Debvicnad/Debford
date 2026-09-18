"use client";

import { useState } from "react";
import { X, Check, AlertTriangle, Eye, ShieldCheck, Car, Calendar, Gauge, Fuel, Cog } from "lucide-react";
import type { PendingItem } from "@/lib/actions/admin.actions";

interface Props {
  item: PendingItem | null;
  isOpen: boolean;
  mode: "inspect" | "reject";
  isPending: boolean;
  onClose: () => void;
  onApprove: (item: PendingItem) => void;
  onReject: (item: PendingItem, reason: string) => void;
}

const REJECTION_PRESETS = [
  "Blurry or low-resolution vehicle photos",
  "VIN does not match vehicle make, model, or year",
  "Missing title documentation or proof of ownership",
  "Unrealistic or misleading asking price",
  "Contact information in photos or description violates policies",
  "Vehicle condition does not match described grade",
];

export function ListingModerationModal({
  item,
  isOpen,
  mode,
  isPending,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);

  if (!isOpen || !item) return null;

  const images = item.images && item.images.length > 0 ? item.images : item.imageUrl ? [item.imageUrl] : [];

  const effectiveReason = customReason.trim() || selectedPreset;

  const handleConfirmReject = () => {
    if (!effectiveReason) return;
    onReject(item, effectiveReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0d121d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#131b2e]/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                mode === "reject"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
              }`}
            >
              {mode === "reject" ? <AlertTriangle className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {mode === "reject" ? "Reject Vehicle Listing" : "Vehicle Listing Inspection"}
              </h3>
              <p className="text-xs text-slate-400">
                {item.title} • {item.price}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {mode === "inspect" ? (
            <>
              {/* Photo Showcase */}
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedPhotoIdx]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">
                      🚗
                    </div>
                  )}
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {item.type}
                  </span>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIdx(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                          selectedPhotoIdx === idx
                            ? "border-blue-500 scale-105"
                            : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Vehicle Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5">
                  <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" /> Year / Make
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">
                    {item.year} {item.make}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5">
                  <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                    <Car className="w-3 h-3 text-purple-400" /> Model
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">
                    {item.model}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5">
                  <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-emerald-400" /> Mileage
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">
                    {item.mileage ? `${item.mileage.toLocaleString()} mi` : "Unspecified"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5">
                  <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                    <Cog className="w-3 h-3 text-amber-400" /> Transmission
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">
                    {item.transmission || "Automatic"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5">
                  <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-rose-400" /> Fuel Type
                  </span>
                  <span className="text-xs font-bold text-white mt-1 block truncate">
                    {item.fuelType || "Gasoline"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5">
                  <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" /> VIN #
                  </span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block truncate">
                    {item.vin || "VIN Not Disclosed"}
                  </span>
                </div>
              </div>

              {/* Seller Information */}
              <div className="p-4 rounded-2xl bg-[#131b2e]/60 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Seller & Submission
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Seller Name</span>
                    <span className="font-semibold text-white">{item.sellerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Seller Email</span>
                    <span className="font-semibold text-white truncate block">
                      {item.sellerEmail || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Submitted Timestamp</span>
                    <span className="font-medium text-slate-300">{item.submittedAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Asking / Reserve Price</span>
                    <span className="font-bold text-emerald-400">{item.price}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Rejection Mode View */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                  <span className="font-bold block">Select reason for rejection:</span>
                  <p className="text-rose-400/90 leading-relaxed">
                    The seller ({item.sellerName}) will automatically receive an in-app notification with this reason so they can update their listing and resubmit.
                  </p>
                </div>

                {/* Preset Chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">
                    Quick Preset Reasons:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {REJECTION_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(preset);
                          setCustomReason("");
                        }}
                        className={`text-left text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                          selectedPreset === preset
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold"
                            : "bg-[#131b2e] text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom feedback textarea */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white">
                    Or write custom compliance feedback:
                  </label>
                  <textarea
                    rows={3}
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setSelectedPreset("");
                    }}
                    placeholder="Describe exactly what needs to be corrected before approval..."
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-[#131b2e]/50 shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {mode === "inspect" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReject(item, "")}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer"
              >
                Reject with Feedback...
              </button>
              <button
                onClick={() => onApprove(item)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isPending ? "Approving..." : "Approve & Publish Live"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleConfirmReject}
              disabled={isPending || !effectiveReason}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>{isPending ? "Rejecting..." : "Confirm Rejection & Send Feedback"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
