import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getMyListings, getNotifications, isSupabaseConfigured } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Debford dashboard.",
};

function StatCard({ label, value, icon, trend, href }: {
  label: string; value: string | number; icon: string; trend?: string; href?: string;
}) {
  const content = (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function QuickAction({ icon, label, href, accent }: {
  icon: string; label: string; href: string; accent: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-gradient-to-br ${accent} hover:scale-[1.03] hover:border-white/20 transition-all duration-200`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-slate-300 text-center leading-tight">{label}</span>
    </Link>
  );
}

function DemoDashboard() {
  return (
    <div className="min-h-screen surface-base flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-xl shadow-blue-500/20">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Preview</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Connect Supabase to unlock your live dashboard with real stats, listings, and notifications.
        </p>
        <div className="glass rounded-2xl border border-white/10 p-5 text-left mb-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Setup steps</h3>
          <ol className="space-y-2 text-xs text-slate-400">
            {[
              "Create a Supabase project at supabase.com",
              "Copy your project URL and anon key",
              "Add them to .env.local in the project root",
              "Run the 4 SQL migrations from supabase/migrations/",
              "Restart the dev server",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-2">
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="block py-3 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
            Open Supabase Dashboard →
          </a>
          <a href="/vehicles" className="block py-3 glass border border-white/10 text-slate-300 text-sm font-medium rounded-xl hover:border-white/20 hover:text-white transition-all">
            Browse vehicles (no auth required)
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    // Dev mode: render a demo dashboard without auth
    return <DemoDashboard />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/dashboard");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, membership_tier, listings_count, sales_count, role")
    .eq("id", user.id)
    .single();

  // Parallel data fetch
  const [stats, listingsData, notificationsData] = await Promise.all([
    getDashboardStats(),
    getMyListings(),
    getNotifications(10),
  ]);

  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen surface-base">
      {/* Top nav */}
      <div className="surface-raised border-b border-subtle sticky top-0 z-40">
        <div className="container-debford py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold text-xs">D</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight hidden sm:block">DEBFORD</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-medium text-slate-400">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/messages" className="relative w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/10 hover:border-white/20 transition-colors">
              <span className="text-lg">🔔</span>
              {stats && stats.unreadMessages > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </Link>
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white text-sm font-bold">
              {initial}
            </div>
          </div>
        </div>
      </div>

      <div className="container-debford py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back, {name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Here&apos;s what&apos;s happening with your Debford account.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🚗" label="My Vehicles" value={stats?.vehiclesCount ?? 0} href="/garage" />
          <StatCard icon="📋" label="Active Listings" value={stats?.activeListings ?? 0} href="/garage" />
          <StatCard icon="💬" label="Messages" value={stats?.unreadMessages ?? 0}
            trend={stats && stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : undefined} href="/messages" />
          <StatCard icon="⭐" label="Membership" value={profile?.membership_tier ?? "Free"} href="/membership" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <QuickAction icon="➕" label="List Vehicle" href="/sell" accent="from-blue-600/20 to-blue-900/10" />
                <QuickAction icon="🔍" label="Browse" href="/vehicles" accent="from-purple-600/20 to-purple-900/10" />
                <QuickAction icon="🔑" label="Rent" href="/rentals" accent="from-emerald-600/20 to-emerald-900/10" />
                <QuickAction icon="🔨" label="Auctions" href="/auctions" accent="from-amber-600/20 to-amber-900/10" />
                <QuickAction icon="🔧" label="Services" href="/services" accent="from-rose-600/20 to-rose-900/10" />
                <QuickAction icon="⚙️" label="Parts" href="/parts" accent="from-cyan-600/20 to-cyan-900/10" />
              </div>
            </div>

            {/* My Listings */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">My Listings</h2>
                <Link href="/sell" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">+ New listing</Link>
              </div>
              {listingsData.listings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">📋</div>
                  <p className="text-slate-500 text-sm mb-4">You haven&apos;t listed any vehicles yet</p>
                  <Link href="/sell" className="px-5 py-2.5 gradient-brand text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
                    List your first vehicle →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {listingsData.listings.slice(0, 3).map((listing: any) => (
                    <div key={listing.id} className="flex items-center gap-4 p-3 surface-base rounded-xl border border-white/5">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl shrink-0">🚗</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {listing.vehicle?.year} {listing.vehicle?.make_name} {listing.vehicle?.model_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {listing.views_count ?? 0} views · {listing.inquiries_count ?? 0} inquiries
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-blue-400">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: listing.currency ?? "USD", minimumFractionDigits: 0 }).format(listing.price)}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          listing.status === "published" ? "bg-emerald-500/15 text-emerald-400" :
                          listing.status === "pending_review" ? "bg-amber-500/15 text-amber-400" :
                          "bg-slate-500/15 text-slate-400"
                        }`}>
                          {listing.status === "pending_review" ? "In Review" : listing.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Notifications</h2>
              </div>
              {notificationsData.notifications.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">No notifications yet</p>
              ) : (
                <div className="space-y-3">
                  {notificationsData.notifications.map((n: any) => (
                    <div key={n.id} className={`flex gap-3 py-2.5 border-b border-white/5 last:border-0 ${!n.is_read ? "opacity-100" : "opacity-60"}`}>
                      <div className="w-8 h-8 surface-overlay rounded-lg flex items-center justify-center text-sm shrink-0">
                        {n.type === "message" ? "💬" : n.type === "bid" ? "🔨" : n.type === "listing" ? "📋" : "🔔"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{n.title}</div>
                        <div className="text-xs text-slate-600">{n.body}</div>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Membership */}
            {profile?.membership_tier === "free" && (
              <div className="relative overflow-hidden gradient-brand rounded-2xl p-5 border border-blue-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative z-10">
                  <div className="text-sm font-semibold text-blue-200 mb-1">Free Plan</div>
                  <h3 className="text-lg font-bold text-white mb-2">Upgrade to Pro</h3>
                  <p className="text-xs text-blue-200/70 mb-4">Unlimited listings, featured placement, priority support.</p>
                  <Link href="/membership" className="inline-block px-4 py-2 bg-white text-blue-900 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors">
                    View Plans →
                  </Link>
                </div>
              </div>
            )}

            {/* Profile */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center text-xl font-bold text-white">
                  {initial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-slate-500 capitalize">{profile?.role ?? "Buyer"} · {profile?.membership_tier ?? "Free"}</div>
                </div>
              </div>
              <Link href="/profile" className="block text-center py-2 text-xs font-medium text-blue-400 surface-base border border-white/10 rounded-xl hover:border-blue-500/30 transition-colors">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
