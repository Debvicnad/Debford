"use client";

import { useSellStore } from "@/stores/sell.store";
import { Car, Settings, Camera, DollarSign, CheckCircle2, Check } from "lucide-react";

export function StepIndicator() {
  const { currentStep, setStep } = useSellStore();

  const steps = [
    { n: 1, label: "Vehicle Info", icon: Car },
    { n: 2, label: "Specs & OE", icon: Settings },
    { n: 3, label: "Photo Stage", icon: Camera },
    { n: 4, label: "Valuation", icon: DollarSign },
    { n: 5, label: "Review & Live", icon: CheckCircle2 },
  ];

  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-none w-full">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = step.n < currentStep;
        const isCurrent = step.n === currentStep;

        return (
          <div key={step.n} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => isCompleted && setStep(step.n)}
              className={`flex flex-col items-center gap-1.5 shrink-0 transition-all ${
                isCompleted ? "cursor-pointer group" : "cursor-default"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border transition-all text-xs ${
                  isCompleted
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10"
                    : isCurrent
                    ? "border-blue-500 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20"
                    : "bg-[#080c14] border-white/10 text-slate-600"
                }`}
                style={{
                  background: isCurrent
                    ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                    : undefined,
                }}
              >
                {isCompleted ? <Check className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[11px] font-bold tracking-tight whitespace-nowrap transition-colors ${
                  isCurrent
                    ? "text-blue-400"
                    : isCompleted
                    ? "text-slate-300 group-hover:text-emerald-400"
                    : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-colors ${
                  isCompleted ? "bg-emerald-500/60" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
