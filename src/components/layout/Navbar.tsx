"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getUnreadNotificationCount } from "@/lib/actions/notification.actions";

const NAV_ITEMS = [
  { href: "/vehicles", label: "Buy" },
  { href: "/rentals", label: "Rent" },
  { href: "/auctions", label: "Auctions" },
  { href: "/services", label: "Services" },
  { href: "/parts", label: "Parts" },
  { href: "/customisation", label: "Upgrades" },
];

const USER_MENU = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/offers", label: "Offers & Deals", icon: "🏷️" },
  { href: "/garage", label: "My Garage", icon: "🏠" },
  { href: "/saved", label: "Saved", icon: "🤍" },
  { href: "/messages", label: "Messages", icon: "💬" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dealership", label: "My Dealership", icon: "🏢" },
  { href: "/reviews", label: "Reviews", icon: "⭐" },
  { href: "/verification", label: "Verification", icon: "🪪" },
  { href: "/profile", label: "Profile & Settings", icon: "⚙️" },
];

/**
 * Global navigation — client component for pathname-aware active states.
 * Hidden on full-screen pages (/sell, /messages, /ai).
 */
export function Navbar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Scroll detection for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const close = () => { setUserOpen(false); setMenuOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    getUnreadNotificationCount()
      .then((count) => setUnreadCount(count))
      .catch(() => {});
  }, [pathname]);

  // Hide on dedicated full-screen routes
  if (pathname.startsWith("/sell") || pathname.startsWith("/ai")) return null;

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0d14]/90 backdrop-blur-xl shadow-2xl shadow-black/50 border-b border-white/10"
          : "bg-gradient-to-b from-black/85 via-black/40 to-transparent"
      }`}
    >
      <nav className="container-debford flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <span className="text-white font-extrabold text-sm">D</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">DEBFORD</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith(item.href)
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Link
            href="/search"
            aria-label="Search"
            className="w-9 h-9 glass rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* DEBA AI */}
          <Link
            href="/ai"
            aria-label="AI Assistant"
            className="hidden sm:flex w-9 h-9 glass rounded-xl border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/40 transition-all"
            title="DEBA AI Assistant"
          >
            🤖
          </Link>

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative w-9 h-9 glass rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
            title="Activity & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md shadow-amber-500/40">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Sell CTA */}
          <Link
            href="/sell"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <span className="text-base leading-none">+</span>
            <span>Sell</span>
          </Link>

          {/* User menu or Auth buttons */}
          {userEmail ? (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                id="user-menu-btn"
                onClick={() => { setUserOpen((o) => !o); setMenuOpen(false); }}
                className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                {userInitial}
              </button>

              {userOpen && (
                <div className="absolute right-0 top-12 w-56 glass rounded-2xl border border-white/15 shadow-2xl shadow-black/50 py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-4 py-2 border-b border-white/8 mb-1">
                    <p className="text-xs text-slate-400 truncate font-medium">{userEmail}</p>
                  </div>
                  {USER_MENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setUserOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        pathname === item.href
                          ? "text-white bg-blue-500/15"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.href === "/notifications" && unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-amber-500 text-slate-950">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  ))}
                  <div className="border-t border-white/8 mt-1 pt-1">
                    <Link href="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                      <span>🔧</span> Admin
                    </Link>
                    <form action="/api/auth/signout" method="POST">
                      <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:text-rose-400 transition-colors text-left">
                        <span>🚪</span> Sign out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:block px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-semibold text-white gradient-brand rounded-lg shadow hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 glass rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); setUserOpen(false); }}
            aria-label="Toggle menu"
          >
            <span className="text-lg leading-none">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="lg:hidden surface-raised border-t border-subtle shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="container-debford py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname.startsWith(item.href) ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/sell" onClick={() => setMenuOpen(false)} className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-white gradient-brand">
              + List a vehicle
            </Link>
            <div className="border-t border-white/8 pt-3 mt-3 space-y-1">
              {USER_MENU.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-amber-500 text-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
