import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  getDashboardStats,
  getMyListings,
  getNotifications,
  isSupabaseConfigured,
} from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import {
  Car,
  Tag,
  MessageSquare,
  Star,
  Plus,
  Compass,
  Key,
  Gavel,
  Wrench,
  Package,
  ShieldCheck,
  ArrowRight,
  Clock,
  ChevronRight,
  Bell,
  Sparkles,
  TrendingUp,
  DollarSign,
  Lock,
  CheckCircle2,
  User,
  Shield,
  FileText,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Private Fleet & Account Command — Debford",
  description: "Manage your registered fleet, active listings, escrow transactions, and specialist service appointments.",
};

const TELEMETRY_METRICS = [
  { label: "Portfolio Value", value: "$345,000+", desc: "Estimated Fleet Equity", icon: DollarSign, color: "text-emerald-400" },
  { label: "Escrow In-Flight", value: "1 Active Hold", desc: "100% Insured Vault Custody", icon: ShieldCheck, color: "text-blue-400" },
  { label: "Scheduled Care", value: "2 Appointments", desc: "Certified Specialist Bays", icon: Wrench, color: "text-amber-400" },
  { label: "Trust Index", value: "99.8%", desc: "Verified Debford Rating", icon: Star, color: "text-purple-400" },
];

const QUICK_COMMANDS = [
  { label: "Direct Offers", desc: "Negotiations & Deals", href: "/offers", icon: Tag, color: "from-blue-600/20 to-indigo-900/10", border: "border-blue-500/20" },
  { label: "Consign Vehicle", desc: "List in Marketplace", href: "/sell", icon: Plus, color: "from-blue-600/20 to-blue-900/10", border: "border-blue-500/20" },
  { label: "Showroom", desc: "Browse Vehicles", href: "/vehicles", icon: Compass, color: "from-purple-600/20 to-purple-900/10", border: "border-purple-500/20" },
  { label: "Fleet Rentals", desc: "Exotic & Executive", href: "/rentals", icon: Key, color: "from-emerald-600/20 to-emerald-900/10", border: "border-emerald-500/20" },
  { label: "Live Auctions", desc: "Real-Time Arena", href: "/auctions", icon: Gavel, color: "from-amber-600/20 to-amber-900/10", border: "border-amber-500/20" },
  { label: "Specialist Care", desc: "Certified Mechanics", href: "/services", icon: Wrench, color: "from-rose-600/20 to-rose-900/10", border: "border-rose-500/20" },
  { label: "Parts Catalog", desc: "OEM & Performance", href: "/parts", icon: Package, color: "from-cyan-600/20 to-cyan-900/10", border: "border-cyan-500/20" },
];

export default async function DashboardPage() {
  const isConfigured = isSupabaseConfigured();
  let user: any = null;
  let profile: any = null;
  let stats: any = null;
  let listingsData: { listings: any[] } = { listings: [] };
  let notificationsData: { notifications: any[] } = { notifications: [] };

  if (isConfigured) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, membership_tier, listings_count, sales_count, role")
          .eq("id", user.id)
          .single();
        profile = prof;

        const [s, l, n] = await Promise.all([
          getDashboardStats(),
          getMyListings(),
          getNotifications(10),
        ]);
        stats = s;
        listingsData = l;
        notificationsData = n;
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback demo data if user is not authenticated or Supabase is local demo
  const isDemo = !user;
  const userName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Alexander Vance";
  const userRole = profile?.role ?? "Verified Collector";
  const userTier = profile?.membership_tier ?? "VIP Concierge";
  const userInitial = userName.charAt(0).toUpperCase();

  const activeStats = {
    vehiclesCount: stats?.vehiclesCount ?? (isDemo ? 2 : 0),
    activeListings: stats?.activeListings ?? (isDemo ? 1 : 0),
    unreadMessages: stats?.unreadMessages ?? (isDemo ? 3 : 0),
    membershipTier: userTier,
  };

  const demoListings = [
    {
      id: "lst-1",
      title: "2023 Porsche 911 GT3 RS — Clubsport Package",
      price: 248500,
      currency: "USD",
      status: "published",
      views_count: 512,
      inquiries_count: 18,
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      year: 2023,
      make: "Porsche",
      model: "911 GT3 RS",
    },
    {
      id: "lst-2",
      title: "2022 BMW M4 Competition Coupe (G82)",
      price: 78900,
      currency: "USD",
      status: "pending_review",
      views_count: 142,
      inquiries_count: 4,
      imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      year: 2022,
      make: "BMW",
      model: "M4 Competition",
    },
  ];

  const currentListings = listingsData.listings.length > 0 ? listingsData.listings : (isDemo ? demoListings : []);

  const demoNotifications = [
    {
      id: "nt-1",
      type: "bid",
      title: "Live Auction Bid Telemetry",
      body: "High bid of $185,000 received on 2021 Aston Martin Vantage.",
      time: "14m ago",
      is_read: false,
      link: "/auctions",
    },
    {
      id: "nt-2",
      type: "escrow",
      title: "Escrow Hold Confirmed",
      body: "Holding deposit of $1,000 secured for Porsche 911 GT3 RS.",
      time: "1h ago",
      is_read: false,
      link: "/checkout?type=vehicle",
    },
    {
      id: "nt-3",
      type: "service",
      title: "Service Diagnostic Scheduled",
      body: "Mobile Inspection Van confirmed for Tuesday at 10:00 AM.",
      time: "5h ago",
      is_read: true,
      link: "/services/requests",
    },
    {
      id: "nt-4",
      type: "parts",
      title: "Express Dispatch Confirmed",
      body: "Order PO-98842 has shipped with priority air courier.",
      time: "1d ago",
      is_read: true,
      link: "/cart",
    },
  ];

  const currentNotifications = notificationsData.notifications.length > 0
    ? notificationsData.notifications
    : (isDemo ? demoNotifications : []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ backgroundColor: "#06090e" }}>
      <Navbar userEmail={user?.email ?? (isDemo ? "alexander@debford.com" : undefined)} />

      {/* Top Breadcrumbs Scrim */}
      <div
        className="border-b relative"
        style={{
          borderColor: "rgba(255, 255, 255, 0.06)",
          backgroundColor: "#080c14",
        }}
      >
        <div className="container-debford py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300 font-medium">Account Command Center</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Vault Online
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Status Ribbon */}
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

      {/* Main Workspace */}
      <div className="container-debford py-8 flex-1">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 8px 24px -4px rgba(37, 99, 235, 0.4)",
              }}
            >
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome back, {userName.split(" ")[0]}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Member
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Role: <strong className="text-slate-200">{userRole}</strong></span>
                <span>·</span>
                <span>Tier: <strong className="text-blue-400">{userTier}</strong></span>
                <span>·</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Escrow Depository Active
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/garage"
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
            >
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Private Garage Vault</span>
            </Link>
            <Link
              href="/sell"
              className="px-4 py-2.5 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 8px 20px -4px rgba(37, 99, 235, 0.4)",
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Consign New Vehicle</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Telemetry Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Registered Fleet",
              value: activeStats.vehiclesCount,
              unit: "Vehicles",
              icon: Car,
              href: "/garage",
              badge: "Vault Encrypted",
              color: "text-blue-400",
            },
            {
              label: "Marketplace Listings",
              value: activeStats.activeListings,
              unit: "Active",
              icon: Tag,
              href: "/garage",
              badge: "+18 Inquiries",
              color: "text-purple-400",
            },
            {
              label: "Encrypted Inquiries",
              value: activeStats.unreadMessages,
              unit: "Unread",
              icon: MessageSquare,
              href: "/messages",
              badge: "Real-time Sync",
              color: "text-emerald-400",
            },
            {
              label: "Membership Status",
              value: activeStats.membershipTier,
              unit: "",
              icon: Star,
              href: "/membership",
              badge: "Tier Privileges",
              color: "text-amber-400",
            },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className="rounded-3xl border p-5 transition-all hover:border-white/20 group relative overflow-hidden block"
                style={{
                  backgroundColor: "rgba(13, 18, 31, 0.75)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    {card.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-2xl font-black text-white font-mono">{card.value}</span>
                  {card.unit && <span className="text-xs text-slate-500 font-medium">{card.unit}</span>}
                </div>
                <span className="text-xs text-slate-400 font-medium block truncate">{card.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 6-Pillar Quick Command Matrix */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Automotive Ecosystem Quick Commands
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_COMMANDS.map((qc, idx) => {
              const Icon = qc.icon;
              return (
                <Link
                  key={idx}
                  href={qc.href}
                  className={`rounded-2xl border p-3.5 flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] bg-gradient-to-br ${qc.color} ${qc.border} hover:border-white/25`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">{qc.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block leading-tight">{qc.desc}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Active Listings & Escrow Tracker (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Active Listings Stream */}
            <div
              className="rounded-3xl border p-6 space-y-4"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-400" />
                    Marketplace Fleet & Listings
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Vehicles consigned under your Debford portfolio
                  </p>
                </div>
                <Link
                  href="/sell"
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>+ Consign Another</span>
                </Link>
              </div>

              {currentListings.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto text-slate-500">
                    🚗
                  </div>
                  <h3 className="text-sm font-bold text-white">No Vehicles Listed Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Consign your vehicle with Debford Escrow protection, free VIN decoder, and access to 48,000+ verified buyers.
                  </p>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                  >
                    <span>List Your First Vehicle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentListings.map((lst: any) => {
                    const img = lst.imageUrl ?? lst.vehicle?.images?.[0]?.url;
                    return (
                      <div
                        key={lst.id}
                        className="p-4 rounded-2xl border border-white/5 bg-[#080c14]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                            {img ? (
                              <Image src={img} alt={lst.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🏎️</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
                              {lst.year ?? lst.vehicle?.year} {lst.make ?? lst.vehicle?.make_name}
                            </span>
                            <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                              {lst.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                              <span>{lst.views_count ?? 0} views</span>
                              <span>·</span>
                              <span>{lst.inquiries_count ?? 0} inquiries</span>
                              <span>·</span>
                              <span className="text-emerald-400 font-medium">Escrow Ready</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          <div className="text-right">
                            <div className="text-sm font-black text-white font-mono">
                              ${Number(lst.price).toLocaleString()}
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-0.5 ${
                                lst.status === "published"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                  : lst.status === "pending_review"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                                  : "bg-slate-500/15 text-slate-400 border border-slate-500/25"
                              }`}
                            >
                              {lst.status === "pending_review" ? "In Review" : lst.status}
                            </span>
                          </div>

                          <Link
                            href="/garage"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Manage Vehicle in Garage"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Escrow In-Flight Tracker Card */}
            <div
              className="rounded-3xl border p-6 space-y-4"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    Active Escrow Custody Holds
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  1 Transaction Secured
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#080c14]/90 border border-white/5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Vault Reference: ESC-77291A
                    </span>
                    <h3 className="font-bold text-white text-xs sm:text-sm mt-0.5">
                      2023 Porsche 911 GT3 RS — Holding Deposit
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-blue-400 block">$1,000.00</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Funds In Custody</span>
                  </div>
                </div>

                {/* 4-Step Escrow Roadmap Bar */}
                <div className="pt-2 border-t border-white/5">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { step: "Deposit Held", status: "completed" },
                      { step: "150-Pt Report", status: "active" },
                      { step: "Key Handover", status: "pending" },
                      { step: "Final Payout", status: "pending" },
                    ].map((s, idx) => (
                      <div key={idx} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            s.status === "completed"
                              ? "bg-emerald-400"
                              : s.status === "active"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-white/10"
                          }`}
                        />
                        <span className={`text-[10px] font-medium block ${
                          s.status === "completed" ? "text-emerald-400" : s.status === "active" ? "text-blue-300 font-bold" : "text-slate-600"
                        }`}>
                          {s.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Seller: Stuttgart Heritage Motors</span>
                  <Link href="/messages" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                    <span>Message Seller</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Notifications & Privileges (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Notifications Feed */}
            <div
              className="rounded-3xl border p-6 space-y-4"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-400" />
                  Recent Notifications
                </h2>
                <Link href="/notifications" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {currentNotifications.slice(0, 4).map((n: any) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      !n.is_read
                        ? "bg-white/[0.04] border-blue-500/25"
                        : "bg-white/[0.01] border-white/5 opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{n.body}</p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px] text-slate-500">
                      <span>{n.time ?? "Recently"}</span>
                      {n.link && (
                        <Link href={n.link} className="text-blue-400 hover:text-blue-300 font-semibold">
                          View details →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Offers Quick Card */}
            <div
              className="rounded-3xl border p-6 space-y-3"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  Direct Offers Pipeline
                </h2>
                <Link href="/offers" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-sm">⏳</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Pending Review</span>
                      <span className="text-[10px] text-slate-400">Incoming buyer bids</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Demo: 1
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm">🛡️</span>
                    <div>
                      <span className="text-xs font-bold text-white block">Escrow Ready</span>
                      <span className="text-[10px] text-slate-400">Accepted deals</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Demo: 1
                  </span>
                </div>
              </div>
              <Link
                href="/offers"
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>Open Negotiation Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Collector VIP Membership Tier Box */}
            <div
              className="rounded-3xl border p-6 space-y-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(13, 18, 31, 0.9) 100%)",
                borderColor: "rgba(37, 99, 235, 0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                  Tier Privileges
                </span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">Collector VIP Club</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Unlimited private listings, zero buyer escrow fees, 24/7 dedicated automotive concierge, and free mobile inspections.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-1 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>0% Commission on Collector Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Priority Transport Dispatch</span>
                </div>
              </div>

              <Link
                href="/membership"
                className="block w-full py-2.5 text-center text-xs font-bold text-white rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Manage Membership & Benefits
              </Link>
            </div>

            {/* Profile & Security Quick Links */}
            <div
              className="rounded-3xl border p-6 space-y-3"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.75)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Vault Security & Settings
              </h3>
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Profile & KYC Credentials</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/verification"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Identity & Escrow Accreditation</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/saved"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Saved Watchlist & Price Alerts</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
