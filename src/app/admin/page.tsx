import type { Metadata } from "next";
import Link from "next/link";
import {
  getPendingListings,
  getAdminStats,
  getAdminUsers,
} from "@/lib/actions/admin.actions";
import { PendingReviewsSection } from "@/components/admin/PendingReviewsSection";
import { RecentUsersTable } from "@/components/admin/RecentUsersTable";

export const metadata: Metadata = {
  title: "Admin Panel — Debford",
  description: "Debford platform administration and review panel.",
};

// ── Stat Card ─────────────────────────────────────────────────
function AdminStat({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {change && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full text-emerald-400 bg-emerald-400/10">
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-white mb-0.5">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

// ── Nav Link ──────────────────────────────────────────────────
function AdminNavLink({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
  badge?: number | string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "gradient-brand text-white shadow"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && Number(badge) > 0 && (
        <span className="px-2 py-0.5 bg-rose-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default async function AdminPage() {
  const [pendingItems, stats, users] = await Promise.all([
    getPendingListings(),
    getAdminStats(),
    getAdminUsers(10),
  ]);

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

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-2">
            Overview
          </div>
          <AdminNavLink href="/admin" icon="📊" label="Dashboard" active />
          <AdminNavLink href="/admin#reviews" icon="📋" label="Pending Review" badge={pendingItems.length} />

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">
            Management
          </div>
          <AdminNavLink href="/vehicles" icon="🚗" label="Live Marketplace" />
          <AdminNavLink href="/admin#users" icon="👥" label="Users" badge={stats.totalUsers} />
          <AdminNavLink href="/garage" icon="🏠" label="My Garage" />

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">
            System
          </div>
          <AdminNavLink href="/dashboard" icon="⚙️" label="User Dashboard" />
          <AdminNavLink href="/" icon="🌐" label="Public Website" />
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-subtle">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-xs font-bold">
              👑
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Administrator</div>
              <div className="text-xs text-slate-500 truncate">Platform Manager</div>
            </div>
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-xs" title="Go to Website">
              ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="surface-raised border-b border-subtle px-6 py-4 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="lg:hidden text-slate-400 hover:text-white mr-1 text-sm">
                ← Home
              </Link>
              <h1 className="text-lg font-bold text-white">Platform Administration</h1>
            </div>
            <p className="text-xs text-slate-500">Live database metrics & listing approvals</p>
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
              Browse Marketplace →
            </Link>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStat
              icon="👥"
              label="Registered Users"
              value={stats.totalUsers}
              change="Live in DB"
              color="bg-blue-500/15"
            />
            <AdminStat
              icon="🚗"
              label="Vehicles in Garage"
              value={stats.totalVehicles}
              change="Total recorded"
              color="bg-purple-500/15"
            />
            <AdminStat
              icon="⏳"
              label="Pending Review"
              value={pendingItems.length}
              change={pendingItems.length > 0 ? "Action required" : "Clear"}
              color="bg-amber-500/15"
            />
            <AdminStat
              icon="✅"
              label="Published Listings"
              value={stats.activeListings}
              change="On Marketplace"
              color="bg-emerald-500/15"
            />
          </div>

          {/* Grid Layout: Pending Reviews & Users */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Pending reviews (Left / Major column) */}
            <div id="reviews" className="xl:col-span-7">
              <PendingReviewsSection initialItems={pendingItems} />
            </div>

            {/* Recent users (Right column) */}
            <div id="users" className="xl:col-span-5">
              <RecentUsersTable initialUsers={users} />
            </div>
          </div>

          {/* Platform health summary */}
          <div className="glass rounded-2xl border border-white/10 p-5">
            <h2 className="text-sm font-bold text-white mb-4">Database & Environment Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Supabase DB", value: "Connected", status: "good" },
                { label: "Storage Buckets", value: "3 Active", status: "good" },
                { label: "Realtime", value: "Enabled", status: "good" },
                { label: "Taxonomy Types", value: "8 Active", status: "good" },
              ].map((metric) => (
                <div key={metric.label} className="surface-base rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-500">{metric.label}</span>
                  </div>
                  <div className="text-base font-bold text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
