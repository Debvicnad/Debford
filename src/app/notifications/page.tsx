import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your Debford notifications.",
};

const MOCK_NOTIFICATIONS = [
  {
    id: "n1", type: "bid", icon: "🔨", title: "You've been outbid!",
    body: "Someone placed a higher bid of $92,000 on the 2021 Porsche 911 Carrera S.",
    time: "2 min ago", read: false, link: "/auctions/a1", cta: "Bid again",
  },
  {
    id: "n2", type: "message", icon: "💬", title: "New message from James K.",
    body: "Is the Toyota Camry still available? Can we arrange a viewing this weekend?",
    time: "18 min ago", read: false, link: "/messages", cta: "Reply",
  },
  {
    id: "n3", type: "listing", icon: "✅", title: "Listing approved",
    body: "Your listing '2023 BMW 5 Series 530i' is now live on Debford.",
    time: "1h ago", read: false, link: "/garage", cta: "View listing",
  },
  {
    id: "n4", type: "offer", icon: "💰", title: "New offer received",
    body: "Sarah M. has made an offer of $28,500 on your Toyota Camry.",
    time: "3h ago", read: true, link: "/messages", cta: "View offer",
  },
  {
    id: "n5", type: "review", icon: "⭐", title: "New review",
    body: "James K. left you a 5-star review: 'Excellent transaction, highly recommend!'",
    time: "1d ago", read: true, link: "/reviews", cta: "View review",
  },
  {
    id: "n6", type: "system", icon: "🔔", title: "Price drop alert",
    body: "A saved vehicle (2022 Mazda 6) has dropped in price from $34,000 to $31,000.",
    time: "2d ago", read: true, link: "/vehicles", cta: "View vehicle",
  },
  {
    id: "n7", type: "billing", icon: "💳", title: "Subscription renewed",
    body: "Your Pro plan has been successfully renewed for another month. $49.00 charged.",
    time: "5d ago", read: true, link: "/membership", cta: null,
  },
  {
    id: "n8", type: "system", icon: "🎉", title: "Welcome to Debford!",
    body: "Your account is set up. Complete your profile to get verified and unlock all features.",
    time: "1w ago", read: true, link: "/profile", cta: "Complete profile",
  },
];

const TYPE_COLORS: Record<string, string> = {
  bid:     "bg-amber-500/15 border-amber-500/25",
  message: "bg-blue-500/15 border-blue-500/25",
  listing: "bg-emerald-500/15 border-emerald-500/25",
  offer:   "bg-purple-500/15 border-purple-500/25",
  review:  "bg-amber-500/15 border-amber-500/25",
  system:  "bg-slate-500/15 border-slate-500/25",
  billing: "bg-rose-500/15 border-rose-500/25",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "bid", label: "Bids" },
  { key: "message", label: "Messages" },
  { key: "listing", label: "Listings" },
  { key: "offer", label: "Offers" },
];

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const resolved = await searchParams;
  const filter = resolved?.filter ?? "all";
  const filtered = filter === "unread"
    ? MOCK_NOTIFICATIONS.filter(n => !n.read)
    : filter === "all"
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.filter(n => n.type === filter);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="min-h-screen surface-base">
      <div className="surface-raised border-b border-subtle">
        <div className="container-debford py-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-slate-300">Notifications</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      <div className="container-debford py-8 max-w-3xl">
        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/notifications?filter=${tab.key}`}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? "gradient-brand text-white"
                  : "glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Notifications list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔔</div>
            <h2 className="text-lg font-bold text-white mb-2">All caught up!</h2>
            <p className="text-slate-500 text-sm">No {filter !== "all" ? filter : ""} notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`relative glass rounded-2xl border p-5 transition-all hover:border-white/20 ${
                  !n.read ? "border-white/15" : "border-white/8 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Unread dot */}
                {!n.read && (
                  <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${TYPE_COLORS[n.type] ?? TYPE_COLORS.system}`}>
                    {n.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`text-sm font-semibold ${n.read ? "text-slate-300" : "text-white"}`}>
                        {n.title}
                      </h3>
                      <span className="text-xs text-slate-600 shrink-0 ml-3">{n.time}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{n.body}</p>
                    <div className="flex items-center gap-3">
                      {n.cta && n.link && (
                        <Link
                          href={n.link}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {n.cta} →
                        </Link>
                      )}
                      {!n.read && (
                        <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification settings link */}
        <div className="mt-8 text-center">
          <Link href="/profile#notif-email" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ⚙️ Manage notification preferences
          </Link>
        </div>
      </div>
    </div>
  );
}
