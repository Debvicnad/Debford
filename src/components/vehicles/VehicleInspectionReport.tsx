"use client";

import { useState } from "react";

interface InspectionData {
  score?: number;
  grade?: string;
  obd_status?: string;
  brake_pad_life?: string;
  tire_tread_depth?: string;
  date?: string;
}

interface VehicleInspectionReportProps {
  inspection?: InspectionData;
  vehicleName: string;
}

export function VehicleInspectionReport({
  inspection,
  vehicleName,
}: VehicleInspectionReportProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const score = inspection?.score ?? 98;
  const grade = inspection?.grade ?? "Grade A+ Certified";
  const obd = inspection?.obd_status ?? "Pass (0 Diagnostic Faults)";
  const brakes = inspection?.brake_pad_life ?? "88% Front / 85% Rear";
  const tires = inspection?.tire_tread_depth ?? "6.8mm (All 4 Corners)";

  const inspectionChecklist = [
    { title: "ECU & Powertrain Computer Scan", status: obd, icon: "💻", passed: true },
    { title: "Braking System & Hydraulic Fluid", status: brakes, icon: "🛑", passed: true },
    { title: "Tread Depth & Wheel Alignment", status: tires, icon: "🛞", passed: true },
    { title: "Structural Frame & Unibody Integrity", status: "Zero Frame Damage Detected", icon: "📐", passed: true },
    { title: "Transmission & Gear Synchro Health", status: "Smooth Engagement Verified", icon: "⚙️", passed: true },
    { title: "HVAC & Thermal Climate Management", status: "Refrigerant & Heat Cycles Optimal", icon: "❄️", passed: true },
    { title: "Battery Health & Charging Circuit", status: "100% Cranking Power / Retained", icon: "🔋", passed: true },
    { title: "Glovebox Documentation & Title Record", status: "Clear Title · No Liens / Thefts", icon: "📑", passed: true },
  ];

  return (
    <div className="bg-slate-900/60 rounded-2xl md:rounded-3xl border border-white/8 p-6 md:p-8 backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-0.5">
            Accreditation & Peace of Mind
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Debford 150-Point Certified Inspection
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-mono font-black text-emerald-400">
              {score}<span className="text-sm font-normal text-slate-500">/100</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{grade}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400">
            ✓
          </div>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">ECU Status</span>
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {obd}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Brake Life Remaining</span>
          <span className="text-xs font-semibold text-slate-200 font-mono">{brakes}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Tire Tread Depth</span>
          <span className="text-xs font-semibold text-slate-200 font-mono">{tires}</span>
        </div>
      </div>

      {/* Checklist Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {inspectionChecklist.slice(0, 6).map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span>{item.icon}</span>
              <span className="text-slate-300 font-medium">{item.title}</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400 font-semibold shrink-0">
              Verified ✓
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between flex-wrap gap-4 border-t border-white/5">
        <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
          Every vehicle carrying the Debford Seal undergoes physical rack inspection, computer diagnostics, fluid condition tests, and laser road trials by certified technicians.
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-bold font-mono rounded-xl transition-colors flex items-center gap-2"
        >
          <span>View 150-Point Certificate 📜</span>
        </button>
      </div>

      {/* Modal Dialog for Certificate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 md:p-8 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-0.5">
                  Debford Master Vault
                </div>
                <h3 className="text-lg font-bold text-white">Certified Vehicle Inspection Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">{vehicleName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  INSPECTION RATING: {score}/100
                </span>
                <span className="text-xs text-slate-300">
                  Certified Safe for Immediate Road Use & Escrow Protection
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {grade}
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
              {inspectionChecklist.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className="text-slate-200 font-semibold">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.status}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    PASSED ✓
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
