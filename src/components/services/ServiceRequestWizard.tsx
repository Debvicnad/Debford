"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createServiceRequest, type ServiceRequestPayload } from "@/lib/actions/service.actions";

const SERVICE_TYPES = [
  { value: "mechanic", icon: "🔧", label: "General Mechanic" },
  { value: "electrician", icon: "⚡", label: "Auto Electrician" },
  { value: "diagnostic", icon: "🔬", label: "Diagnostic Scan" },
  { value: "bodywork", icon: "🚗", label: "Body & Paint" },
  { value: "tires", icon: "⭕", label: "Tires & Alignment" },
  { value: "detailing", icon: "✨", label: "Detailing & Valet" },
  { value: "customization", icon: "🎨", label: "Customisation" },
  { value: "performance", icon: "🏎️", label: "Performance Tuning" },
];

const URGENCY_OPTIONS = [
  { value: "flexible", label: "Flexible", desc: "Within the next 2–4 weeks" },
  { value: "this_week", label: "This week", desc: "Within the next 7 days" },
  { value: "urgent", label: "Urgent", desc: "As soon as possible" },
];

interface Step1Props { onNext: (type: string) => void; }
interface Step2Props { serviceType: string; onNext: (data: Partial<ServiceRequestPayload>) => void; onBack: () => void; }
interface Step3Props { data: Partial<ServiceRequestPayload>; onBack: () => void; onSuccess: (id: string) => void; }

function Step1ServiceType({ onNext }: Step1Props) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {SERVICE_TYPES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSelected(s.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              selected === s.value
                ? "border-blue-500 bg-blue-500/10 text-white"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white glass"
            }`}
          >
            <span className="text-2xl">{s.icon}</span>
            <span className="text-xs font-medium text-center leading-tight">{s.label}</span>
          </button>
        ))}
      </div>
      <button
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
        className="w-full py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </div>
  );
}

function Step2Details({ serviceType, onNext, onBack }: Step2Props) {
  const [form, setForm] = useState({
    vehicleDescription: "",
    description: "",
    location: "",
    urgency: "flexible" as const,
    preferredDate: "",
    budget: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.vehicleDescription && form.description && form.location;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Your Vehicle
        </label>
        <input
          type="text"
          value={form.vehicleDescription}
          onChange={(e) => update("vehicleDescription", e.target.value)}
          placeholder="e.g. 2021 Toyota Camry SE, 45,000 km"
          className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Describe the issue or service needed
        </label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="e.g. Engine warning light on, rough idle at startup, oil change overdue…"
          className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Your Location
        </label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="e.g. Brooklyn, New York, NY"
          className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Urgency
        </label>
        <div className="grid grid-cols-3 gap-3">
          {URGENCY_OPTIONS.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => update("urgency", u.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                form.urgency === u.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 glass hover:border-white/20"
              }`}
            >
              <div className="text-sm font-semibold text-white mb-0.5">{u.label}</div>
              <div className="text-xs text-slate-600">{u.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Preferred date <span className="text-slate-700 normal-case">(optional)</span>
          </label>
          <input
            type="date"
            value={form.preferredDate}
            onChange={(e) => update("preferredDate", e.target.value)}
            className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Max budget <span className="text-slate-700 normal-case">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              placeholder="500"
              className="w-full pl-8 pr-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="px-6 py-3 glass border border-white/10 text-slate-400 font-medium rounded-xl hover:text-white hover:border-white/20 transition-all">
          ← Back
        </button>
        <button
          disabled={!valid}
          onClick={() => onNext({ ...form, serviceType })}
          className="flex-1 py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review request →
        </button>
      </div>
    </div>
  );
}

function Step3Review({ data, onBack, onSuccess }: Step3Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const serviceLabel = SERVICE_TYPES.find(s => s.value === data.serviceType)?.label ?? data.serviceType;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createServiceRequest(data as ServiceRequestPayload);
      if (result.error) { setError(result.error); return; }
      if (result.requestId) onSuccess(result.requestId);
    });
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl border border-white/10 divide-y divide-white/5">
        {[
          { label: "Service type", value: serviceLabel },
          { label: "Vehicle", value: data.vehicleDescription },
          { label: "Description", value: data.description },
          { label: "Location", value: data.location },
          { label: "Urgency", value: URGENCY_OPTIONS.find(u => u.value === data.urgency)?.label },
          data.preferredDate ? { label: "Preferred date", value: data.preferredDate } : null,
          data.budget ? { label: "Max budget", value: `$${data.budget}` } : null,
        ].filter(Boolean).map((row) => (
          <div key={row!.label} className="flex items-start gap-4 px-4 py-3">
            <span className="text-xs text-slate-600 w-28 shrink-0 pt-0.5">{row!.label}</span>
            <span className="text-sm text-slate-200">{row!.value}</span>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl border border-blue-500/20 p-4 text-xs text-slate-400 leading-relaxed">
        📬 Your request will be sent to verified service professionals in your area. You&apos;ll receive quotes within 2–24 hours. Selecting a provider and confirming the booking comes next — no payment upfront.
      </div>

      {error && (
        <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-sm text-rose-400">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3 glass border border-white/10 text-slate-400 font-medium rounded-xl hover:text-white hover:border-white/20 transition-all">
          ← Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 py-3 gradient-brand text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send request →"}
        </button>
      </div>
    </div>
  );
}

function SuccessState({ requestId }: { requestId: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
        ✅
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Request sent!</h2>
      <p className="text-slate-400 text-sm mb-1">
        Your service request has been broadcast to providers in your area.
      </p>
      <p className="text-slate-600 text-xs mb-8">Request ID: {requestId}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/services/requests" className="px-6 py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
          View Quotes & Track Request →
        </Link>
        <Link href="/services/providers" className="px-6 py-3 glass border border-white/10 text-slate-300 text-sm font-medium rounded-xl hover:border-white/20 hover:text-white transition-all">
          Browse Directory
        </Link>
      </div>
    </div>
  );
}

const STEP_TITLES = [
  { title: "What service do you need?", subtitle: "Select the category that best describes your request" },
  { title: "Tell us more", subtitle: "Details help providers send you accurate quotes" },
  { title: "Review your request", subtitle: "Double-check before sending to providers" },
];

export function ServiceRequestWizard() {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceRequestPayload>>({});
  const [successId, setSuccessId] = useState<string | null>(null);

  if (successId) return <SuccessState requestId={successId} />;

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              n < step ? "bg-emerald-500 text-white" :
              n === step ? "gradient-brand text-white" :
              "surface-base border border-white/10 text-slate-600"
            }`}>
              {n < step ? "✓" : n}
            </div>
            {n < 3 && <div className={`flex-1 h-0.5 w-12 rounded ${n < step ? "bg-emerald-500" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">{STEP_TITLES[step - 1].title}</h2>
        <p className="text-slate-500 text-sm mt-1">{STEP_TITLES[step - 1].subtitle}</p>
      </div>

      {step === 1 && (
        <Step1ServiceType onNext={(t) => { setServiceType(t); setStep(2); }} />
      )}
      {step === 2 && serviceType && (
        <Step2Details
          serviceType={serviceType}
          onBack={() => setStep(1)}
          onNext={(data) => { setFormData(data); setStep(3); }}
        />
      )}
      {step === 3 && (
        <Step3Review
          data={formData}
          onBack={() => setStep(2)}
          onSuccess={(id) => setSuccessId(id)}
        />
      )}
    </div>
  );
}
