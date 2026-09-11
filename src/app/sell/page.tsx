"use client";

import Link from "next/link";
import { useSellStore } from "@/stores/sell.store";
import { StepIndicator } from "@/components/sell/StepIndicator";
import { Step1VehicleInfo } from "@/components/sell/Step1VehicleInfo";
import { Step2Specs } from "@/components/sell/Step2Specs";
import { Step3Photos } from "@/components/sell/Step3Photos";
import { Step4Pricing } from "@/components/sell/Step4Pricing";
import { Step5Review } from "@/components/sell/Step5Review";

const STEP_TITLES = [
  { n: 1, title: "Vehicle Information", subtitle: "Tell us about the vehicle you're listing" },
  { n: 2, title: "Specs & Features", subtitle: "Add technical details and equipment" },
  { n: 3, title: "Photos", subtitle: "Great photos sell faster — add up to 20" },
  { n: 4, title: "Pricing", subtitle: "Set your asking price and key highlights" },
  { n: 5, title: "Review & Publish", subtitle: "Double-check everything before going live" },
];

export default function SellPage() {
  const { currentStep, nextStep, prevStep } = useSellStore();
  const stepMeta = STEP_TITLES[currentStep - 1];

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
          <Link
            href="/dashboard"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Save & exit
          </Link>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="max-w-3xl mx-auto">
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

          {/* Sidebar tips (steps 1-4 only) */}
          {currentStep < 5 && (
            <div className="mt-5 glass rounded-xl border border-white/8 p-5">
              <h3 className="text-xs font-semibold text-white mb-3">
                💡 {currentStep === 1
                  ? "Listing tips"
                  : currentStep === 2
                  ? "Spec tips"
                  : currentStep === 3
                  ? "Photography tips"
                  : "Pricing tips"}
              </h3>
              <ul className="space-y-2">
                {[
                  [
                    "Include the VIN to unlock a free accident history check for buyers",
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
                    "Include front, rear, both sides, interior, dashboard, and engine shots",
                    "High resolution (1920×1280px) looks sharper in search results",
                  ],
                  [
                    "Research similar listings to price competitively",
                    "Enabling 'negotiable' increases inquiry rates by 25%",
                    "Adding highlights like 'One owner' and 'Full service history' builds trust",
                  ],
                ][currentStep - 1].map((tip) => (
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
