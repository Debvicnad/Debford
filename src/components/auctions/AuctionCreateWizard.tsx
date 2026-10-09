"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Gavel,
  DollarSign,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Zap,
  Shield,
} from "lucide-react";
import { createAuction, type CreateAuctionInput } from "@/lib/actions/auction.actions";

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basics", icon: Gavel },
  { id: 2, label: "Pricing", icon: DollarSign },
  { id: 3, label: "Schedule", icon: Calendar },
  { id: 4, label: "Registration", icon: Users },
  { id: 5, label: "Review", icon: CheckCircle2 },
];

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors bg-white/5 border border-white/10 focus:border-amber-500/50";

const labelCls = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5";

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-[11px] flex items-start gap-1" style={{ color: "rgba(148,163,184,0.5)" }}>
      <Info className="w-3 h-3 shrink-0 mt-0.5" />
      {children}
    </p>
  );
}

// ── Step 1 — Basics ───────────────────────────────────────────────────────────
function Step1Basics({
  data,
  onChange,
}: {
  data: Partial<CreateAuctionInput>;
  onChange: (patch: Partial<CreateAuctionInput>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Auction Title *</label>
        <input
          className={inputCls}
          placeholder="e.g. 2023 Porsche 911 GT3 RS — Weissach Package"
          value={data.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          maxLength={120}
        />
        <FieldHint>Make it descriptive — bidders scan titles first.</FieldHint>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={`${inputCls} min-h-[120px] resize-y`}
          placeholder="Describe the vehicle's condition, history, special features, and anything a bidder should know before placing a bid…"
          value={data.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={5}
        />
      </div>

      <div>
        <label className={labelCls}>Currency</label>
        <select
          className={inputCls}
          value={data.currency ?? "USD"}
          onChange={(e) => onChange({ currency: e.target.value })}
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          {["USD", "GBP", "EUR", "AED", "GHS", "NGN"].map((c) => (
            <option key={c} value={c} style={{ backgroundColor: "#0d1220" }}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Step 2 — Pricing ──────────────────────────────────────────────────────────
function Step2Pricing({
  data,
  onChange,
}: {
  data: Partial<CreateAuctionInput>;
  onChange: (patch: Partial<CreateAuctionInput>) => void;
}) {
  const currency = data.currency ?? "USD";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Starting Price ({currency}) *</label>
          <input
            type="number"
            className={inputCls}
            placeholder="10000"
            min={1}
            value={data.startingPrice ?? ""}
            onChange={(e) => onChange({ startingPrice: parseFloat(e.target.value) || 0 })}
          />
          <FieldHint>Lowest acceptable opening bid amount.</FieldHint>
        </div>

        <div>
          <label className={labelCls}>Bid Increment ({currency}) *</label>
          <input
            type="number"
            className={inputCls}
            placeholder="500"
            min={1}
            value={data.bidIncrement ?? ""}
            onChange={(e) => onChange({ bidIncrement: parseFloat(e.target.value) || 100 })}
          />
          <FieldHint>Minimum amount each new bid must exceed the previous by.</FieldHint>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Reserve Price ({currency}) — Optional</label>
          <input
            type="number"
            className={inputCls}
            placeholder="Leave blank for no reserve"
            min={0}
            value={data.reservePrice ?? ""}
            onChange={(e) =>
              onChange({ reservePrice: e.target.value ? parseFloat(e.target.value) : undefined })
            }
          />
          <FieldHint>Hidden minimum price. Auction only closes a deal if this is met.</FieldHint>
        </div>

        <div>
          <label className={labelCls}>Buy It Now Price ({currency}) — Optional</label>
          <input
            type="number"
            className={inputCls}
            placeholder="Leave blank to disable"
            min={0}
            value={data.buyNowPrice ?? ""}
            onChange={(e) =>
              onChange({ buyNowPrice: e.target.value ? parseFloat(e.target.value) : undefined })
            }
          />
          <FieldHint>Allows any bidder to skip the auction and buy outright.</FieldHint>
        </div>
      </div>

      {/* Pricing preview */}
      {(data.startingPrice || data.bidIncrement) && (
        <div
          className="rounded-2xl p-4 border space-y-2"
          style={{ backgroundColor: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}
        >
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
            Pricing Preview
          </div>
          {[
            ["Opening Bid", data.startingPrice],
            ["Next Minimum Bid", (data.startingPrice ?? 0) + (data.bidIncrement ?? 0)],
            ...(data.reservePrice ? [["Reserve (hidden)", data.reservePrice]] : []),
            ...(data.buyNowPrice ? [["Buy Now Price", data.buyNowPrice]] : []),
          ].map(([label, val]) => (
            <div key={String(label)} className="flex justify-between text-xs">
              <span style={{ color: "rgba(148,163,184,0.6)" }}>{label}</span>
              <span className="font-bold text-white">
                {currency} {Number(val).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 3 — Schedule ─────────────────────────────────────────────────────────
function Step3Schedule({
  data,
  onChange,
}: {
  data: Partial<CreateAuctionInput>;
  onChange: (patch: Partial<CreateAuctionInput>) => void;
}) {
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  const durationHours = data.startsAt && data.endsAt
    ? Math.round((new Date(data.endsAt).getTime() - new Date(data.startsAt).getTime()) / 3600000)
    : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Auction Starts *</label>
          <input
            type="datetime-local"
            className={inputCls}
            min={minDateTime}
            value={data.startsAt ? data.startsAt.slice(0, 16) : ""}
            onChange={(e) => onChange({ startsAt: new Date(e.target.value).toISOString() })}
            style={{ colorScheme: "dark" }}
          />
          <FieldHint>When live bidding opens.</FieldHint>
        </div>

        <div>
          <label className={labelCls}>Auction Ends *</label>
          <input
            type="datetime-local"
            className={inputCls}
            min={data.startsAt ? data.startsAt.slice(0, 16) : minDateTime}
            value={data.endsAt ? data.endsAt.slice(0, 16) : ""}
            onChange={(e) => onChange({ endsAt: new Date(e.target.value).toISOString() })}
            style={{ colorScheme: "dark" }}
          />
          <FieldHint>
            Countdown clock shown to bidders. Anti-sniping auto-extends by 2 min.
          </FieldHint>
        </div>
      </div>

      {durationHours !== null && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ backgroundColor: "rgba(99,102,241,0.06)", borderColor: "rgba(99,102,241,0.2)" }}
        >
          <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-xs">
            <span style={{ color: "rgba(148,163,184,0.6)" }}>Auction duration: </span>
            <span className="font-bold text-white">
              {durationHours >= 24
                ? `${Math.floor(durationHours / 24)} day${Math.floor(durationHours / 24) > 1 ? "s" : ""} ${durationHours % 24}h`
                : `${durationHours} hour${durationHours !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      )}

      <div
        className="p-4 rounded-2xl border"
        style={{ backgroundColor: "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.15)" }}
      >
        <div className="flex items-start gap-2 text-xs">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span style={{ color: "rgba(148,163,184,0.7)" }}>
            <strong className="text-white">Anti-Sniping Protection</strong> is enabled
            automatically — any bid placed within 2 minutes of closing extends the clock by 2
            minutes to ensure a fair result.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Step 4 — Registration ─────────────────────────────────────────────────────
function Step4Registration({
  data,
  onChange,
}: {
  data: Partial<CreateAuctionInput>;
  onChange: (patch: Partial<CreateAuctionInput>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => onChange({ requiresRegistration: !data.requiresRegistration })}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              data.requiresRegistration ? "bg-amber-500" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                data.requiresRegistration ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <label className="text-sm font-bold text-white cursor-pointer"
            onClick={() => onChange({ requiresRegistration: !data.requiresRegistration })}>
            Require Participant Pre-Registration
          </label>
        </div>
        <p className="text-[11px] ml-14" style={{ color: "rgba(148,163,184,0.5)" }}>
          When enabled, bidders must apply and be approved before they can place bids. You review
          each applicant in your Auction Manager.
        </p>
      </div>

      {data.requiresRegistration && (
        <>
          <div>
            <label className={labelCls}>Registration Deadline — Optional</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={data.registrationDeadline ? data.registrationDeadline.slice(0, 16) : ""}
              onChange={(e) =>
                onChange({
                  registrationDeadline: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
              style={{ colorScheme: "dark" }}
            />
            <FieldHint>
              Cut-off date for new applications. Leave blank to allow registration up to auction start.
            </FieldHint>
          </div>

          <div>
            <label className={labelCls}>Max Participants — Optional</label>
            <input
              type="number"
              className={inputCls}
              placeholder="Leave blank for unlimited"
              min={2}
              value={data.maxParticipants ?? ""}
              onChange={(e) =>
                onChange({
                  maxParticipants: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
            <FieldHint>Caps the number of approved bidders for exclusive events.</FieldHint>
          </div>
        </>
      )}

      {!data.requiresRegistration && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ backgroundColor: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.15)" }}
        >
          <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.65)" }}>
            <strong className="text-white">Open auction</strong> — any signed-in Debford member can
            place bids immediately when the auction goes live. Ideal for broad exposure.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 5 — Review ───────────────────────────────────────────────────────────
function Step5Review({ data }: { data: Partial<CreateAuctionInput> }) {
  const currency = data.currency ?? "USD";
  const fmt = (n?: number) => (n !== undefined ? `${currency} ${n.toLocaleString()}` : "—");

  const sections = [
    {
      title: "Basics",
      rows: [
        ["Title", data.title ?? "—"],
        ["Currency", currency],
        [
          "Description",
          data.description ? `${data.description.slice(0, 80)}…` : "None",
        ],
      ],
    },
    {
      title: "Pricing",
      rows: [
        ["Starting Price", fmt(data.startingPrice)],
        ["Bid Increment", fmt(data.bidIncrement)],
        ["Reserve Price", data.reservePrice ? fmt(data.reservePrice) : "No reserve"],
        ["Buy It Now", data.buyNowPrice ? fmt(data.buyNowPrice) : "Disabled"],
      ],
    },
    {
      title: "Schedule",
      rows: [
        [
          "Starts",
          data.startsAt ? new Date(data.startsAt).toLocaleString() : "—",
        ],
        [
          "Ends",
          data.endsAt ? new Date(data.endsAt).toLocaleString() : "—",
        ],
      ],
    },
    {
      title: "Registration",
      rows: [
        [
          "Pre-Registration",
          data.requiresRegistration ? "Required (operator approval)" : "Open to all members",
        ],
        ...(data.requiresRegistration
          ? [
              [
                "Deadline",
                data.registrationDeadline
                  ? new Date(data.registrationDeadline).toLocaleString()
                  : "Up to auction start",
              ],
              ["Max Participants", data.maxParticipants ? String(data.maxParticipants) : "Unlimited"],
            ]
          : []),
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div
          key={s.title}
          className="rounded-2xl border p-4 space-y-2"
          style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3">
            {s.title}
          </div>
          {s.rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 text-xs">
              <span style={{ color: "rgba(148,163,184,0.5)" }}>{k}</span>
              <span className="font-semibold text-white text-right">{v}</span>
            </div>
          ))}
        </div>
      ))}

      <div
        className="p-4 rounded-2xl border"
        style={{ backgroundColor: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}
      >
        <p className="text-xs" style={{ color: "rgba(203,213,225,0.7)" }}>
          Your auction will be saved as a <strong className="text-white">Draft</strong>. You can
          review it in your Auction Manager and publish it to{" "}
          <strong className="text-white">Scheduled</strong> when ready.
        </p>
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export function AuctionCreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const [data, setData] = useState<Partial<CreateAuctionInput>>({
    currency: "USD",
    bidIncrement: 500,
    requiresRegistration: false,
  });

  const patch = (updates: Partial<CreateAuctionInput>) =>
    setData((prev) => ({ ...prev, ...updates }));

  function validate(): string | null {
    if (step === 1 && !data.title?.trim()) return "Please enter an auction title.";
    if (step === 2) {
      if (!data.startingPrice || data.startingPrice <= 0) return "Starting price must be greater than 0.";
      if (!data.bidIncrement || data.bidIncrement <= 0) return "Bid increment must be greater than 0.";
      if (data.buyNowPrice && data.buyNowPrice <= (data.startingPrice ?? 0)) {
        return "Buy Now price must be higher than the starting price.";
      }
    }
    if (step === 3) {
      if (!data.startsAt) return "Please set a start date/time.";
      if (!data.endsAt) return "Please set an end date/time.";
      if (new Date(data.endsAt) <= new Date(data.startsAt)) {
        return "End time must be after start time.";
      }
      if (new Date(data.startsAt) <= new Date()) {
        return "Start time must be in the future.";
      }
    }
    return null;
  }

  function next() {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setErrorMsg(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  function submit() {
    startTransition(async () => {
      setErrorMsg(null);
      const result = await createAuction(data as CreateAuctionInput);
      if (result.error) {
        setErrorMsg(result.error);
        return;
      }
      setSuccessId(result.id ?? null);
    });
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (successId) {
    return (
      <div className="text-center py-16 space-y-5 px-6">
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 8px 32px rgba(245,158,11,0.3)" }}>
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Auction Created!</h2>
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
            Your auction has been saved as a draft. Head to your Auction Manager to review and publish it.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/auctions/manage")}
            className="px-6 py-3 rounded-xl text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}
          >
            Open Auction Manager
          </button>
          <button
            onClick={() => router.push(`/auctions/${successId}`)}
            className="px-6 py-3 rounded-xl text-sm font-bold border"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8" }}
          >
            Preview Auction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Step Progress ── */}
      <div className="flex items-center justify-between mb-8 relative">
        <div
          className="absolute top-4 left-0 right-0 h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
        />
        {STEPS.map((s) => {
          const Icon = s.icon;
          const done = s.id < step;
          const active = s.id === step;
          return (
            <div key={s.id} className="relative flex flex-col items-center gap-2 z-10">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: done
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : active
                    ? "linear-gradient(135deg, #6366f1, #3b82f6)"
                    : "rgba(255,255,255,0.05)",
                  border: active ? "2px solid rgba(99,102,241,0.5)" : "2px solid transparent",
                  boxShadow: active ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                }}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Icon className="w-4 h-4" style={{ color: active ? "#fff" : "rgba(148,163,184,0.4)" }} />
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider hidden sm:block"
                style={{ color: active ? "#f8fafc" : done ? "#f59e0b" : "rgba(148,163,184,0.4)" }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Step Card ── */}
      <div
        className="rounded-3xl border p-6 sm:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(13,18,31,0.95), rgba(10,15,26,0.95))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-black text-white mb-1">
            {STEPS[step - 1].label}
          </h2>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
            Step {step} of {STEPS.length}
          </p>
        </div>

        {step === 1 && <Step1Basics data={data} onChange={patch} />}
        {step === 2 && <Step2Pricing data={data} onChange={patch} />}
        {step === 3 && <Step3Schedule data={data} onChange={patch} />}
        {step === 4 && <Step4Registration data={data} onChange={patch} />}
        {step === 5 && <Step5Review data={data} />}

        {/* Error */}
        {errorMsg && (
          <div
            className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold"
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              borderColor: "rgba(239,68,68,0.25)",
              color: "#f87171",
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#000",
                boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
              }}
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Gavel className="w-4 h-4" />
              )}
              {isPending ? "Creating…" : "Create Auction (Draft)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
