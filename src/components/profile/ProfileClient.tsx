"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Crown,
  Car,
  Lock,
  Bell,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Camera,
  Mail,
  Phone,
  MapPin,
  Save,
  Key,
  Smartphone,
  Eye,
  ExternalLink,
  Award,
  Clock,
  Gauge,
  Sliders,
} from "lucide-react";

interface ProfileClientProps {
  userEmail?: string;
  userFullName?: string;
  userRole?: string;
}

export function ProfileClient({
  userEmail = "collector@debford.luxury",
  userFullName = "Alexander Wright",
  userRole = "Pro Dealer & Collector",
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "escrow">("profile");

  // Profile Form State
  const [formData, setFormData] = useState({
    firstName: userFullName.split(" ")[0] || "Alexander",
    lastName: userFullName.split(" ")[1] || "Wright",
    email: userEmail,
    phone: "+1 (305) 892-4100",
    city: "Miami",
    country: "United States",
    primaryMarque: "Porsche GT & BMW M",
    bio: "Collector of low-mileage European track specials and homologation homologues. Active consignor and track day participant.",
  });

  // Security Form State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    outbidAlerts: true,
    serviceQuotes: true,
    priceDrops: true,
    escrowMilestones: true,
    marketingDigest: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess("Profile telemetry and security credentials updated successfully!");
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  return (
    <div className="pb-24">
      {/* ── CINEMATIC PROFILE HEADER ───────────────────────── */}
      <div className="relative pt-28 pb-12 overflow-hidden border-b border-white/8 bg-[#080d16]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[320px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[280px] bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Technical Scanlines */}
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
            <span className="text-blue-400 font-semibold">Collector Profile & Security</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Grand Profile Avatar */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-2xl shadow-blue-500/25 shrink-0">
                  <div className="w-full h-full bg-[#080d16] rounded-[22px] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl">
                    {formData.firstName[0]}
                    {formData.lastName[0]}
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
                  title="Update profile portrait"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Tier-1 Verified</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-3 py-0.5 rounded-full">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Pro Dealer Plan</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  {formData.email} · {formData.city}, {formData.country}
                </p>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mt-2">
                  <span>Member since Sep 2026</span>
                  <span>·</span>
                  <span>UID: #DB-84920-US</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/garage"
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium hover:border-white/20 hover:text-white transition-all flex items-center gap-2"
              >
                <Car className="w-4 h-4 text-blue-400" />
                <span>My Garage</span>
              </Link>
              <Link
                href="/membership"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>Membership Plans</span>
              </Link>
            </div>
          </div>

          {/* ── PROFILE TELEMETRY RIBBON ─────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/8">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Car className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Vaulted Fleet
                </span>
              </div>
              <div className="text-xl font-bold text-white">6 Vehicles</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Encrypted glovebox synced</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Escrow Settled
                </span>
              </div>
              <div className="text-xl font-bold text-white">$418,000</div>
              <p className="text-[11px] text-slate-400 mt-0.5">100% dispute-free record</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  Trust Rating
                </span>
              </div>
              <div className="text-xl font-bold text-white">4.9 / 5.0</div>
              <p className="text-[11px] text-slate-400 mt-0.5">187 peer reviews</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/6">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  KYC Protocol
                </span>
              </div>
              <div className="text-xl font-bold text-white">100% Complete</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Passport & 2FA verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: VERIFICATION & STATS CARD */}
          <div className="space-y-6">
            {/* Identity Checklist Card */}
            <div className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Trust & Verification</span>
                </h3>
                <Link
                  href="/verification"
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  Manage →
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">Email Address</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">Mobile SMS (2FA)</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">Government KYC ID</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">Approved</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-200">Operating Address</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">Verified</span>
                </div>
              </div>
            </div>

            {/* Quick Activity Stats */}
            <div className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" />
                <span>Marketplace Activity</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#080d16] border border-white/5">
                  <div className="text-xl font-black text-white">5</div>
                  <div className="text-[11px] text-slate-500">Live Consignments</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#080d16] border border-white/5">
                  <div className="text-xl font-black text-white">12</div>
                  <div className="text-[11px] text-slate-500">Auctions Won</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#080d16] border border-white/5">
                  <div className="text-xl font-black text-white">8</div>
                  <div className="text-[11px] text-slate-500">Services Booked</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#080d16] border border-white/5">
                  <div className="text-xl font-black text-emerald-400">100%</div>
                  <div className="text-[11px] text-slate-500">Positive Feedback</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 4-TAB MANAGEMENT CONSOLE */}
          <div className="lg:col-span-2 space-y-6">
            {/* TABS SELECTOR */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0d121d] border border-white/8 overflow-x-auto">
              {[
                { id: "profile", label: "Identity & Marque", icon: User },
                { id: "security", label: "Security & 2FA", icon: Lock },
                { id: "notifications", label: "Alert Streams", icon: Bell },
                { id: "escrow", label: "Escrow & Payout", icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SAVE SUCCESS TOAST */}
            {savedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{savedSuccess}</span>
              </div>
            )}

            {/* TAB 1: IDENTITY & MARQUE */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Collector Identity & Telemetry</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Your public collector profile visible to verified buyers, sellers, and auction consignors.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Marque Preference</label>
                    <input
                      type="text"
                      value={formData.primaryMarque}
                      onChange={(e) => setFormData({ ...formData, primaryMarque: e.target.value })}
                      placeholder="e.g. Porsche GT, BMW M, Ferrari V12"
                      className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={`${formData.city}, ${formData.country}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(",");
                        setFormData({
                          ...formData,
                          city: parts[0]?.trim() || "",
                          country: parts[1]?.trim() || "United States",
                        });
                      }}
                      className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Collector Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-[#080d16] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SECURITY & CREDENTIALS */}
            {activeTab === "security" && (
              <div className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Security & 2-Factor Authentication</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Protect high-value vehicle bids and escrow authorizations with multi-factor authentication.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-slate-400">
                        Require an SMS or authenticator code when placing bids or disbursing funds.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      twoFactorEnabled
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    {twoFactorEnabled ? "Active & Protected" : "Enable 2FA"}
                  </button>
                </div>

                {/* Password Change Sub-section */}
                <div className="pt-4 border-t border-white/6 space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Change Password
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full bg-[#080d16] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSavedSuccess("Password credentials updated!");
                        setTimeout(() => setSavedSuccess(null), 3000);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>Update Password</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Alert Streams & Push Triggers</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fine-tune critical transactional alerts across live bidding, specialist quotes, and escrow status.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: "outbidAlerts", title: "Live Auction Outbid Alerts", desc: "Instant push notification when another collector exceeds your high bid." },
                    { key: "serviceQuotes", title: "Specialist Quote Delivery", desc: "Notification when certified mechanics submit quotes for your service requests." },
                    { key: "priceDrops", title: "Saved Vehicle Price Reductions", desc: "Alert when vehicles in your watchlist drop by $500 or more." },
                    { key: "escrowMilestones", title: "Escrow Custody & Inspection Updates", desc: "Critical milestones: funds received, 150-pt inspection passed, carrier dispatched." },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof typeof prev],
                          }))
                        }
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          notifications[item.key as keyof typeof notifications]
                            ? "bg-blue-600"
                            : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                            notifications[item.key as keyof typeof notifications]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ESCROW & PAYOUT */}
            {activeTab === "escrow" && (
              <div className="rounded-3xl bg-[#0d121d] border border-white/8 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Escrow Settlement & Payout Vault</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage bank wire destinations, connected Stripe identity, and transaction fee waivers.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 to-[#080d16] border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-bold text-white">Stripe Escrow Connect</h4>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Disbursements deposited directly to: <span className="font-mono text-white">JPMorgan Chase ···· 8419</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-colors"
                  >
                    Update Bank Account
                  </button>
                </div>

                <div className="pt-3 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Escrow Transaction Policy
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/6 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Insured Custody</span>
                        <span className="text-[11px] text-slate-400">
                          Funds held in FDIC-insured trust account until road test is satisfied.
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/6 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Same-Day ACH / Wire</span>
                        <span className="text-[11px] text-slate-400">
                          Seller proceeds released within 2 hours of buyer acceptance signature.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
