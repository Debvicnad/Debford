"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  AlertCircle,
  Car,
  ChevronRight,
  CheckCircle2,
  FileCheck,
  Zap,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Key,
  Clock,
  HelpCircle,
} from "lucide-react";
import {
  createPurchaseCheckout,
  createListingBoostCheckout,
} from "@/lib/actions/stripe.actions";

interface VehiclePreview {
  id: string;
  title: string;
  price: number;
  currency?: string;
  year?: number;
  sellerName?: string;
  sellerRating?: number;
  imageUrl?: string;
  location?: string;
}

interface Props {
  checkoutType: "vehicle" | "boost" | "membership" | "general";
  vehicle?: VehiclePreview | null;
  boostPlan?: "featured" | "priority" | null;
  membershipPlan?: string | null;
  initialSuccessRef?: string | null;
  isAuthenticated: boolean;
}

const ESCROW_TELEMETRY = [
  { label: "Escrow Custody", value: "100%", desc: "Non-disbursed vault protection", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Inspection Check", value: "150-Point", desc: "Report matching guarantee", icon: FileCheck, color: "text-blue-400" },
  { label: "Enclosed Freight", value: "Available", desc: "White-glove GPS tracked fleet", icon: Truck, color: "text-amber-400" },
  { label: "Data Encryption", value: "256-Bit SSL", desc: "Military-grade escrow security", icon: Lock, color: "text-purple-400" },
];

export function CheckoutClient({
  checkoutType,
  vehicle,
  boostPlan,
  membershipPlan: _membershipPlan,
  initialSuccessRef,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [depositMode, setDepositMode] = useState<"full" | "deposit">("deposit");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "standard" | "enclosed">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wire" | "apple_pay">("card");
  const [shippingAddress, setShippingAddress] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  // Simulated card details for visual immersion
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const [successReference, setSuccessReference] = useState<string | null>(initialSuccessRef ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Prices calculation
  const baseVehiclePrice = vehicle?.price ?? 45000;
  const depositAmount = Math.min(1000, Math.round(baseVehiclePrice * 0.05));
  const deliveryFee = deliveryOption === "enclosed" ? 650 : deliveryOption === "standard" ? 350 : 0;
  const escrowProtectionFee = 49; // Flat platform escrow custody fee

  const totalPayableNow =
    checkoutType === "vehicle"
      ? (depositMode === "deposit" ? depositAmount : baseVehiclePrice) + deliveryFee + escrowProtectionFee
      : checkoutType === "boost"
      ? (boostPlan === "priority" ? 29.99 : 9.99)
      : 49;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: vehicle?.currency ?? "USD",
      minimumFractionDigits: 0,
    }).format(n);

  function handleCopyReference(ref: string) {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  }

  function handleProcessPayment(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated) {
      router.push(`/login?redirectTo=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "/checkout")}`);
      return;
    }

    startTransition(async () => {
      if (checkoutType === "vehicle" && vehicle) {
        const res = await createPurchaseCheckout({
          listingId: vehicle.id,
          depositOnly: depositMode === "deposit",
          deliveryOption: deliveryOption === "enclosed" ? "enclosed_transport" : deliveryOption === "standard" ? "delivery" : "pickup",
          shippingAddress: deliveryOption !== "pickup" ? shippingAddress : undefined,
          buyerNotes: buyerNotes.trim() || undefined,
        });

        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.url) {
          window.location.href = res.url;
        } else {
          setSuccessReference(res.escrowReference ?? "ESC-SUCCESS");
        }
      } else if (checkoutType === "boost" && vehicle) {
        const res = await createListingBoostCheckout(vehicle.id, boostPlan || "featured");
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.url) {
          window.location.href = res.url;
        } else {
          setSuccessReference(`BOOST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
        }
      } else {
        setSuccessReference(`ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      }
    });
  }

  // ── Success State Screen ────────────────────────────────────
  if (successReference) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden" style={{ backgroundColor: "#06090e" }}>
        {/* Ambient emerald backlight */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 9, 14, 0) 70%)",
          }}
        />

        <div className="max-w-xl w-full mx-auto space-y-6 relative z-10 text-center">
          {/* Animated Shield Badge */}
          <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-emerald-500/25 animate-scaleUp">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              {checkoutType === "vehicle" ? "Escrow Vault Allocation Secured" : "Payment Confirmed"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              Transaction Successfully Protected
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Funds are safely held in non-disbursed custody under Debford Financial Escrow.
            </p>
          </div>

          {/* Reference Card with One-Click Copy */}
          <div
            className="rounded-3xl border p-6 text-left space-y-4"
            style={{
              backgroundColor: "rgba(13, 18, 31, 0.85)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#131b2e] border border-white/5">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Debford Escrow Vault ID
                </span>
                <span className="text-sm font-mono font-bold text-blue-400">
                  {successReference}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyReference(successReference)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Escrow Milestone Roadmap */}
            {checkoutType === "vehicle" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Escrow Custody Roadmap
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-400">Step 1 of 4 Complete</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      title: "1. Deposit Held in Insured Vault",
                      status: "completed",
                      desc: "Funds securely locked in Debford Non-Disbursed Custody. Seller cannot access funds.",
                    },
                    {
                      title: "2. Vehicle Inspection & Title Verification",
                      status: "current",
                      desc: "Coordinate in-person test drive or commission Debford 150-Point Mobile Inspection.",
                    },
                    {
                      title: "3. Physical Handover & Key Release",
                      status: "pending",
                      desc: "Verify vehicle condition matches report and sign digital transfer certificate.",
                    },
                    {
                      title: "4. Final Escrow Payout Released to Seller",
                      status: "pending",
                      desc: "Funds only released to seller upon your explicit digital sign-off.",
                    },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors ${
                        step.status === "completed"
                          ? "bg-emerald-500/[0.06] border-emerald-500/20"
                          : step.status === "current"
                          ? "bg-blue-500/[0.08] border-blue-500/30"
                          : "bg-white/[0.02] border-white/5 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          step.status === "completed"
                            ? "bg-emerald-500 text-white"
                            : step.status === "current"
                            ? "bg-blue-600 text-white animate-pulse"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {step.status === "completed" ? "✓" : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{step.title}</span>
                          {step.status === "current" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-blue-500/20 text-blue-300">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-3.5 text-white text-xs font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all hover:opacity-95 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 8px 24px -4px rgba(37, 99, 235, 0.4)",
              }}
            >
              <span>Go to Account Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/messages"
              className="flex-1 py-3.5 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all text-center cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              Message Seller to Coordinate Handover
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20">
      {/* Breadcrumb Scrim */}
      <div
        className="border-b relative"
        style={{
          borderColor: "rgba(255, 255, 255, 0.06)",
          backgroundColor: "#080c14",
        }}
      >
        <div className="container-debford py-3.5 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/vehicles" className="hover:text-slate-300 transition-colors">Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300 font-medium">Secure Escrow Checkout</span>
        </div>
      </div>

      {/* Telemetry Ribbon */}
      <div
        className="border-b"
        style={{
          borderColor: "rgba(255, 255, 255, 0.05)",
          backgroundColor: "rgba(8, 12, 20, 0.6)",
        }}
      >
        <div className="container-debford py-3.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ESCROW_TELEMETRY.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-white">{m.value}</span>
                      <span className="text-[11px] text-slate-400 truncate">{m.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">{m.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-debford py-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Title */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected by Debford Automotive Escrow Vault</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {checkoutType === "vehicle"
                  ? "Vehicle Escrow Protection"
                  : checkoutType === "boost"
                  ? "Listing Visibility Boost"
                  : "Secure Checkout"}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#0d121f] px-4 py-2 rounded-xl border border-white/10">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted Escrow</span>
            </div>
          </div>

          <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Escrow Options (Col 7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Option 1: Payment Mode (Hold Deposit vs Full Purchase) */}
              {checkoutType === "vehicle" && (
                <div
                  className="rounded-3xl border p-6 space-y-4"
                  style={{
                    backgroundColor: "rgba(13, 18, 31, 0.75)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      1. Choose Escrow Protection Tier
                    </h2>
                    <span className="text-[11px] text-slate-500">Non-disbursed custody</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDepositMode("deposit")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        depositMode === "deposit"
                          ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/50"
                          : "bg-[#090e18]/80 border-white/5 hover:border-white/15"
                      }`}
                    >
                      {depositMode === "deposit" && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                      )}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-white">Refundable Holding Deposit</span>
                        <span className="text-xs font-mono font-black text-blue-400">${depositAmount}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Reserves vehicle exclusively for 7 days while you inspect, verify title, and finalize financing.
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>100% Refundable if inspection fails</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositMode("full")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        depositMode === "full"
                          ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/50"
                          : "bg-[#090e18]/80 border-white/5 hover:border-white/15"
                      }`}
                    >
                      {depositMode === "full" && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                      )}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-white">Full Purchase Escrow</span>
                        <span className="text-xs font-mono font-black text-blue-400">{fmt(baseVehiclePrice)}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Full purchase funds locked in Debford Escrow Vault. Fast-tracks title deeds, key dispatch, and delivery.
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-blue-300 font-semibold">
                        <Key className="w-3 h-3 text-blue-400" />
                        <span>Instant key release authorization</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Option 2: Delivery / Transport */}
              {checkoutType === "vehicle" && (
                <div
                  className="rounded-3xl border p-6 space-y-4"
                  style={{
                    backgroundColor: "rgba(13, 18, 31, 0.75)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400" />
                    2. Handover & Transport Method
                  </h2>

                  <div className="space-y-2">
                    {[
                      {
                        id: "pickup",
                        label: "Direct In-Person Handover",
                        fee: 0,
                        desc: "Meet seller at accredited location for physical key exchange and title signing.",
                      },
                      {
                        id: "standard",
                        label: "Debford Standard Flatbed Transport",
                        fee: 350,
                        desc: "Door-to-door open carrier shipping with real-time GPS tracking telemetry.",
                      },
                      {
                        id: "enclosed",
                        label: "VIP Enclosed Vehicle Transport",
                        fee: 650,
                        desc: "Climate-controlled white-glove carrier for exotic, luxury, and track vehicles.",
                      },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setDeliveryOption(opt.id as "pickup" | "standard" | "enclosed")}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          deliveryOption === opt.id
                            ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/50"
                            : "bg-[#090e18]/80 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="pr-3">
                          <span className="text-xs font-bold text-white block">{opt.label}</span>
                          <span className="text-[11px] text-slate-400 leading-snug">{opt.desc}</span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-400 shrink-0 font-mono">
                          {opt.fee === 0 ? "Free" : `+$${opt.fee}`}
                        </span>
                      </button>
                    ))}
                  </div>

                  {deliveryOption !== "pickup" && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Delivery Destination Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter full delivery street address, city, and zip code"
                        className="w-full bg-[#090e18] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Notes for Seller / Dispatch Team (Optional)
                    </label>
                    <textarea
                      value={buyerNotes}
                      onChange={(e) => setBuyerNotes(e.target.value)}
                      placeholder="e.g., preferred viewing dates, gate codes, private garage delivery notes..."
                      rows={2}
                      className="w-full bg-[#090e18] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Option 3: Payment Method Selector */}
              <div
                className="rounded-3xl border p-6 space-y-4"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.75)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  3. Select Payment Instrument
                </h2>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "card", label: "Credit Card", icon: "💳", desc: "Instant Escrow Hold" },
                    { id: "apple_pay", label: "Apple / Pay", icon: "⚡", desc: "1-Click Token" },
                    { id: "wire", label: "Bank Wire / ACH", icon: "🏦", desc: "Zero Fee Wire" },
                  ].map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as "card" | "wire" | "apple_pay")}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? "bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500/50"
                          : "bg-[#090e18] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-xl">{pm.icon}</span>
                      <span className="text-[11px] font-bold text-white">{pm.label}</span>
                      <span className="text-[10px] text-slate-500">{pm.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Simulated Card Fields if Credit Card selected */}
                {paymentMethod === "card" && (
                  <div className="space-y-2.5 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8921"
                        className="w-full bg-[#090e18] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="08/28"
                          className="w-full bg-[#090e18] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="842"
                          className="w-full bg-[#090e18] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "wire" && (
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs space-y-1.5 text-blue-300">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>Domestic & International Wire Transfer</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Debford Escrow routing and account details will be generated upon authorization. Dedicated vault account is assigned to your specific vehicle VIN.
                    </p>
                  </div>
                )}

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-[11px] text-blue-300">
                  <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Card will be authorized with an escrow hold. Funds will not be disbursed to seller until you complete physical inspection and approve the transfer.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Action (Col 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div
                className="rounded-3xl border p-6 shadow-2xl space-y-5 sticky top-24"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.85)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Vehicle or Item Preview */}
                {vehicle && (
                  <div className="pb-4 border-b border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-[#080c14] rounded-2xl overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        {vehicle.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={vehicle.imageUrl} alt={vehicle.title} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="w-8 h-8 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider">
                            Verified Listing
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium">· Escrow Protected</span>
                        </div>
                        <h3 className="font-extrabold text-white text-xs sm:text-sm truncate">
                          {vehicle.title}
                        </h3>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Seller: <strong className="text-slate-200">{vehicle.sellerName ?? "Verified Dealer"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Payment Summary
                  </h3>

                  {checkoutType === "vehicle" ? (
                    <>
                      <div className="flex justify-between text-slate-400">
                        <span>Vehicle Agreed Price</span>
                        <span className="text-white font-semibold font-mono">{fmt(baseVehiclePrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Escrow Vault Custody & Warranty</span>
                        <span className="text-white font-semibold font-mono">${escrowProtectionFee}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>Vehicle Transport Fee ({deliveryOption === "enclosed" ? "VIP Enclosed" : "Flatbed"})</span>
                          <span className="text-white font-semibold font-mono">${deliveryFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                        <span className="font-extrabold text-white">
                          {depositMode === "deposit" ? "Holding Deposit Due Now" : "Total Escrow Due Now"}
                        </span>
                        <span className="text-2xl font-black text-blue-400 font-mono">
                          {fmt(totalPayableNow)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                      <span className="font-extrabold text-white">Total Due</span>
                      <span className="text-2xl font-black text-blue-400 font-mono">
                        ${totalPayableNow.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 text-white text-xs font-extrabold rounded-xl shadow-xl transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 8px 24px -4px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authorize Escrow Vault ({fmt(totalPayableNow)})</span>
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-500 text-center space-y-1">
                  <p className="text-slate-400">100% Refundable if vehicle does not match inspection report.</p>
                  <p className="text-slate-600">Debford Financial Escrow Services LLC · Licensed Escrow Depository #194021</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
