"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSellStore } from "@/stores/sell.store";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { Step1VehicleInfo } from "@/components/sell/Step1VehicleInfo";
import { Step2Specs } from "@/components/sell/Step2Specs";
import { Step3Photos } from "@/components/sell/Step3Photos";
import { Step4Pricing } from "@/components/sell/Step4Pricing";
import { Step5Review } from "@/components/sell/Step5Review";
import { Navbar } from "@/components/layout/Navbar";
import {
  CheckCircle2,
  X,
  RotateCcw,
  FileText,
  ShieldCheck,
  Zap,
  Camera,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

const STEP_TITLES = [
  { n: 1, title: "Vehicle Identification & Type", subtitle: "Enter your 17-digit VIN or select make, model, and year manually" },
  { n: 2, title: "Engineering Specs & Equipment", subtitle: "Define transmission, engine displacement, and factory options" },
  { n: 3, title: "Showroom Photography Stage", subtitle: "Upload up to 20 high-resolution photos — natural daylight angles perform best" },
  { n: 4, title: "Valuation & Settlement Terms", subtitle: "Set asking price, escrow terms, and listing highlights" },
  { n: 5, title: "Editorial Review & Publication", subtitle: "Confirm all vehicle specifications before pushing live to the marketplace" },
];

const TELEMETRY_METRICS = [
  { label: "VIN Decoder", value: "Instant 17-Char", desc: "NHTSA Auto-Populate", icon: Zap, color: "text-amber-400" },
  { label: "Photo Staging", value: "20 HD Angles", desc: "Showroom Resolution", icon: Camera, color: "text-blue-400" },
  { label: "Escrow Custody", value: "100% Insured", desc: "Protected Buyer Funds", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Buyer Reach", value: "48,000+ Active", desc: "Global Enthusiasts", icon: Users, color: "text-purple-400" },
];

const STEP_TIPS: string[][] = [
  [
    "Include the 17-digit VIN to unlock instant NHTSA decoding — auto-fills make, model, engine specs, and body layout.",
    "Accurate mileage and condition ratings build trust and reduce negotiation friction by 35%.",
    "Listings with 8+ high-resolution photos receive 3× more viewing requests.",
    "Responding to buyer inquiries within 1 hour increases conversion to escrow by 40%.",
  ],
  [
    "Complete technical specifications rank significantly higher in Debford discovery filters.",
    "Tagging installed factory options takes 2 minutes and increases search visibility by 50%.",
    "A detailed provenance description builds buyer confidence — aim for 100+ words highlighting maintenance records.",
  ],
  [
    "Natural overcast daylight photos perform best — avoid flash reflection on gloss bodywork.",
    "Drag and drop photos to arrange order — the first image serves as your listing cover.",
    "Tick off the required shot checklist (front 3/4, rear 3/4, cockpit, engine bay) to maximize exposure.",
    "High-resolution 16:9 images look razor sharp on both desktop showroom and mobile screens.",
  ],
  [
    "Research similar vehicles on the Debford marketplace to establish competitive asking prices.",
    "Enabling 'Negotiable' increases serious buyer inquiry and offer rates by 25%.",
    "Adding highlights like 'Single Owner', 'Clean Title Deed', and 'Full Service History' commands premium valuation.",
  ],
];

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return "1 hour ago";
  return `${hrs} hours ago`;
}

function hasMeaningfulDraft(data: ReturnType<typeof useSellStore.getState>["data"]): boolean {
  return !!(data.isDraft && (data.make || data.model || data.year));
}

export default function SellPage() {
  const { currentStep, nextStep, prevStep, data, reset } = useSellStore();
  const stepMeta = STEP_TITLES[currentStep - 1];

  const [draftMode, setDraftMode] = useState<"check" | "resume" | "fresh">("check");
  const [draftDismissed, setDraftDismissed] = useState(false);

  useEffect(() => {
    if (hasMeaningfulDraft(data)) {
      setDraftMode("check");
    } else {
      setDraftMode("fresh");
    }
  }, []); // eslint-disable-line

  function handleResume() {
    setDraftMode("resume");
  }

  function handleStartFresh() {
    reset();
    setDraftMode("fresh");
  }

  // "check" = show resume/fresh choice overlay
  if (draftMode === "check" && hasMeaningfulDraft(data)) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: "#06090e" }}>
        {/* Ambient background glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(6, 9, 14, 0) 70%)",
          }}
        />

        <div
          className="max-w-md w-full rounded-3xl border p-8 space-y-6 relative z-10 shadow-2xl"
          style={{
            backgroundColor: "#0d121f",
            borderColor: "rgba(255, 255, 255, 0.12)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}>
              D
            </div>
            <span className="text-white font-extrabold tracking-tight">DEBFORD CONSIGNMENT</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Resume In-Progress Listing?</h1>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An auto-saved draft for{" "}
              <span className="font-semibold text-white">
                {[data.year, data.make, data.model].filter(Boolean).join(" ") || "your vehicle"}
              </span>{" "}
              was recovered.
              {data.lastSavedAt && (
                <span className="text-slate-500 font-mono"> (Saved {timeAgo(data.lastSavedAt)})</span>
              )}
            </p>
          </div>

          {/* Draft summary box */}
          <div className="p-4 rounded-2xl bg-[#080c14] border border-white/5 space-y-2.5">
            {[
              { label: "Step Reached", value: `Step ${currentStep ?? 1} of 5` },
              { label: "Vehicle", value: [data.year, data.make, data.model].filter(Boolean).join(" ") || "—" },
              { label: "Listing Type", value: data.listingType ?? "Sale" },
              { label: "Photos Staged", value: data.photoUrls?.length ? `${data.photoUrls.length} image(s)` : "None yet" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{row.label}</span>
                <span className="text-white font-semibold capitalize">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartFresh}
              className="py-3 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Fresh</span>
            </button>
            <button
              type="button"
              onClick={handleResume}
              className="py-3 text-white rounded-xl text-xs font-bold shadow-lg transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 16px -2px rgba(37, 99, 235, 0.4)",
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume Draft</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* Top Header Scrim */}
      <div
        className="border-b relative"
        style={{
          borderColor: "rgba(255, 255, 255, 0.06)",
          backgroundColor: "#080c14",
        }}
      >
        <div className="container-debford py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/garage" className="hover:text-slate-300 transition-colors">Garage Vault</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300 font-medium">Vehicle Consignment Studio</span>
          </div>

          <div className="flex items-center gap-3">
            {data.isDraft && (
              <span className="text-[11px] text-emerald-400 font-semibold hidden sm:flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auto-Saved</span>
                {data.lastSavedAt && (
                  <span className="text-slate-500 font-mono"> · {timeAgo(data.lastSavedAt)}</span>
                )}
              </span>
            )}
            <Link
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/5 hover:border-white/15 transition-all"
            >
              Exit to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Telemetry Status Ribbon */}
      <div
        className="border-b"
        style={{
          borderColor: "rgba(255, 255, 255, 0.05)",
          backgroundColor: "rgba(8, 12, 20, 0.6)",
        }}
      >
        <div className="container-debford py-3.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TELEMETRY_METRICS.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">{m.value}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="container-debford py-8 flex-1 max-w-4xl mx-auto w-full">
        {/* Resumed Draft Alert Banner */}
        {data.isDraft && !draftDismissed && draftMode === "resume" && (
          <div className="mb-6 flex items-center justify-between gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Draft resumed successfully. All previously staged fields, photos, and specs are intact.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDraftDismissed(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 5-Step Indicator */}
        <StepIndicator />

        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              Step {currentStep} of 5
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {stepMeta.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {stepMeta.subtitle}
          </p>
        </div>

        {/* Step Content Stage Card */}
        <div
          className="rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all"
          style={{
            backgroundColor: "rgba(13, 18, 31, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {currentStep === 1 && <Step1VehicleInfo onNext={nextStep} />}
          {currentStep === 2 && <Step2Specs onNext={nextStep} onBack={prevStep} />}
          {currentStep === 3 && <Step3Photos onNext={nextStep} onBack={prevStep} />}
          {currentStep === 4 && <Step4Pricing onNext={nextStep} onBack={prevStep} />}
          {currentStep === 5 && <Step5Review onBack={prevStep} />}
        </div>

        {/* Dynamic Editorial Tips Box */}
        {currentStep < 5 && (
          <div
            className="mt-6 rounded-2xl border p-5"
            style={{
              backgroundColor: "rgba(13, 18, 31, 0.6)",
              borderColor: "rgba(255, 255, 255, 0.06)",
            }}
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{["Listing Identification Tips", "Engineering Specification Tips", "Showroom Photography Tips", "Market Valuation Tips"][currentStep - 1]}</span>
            </h3>
            <ul className="space-y-2">
              {STEP_TIPS[currentStep - 1].map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-400">
                  <span className="text-blue-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
