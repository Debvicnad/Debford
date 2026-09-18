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
import { CheckCircle2, X, RotateCcw, FileText } from "lucide-react";

const STEP_TITLES = [
  { n: 1, title: "Vehicle Information",  subtitle: "Tell us about the vehicle you're listing" },
  { n: 2, title: "Specs & Features",     subtitle: "Add technical details and equipment" },
  { n: 3, title: "Photos",               subtitle: "Great photos sell faster — add up to 20" },
  { n: 4, title: "Pricing",              subtitle: "Set your asking price and key highlights" },
  { n: 5, title: "Review & Publish",     subtitle: "Double-check everything before going live" },
];

const STEP_TIPS: string[][] = [
  [
    "Include the VIN to unlock a free NHTSA vehicle decode — auto-fills make, model, specs",
    "Accurate mileage and condition build trust and reduce negotiation",
    "Listings with 8+ photos get 3× more views",
    "Responding within 1 hour increases your conversion rate by 40%",
  ],
  [
    "Complete specs outperform incomplete listings in search rankings",
    "Selecting features takes 2 minutes and increases visibility significantly",
    "A detailed description builds trust — aim for 100+ words",
  ],
  [
    "Natural daylight photos perform best — avoid flash",
    "Drag photos to reorder — the first photo is your listing cover",
    "Tick off the required shot checklist (front, rear, interior…) to maximise visibility",
    "High resolution (1920×1280px) looks sharper in search results",
  ],
  [
    "Research similar listings to price competitively",
    "Use the cross-currency preview to check if your price translates well for international buyers",
    "Enabling 'negotiable' increases inquiry rates by 25%",
    "Adding highlights like 'One owner' and 'Full service history' builds trust",
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

/** Returns true if the stored data differs meaningfully from defaults */
function hasMeaningfulDraft(data: ReturnType<typeof useSellStore.getState>["data"]): boolean {
  return !!(data.isDraft && (data.make || data.model || data.year));
}

export default function SellPage() {
  const { currentStep, nextStep, prevStep, data, reset } = useSellStore();
  const stepMeta = STEP_TITLES[currentStep - 1];

  // Draft management state
  const [draftMode, setDraftMode] = useState<"check" | "resume" | "fresh">("check");
  const [draftDismissed, setDraftDismissed] = useState(false);

  useEffect(() => {
    // Only run on client after hydration
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
      <div className="min-h-screen surface-base flex items-center justify-center p-6">
        <div className="max-w-md w-full glass rounded-3xl border border-white/10 p-8 space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">D</span>
            </div>
            <span className="text-white font-bold">DEBFORD</span>
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white">You have an unsaved draft</h1>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your previous listing for{" "}
              <span className="font-semibold text-white">
                {[data.year, data.make, data.model].filter(Boolean).join(" ") || "a vehicle"}
              </span>{" "}
              was auto-saved.
              {data.lastSavedAt && (
                <span className="text-slate-500"> Last saved {timeAgo(data.lastSavedAt)}.</span>
              )}
            </p>
          </div>

          {/* Draft summary */}
          <div className="p-4 surface-base rounded-2xl border border-white/8 space-y-2">
            {[
              { label: "Step reached",  value: `Step ${currentStep ?? 1} of 5` },
              { label: "Vehicle",       value: [data.year, data.make, data.model].filter(Boolean).join(" ") || "—" },
              { label: "Listing type",  value: data.listingType ?? "—" },
              { label: "Photos",        value: data.photoUrls?.length ? `${data.photoUrls.length} photo(s) staged` : "None yet" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{row.label}</span>
                <span className="text-white font-semibold capitalize">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleStartFresh}
              className="py-3 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Start fresh
            </button>
            <button
              onClick={handleResume}
              className="py-3 gradient-brand text-white rounded-xl text-sm font-bold hover:opacity-90 shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Resume draft
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base">
      {/* Header */}
      <div className="surface-raised border-b border-subtle sticky top-0 z-40">
        <div className="container-debford py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold text-xs">D</span>
              </div>
              <span className="text-white font-bold hidden sm:block">DEBFORD</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-medium text-slate-400">List a Vehicle</span>
          </div>

          <div className="flex items-center gap-3">
            {data.isDraft && (
              <span className="text-[11px] text-emerald-400 font-semibold hidden sm:block">
                ✓ Draft saved
                {data.lastSavedAt && (
                  <span className="text-slate-500 font-normal"> · {timeAgo(data.lastSavedAt)}</span>
                )}
              </span>
            )}
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Save & exit
            </Link>
          </div>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="max-w-3xl mx-auto">
          {/* Draft save banner — shown after resuming, dismissible */}
          {data.isDraft && !draftDismissed && draftMode === "resume" && (
            <div className="mb-5 flex items-center justify-between gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Draft resumed — pick up where you left off. All fields are pre-filled.
                </span>
              </div>
              <button
                onClick={() => setDraftDismissed(true)}
                className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step indicator */}
          <StepIndicator />

          {/* Step header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Step {currentStep} of 5
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{stepMeta.title}</h1>
            <p className="text-slate-400 text-sm mt-1">{stepMeta.subtitle}</p>
          </div>

          {/* Step content card */}
          <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
            {currentStep === 1 && <Step1VehicleInfo onNext={nextStep} />}
            {currentStep === 2 && <Step2Specs onNext={nextStep} onBack={prevStep} />}
            {currentStep === 3 && <Step3Photos onNext={nextStep} onBack={prevStep} />}
            {currentStep === 4 && <Step4Pricing onNext={nextStep} onBack={prevStep} />}
            {currentStep === 5 && <Step5Review onBack={prevStep} />}
          </div>

          {/* Tips sidebar */}
          {currentStep < 5 && (
            <div className="mt-5 glass rounded-xl border border-white/8 p-5">
              <h3 className="text-xs font-semibold text-white mb-3">
                💡 {["Listing tips", "Spec tips", "Photography tips", "Pricing tips"][currentStep - 1]}
              </h3>
              <ul className="space-y-2">
                {STEP_TIPS[currentStep - 1].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
