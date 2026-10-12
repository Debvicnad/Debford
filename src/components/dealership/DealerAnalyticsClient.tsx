"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Sparkles,
  ArrowRight,
  Eye,
  MessageSquare,
  DollarSign,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import type { DealerAnalyticsOverview } from "@/lib/actions/dealer.actions";

interface Props {
  analytics: DealerAnalyticsOverview;
}

export function DealerAnalyticsClient({ analytics }: Props) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");
  const [activeTab, setActiveTab] = useState<"funnel" | "inventory" | "recommendations">("funnel");

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-[#0d1322]/80 backdrop-blur-xl rounded-2xl border border-white/8 p-6 shadow-2xl space-y-6">
      {/* Header with Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold mb-1">
            <BarChart3 className="w-3 h-3" />
            <span>Commercial Dealership Intelligence</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Fleet Performance & Conversion Telemetry
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex items-center bg-[#070b12] rounded-xl p-1 border border-white/5">
            {[
              { id: "funnel", label: "Sales Funnel" },
              { id: "inventory", label: "Unit Velocity" },
              { id: "recommendations", label: "AI Directives" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Timeframe */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-1.5 bg-[#070b12] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500/70 appearance-none cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[11px] text-slate-400 font-medium">Turnover Velocity</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {analytics.turnoverRate}x
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
              +0.4x vs peer
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Avg {analytics.avgDaysOnMarket} days on market</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[11px] text-slate-400 font-medium">Price Competitiveness</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-blue-400">
              {analytics.priceCompetitivenessScore}%
            </span>
            <span className="text-[10px] text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">
              Optimal
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Calibrated to regional market</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[11px] text-slate-400 font-medium">Lead Conversion</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-purple-400">
              {analytics.leadConversionRate}%
            </span>
            <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded">
              +1.8% MTD
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{analytics.inquiriesCount} qualified inquiries</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[11px] text-slate-400 font-medium">Active Portfolio Value</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-amber-400">
              {fmt.format(analytics.inventoryValue)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{analytics.activeUnits} live fleet vehicles</p>
        </div>
      </div>

      {/* ── TAB 1: FUNNEL TELEMETRY ────────────────────────────── */}
      {activeTab === "funnel" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Pipeline efficiency from prospective buyers viewing listings through verified escrow completion:
          </p>

          <div className="space-y-3">
            {analytics.funnel.map((step, idx) => {
              const maxCount = analytics.funnel[0]?.count || 1;
              const barWidth = Math.max(8, Math.round((step.count / maxCount) * 100));

              return (
                <div key={step.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-slate-400">
                        {idx + 1}
                      </span>
                      {step.stage}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-white font-bold">{step.count.toLocaleString()}</span>
                      <span className="text-slate-500 text-[11px]">
                        ({step.conversionRate}% {idx === 0 ? "reach" : "conv"})
                      </span>
                    </div>
                  </div>

                  <div className="h-2 bg-[#070b12] rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0
                          ? "bg-blue-600"
                          : idx === 1
                          ? "bg-indigo-600"
                          : idx === 2
                          ? "bg-purple-600"
                          : idx === 3
                          ? "bg-amber-600"
                          : idx === 4
                          ? "bg-teal-600"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: INVENTORY VELOCITY ─────────────────────────── */}
      {activeTab === "inventory" && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 text-left">Unit Title</th>
                <th className="py-2.5 text-left">Asking Price</th>
                <th className="py-2.5 text-left">Market Delta</th>
                <th className="py-2.5 text-left">Views</th>
                <th className="py-2.5 text-left">Inquiries</th>
                <th className="py-2.5 text-left">Age</th>
                <th className="py-2.5 text-right">Liquidity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics.topInventory.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-semibold text-white">{item.title}</td>
                  <td className="py-3 font-mono text-slate-300">{fmt.format(item.price)}</td>
                  <td className="py-3 font-mono">
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.marketPriceDelta <= 0
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-amber-400 bg-amber-500/10"
                      }`}
                    >
                      {item.marketPriceDelta > 0 ? "+" : ""}
                      {item.marketPriceDelta}%
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-400">{item.views}</td>
                  <td className="py-3 font-mono text-slate-400">{item.inquiries}</td>
                  <td className="py-3 font-mono text-slate-400">{item.daysListed}d</td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "hot"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : item.status === "live"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 3: AI DIRECTIVES ──────────────────────────────── */}
      {activeTab === "recommendations" && (
        <div className="space-y-3">
          {analytics.inventoryRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all flex items-start gap-3.5"
            >
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-bold text-white truncate">{rec.vehicleTitle}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      rec.impact === "high"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : rec.impact === "medium"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {rec.impact} impact
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
