"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Gavel,
  MessageSquare,
  DollarSign,
  CreditCard,
  AlertCircle,
  Clock,
  Radio,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  type DbNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/lib/actions/notification.actions";

interface Props {
  initialNotifications: DbNotification[];
  initialUnreadCount: number;
  userId?: string | null;
}

const FILTER_TABS = [
  { key: "all", label: "All Alerts" },
  { key: "unread", label: "Unread" },
  { key: "bid", label: "Auction Bids" },
  { key: "escrow", label: "Escrow & Vault" },
  { key: "message", label: "Messages" },
  { key: "listing", label: "Listings" },
  { key: "offer", label: "Offers" },
  { key: "billing", label: "Membership" },
];

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function getBadgeStyle(type: string) {
  switch (type) {
    case "bid":
    case "auction":
      return { bg: "bg-amber-500/15 text-amber-300 border-amber-500/30", label: "Live Auction" };
    case "escrow":
      return { bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", label: "Escrow Vault" };
    case "message":
      return { bg: "bg-sky-500/15 text-sky-300 border-sky-500/30", label: "Direct Message" };
    case "listing":
      return { bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30", label: "Marketplace" };
    case "offer":
      return { bg: "bg-purple-500/15 text-purple-300 border-purple-500/30", label: "Direct Offer" };
    case "billing":
      return { bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", label: "Membership" };
    default:
      return { bg: "bg-slate-500/15 text-slate-300 border-white/10", label: "System Telemetry" };
  }
}

export function NotificationsHubClient({
  initialNotifications,
  initialUnreadCount,
  userId,
}: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<DbNotification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [newAlertFlash, setNewAlertFlash] = useState(false);

  // Setup Supabase Realtime for instant incoming notifications
  useEffect(() => {
    if (!userId) return;
    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`user_notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const fresh = payload.new as any;
            const formatted: DbNotification = {
              id: fresh.id,
              user_id: fresh.user_id,
              type: fresh.type,
              title: fresh.title,
              body: fresh.body,
              data: fresh.data,
              is_read: false,
              read_at: null,
              created_at: fresh.created_at,
              link: fresh.data?.link || "/dashboard",
              cta: fresh.data?.cta || "View Details",
              icon: fresh.data?.icon || "🔔",
            };
            setNotifications((prev) => [formatted, ...prev]);
            setNewAlertFlash(true);
            setTimeout(() => setNewAlertFlash(false), 2000);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setRealtimeActive(true);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Graceful fallback
    }
  }, [userId]);

  // Mark all read
  const handleMarkAllRead = () => {
    startTransition(async () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      await markAllNotificationsAsRead();
    });
  };

  // Mark single item read
  const handleMarkSingleRead = (id: string) => {
    startTransition(async () => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      await markNotificationAsRead(id);
    });
  };

  // Delete notification
  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await deleteNotification(id);
    });
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    startTransition(async () => {
      setNotifications([]);
      await clearAllNotifications();
    });
  };

  // Filtered stream
  const filtered = notifications.filter((n) => {
    const matchesFilter =
      activeFilter === "all"
        ? true
        : activeFilter === "unread"
        ? !n.is_read
        : n.type === activeFilter;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.body && n.body.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8">
      {/* ── Realtime Telemetry Status Ribbon ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-base font-black text-white font-mono block">
                {notifications.length} Alerts
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                Total Activity
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-base font-black text-amber-300 font-mono block">
                {unreadCount} Unread
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                Actionable Items
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-base font-black text-emerald-300 font-mono block">
                100% Insured
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                Escrow Custody
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-colors ${
                newAlertFlash
                  ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-ping"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}
            >
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-black text-purple-300 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                WebSocket Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search & Action Controls ────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/70 border border-white/8 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by title or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex items-center gap-2 justify-end">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isPending}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/8 hover:border-rose-500/30 transition-all cursor-pointer"
              title="Clear all alerts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category Filter Tabs ────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const countForTab =
            tab.key === "all"
              ? notifications.length
              : tab.key === "unread"
              ? unreadCount
              : notifications.filter((n) => n.type === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white bg-white/5 border border-white/5 hover:border-white/15"
              }`}
            >
              <span>{tab.label}</span>
              {countForTab > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive
                      ? "bg-white/20 text-white font-black"
                      : tab.key === "unread"
                      ? "bg-amber-400 text-slate-950 font-black"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {countForTab}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notifications Stream ────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-slate-900/40 border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center text-3xl mx-auto mb-3">
            🔔
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No alerts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            {activeFilter !== "all" || searchQuery
              ? "No notifications match the active criteria. Reset filters to see all platform updates."
              : "Your telemetry stream is clear. You will be alerted immediately when bids, messages, or escrow actions occur."}
          </p>
          {(activeFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-blue-400 hover:text-white bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const badge = getBadgeStyle(item.type);
            return (
              <div
                key={item.id}
                onClick={() => !item.is_read && handleMarkSingleRead(item.id)}
                className={`rounded-3xl border p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group ${
                  !item.is_read
                    ? "border-blue-500/35 bg-gradient-to-r from-[#0d1424] via-[#090d18] to-[#070a12] shadow-xl shadow-blue-500/5 hover:border-blue-500/60"
                    : "border-white/5 bg-[#080c14]/70 hover:border-white/15"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                    {item.icon || "🔔"}
                  </div>

                  {/* Body Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      {!item.is_read && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                          <span>NEW</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold truncate max-w-xl transition-colors ${
                        !item.is_read
                          ? "text-white group-hover:text-blue-300"
                          : "text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {item.title}
                    </h3>

                    {item.body && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl font-light">
                        {item.body}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 flex items-center justify-end gap-2">
                  {/* Action Link CTA */}
                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={() => !item.is_read && handleMarkSingleRead(item.id)}
                      className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:opacity-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      style={{
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        boxShadow: "0 4px 12px -2px rgba(37, 99, 235, 0.4)",
                      }}
                    >
                      <span>{item.cta || "View Action"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {/* Mark as read toggle */}
                  {!item.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkSingleRead(item.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/8 hover:border-emerald-500/30 transition-all cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-white/8 hover:border-rose-500/30 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
