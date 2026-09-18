import type { Metadata } from "next";
import Link from "next/link";
import {
  getPendingListings,
  getAdminStats,
  getAdminUsers,
  getPendingKycApplications,
  getPendingServiceProviders,
  getAdminAuditLogs,
} from "@/lib/actions/admin.actions";
import { AdminDashboardHub } from "@/components/admin/AdminDashboardHub";

export const metadata: Metadata = {
  title: "Admin Console — Debford",
  description: "Debford platform administration — listing moderation, KYC verification, provider badges, and audit logs.",
};

function AdminNavLink({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: number | string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && Number(badge) > 0 && (
        <span className="px-2 py-0.5 bg-rose-600 rounded-full text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default async function AdminPage() {
  const [pendingListings, stats, users, kycApplications, serviceProviders, auditLogs] =
    await Promise.all([
      getPendingListings(),
      getAdminStats(),
      getAdminUsers(20),
      getPendingKycApplications(),
      getPendingServiceProviders(),
      getAdminAuditLogs(30),
    ]);

  const urgentCount =
    pendingListings.length +
    kycApplications.filter((a) => a.status === "pending").length +
    serviceProviders.filter((p) => p.verificationStatus === "pending").length;

  return (
    <div className="min-h-screen surface-base flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 surface-raised border-r border-subtle">
        {/* Logo */}
        <div className="p-5 border-b border-subtle">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
              <span className="text-white font-extrabold text-sm">D</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">DEBFORD</div>
              <div className="text-slate-500 text-xs mt-0.5">Admin Console</div>
            </div>
          </Link>
        </div>

        {/* Urgent badge */}
        {urgentCount > 0 && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <div>
                <div className="text-xs font-bold text-amber-400">{urgentCount} items pending</div>
                <div className="text-[10px] text-slate-500">Require your attention</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-2">
            Overview
          </div>
          <AdminNavLink href="/admin" icon="📊" label="Dashboard" />

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">
            Moderation
          </div>
          <AdminNavLink href="/admin#listings" icon="🚗" label="Listing Review" badge={pendingListings.length} />
          <AdminNavLink href="/admin#kyc" icon="🪪" label="KYC & Dealers" badge={kycApplications.filter((a) => a.status === "pending").length} />
          <AdminNavLink href="/admin#providers" icon="🔧" label="Service Providers" badge={serviceProviders.filter((p) => p.verificationStatus === "pending").length} />

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">
            Management
          </div>
          <AdminNavLink href="/admin#users" icon="👥" label="Users & Permissions" badge={stats.totalUsers} />
          <AdminNavLink href="/admin#audit" icon="📝" label="Audit Trail" />

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">
            Platform
          </div>
          <AdminNavLink href="/vehicles" icon="🌐" label="Live Marketplace" />
          <AdminNavLink href="/services/providers" icon="🔩" label="Services Directory" />
          <AdminNavLink href="/" icon="↗" label="Public Website" />
        </nav>

        {/* Admin Profile */}
        <div className="p-3 border-t border-subtle">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-xs font-bold">
              👑
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Administrator</div>
              <div className="text-xs text-slate-500 truncate">Platform Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <AdminDashboardHub
        stats={stats}
        pendingListings={pendingListings}
        kycApplications={kycApplications}
        serviceProviders={serviceProviders}
        users={users}
        auditLogs={auditLogs}
      />
    </div>
  );
}
