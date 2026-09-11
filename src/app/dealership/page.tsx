import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dealership Management",
  description: "Manage your dealership inventory, team, and analytics on Debford.",
};

const MOCK_INVENTORY = [
  { id: "d1", title: "2023 Toyota Camry SE", price: 32000, status: "published", views: 412, inquiries: 14, days: 8 },
  { id: "d2", title: "2022 BMW 5 Series 530i", price: 62000, status: "published", views: 287, inquiries: 9, days: 15 },
  { id: "d3", title: "2024 Tesla Model 3 LR", price: 48500, status: "pending_review", views: 0, inquiries: 0, days: 1 },
  { id: "d4", title: "2021 Jeep Wrangler Rubicon", price: 44000, status: "sold", views: 892, inquiries: 31, days: 0 },
  { id: "d5", title: "2023 Mercedes GLE 350", price: 74500, status: "published", views: 156, inquiries: 5, days: 22 },
];

const TEAM_MEMBERS = [
  { name: "James Kowalski", role: "Sales Manager", email: "james@dealership.com", listings: 12, initials: "JK" },
  { name: "Sarah Chen", role: "Sales Consultant", email: "sarah@dealership.com", listings: 8, initials: "SC" },
  { name: "Mike Torres", role: "Finance Manager", email: "mike@dealership.com", listings: 0, initials: "MT" },
];

export default async function DealershipPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/dealership");

  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  const statusStyle: Record<string, string> = {
    published: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pending_review: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    sold: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    draft: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="min-h-screen surface-base">
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-slate-300">Dealership</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white font-bold text-sm">P</div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Prestige Motors</h1>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-emerald-400">✓ Verified Dealer</span>
                    <span>·</span>
                    <span>★ 4.9 (187 reviews)</span>
                    <span>·</span>
                    <span>New York, NY</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/sell" className="px-4 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
                + Add Inventory
              </Link>
              <Link href="/dealership/settings" className="px-4 py-2.5 glass border border-white/10 text-slate-300 text-sm font-medium rounded-xl hover:border-white/20 hover:text-white transition-all">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-debford py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Active Listings", value: "24", icon: "📋", color: "text-blue-400" },
            { label: "Total Views", value: "8,412", icon: "👁️", color: "text-slate-300" },
            { label: "Inquiries", value: "143", icon: "💬", color: "text-slate-300" },
            { label: "Sales MTD", value: fmt.format(284000), icon: "💰", color: "text-emerald-400" },
            { label: "Avg. Days Listed", value: "12", icon: "📅", color: "text-slate-300" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl border border-white/10 p-4">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Inventory table */}
          <div className="xl:col-span-2 glass rounded-2xl border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h2 className="text-sm font-bold text-white">Inventory</h2>
              <div className="flex gap-2">
                <select className="px-3 py-1.5 surface-base border border-white/10 rounded-lg text-xs text-slate-300 bg-transparent focus:outline-none">
                  <option>All status</option>
                  <option>Published</option>
                  <option>Pending</option>
                  <option>Sold</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Vehicle", "Price", "Status", "Views", "Inquiries", "Days", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INVENTORY.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-sm">🚗</div>
                          <span className="text-xs font-medium text-white">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-blue-400">{fmt.format(item.price)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 text-xs font-medium border rounded-full capitalize ${statusStyle[item.status]}`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{item.views.toLocaleString()}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{item.inquiries}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{item.status === "sold" ? "—" : `${item.days}d`}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <button className="px-2 py-1 text-xs text-slate-400 hover:text-white glass border border-white/10 rounded-lg transition-all">Edit</button>
                          <button className="px-2 py-1 text-xs text-rose-400 hover:text-rose-300 glass border border-rose-500/20 rounded-lg transition-all">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/8 text-center">
              <Link href="/sell" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                + Add new vehicle to inventory
              </Link>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Team */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">Team</h2>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">+ Invite</button>
              </div>
              <div className="space-y-3">
                {TEAM_MEMBERS.map((m) => (
                  <div key={m.email} className="flex items-center gap-3">
                    <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">{m.name}</div>
                      <div className="text-xs text-slate-600">{m.role}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">{m.listings} listings</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick analytics */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-white mb-4">This Month</h2>
              <div className="space-y-3">
                {[
                  { label: "New listings added", value: "7", bar: 70 },
                  { label: "Listings sold", value: "3", bar: 30 },
                  { label: "Inquiries received", value: "47", bar: 65 },
                  { label: "Profile views", value: "1,204", bar: 85 },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">{m.label}</span>
                      <span className="text-xs font-bold text-white">{m.value}</span>
                    </div>
                    <div className="h-1 surface-base rounded-full overflow-hidden">
                      <div className="h-full gradient-brand rounded-full" style={{ width: `${m.bar}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="glass rounded-2xl border border-amber-500/20 p-5">
              <div className="text-amber-400 text-sm font-bold mb-1">⭐ Upgrade to Enterprise</div>
              <p className="text-xs text-slate-500 mb-3">Unlock bulk import, branded dealership page, and dedicated account manager.</p>
              <Link href="/membership" className="block text-center py-2 text-xs font-semibold gradient-brand text-white rounded-xl hover:opacity-90 transition-opacity">
                View Plans →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
