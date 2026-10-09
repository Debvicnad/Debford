import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { NotificationsHubClient } from "@/components/notifications/NotificationsHubClient";
import { getNotifications } from "@/lib/actions/notification.actions";
import { isSupabaseConfigured } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { Bell, ChevronRight, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Activity & Notifications Telemetry — Debford",
  description:
    "Real-time notifications, auction bidding updates, message inquiries, and escrow transaction status on Debford.",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const resolved = await searchParams;
  const activeFilter = resolved?.filter ?? "all";

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

  const { notifications, unreadCount } = await getNotifications(activeFilter);

  return (
    <main className="min-h-screen bg-[#06090e] text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col">
      <Navbar userEmail={user?.email} />

      {/* ── Top Breadcrumb Bar ────────────────────────────────────────────── */}
      <div className="border-b border-white/6 bg-slate-950/70 backdrop-blur-md pt-24 pb-3.5">
        <div className="container-debford flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300 font-medium">Activity &amp; Notifications</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{unreadCount} Unread Alerts</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Page Header Banner ────────────────────────────────────────────── */}
      <div className="relative py-10 overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0b0f19] to-[#06090e]">
        <div className="absolute top-0 right-1/4 w-[500px] h-[220px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[180px] bg-amber-500/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-debford relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Bell className="w-3.5 h-3.5" />
            <span>Digital Notification Nexus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Activity &amp; Notifications
          </h1>

          <p className="text-sm text-slate-400 font-light leading-relaxed max-w-2xl">
            Live updates on your vehicle auction bids, escrow deposit status, marketplace inquiries,
            and dealership messages.
          </p>
        </div>
      </div>

      {/* ── Interactive Notifications Workspace ───────────────────────────── */}
      <div className="container-debford py-8 flex-1 max-w-5xl mx-auto w-full">
        <NotificationsHubClient
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
          userId={user?.id}
        />
      </div>
    </main>
  );
}
