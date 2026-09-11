"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { placePartsOrder } from "@/lib/actions/parts.actions";

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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [orderCompleteId, setOrderCompleteId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

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
      <div className="min-h-screen surface-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "DEBFORD10" || promoCode.trim().toUpperCase() === "TURBO") {
      setPromoApplied(true);
    } else {
      alert("Invalid promo code. Try 'DEBFORD10' for 10% off!");
    }
  }

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = Math.max(0, total - discount);

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
      }
    });
  }

  if (orderCompleteId) {
    return (
      <div className="min-h-screen surface-base pt-24 pb-16">
        <div className="container-debford max-w-lg mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-xl shadow-emerald-500/20 animate-scaleUp">
            🎉
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              Order Confirmed
            </span>
            <h1 className="text-3xl font-black text-white mt-2 mb-1">
              Thank You for Your Order!
            </h1>
            <p className="text-slate-400 text-xs">
              Order Reference: <strong className="text-blue-400 font-mono">{orderCompleteId}</strong>
            </p>
          </div>

          <div className="glass rounded-3xl border border-white/10 p-6 text-left text-xs space-y-3 bg-[#0d121f]">
            <div className="flex justify-between pb-2 border-b border-white/5 text-slate-400">
              <span>Delivery To:</span>
              <span className="font-bold text-white">{fullName || "Verified Customer"}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-white/5 text-slate-400">
              <span>Shipping Destination:</span>
              <span className="text-white">{city || "Your Address"}, {country}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-white/5 text-slate-400">
              <span>Estimated Delivery:</span>
              <span className="text-emerald-400 font-bold">2–4 Business Days (Express)</span>
            </div>
            <div className="flex justify-between pt-1 text-slate-400 text-sm">
              <span className="font-bold text-white">Total Charged:</span>
              <span className="font-black text-blue-400">${finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full py-3.5 gradient-brand text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 text-center"
            >
              Go to Account Dashboard →
            </Link>
            <Link
              href="/parts"
              className="block w-full py-3 glass border border-white/10 text-slate-300 text-xs font-semibold rounded-xl text-center hover:text-white"
            >
              Continue Shopping Parts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-base pt-16">
      {/* Breadcrumb Header */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <Link href="/parts" className="hover:text-slate-300 transition-colors">Parts Marketplace</Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-slate-300">Shopping Cart ({items.length})</span>
        </div>
      </div>

      <div className="container-debford py-10">
        <h1 className="text-3xl font-extrabold text-white mb-8">
          Your Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border border-white/10 space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto text-slate-500">
              🛒
            </div>
            <h2 className="text-xl font-bold text-white">Your Cart is Currently Empty</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore thousands of genuine OEM and aftermarket auto parts with guaranteed fitment.
            </p>
            <Link
              href="/parts"
              className="inline-block px-6 py-3 gradient-brand text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25"
            >
              Browse Parts Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List (Col 8) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Indicator */}
              <div className="glass rounded-2xl border border-white/10 p-4 space-y-2 bg-[#131b2e]/60">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-slate-200">
                      {amountNeeded === 0 ? (
                        <span className="text-emerald-400 font-bold">🎉 You qualify for FREE Standard Delivery!</span>
                      ) : (
                        <span>
                          Add <strong className="text-white">${amountNeeded}</strong> more for <strong>FREE Shipping</strong>
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{progressToFreeShipping}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="gradient-brand h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="glass rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5">
                {items.map((item) => {
                  const isImageHttp = item.image.startsWith("http");

                  return (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-20 h-20 bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                          {isImageHttp ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-3xl opacity-40">{item.image}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                              {item.brand}
                            </span>
                            {item.partNumber && (
                              <span className="font-mono text-[10px] text-slate-500">
                                #{item.partNumber}
                              </span>
                            )}
                          </div>
                          <Link href={`/parts/${item.id}`} className="block">
                            <h3 className="font-bold text-white text-xs sm:text-sm hover:text-blue-300 transition-colors truncate">
                              {item.title}
                            </h3>
                          </Link>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Merchant: {item.seller}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="flex items-center glass rounded-xl border border-white/10 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-white">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ${item.price} each
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clear Cart button */}
              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/parts"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  ← Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear All Items
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Box (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass rounded-3xl border border-white/15 p-6 shadow-2xl space-y-5 bg-[#0d121f]">
                <h2 className="text-base font-extrabold text-white pb-3 border-b border-white/10">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Items Subtotal ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span className="font-semibold text-white">${subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Standard Shipping</span>
                    <span className={shippingFee === 0 ? "text-emerald-400 font-bold" : "text-white"}>
                      {shippingFee === 0 ? "FREE" : `$${shippingFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Tax (8%)</span>
                    <span className="text-white">${tax.toLocaleString()}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Promo Discount (10%)</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                    <span className="font-extrabold text-white">Total Amount</span>
                    <span className="text-2xl font-black text-blue-400">
                      ${finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Coupon code (try DEBFORD10)"
                    className="flex-1 bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl border border-white/10 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 gradient-brand text-white text-xs font-extrabold rounded-xl hover:opacity-90 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Secure Checkout (${finalTotal.toLocaleString()})</span>
                </button>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>30-Day Money-Back Fitment Guarantee on all parts.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="glass max-w-lg w-full rounded-3xl border border-white/20 p-6 shadow-2xl space-y-5 bg-[#0e1424] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Complete Parts Order</h3>
                    <p className="text-xs text-slate-400">Total: ${finalTotal.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
                    1. Shipping Information
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Email Address *"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number *"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address *"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full bg-[#131b2e] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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

                <div className="pt-2 border-t border-white/10">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
                    2. Payment Method
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "card", label: "Credit Card", icon: "💳" },
                      { id: "apple_pay", label: "Apple Pay", icon: "🍎" },
                      { id: "paypal", label: "PayPal", icon: "🅿️" },
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer ${
                          paymentMethod === pm.id
                            ? "bg-blue-600/20 border-blue-500 text-white font-bold"
                            : "bg-[#131b2e] border-white/10 text-slate-400"
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

                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-3 bg-white/5 text-slate-300 rounded-xl font-bold hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3 gradient-brand text-white font-extrabold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Place Order (${finalTotal.toLocaleString()})</span>
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
