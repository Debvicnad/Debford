"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  ShoppingBag,
  Gavel,
  Wrench,
  Key,
  BarChart2,
  Activity,
  DollarSign,
  Package,
} from "lucide-react";
import type { PlatformAnalytics } from "@/lib/actions/analytics.actions";

interface Props {
  analytics: PlatformAnalytics;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  color: string;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/15 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              isPositive
                ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                : "text-rose-400 bg-rose-400/10 border-rose-400/20"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-white group-hover:text-blue-300 transition-colors">
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

// Tiny sparkline using inline SVG — no external chart library needed
function Sparkline({
  data,
  color = "#3b82f6",
}: {
  data: { date: string; count: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 300;
  const H = 48;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - (d.count / max) * H;
      return `${x},${y}`;
    })
    .join(" ");

  const area = `0,${H} ${points} ${W},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={area}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BarRow({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((count / Math.max(max, 1)) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-8 text-right">{count}</span>
    </div>
  );
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

const num = (n: number) =>
  n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

export function AdminAnalyticsPanel({ analytics: a }: Props) {
  const maxMake = useMemo(() => Math.max(...a.topMakes.map((m) => m.count), 1), [a]);
  const maxSvc = useMemo(() => Math.max(...a.topServiceCategories.map((s) => s.count), 1), [a]);

  return (
    <div className="space-y-8">
      {/* ── KPI Grid ──────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          Platform KPIs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={DollarSign}
            label="Estimated GMV"
            value={fmt(a.totalGMV)}
            trend={a.totalGMVChange}
            color="bg-emerald-600/50"
          />
          <KpiCard
            icon={Car}
            label="Published Listings"
            value={num(a.publishedListings)}
            sub={`${a.newListingsThisMonth} this month`}
            color="bg-blue-600/50"
          />
          <KpiCard
            icon={Users}
            label="Registered Users"
            value={num(a.totalUsers)}
            sub={`+${a.newUsersThisMonth} this month`}
            color="bg-purple-600/50"
          />
          <KpiCard
            icon={Gavel}
            label="Auction Bids"
            value={num(a.totalBids)}
            sub={`${a.liveAuctions} auctions live`}
            color="bg-amber-600/50"
          />
          <KpiCard
            icon={Wrench}
            label="Service Requests"
            value={num(a.totalServiceRequests)}
            sub={`${a.completedServiceBookings} completed`}
            color="bg-cyan-600/50"
          />
          <KpiCard
            icon={Key}
            label="Rental Bookings"
            value={num(a.totalRentalBookings)}
            sub={`${a.activeRentals} active now`}
            color="bg-rose-600/50"
          />
          <KpiCard
            icon={Package}
            label="Parts Orders"
            value={num(a.totalPartsOrders)}
            color="bg-sky-600/50"
          />
          <KpiCard
            icon={ShoppingBag}
            label="Transactions"
            value={num(a.transactionsCount)}
            color="bg-indigo-600/50"
          />
        </div>
      </div>

      {/* ── Trend Charts ──────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              New Listings (30 days)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {a.listingsTrend.reduce((s, d) => s + d.count, 0)} total
            </span>
          </div>
          <Sparkline data={a.listingsTrend} color="#3b82f6" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
            <span>{a.listingsTrend[0]?.date}</span>
            <span>{a.listingsTrend[a.listingsTrend.length - 1]?.date}</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              New Users (30 days)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {a.usersTrend.reduce((s, d) => s + d.count, 0)} total
            </span>
          </div>
          <Sparkline data={a.usersTrend} color="#a855f7" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
            <span>{a.usersTrend[0]?.date}</span>
            <span>{a.usersTrend[a.usersTrend.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* ── Top Breakdowns ────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl border border-white/10 p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-400" />
            Top Vehicle Makes
          </h3>
          <div className="space-y-3">
            {a.topMakes.map((m) => (
              <BarRow
                key={m.make}
                label={m.make}
                count={m.count}
                max={maxMake}
                color="bg-blue-500"
              />
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            Top Service Categories
          </h3>
          <div className="space-y-3">
            {a.topServiceCategories.map((s) => (
              <BarRow
                key={s.category}
                label={s.category}
                count={s.count}
                max={maxSvc}
                color="bg-cyan-500"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
