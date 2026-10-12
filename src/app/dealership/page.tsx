import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { Navbar } from "@/components/layout/Navbar";
import { getDealerAnalytics } from "@/lib/actions/dealer.actions";
import { DealerAnalyticsClient } from "@/components/dealership/DealerAnalyticsClient";
import {
  ChevronRight,
  ShieldCheck,
  Star,
  Plus,
  Settings,
  BarChart2,
  Car,
  Eye,
  MessageSquare,
  DollarSign,
  Calendar,
  Edit3,
  Trash2,
  Users,
  UserPlus,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dealership Fleet Command Centre — Debford",
  description:
    "Manage your dealership inventory, monitor telemetry, collaborate with your sales team, and access performance analytics on Debford.",
};

const MOCK_INVENTORY = [
  { id: "d1", title: "2023 Toyota Camry SE", price: 32000, status: "published", views: 412, inquiries: 14, days: 8 },
  { id: "d2", title: "2022 BMW 5 Series 530i", price: 62000, status: "published", views: 287, inquiries: 9, days: 15 },
  { id: "d3", title: "2024 Tesla Model 3 LR", price: 48500, status: "pending_review", views: 0, inquiries: 0, days: 1 },
  { id: "d4", title: "2021 Jeep Wrangler Rubicon", price: 44000, status: "sold", views: 892, inquiries: 31, days: 0 },
  { id: "d5", title: "2023 Mercedes GLE 350", price: 74500, status: "published", views: 156, inquiries: 5, days: 22 },
];

const TEAM_MEMBERS = [
  { name: "James Kowalski", role: "Sales Manager", email: "james@dealership.com", listings: 12, initials: "JK", online: true },
  { name: "Sarah Chen", role: "Sales Consultant", email: "sarah@dealership.com", listings: 8, initials: "SC", online: true },
  { name: "Mike Torres", role: "Finance Manager", email: "mike@dealership.com", listings: 0, initials: "MT", online: false },
];

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  published: {
    label: "Live",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    dot: "bg-emerald-400",
  },
  pending_review: {
    label: "Pending Review",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    dot: "bg-amber-400",
  },
  sold: {
    label: "Sold",
    className: "text-slate-400 bg-slate-500/10 border-slate-500/25",
    dot: "bg-slate-500",
  },
  draft: {
    label: "Draft",
    className: "text-blue-400 bg-blue-500/10 border-blue-500/25",
    dot: "bg-blue-400",
  },
};

export default async function DealershipPage() {
  let user = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }
  }
  if (!user && isSupabaseConfigured()) redirect("/login?redirectTo=/dealership");

  const analytics = await getDealerAnalytics();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "Prestige Motors — Debford Certified Dealer",
    description: "Verified dealership fleet command, inventory, and escrow sales on Debford.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "187",
    },
  };

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  return (
    <main className="min-h-screen bg-[#06090e] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <Navbar userEmail={user?.email} />

      {/* ── CINEMATIC DEALERSHIP HEADER ─────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#080d16]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[350px] h-[200px] bg-amber-600/6 rounded-full blur-[100px] pointer-events-none" />

        {/* Technical Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-6 tracking-wide">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-blue-400 font-semibold">Fleet Command Centre</span>
          </nav>

          {/* Dealership Identity */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Dealership Crest */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-2xl shadow-blue-500/25 shrink-0">
                <div className="w-full h-full bg-[#080d16] rounded-[14px] flex items-center justify-center text-white font-black text-2xl sm:text-3xl">
                  P
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    Prestige Motors
                  </h1>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Dealer</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-white">4.9</span>
                    <span>(187 reviews)</span>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>New York, NY</span>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="font-mono text-slate-400">Pro Dealer Plan</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/dealership/settings"
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium hover:border-white/20 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </Link>
              <Link
                href="/sell"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>Add Inventory</span>
              </Link>
            </div>
          </div>

          {/* ── TELEMETRY KPI RIBBON ─────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/8">
            {[
              { label: "Active Listings", value: "24", Icon: Car, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Total Views", value: "8,412", Icon: Eye, color: "text-slate-300", bg: "bg-white/[0.03] border-white/8" },
              { label: "Inquiries", value: "143", Icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
              { label: "Sales MTD", value: fmt.format(284000), Icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Avg. Days Listed", value: "12d", Icon: Calendar, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            ].map(({ label, value, Icon, color, bg }) => (
              <div key={label} className={`flex items-center gap-3 p-3 rounded-xl border ${bg}`}>
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className={`text-base font-bold font-mono ${color} leading-none`}>{value}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN COMMAND GRID ───────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Inventory Fleet Table & Analytics */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 shadow-2xl overflow-hidden">
              {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Fleet</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-bold">
                  {MOCK_INVENTORY.length} Units
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-1.5 bg-[#070b12] border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500/70 appearance-none cursor-pointer">
                  <option>All Status</option>
                  <option>Live</option>
                  <option>Pending Review</option>
                  <option>Sold</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Vehicle", "Price", "Status", "Views", "Inquiries", "Age", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INVENTORY.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#070b12] border border-white/8 rounded-lg flex items-center justify-center shrink-0">
                              <Car className="w-4 h-4 text-slate-500" />
                            </div>
                            <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {item.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold text-blue-400 font-mono">{fmt.format(item.price)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border rounded-full ${cfg.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-slate-300 font-mono">{item.views.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-slate-300 font-mono">{item.inquiries}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs text-slate-400 font-mono">
                            {item.status === "sold" ? "—" : `${item.days}d`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/8 hover:border-white/20 rounded-lg transition-all">
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/35 rounded-lg transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3.5 border-t border-white/8 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing <strong className="text-slate-300">{MOCK_INVENTORY.length}</strong> of 24 units
              </span>
              <Link
                href="/sell"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add unit to fleet</span>
              </Link>
            </div>
          </div>

          {/* Dealer Analytics Telemetry Suite */}
          <DealerAnalyticsClient analytics={analytics} />
        </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Sales Team Panel */}
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Sales Team</h2>
                </div>
                <button className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite</span>
                </button>
              </div>

              <div className="space-y-3">
                {TEAM_MEMBERS.map((m) => (
                  <div key={m.email} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#070b12] border border-white/6">
                    {/* Avatar with online pulse */}
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                        {m.initials}
                      </div>
                      {m.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#070b12]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.role}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-blue-400">{m.listings}</div>
                      <div className="text-[10px] text-slate-500">listings</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Performance Analytics */}
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">This Month</h2>
              </div>

              <div className="space-y-4">
                {[
                  { label: "New listings added", value: "7", bar: 70, color: "from-blue-600 to-indigo-600" },
                  { label: "Listings sold", value: "3", bar: 30, color: "from-emerald-600 to-teal-600" },
                  { label: "Inquiries received", value: "47", bar: 65, color: "from-purple-600 to-indigo-600" },
                  { label: "Profile views", value: "1,204", bar: 85, color: "from-amber-500 to-orange-600" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-slate-400">{m.label}</span>
                      <span className="text-xs font-bold text-white font-mono">{m.value}</span>
                    </div>
                    <div className="h-1.5 bg-[#070b12] rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                        style={{ width: `${m.bar}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-br from-amber-950/60 to-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-5 shadow-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">Upgrade to Enterprise</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock bulk inventory import, branded dealership landing page, AI-powered valuation, and a
                dedicated Debford account manager.
              </p>
              <Link
                href="/membership"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                <span>View Enterprise Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-4 shadow-2xl space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Access</p>
              {[
                { label: "Verification & Trust Centre", href: "/verification", Icon: ShieldCheck, color: "text-blue-400" },
                { label: "Performance Analytics", href: "/dashboard", Icon: TrendingUp, color: "text-emerald-400" },
                { label: "Membership & Billing", href: "/membership", Icon: Award, color: "text-amber-400" },
              ].map(({ label, href, Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#070b12] border border-white/6 hover:border-white/15 hover:bg-white/[0.04] transition-all group"
                >
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dealership Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
