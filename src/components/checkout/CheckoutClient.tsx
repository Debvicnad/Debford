"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  Truck,
  CheckCircle2,
  AlertCircle,
  Car,
  Rocket,
  Crown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
} from "lucide-react";
import {
  createPurchaseCheckout,
  createListingBoostCheckout,
  releaseEscrowHold,
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

export function CheckoutClient({
  checkoutType,
  vehicle,
  boostPlan,
  membershipPlan,
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

  const [successReference, setSuccessReference] = useState<string | null>(initialSuccessRef ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prices calculation
  const baseVehiclePrice = vehicle?.price ?? 45000;
  const depositAmount = Math.min(1000, Math.round(baseVehiclePrice * 0.05));
  const deliveryFee = deliveryOption === "enclosed" ? 650 : deliveryOption === "standard" ? 350 : 0;
  const escrowProtectionFee = 49; // Flat platform escrow warranty fee

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

  function handleProcessPayment(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAuthenticated) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.href)}`);
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
      <div className="min-h-screen surface-base pt-24 pb-16">
        <div className="container-debford max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-emerald-500/20 animate-scaleUp">
            🛡️
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              {checkoutType === "vehicle" ? "Escrow Hold Secured" : "Payment Confirmed"}
            </span>
            <h1 className="text-3xl font-black text-white mt-2 mb-1">
              Transaction Successfully Protected
            </h1>
            <p className="text-slate-400 text-xs">
              Debford Vault Reference: <strong className="text-blue-400 font-mono">{successReference}</strong>
            </p>
          </div>

          {/* Milestone Stepper */}
          {checkoutType === "vehicle" && (
            <div className="glass rounded-3xl border border-white/10 p-6 text-left space-y-4 bg-[#0d121f]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Escrow Milestone Roadmap
              </h3>
              <div className="space-y-3">
                {[
                  { title: "1. Deposit Held in Debford Vault", status: "completed", desc: "Funds held in 100% insured digital custody." },
                  { title: "2. Vehicle Inspection & Title Check", status: "current", desc: "Coordinate viewing or order 150-point mobile report." },
                  { title: "3. Physical Handover & Key Release", status: "pending", desc: "Confirm receipt of vehicle and signed title documents." },
                  { title: "4. Escrow Payout Released to Seller", status: "pending", desc: "Funds released only after your explicit approval." },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
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
                    <div>
                      <div className="text-xs font-bold text-white">{step.title}</div>
                      <div className="text-[11px] text-slate-400">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-3.5 gradient-brand text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 text-center"
            >
              Go to Account Dashboard →
            </Link>
            <Link
              href="/messages"
              className="flex-1 py-3.5 glass border border-white/10 hover:border-white/25 text-slate-200 text-xs font-bold rounded-xl text-center"
            >
              Message Seller to Coordinate Handover
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base pt-16 pb-20">
      {/* Breadcrumb */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link href="/vehicles" className="hover:text-slate-300 transition-colors">Marketplace</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-300">Secure Escrow Checkout</span>
        </div>
      </div>

      <div className="container-debford py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Title */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected by Debford Automotive Escrow Vault</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {checkoutType === "vehicle"
                  ? "Vehicle Escrow Protection"
                  : checkoutType === "boost"
                  ? "Listing Visibility Boost"
                  : "Secure Checkout"}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#131b2e] px-3.5 py-2 rounded-xl border border-white/5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Escrow Options (Col 7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Option 1: Payment Mode (Hold Deposit vs Full Purchase) */}
              {checkoutType === "vehicle" && (
                <div className="glass rounded-3xl border border-white/10 p-6 space-y-4 bg-[#0d121f]">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    1. Choose Escrow Protection Tier
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDepositMode("deposit")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        depositMode === "deposit"
                          ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30"
                          : "bg-[#131b2e]/60 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-white">Refundable Holding Deposit</span>
                        <span className="text-xs font-black text-blue-400">${depositAmount}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Reserves vehicle exclusively for 7 days while you inspect and finalize payment.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositMode("full")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        depositMode === "full"
                          ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30"
                          : "bg-[#131b2e]/60 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-white">Full Purchase Escrow</span>
                        <span className="text-xs font-black text-blue-400">{fmt(baseVehiclePrice)}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Full funds held in escrow vault until title and keys are transferred.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Option 2: Delivery / Transport */}
              {checkoutType === "vehicle" && (
                <div className="glass rounded-3xl border border-white/10 p-6 space-y-4 bg-[#0d121f]">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400" />
                    2. Handover & Transport Method
                  </h2>

                  <div className="space-y-2">
                    {[
                      { id: "pickup", label: "Direct In-Person Handover", fee: 0, desc: "Meet seller locally for key exchange and title signing" },
                      { id: "standard", label: "Debford Standard Flatbed Transport", fee: 350, desc: "Door-to-door open carrier shipping with GPS tracking" },
                      { id: "enclosed", label: "VIP Enclosed Vehicle Transport", fee: 650, desc: "Climate-controlled white-glove carrier for luxury/supercars" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setDeliveryOption(opt.id as any)}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          deliveryOption === opt.id
                            ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30"
                            : "bg-[#131b2e]/60 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{opt.label}</span>
                          <span className="text-[11px] text-slate-400">{opt.desc}</span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-400 shrink-0 ml-2">
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
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Option 3: Payment Method Selector */}
              <div className="glass rounded-3xl border border-white/10 p-6 space-y-4 bg-[#0d121f]">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  3. Select Payment Instrument
                </h2>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "card", label: "Credit Card", icon: "💳" },
                    { id: "apple_pay", label: "Apple / Google Pay", icon: "⚡" },
                    { id: "wire", label: "Bank Wire / ACH", icon: "🏦" },
                  ].map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                          : "bg-[#131b2e] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-lg">{pm.icon}</span>
                      <span className="text-[11px]">{pm.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-[11px] text-blue-300">
                  <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    Card will be authorized with an escrow hold. Funds will not be paid to seller until you confirm vehicle inspection.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Action (Col 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass rounded-3xl border border-white/15 p-6 shadow-2xl space-y-5 bg-[#0d121f] sticky top-20">
                {/* Vehicle or Item Preview */}
                {vehicle && (
                  <div className="pb-4 border-b border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        {vehicle.imageUrl ? (
                          <img src={vehicle.imageUrl} alt={vehicle.title} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="w-7 h-7 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block">
                          Verified Listing
                        </span>
                        <h3 className="font-extrabold text-white text-xs sm:text-sm truncate">
                          {vehicle.title}
                        </h3>
                        <div className="text-[11px] text-slate-400">
                          Seller: {vehicle.sellerName ?? "Verified Dealer"}
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
                        <span>Vehicle Purchase Agreed Price</span>
                        <span className="text-white font-semibold">{fmt(baseVehiclePrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Escrow Vault Protection Fee</span>
                        <span className="text-white font-semibold">${escrowProtectionFee}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>Vehicle Transport Fee</span>
                          <span className="text-white font-semibold">${deliveryFee}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                        <span className="font-extrabold text-white">
                          {depositMode === "deposit" ? "Holding Deposit Due Now" : "Total Escrow Due Now"}
                        </span>
                        <span className="text-2xl font-black text-blue-400">
                          {fmt(totalPayableNow)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                      <span className="font-extrabold text-white">Total Due</span>
                      <span className="text-2xl font-black text-blue-400">
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
                  className="w-full py-3.5 gradient-brand text-white text-xs font-extrabold rounded-xl hover:opacity-90 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
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
                  <p>100% Refundable if vehicle does not match inspection report.</p>
                  <p className="text-slate-600">Debford Financial Escrow Services LLC · NMLS #194021</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
