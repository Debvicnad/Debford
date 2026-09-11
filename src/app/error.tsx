"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <main className="min-h-screen surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full glass border border-subtle rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-500/10 blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          We encountered an unexpected issue while loading this page. This can happen if services are synchronizing.
        </p>

        {error.digest && (
          <p className="text-[11px] text-slate-500 font-mono mb-6 bg-slate-900/60 py-1.5 px-3 rounded-lg inline-block border border-white/5">
            Error Code: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl glass hover:bg-white/10 text-slate-200 font-medium text-sm transition-colors border border-white/10"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
