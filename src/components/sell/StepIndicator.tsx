"use client";

import { useSellStore } from "@/stores/sell.store";

export function StepIndicator() {
  const { currentStep, setStep, data } = useSellStore();

  const steps = [
    { n: 1, label: "Vehicle Info", icon: "🚗" },
    { n: 2, label: "Specs", icon: "⚙️" },
    { n: 3, label: "Photos", icon: "📷" },
    { n: 4, label: "Pricing", icon: "💰" },
    { n: 5, label: "Review", icon: "✅" },
  ];

  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center">
          <button
            onClick={() => step.n < currentStep && setStep(step.n)}
            className={`flex flex-col items-center gap-1 shrink-0 ${step.n < currentStep ? "cursor-pointer" : "cursor-default"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all text-sm ${
                step.n < currentStep
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : step.n === currentStep
                  ? "gradient-brand border-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "surface-raised border-white/15 text-slate-600"
              }`}
            >
              {step.n < currentStep ? "✓" : step.icon}
            </div>
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                step.n === currentStep
                  ? "text-blue-400"
                  : step.n < currentStep
                  ? "text-emerald-400"
                  : "text-slate-600"
              }`}
            >
              {step.label}
            </span>
          </button>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-10 sm:w-16 mx-1 shrink-0 transition-colors ${
                step.n < currentStep ? "bg-emerald-600" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
