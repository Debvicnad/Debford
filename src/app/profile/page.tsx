import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your Debford profile, verification, and preferences.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen surface-base">
      {/* Header */}
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-5 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Dashboard</Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-white font-semibold">My Profile</h1>
        </div>
      </div>

      <div className="container-debford py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          {/* Left — Avatar + quick info */}
          <div className="space-y-5">
            {/* Avatar card */}
            <div className="glass rounded-2xl border border-white/10 p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 gradient-brand rounded-2xl flex items-center justify-center text-4xl font-extrabold text-white mx-auto shadow-xl">
                  U
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm hover:bg-blue-500 transition-colors shadow-lg">
                  📷
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mb-0.5">User Name</h2>
              <p className="text-sm text-slate-500 mb-3">user@example.com</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-medium bg-slate-700/60 text-slate-300 rounded-full">
                  🛒 Buyer
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-slate-700/60 text-amber-400 rounded-full">
                  ⭐ Free Plan
                </span>
              </div>
              <div className="text-xs text-slate-600 mb-4">
                Member since September 2026
              </div>
              <Link
                href="/membership"
                className="block w-full py-2 gradient-brand text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Verification */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Verification Status</h3>
              <div className="space-y-3">
                {[
                  { label: "Email", status: true, icon: "📧" },
                  { label: "Phone number", status: false, icon: "📱" },
                  { label: "Government ID", status: false, icon: "🪪" },
                  { label: "Address", status: false, icon: "🏠" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.status ? (
                      <span className="text-xs font-medium text-emerald-400">✓ Verified</span>
                    ) : (
                      <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                        Verify →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Account Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Listings", value: "2" },
                  { label: "Sales", value: "0" },
                  { label: "Purchases", value: "0" },
                  { label: "Reviews", value: "0" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2.5 surface-base rounded-xl">
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-xs text-slate-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Edit form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Personal info */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="text-base font-bold text-white mb-5">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">First name</label>
                    <input defaultValue="User" className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Last name</label>
                    <input defaultValue="Name" className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
                  <input defaultValue="user@example.com" type="email" className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone number</label>
                  <input placeholder="+1 (555) 000-0000" type="tel" className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell buyers a bit about yourself..."
                    className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Country</label>
                    <select className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors bg-transparent">
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Nigeria</option>
                      <option>Germany</option>
                      <option>France</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">City</label>
                    <input placeholder="New York" className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button id="save-profile-btn" className="px-6 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    Save changes
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="text-base font-bold text-white mb-5">Preferences</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
                    <select className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent">
                      <option>USD — US Dollar</option>
                      <option>GBP — British Pound</option>
                      <option>EUR — Euro</option>
                      <option>NGN — Nigerian Naira</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Distance unit</label>
                    <select className="w-full px-4 py-3 surface-base border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 bg-transparent">
                      <option>km — Kilometres</option>
                      <option>mi — Miles</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notifications</h4>
                  {[
                    { id: "notif-email", label: "Email notifications", desc: "Messages, offers, listing updates", default: true },
                    { id: "notif-push", label: "Push notifications", desc: "Real-time alerts on your device", default: true },
                    { id: "notif-marketing", label: "Marketing emails", desc: "New features, tips, promotions", default: false },
                  ].map((n) => (
                    <label key={n.id} className="flex items-start justify-between gap-4 cursor-pointer">
                      <div>
                        <div className="text-sm text-white">{n.label}</div>
                        <div className="text-xs text-slate-600">{n.desc}</div>
                      </div>
                      <div className="relative shrink-0 mt-0.5">
                        <input id={n.id} type="checkbox" defaultChecked={n.default} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="glass rounded-2xl border border-rose-500/15 p-6">
              <h3 className="text-base font-bold text-rose-400 mb-4">Danger Zone</h3>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-sm text-white">Delete account</div>
                  <div className="text-xs text-slate-500">Permanently delete your account and all data. This cannot be undone.</div>
                </div>
                <button className="px-4 py-2 border border-rose-500/30 text-rose-400 text-sm font-medium rounded-xl hover:border-rose-500 hover:bg-rose-500/10 transition-all">
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
