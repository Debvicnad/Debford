"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Compass,
  Gavel,
  Plus,
  Bell,
  Home,
  Layers,
} from "lucide-react";
import { getUnreadNotificationCount } from "@/lib/actions/notification.actions";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Hide on full-screen flows
  if (
    pathname.startsWith("/sell") ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/messages")
  ) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    getUnreadNotificationCount()
      .then((c) => setUnreadCount(c))
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    {
      href: "/vehicles",
      label: "Market",
      icon: Compass,
      isActive: pathname === "/" || pathname.startsWith("/vehicles"),
    },
    {
      href: "/auctions",
      label: "Auctions",
      icon: Gavel,
      isActive: pathname.startsWith("/auctions"),
      isLive: true,
    },
    {
      href: "/sell",
      label: "Sell",
      icon: Plus,
      isCenterAction: true,
    },
    {
      href: "/notifications",
      label: "Alerts",
      icon: Bell,
      isActive: pathname.startsWith("/notifications"),
      badge: unreadCount,
    },
    {
      href: "/dashboard",
      label: "Garage",
      icon: Layers,
      isActive:
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/garage") ||
        pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#070a10]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenterAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="List a Vehicle"
                className="relative -top-4 flex flex-col items-center group cursor-pointer"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white">
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300 text-amber-400" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider group-hover:text-white">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                item.isActive
                  ? "text-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? "scale-110" : ""
                  }`}
                />

                {/* Live ping beacon */}
                {item.isLive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}

                {/* Unread badge */}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center shadow-md shadow-amber-500/40">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[10px] mt-1 font-semibold transition-colors ${
                  item.isActive ? "text-white font-bold" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>

              {item.isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
