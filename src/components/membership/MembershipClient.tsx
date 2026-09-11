"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Crown,
  Zap,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  switchMembershipPlan,
  cancelMembershipSubscription,
  MembershipTier,
  BillingCycle,
  MembershipStatus,
} from "@/lib/actions/membership.actions";

interface Props {
  initialMembership: MembershipStatus | null;
  isAuthenticated: boolean;
}

interface PlanDef {
  id: MembershipTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  badge?: string;
  isPopular?: boolean;
  colorScheme: {
    border: string;
    glow: string;
    badgeBg: string;
    btnClass: string;
  };
  highlights: string[];
  features: { label: string; included: boolean }[];
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free Explorer",
    tagline: "Essential tools for casual buyers and private one-off sellers.",
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    colorScheme: {
      border: "border-white/10 hover:border-white/20",
      glow: "",
      badgeBg: "bg-slate-700 text-slate-300",
      btnClass: "glass border border-white/15 text-slate-200 hover:border-white/30 hover:text-white",
    },
    highlights: ["3 active listings", "Direct buyer messaging", "Digital garage (5 vehicles)"],
    features: [
      { label: "3 active vehicle listings", included: true },
      { label: "Standard search placement", included: true },
      { label: "Direct chat & offer negotiations", included: true },
      { label: "Digital Garage for 5 vehicles", included: true },
      { label: "Standard KYC verification badge", included: true },
      { label: "Featured listing boost", included: false },
      { label: "Dealer storefront & custom branding", included: false },
      { label: "Listing performance analytics", included: false },
      { label: "Live auction bidding & hosting", included: false },
      { label: "Dedicated account manager", included: false },
    ],
  },
  {
    id: "basic",
    name: "Basic Seller",
    tagline: "Ideal for active sellers and enthusiasts managing a small fleet.",
    monthlyPrice: 19,
    annualMonthlyPrice: 15,
    colorScheme: {
      border: "border-blue-500/30 hover:border-blue-500/50",
      glow: "hover:shadow-blue-500/10",
      badgeBg: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      btnClass: "glass border border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white",
    },
    highlights: ["10 active listings", "2 featured boosts / month", "Basic vehicle analytics"],
    features: [
      { label: "10 active vehicle listings", included: true },
      { label: "Boosted search placement", included: true },
      { label: "2 featured listings / month", included: true },
      { label: "Digital Garage for 15 vehicles", included: true },
      { label: "Listing views & inquiry metrics", included: true },
      { label: "Verified Seller Badge", included: true },
      { label: "Standard email support (< 24h)", included: true },
      { label: "Dealer storefront & custom branding", included: false },
      { label: "Live auction hosting", included: false },
      { label: "Bulk inventory CSV sync", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Dealer",
    tagline: "For professional automotive dealers, brokerages, and high-volume sellers.",
    monthlyPrice: 49,
    annualMonthlyPrice: 39,
    badge: "⭐ Most Popular",
    isPopular: true,
    colorScheme: {
      border: "border-blue-500 ring-2 ring-blue-500/30",
      glow: "shadow-2xl shadow-blue-500/20",
      badgeBg: "gradient-brand text-white shadow-lg shadow-blue-500/30",
      btnClass: "gradient-brand text-white hover:opacity-95 shadow-lg shadow-blue-500/30",
    },
    highlights: ["Unlimited listings", "10 featured boosts / month", "Verified Dealer badge", "Full auction access"],
    features: [
      { label: "Unlimited vehicle listings", included: true },
      { label: "Top-tier search priority", included: true },
      { label: "10 featured listings / month ($99 value)", included: true },
      { label: "Verified Dealer gold badge", included: true },
      { label: "Branded dealer profile & inventory page", included: true },
      { label: "Full realtime analytics & lead CRM", included: true },
      { label: "Live auction bidding & hosting", included: true },
      { label: "Digital Garage for 50 vehicles", included: true },
      { label: "Priority customer support (< 2h)", included: true },
      { label: "3 sub-dealer team logins", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Fleet",
    tagline: "Tailored for commercial dealerships, auction houses, and multi-location fleets.",
    monthlyPrice: 199,
    annualMonthlyPrice: 159,
    badge: "💎 Dealerships & Fleets",
    colorScheme: {
      border: "border-amber-500/40 hover:border-amber-500/70",
      glow: "hover:shadow-amber-500/15",
      badgeBg: "bg-amber-500 text-amber-950 font-extrabold",
      btnClass: "border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-amber-950 font-bold",
    },
    highlights: ["Unlimited + automated DMS feed", "Homepage spotlight placement", "24/7 dedicated account manager"],
    features: [
      { label: "Unlimited listings + automated DMS sync", included: true },
      { label: "Permanent homepage showcase spot", included: true },
      { label: "Unlimited monthly featured boosts", included: true },
      { label: "Official Certified Enterprise badge", included: true },
      { label: "Custom branded URL & website widget", included: true },
      { label: "Enterprise API access & webhooks", included: true },
      { label: "Private dealer auction hosting", included: true },
      { label: "Unlimited garage & fleet management", included: true },
      { label: "Dedicated account manager & phone line", included: true },
      { label: "Unlimited team member seats", included: true },
    ],
  },
];

const FAQS = [
  {
    q: "Can I upgrade or downgrade my plan at any time?",
    a: "Yes! You can switch between Free, Basic, Pro, and Enterprise anytime. When upgrading or changing billing cycles, new features unlock instantly and billing is automatically prorated.",
  },
  {
    q: "How does the annual discount work?",
    a: "Selecting annual billing saves you 20% compared to month-to-month billing. You are billed once per year at the discounted rate.",
  },
  {
    q: "What perks does the Verified Dealer badge provide?",
    a: "Verified Dealer profiles on Pro and Enterprise tiers receive a prominent gold badge across all vehicle cards, boosting buyer trust and conversion by up to 3.4x according to marketplace data.",
  },
  {
    q: "Are there any hidden listing fees or commissions?",
    a: "No hidden listing fees. Free and paid plans include their stated listing allowances with zero listing surcharge.",
  },
  {
    q: "Can I cancel my subscription if I no longer need it?",
    a: "Absolutely. You can cancel your subscription in 1-click anytime with no cancellation fees. Your plan benefits will remain active until the end of your billing cycle.",
  },
];

export function MembershipClient({ initialMembership, isAuthenticated }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [membership, setMembership] = useState<MembershipStatus | null>(initialMembership);
  const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(
    searchParams.get("success") ? "🎉 Your subscription was successfully activated!" : null
  );

  const currentTier: MembershipTier = membership?.tier ?? "free";

  function handlePlanSelect(plan: PlanDef) {
    setActionError(null);
    setActionSuccess(null);

    if (!isAuthenticated) {
      router.push(`/login?redirectTo=/membership`);
      return;
    }

    if (plan.id === currentTier) {
      return;
    }

    setSelectedPlan(plan);
  }

  function handleConfirmPlanChange() {
    if (!selectedPlan) return;
    setActionError(null);

    startTransition(async () => {
      const res = await switchMembershipPlan(selectedPlan.id, billingCycle);

      if (res.error) {
        setActionError(res.error);
      } else if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        setMembership({
          tier: res.tier as MembershipTier,
          role: selectedPlan.id === "enterprise" || selectedPlan.id === "pro" ? "dealer" : (membership?.role ?? "buyer"),
          email: membership?.email ?? null,
          fullName: membership?.fullName ?? null,
          subscriptionStatus: "active",
          subscriptionExpiresAt: res.expiresAt ?? null,
        });
        setActionSuccess(`🎉 You have successfully upgraded to the ${selectedPlan.name}!`);
        setSelectedPlan(null);
      }
    });
  }

  function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel your paid plan and revert to the Free tier?")) return;
    setActionError(null);

    startTransition(async () => {
      const res = await cancelMembershipSubscription();
      if (res.error) {
        setActionError(res.error);
      } else {
        setMembership({
          tier: "free",
          role: "buyer",
          email: membership?.email ?? null,
          fullName: membership?.fullName ?? null,
          subscriptionStatus: "cancelled",
        });
        setActionSuccess("Your subscription has been cancelled. Account reverted to Free tier.");
        setSelectedPlan(null);
      }
    });
  }

  return (
    <div className="min-h-screen surface-base">
      {/* Hero Header */}
      <div className="relative overflow-hidden surface-raised border-b border-subtle pt-12 pb-14">
        <div className="absolute inset-0 gradient-hero opacity-75" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-debford relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 justify-center">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>›</span>
            <span className="text-slate-300">Membership & Dealer Plans</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Crown className="w-3.5 h-3.5" />
            <span>Powering Over 12,000+ Verified Sellers & Automotive Dealerships</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            Scale Your Automotive Business
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Choose the Debford tier engineered for your ambitions. From verified private sellers to high-volume multi-rooftop dealerships.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center gap-2 p-1.5 glass rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "gradient-brand text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "annual"
                  ? "gradient-brand text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                Save 20%
              </span>
            </button>
          </div>

          {/* User Current Tier Status Bar */}
          {isAuthenticated && membership && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#131b2e] border border-white/10 text-xs text-slate-300">
              <span>Current Active Plan:</span>
              <span className="font-extrabold text-blue-400 uppercase tracking-wider">
                {membership.tier} tier
              </span>
              {membership.subscriptionExpiresAt && (
                <span className="text-slate-500">
                  (Renews: {new Date(membership.subscriptionExpiresAt).toLocaleDateString()})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-debford py-12">
        {/* Success / Error Alerts */}
        {actionSuccess && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between gap-3 text-emerald-300 text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center justify-between gap-3 text-rose-300 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16 items-stretch">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentTier;
            const price = billingCycle === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
            const annualSavings = (plan.monthlyPrice - plan.annualMonthlyPrice) * 12;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between glass rounded-3xl border-2 p-6 transition-all duration-300 ${plan.colorScheme.border} ${plan.colorScheme.glow} ${
                  plan.isPopular ? "bg-gradient-to-b from-blue-950/20 to-[#0c1220]" : "bg-[#0d121f]/90"
                }`}
              >
                {/* Popular / Enterprise Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1 text-xs rounded-full ${plan.colorScheme.badgeBg}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                      {isCurrent && (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full uppercase">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{plan.tagline}</p>
                  </div>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1.5">
                      {price === 0 ? (
                        <span className="text-4xl font-extrabold text-white">Free</span>
                      ) : (
                        <>
                          <span className="text-4xl font-extrabold text-white">${price}</span>
                          <span className="text-xs text-slate-400 font-medium">/ month</span>
                        </>
                      )}
                    </div>
                    {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                      <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                        Billed ${price * 12}/yr (Saved ${annualSavings}/yr)
                      </p>
                    )}
                  </div>

                  {/* Key Highlights */}
                  <div className="mb-6 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Key Highlights
                    </span>
                    {plan.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-2.5 text-xs">
                        <span
                          className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                            f.included
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-800 text-slate-600"
                          }`}
                        >
                          {f.included ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        </span>
                        <span className={f.included ? "text-slate-300" : "text-slate-600 line-through"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA */}
                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 text-center text-xs font-bold rounded-xl bg-white/5 border border-white/10 text-slate-400 cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${plan.colorScheme.btnClass}`}
                    >
                      <span>
                        {currentTier === "free"
                          ? `Upgrade to ${plan.name}`
                          : plan.id === "free"
                          ? "Downgrade to Free"
                          : `Switch to ${plan.name}`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Upgrade Confirmation Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="glass max-w-md w-full rounded-3xl border border-white/20 p-6 shadow-2xl space-y-5 bg-[#0e1424]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Confirm Plan Selection</h3>
                    <p className="text-xs text-slate-400">{selectedPlan.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-[#131b2e] rounded-2xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Plan</span>
                  <span className="font-bold text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Billing Cycle</span>
                  <span className="font-bold text-white capitalize">{billingCycle}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Rate</span>
                  <span className="font-extrabold text-blue-400 text-sm">
                    ${billingCycle === "annual" ? selectedPlan.annualMonthlyPrice : selectedPlan.monthlyPrice}
                    <span className="text-xs text-slate-400 font-normal">/month</span>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Instant Activation & 14-Day Money Back Guarantee</span>
                </div>
                <p className="text-slate-400">
                  You can change or cancel your subscription at any time directly in your account dashboard.
                </p>
              </div>

              {actionError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                  {actionError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPlanChange}
                  disabled={isPending}
                  className="flex-1 py-3 gradient-brand text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Confirm & Activate Plan</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Comparison Matrix */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden mb-16 shadow-2xl">
          <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Full Feature Comparison</h2>
              <p className="text-xs text-slate-400 mt-1">Detailed breakdown of platform capabilities across all tiers</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#131b2e]/60">
                  <th className="text-left px-6 py-4 text-slate-400 font-bold uppercase tracking-wider w-64">
                    Platform Capability
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={`px-4 py-4 text-center font-extrabold uppercase tracking-wider ${
                        p.id === "pro" ? "text-blue-400" : "text-white"
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: "Active Listings Allowance", values: ["3 Listings", "10 Listings", "Unlimited", "Unlimited + DMS Feed"] },
                  { label: "Featured Placement Boosts", values: ["Pay-as-you-go", "2 per month", "10 per month", "Unlimited"] },
                  { label: "Buyer Messaging & Offers", values: ["Standard", "Unlimited", "Unlimited + CRM", "Unlimited + Lead API"] },
                  { label: "Digital Garage Vehicle Slots", values: ["5 Vehicles", "15 Vehicles", "50 Vehicles", "Unlimited Fleet"] },
                  { label: "KYC / Seller Trust Badging", values: ["Standard", "Verified Seller", "Verified Dealer Gold", "Enterprise Certified"] },
                  { label: "Live Auction Hosting & Bidding", values: ["Bidding only", "Bidding only", "Host & Bid", "Private & Public Auctions"] },
                  { label: "Custom Dealership URL & Storefront", values: ["–", "–", "✓ Included", "✓ Branded Portal & Widget"] },
                  { label: "Inventory Performance Analytics", values: ["–", "Basic Views", "Deep Funnel & Leads", "Advanced BI & Export"] },
                  { label: "Customer Support SLA", values: ["Community", "Email (<24h)", "Priority (<2h)", "24/7 Dedicated Manager"] },
                  { label: "Sub-account Team Logins", values: ["1 Account", "1 Account", "3 Team Logins", "Unlimited Seats"] },
                ].map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"}>
                    <td className="px-6 py-3.5 font-medium text-slate-300">{row.label}</td>
                    {row.values.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-4 py-3.5 text-center ${
                          val === "–"
                            ? "text-slate-600"
                            : cIdx === 2
                            ? "text-blue-400 font-bold"
                            : "text-slate-300 font-medium"
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enterprise Callout Banner */}
        <div className="glass rounded-3xl border border-amber-500/30 p-8 mb-16 bg-gradient-to-r from-amber-500/10 via-[#131b2e] to-[#0a0d14] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> High Volume Multi-Rooftop Dealerships
            </span>
            <h3 className="text-2xl font-extrabold text-white">Need a Custom Enterprise Agreement?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We offer bespoke contracts with custom DMS integrations (CDK, Reynolds & Reynolds, DealerTrack), dedicated SLA guarantees, and tailored commission schedules for groups listing 500+ vehicles.
            </p>
          </div>
          <Link
            href="/messages?seller=admin&topic=enterprise"
            className="px-6 py-3.5 bg-amber-500 text-amber-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all shrink-0"
          >
            Talk to Enterprise Sales →
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400">Everything you need to know about plans, billing, and dealer features</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="glass rounded-2xl border border-white/10 group overflow-hidden bg-[#0d121f]/60 transition-colors"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-xs sm:text-sm font-bold text-white list-none">
                  <span>{faq.q}</span>
                  <span className="text-slate-500 group-open:rotate-45 transition-transform text-lg leading-none font-normal shrink-0 ml-3">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          {/* Cancel Subscription link if on a paid plan */}
          {isAuthenticated && currentTier !== "free" && (
            <div className="text-center pt-8">
              <button
                onClick={handleCancelSubscription}
                disabled={isPending}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold transition-colors cursor-pointer"
              >
                Cancel my paid subscription and revert to Free tier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
