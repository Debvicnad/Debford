"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Car,
  ShieldCheck,
  Wrench,
  Users,
  History,
  Activity,
  AlertTriangle,
  Server,
  Globe,
} from "lucide-react";
import type { PendingItem, AdminUserItem } from "@/lib/actions/admin.actions";
import type { KycApplicationItem, ServiceProviderModerationItem, AdminAuditLogItem, AdminStatsOverview, AdminTab } from "@/types/admin.types";
import { PendingReviewsSection } from "./PendingReviewsSection";
import { KycReviewSection } from "./KycReviewSection";
import { ServiceProvidersModerationSection } from "./ServiceProvidersModerationSection";
import { RecentUsersTable } from "./RecentUsersTable";
import { AdminAuditLogFeed } from "./AdminAuditLogFeed";
import Link from "next/link";

interface Props {
  stats: AdminStatsOverview;
  pendingListings: PendingItem[];
  kycApplications: KycApplicationItem[];
  serviceProviders: ServiceProviderModerationItem[];
  users: AdminUserItem[];
  auditLogs: AdminAuditLogItem[];
}

const TABS: { id: AdminTab; label: string; Icon: React.ElementType; badge?: (p: Props) => number }[] = [
  { id: "overview",   label: "Overview",       Icon: LayoutDashboard },
  { id: "listings",   label: "Listing Review", Icon: Car,         badge: (p) => p.pendingListings.length },
  { id: "kyc",        label: "KYC & Dealers",  Icon: ShieldCheck, badge: (p) => p.kycApplications.filter((a) => a.status === "pending").length },
  { id: "providers",  label: "Providers",      Icon: Wrench,      badge: (p) => p.serviceProviders.filter((sp) => sp.verificationStatus === "pending").length },
  { id: "users",      label: "Users",          Icon: Users },
  { id: "audit",      label: "Audit Trail",    Icon: History },
];

function StatCard({
  label,
  value,
  icon,
  change,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  color: string;
}) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 group hover:border-white/15 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-xl shadow-inner`}>
          {icon}
        </div>
        {change && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-white mb-0.5 group-hover:text-blue-300 transition-colors">
        {value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export function AdminDashboardHub({
  stats,
  pendingListings,
  kycApplications,
  serviceProviders,
  users,
  auditLogs,
}: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const props: Props = { stats, pendingListings, kycApplications, serviceProviders, users, auditLogs };

  const urgentCount =
    pendingListings.length +
    kycApplications.filter((a) => a.status === "pending").length +
    serviceProviders.filter((p) => p.verificationStatus === "pending").length;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top Bar */}
      <div className="surface-raised border-b border-subtle px-6 py-4 flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">Platform Administration</h1>
            {urgentCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                {urgentCount} items need attention
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Live database metrics, KYC verification, listing approvals & audit logging
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sell"
            className="px-3.5 py-1.5 gradient-brand text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow"
          >
            + List New Vehicle
          </Link>
          <Link
            href="/vehicles"
            className="px-3.5 py-1.5 glass border border-white/10 text-slate-300 text-xs font-medium rounded-lg hover:border-white/20 hover:text-white transition-all"
          >
            Marketplace →
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="shrink-0 surface-raised border-b border-subtle px-6 flex items-center gap-1 overflow-x-auto">
        {TABS.map(({ id, label, Icon, badge }) => {
          const badgeCount = badge ? badge(props) : 0;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3.5 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-blue-400 text-blue-300"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {badgeCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black bg-rose-600 text-white">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ─── OVERVIEW TAB ──────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard icon="👥" label="Registered Users"    value={stats.totalUsers}     color="bg-blue-500/15"    change="Live DB" />
              <StatCard icon="✅" label="Verified Accounts"   value={stats.verifiedUsers}  color="bg-emerald-500/15" />
              <StatCard icon="🚗" label="Vehicle Listings"    value={stats.totalVehicles}  color="bg-purple-500/15"  />
              <StatCard icon="📋" label="Pending Reviews"     value={stats.pendingReviews + stats.pendingKyc} color="bg-amber-500/15" change={stats.pendingReviews + stats.pendingKyc > 0 ? "Action needed" : "All clear"} />
              <StatCard icon="📢" label="Published Listings"  value={stats.activeListings} color="bg-cyan-500/15"    change="Live" />
              <StatCard icon="🪪" label="Pending KYC"         value={stats.pendingKyc}     color="bg-violet-500/15"  change={stats.pendingKyc > 0 ? "Review" : "Clear"} />
              <StatCard icon="🔧" label="Service Providers"   value={stats.totalProviders} color="bg-sky-500/15"     />
              <StatCard icon="⏳" label="Awaiting Verification" value={stats.pendingProviders} color="bg-rose-500/15" />
            </div>

            {/* Quick Action Alerts */}
            {urgentCount > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Urgent Actions Required
                </h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {pendingListings.length > 0 && (
                    <button
                      onClick={() => setActiveTab("listings")}
                      className="p-4 glass rounded-2xl border border-amber-500/20 text-left hover:border-amber-500/40 transition-all cursor-pointer group"
                    >
                      <span className="text-2xl">🚗</span>
                      <p className="text-xs font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                        {pendingListings.length} Listing{pendingListings.length !== 1 ? "s" : ""} Awaiting Review
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Click to review and publish</p>
                    </button>
                  )}
                  {kycApplications.filter((a) => a.status === "pending").length > 0 && (
                    <button
                      onClick={() => setActiveTab("kyc")}
                      className="p-4 glass rounded-2xl border border-blue-500/20 text-left hover:border-blue-500/40 transition-all cursor-pointer group"
                    >
                      <span className="text-2xl">🪪</span>
                      <p className="text-xs font-bold text-white mt-2 group-hover:text-blue-300 transition-colors">
                        {kycApplications.filter((a) => a.status === "pending").length} KYC Application{kycApplications.filter((a) => a.status === "pending").length !== 1 ? "s" : ""} Pending
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Review identity documents</p>
                    </button>
                  )}
                  {serviceProviders.filter((p) => p.verificationStatus === "pending").length > 0 && (
                    <button
                      onClick={() => setActiveTab("providers")}
                      className="p-4 glass rounded-2xl border border-cyan-500/20 text-left hover:border-cyan-500/40 transition-all cursor-pointer group"
                    >
                      <span className="text-2xl">🔧</span>
                      <p className="text-xs font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
                        {serviceProviders.filter((p) => p.verificationStatus === "pending").length} Provider Verification{serviceProviders.filter((p) => p.verificationStatus === "pending").length !== 1 ? "s" : ""} Pending
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Grant verified workshop badges</p>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Recent Audit Activity */}
            <div className="glass rounded-3xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">Recent Admin Activity</h2>
              <AdminAuditLogFeed logs={auditLogs.slice(0, 5)} />
            </div>

            {/* System Health */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                System Health
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Supabase DB",       value: "Connected",    icon: "🟢" },
                  { label: "Storage Buckets",   value: "3 Active",     icon: "🟢" },
                  { label: "Realtime Engine",    value: "Enabled",      icon: "🟢" },
                  { label: "Services API",       value: "Operational",  icon: "🟢" },
                ].map((m) => (
                  <div key={m.label} className="surface-base rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{m.icon}</span>
                      <span className="text-[10px] text-slate-500">{m.label}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── LISTINGS REVIEW TAB ───────────────────────────────────── */}
        {activeTab === "listings" && (
          <PendingReviewsSection initialItems={pendingListings} />
        )}

        {/* ─── KYC & DEALERS TAB ─────────────────────────────────────── */}
        {activeTab === "kyc" && (
          <div className="glass rounded-3xl border border-white/10 p-6">
            <div className="mb-6">
              <h2 className="text-base font-bold text-white">KYC & Dealer License Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Review identity documents and dealer applications. Approved accounts receive a verified badge and expanded platform privileges.
              </p>
            </div>
            <KycReviewSection initialApplications={kycApplications} />
          </div>
        )}

        {/* ─── SERVICE PROVIDERS TAB ─────────────────────────────────── */}
        {activeTab === "providers" && (
          <div className="glass rounded-3xl border border-white/10 p-6">
            <div className="mb-6">
              <h2 className="text-base font-bold text-white">Automotive Service Provider Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Grant or revoke the Verified Workshop badge for mechanics, garages, detailing centers, and mobile service providers.
              </p>
            </div>
            <ServiceProvidersModerationSection initialProviders={serviceProviders} />
          </div>
        )}

        {/* ─── USERS TAB ─────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="glass rounded-3xl border border-white/10 p-6">
            <div className="mb-6">
              <h2 className="text-base font-bold text-white">User Accounts & Permissions</h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage user roles, KYC verification statuses, and platform access controls.
              </p>
            </div>
            <RecentUsersTable initialUsers={users} />
          </div>
        )}

        {/* ─── AUDIT TRAIL TAB ───────────────────────────────────────── */}
        {activeTab === "audit" && (
          <div className="glass rounded-3xl border border-white/10 p-6">
            <AdminAuditLogFeed logs={auditLogs} />
          </div>
        )}
      </div>
    </div>
  );
}
