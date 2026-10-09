"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  AlertCircle,
  Lock,
  ChevronRight,
  Package,
  Zap,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useCart } from "@/lib/context/CartContext";
import { placePartsOrder } from "@/lib/actions/parts.actions";

const TELEMETRY_METRICS = [
  { label: "Fitment Guarantee", value: "100%", desc: "Verified by VIN & OE Specs", icon: ShieldCheck, color: "text-emerald-400" },
  { label: "Express Dispatch", value: "24h", desc: "Tracked Priority Freight", icon: Zap, color: "text-amber-400" },
  { label: "Escrow Protection", value: "Insured", desc: "Non-disbursed Vault Custody", icon: Lock, color: "text-blue-400" },
  { label: "Return Window", value: "30 Days", desc: "Zero-Friction Return Policy", icon: RotateCcw, color: "text-purple-400" },
];

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    tax,
    total,
    isMounted,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [orderCompleteId, setOrderCompleteId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple_pay">("card");

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#06090e" }}>
        <div className="w-9 h-9 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (code === "DEBFORD10" || code === "TURBO" || code === "GT3") {
      setPromoApplied(true);
    } else {
      setPromoError("Invalid code. Try 'DEBFORD10' for 10% off!");
    }
  }

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = Math.max(0, total - discount);

  function handleCopyOrderId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  }

  function handleConfirmOrder(e: React.FormEvent) {
    e.preventDefault();
    setOrderError(null);

    startTransition(async () => {
      const res = await placePartsOrder({
        items: items.map((i) => ({
          partId: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          seller: i.seller,
        })),
        fullName,
        email,
        phone,
        streetAddress,
        city,
        postalCode,
        country,
        paymentMethod,
        subtotal,
        shippingFee,
        tax,
        total: finalTotal,
      });

      if (res.error) {
        setOrderError(res.error);
      } else {
        setOrderCompleteId(res.orderId ?? "PO-SUCCESS");
        clearCart();
        setIsCheckoutOpen(false);
      }
    });
  }

  // ── Success Confirmation Screen ──────────────────────────────
  if (orderCompleteId) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col" style={{ backgroundColor: "#06090e" }}>
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden">
          {/* Ambient light backdrop */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(6, 9, 14, 0) 70%)",
            }}
          />

          <div className="max-w-xl w-full mx-auto space-y-6 relative z-10">
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-emerald-500/20 animate-scaleUp">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Order Confirmed & Secured
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
                  Thank You for Your Order
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  A confirmation email and real-time tracking link have been dispatched.
                </p>
              </div>
            </div>

            {/* Reference & Summary Box */}
            <div
              className="rounded-3xl border p-6 text-xs space-y-4"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Order Reference with Copy */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#131b2e] border border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <span className="text-sm font-mono font-bold text-blue-400">
                    {orderCompleteId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(orderCompleteId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRef ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Delivery Details */}
              <div className="divide-y divide-white/5 space-y-2.5 pt-1">
                <div className="flex justify-between text-slate-400 pt-2">
                  <span>Recipient</span>
                  <span className="font-semibold text-white">{fullName || "Verified Buyer"}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2">
                  <span>Destination</span>
                  <span className="font-semibold text-white truncate max-w-[240px]">
                    {city || "Domestic Dispatch"}, {country}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2">
                  <span>Carrier & Dispatch</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" /> 2–4 Business Days (Express Air)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 text-sm">
                  <span className="font-bold text-white">Total Amount Paid</span>
                  <span className="font-black text-blue-400 text-lg">
                    ${finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 4-Step Fulfillment Milestone */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Dispatch Lifecycle Telemetry
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Payment", status: "complete" },
                    { label: "Picking", status: "current" },
                    { label: "In Transit", status: "pending" },
                    { label: "Delivered", status: "pending" },
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          step.status === "complete"
                            ? "bg-emerald-400"
                            : step.status === "current"
                            ? "bg-blue-500 animate-pulse"
                            : "bg-white/10"
                        }`}
                      />
                      <span className={`text-[10px] font-medium block ${
                        step.status === "complete" ? "text-emerald-400" : step.status === "current" ? "text-blue-300 font-bold" : "text-slate-600"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full py-3.5 text-white text-xs font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all hover:opacity-95 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 8px 24px -4px rgba(37, 99, 235, 0.4)",
                }}
              >
                <span>View Order in Account Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/parts"
                className="block w-full py-3 text-slate-300 hover:text-white text-xs font-semibold rounded-xl text-center border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                Continue Shopping Parts Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ backgroundColor: "#06090e" }}>
      <Navbar />

      {/* Hero Breadcrumb Scrim */}
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
          <Link href="/parts" className="hover:text-slate-300 transition-colors">Parts Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300 font-medium">Shopping Cart ({items.length})</span>
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
            {TELEMETRY_METRICS.map((m, idx) => {
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

      {/* Main Cart Workspace */}
      <div className="container-debford py-10 flex-1">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>OEM & Performance Parts Cart</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Review Your Cart
            </h1>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Total Items: <strong className="text-white">{items.reduce((acc, i) => acc + i.quantity, 0)}</strong>
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer px-3 py-1.5 rounded-xl border border-white/5 hover:border-rose-500/30 bg-white/[0.02]"
              >
                Clear All Items
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State Sanctuary */
          <div
            className="text-center py-24 rounded-3xl border max-w-xl mx-auto space-y-5"
            style={{
              backgroundColor: "rgba(13, 18, 31, 0.6)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-4xl mx-auto shadow-inner">
              <ShoppingBag className="w-9 h-9 text-slate-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Cart is Currently Empty</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
                Discover guaranteed OEM components, carbon aero enhancements, performance exhausts, and braking systems.
              </p>
            </div>
            <div>
              <Link
                href="/parts"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:opacity-95 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 8px 24px -4px rgba(37, 99, 235, 0.4)",
                }}
              >
                <span>Browse Parts Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Items List (Col 8) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Indicator */}
              <div
                className="rounded-2xl border p-4 space-y-2.5"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.7)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-semibold text-slate-200">
                      {amountNeeded === 0 ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /> You qualify for FREE Standard Ground Delivery!
                        </span>
                      ) : (
                        <span>
                          Add <strong className="text-white font-bold">${amountNeeded}</strong> more to unlock <strong className="text-emerald-400">FREE Shipping</strong>
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] font-bold">
                    {progressToFreeShipping}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressToFreeShipping}%`,
                      background: progressToFreeShipping >= 100
                        ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                        : "linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)",
                      boxShadow: progressToFreeShipping >= 100
                        ? "0 0 12px rgba(16, 185, 129, 0.5)"
                        : "0 0 12px rgba(56, 189, 248, 0.4)",
                    }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div
                className="rounded-3xl border overflow-hidden divide-y divide-white/5"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.75)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {items.map((item) => {
                  const isImageHttp = item.image && item.image.startsWith("http");

                  return (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-20 h-20 bg-[#080c14] rounded-2xl overflow-hidden shrink-0 border border-white/10 flex items-center justify-center group">
                          {isImageHttp ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-3xl opacity-50">{item.image || "📦"}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                              {item.brand || "OEM"}
                            </span>
                            {item.partNumber && (
                              <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                OE #{item.partNumber}
                              </span>
                            )}
                          </div>
                          <Link href={`/parts/${item.id}`} className="block">
                            <h3 className="font-bold text-white text-xs sm:text-sm hover:text-blue-300 transition-colors truncate max-w-md">
                              {item.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span>Seller: <strong className="text-slate-300 font-medium">{item.seller}</strong></span>
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Fitment Guaranteed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        {/* Stepper */}
                        <div className="flex items-center rounded-xl border border-white/10 p-1 bg-[#090e18]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Decrease Quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-white font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-25 transition-colors cursor-pointer"
                            title="Increase Quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <div className="text-sm font-black text-white">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ${item.price} ea
                          </div>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav actions */}
              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/parts"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                >
                  ← Continue Shopping Parts
                </Link>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Eligible for Debford 30-Day Money-Back Protection</span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Box (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              <div
                className="rounded-3xl border p-6 shadow-2xl space-y-5 sticky top-24"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.85)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
                    Order Summary
                  </h2>
                  <span className="text-[11px] font-mono text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    {items.reduce((s, i) => s + i.quantity, 0)} Items
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-white">${subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Express Freight Shipping</span>
                    <span className={shippingFee === 0 ? "text-emerald-400 font-bold" : "text-white font-semibold"}>
                      {shippingFee === 0 ? "FREE" : `$${shippingFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="text-white font-semibold">${tax.toLocaleString()}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-emerald-400 font-semibold p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span>Promotional Discount (10%)</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                    <span className="font-extrabold text-white">Total Amount</span>
                    <span className="text-2xl font-black text-blue-400 font-mono">
                      ${finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (e.g. DEBFORD10)"
                      className="flex-1 bg-[#090e18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-rose-400">{promoError}</p>
                  )}
                  {promoApplied && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Coupon DEBFORD10 applied successfully
                    </p>
                  )}
                </form>

                {/* Primary Checkout Triggers */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-3.5 text-white text-xs font-extrabold rounded-xl shadow-xl transition-all hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 8px 24px -4px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Proceed to Express Checkout (${finalTotal.toLocaleString()})</span>
                  </button>
                </div>

                {/* Escrow Guarantee Pill */}
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Debford 30-Day Guarantee: 100% money back if not compatible.</span>
                </div>

                {/* Accepted Payment Chips */}
                <div className="pt-2 border-t border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-bold">
                    Secure Payment Accepted
                  </span>
                  <div className="flex items-center justify-center gap-2 flex-wrap text-slate-400 text-xs">
                    {["Visa", "Mastercard", "Amex", "Apple Pay", "PayPal", "Escrow"].map((m) => (
                      <span key={m} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-medium text-slate-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Express Checkout Modal ──────────────────────────────── */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
            <div
              className="max-w-lg w-full rounded-3xl border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: "#0d121f",
                borderColor: "rgba(255, 255, 255, 0.12)",
                boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Complete Parts Order</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Payable Total: <strong className="text-blue-400 font-bold">${finalTotal.toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
                {/* 1. Shipping Details */}
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    1. Shipping & Dispatch Destination
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Email Address *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number *"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address *"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="City *"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Postal Code *"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Country *"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Instrument */}
                <div className="pt-2 border-t border-white/10">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    2. Payment Method
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "card", label: "Credit Card", icon: "💳" },
                      { id: "apple_pay", label: "Apple / Pay", icon: "⚡" },
                      { id: "paypal", label: "PayPal", icon: "🅿️" },
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === pm.id
                            ? "bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500/30"
                            : "bg-[#131b2e] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-base">{pm.icon}</span>
                        <span className="text-[11px]">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {orderError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-3 bg-white/5 text-slate-300 rounded-xl font-bold hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3 text-white font-extrabold rounded-xl shadow-lg transition-all hover:opacity-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 8px 20px -4px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Authorize & Place Order (${finalTotal.toLocaleString()})</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
