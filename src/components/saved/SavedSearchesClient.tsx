"use client";

import { useState, useTransition } from "react";
import { Search, Bell, BellOff, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { toggleSearchAlert, deleteSavedSearch } from "@/lib/actions/savedsearch.actions";
import type { SavedSearchItem } from "@/lib/actions/savedsearch.actions";
import Link from "next/link";

interface Props {
  initialSearches: SavedSearchItem[];
}

export function SavedSearchesClient({ initialSearches }: Props) {
  const [searches, setSearches] = useState(initialSearches);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleToggleAlert = (id: string, current: boolean) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await toggleSearchAlert(id, !current);
      if (!res.error) {
        setSearches((prev) =>
          prev.map((s) => (s.id === id ? { ...s, alertsEnabled: !current } : s))
        );
      }
      setBusyId(null);
    });
  };

  const handleDelete = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await deleteSavedSearch(id);
      if (!res.error) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
      }
      setBusyId(null);
    });
  };

  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
          <Search className="w-7 h-7 text-slate-500" />
        </div>
        <p className="text-base font-semibold text-white mb-1">No saved searches yet</p>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          Run a search and save it to monitor new listings automatically.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
          Start a Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searches.map((ss) => (
        <div
          key={ss.id}
          className="glass rounded-2xl border border-white/10 p-5 hover:border-white/15 transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-sm font-bold text-white truncate">{ss.name}</span>
                {ss.alertsEnabled && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    <Bell className="w-2.5 h-2.5" /> ALERTS ON
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.entries(ss.filters).map(([key, val]) => (
                  <span
                    key={key}
                    className="px-2.5 py-0.5 text-[11px] font-medium bg-white/5 border border-white/10 rounded-full text-slate-300"
                  >
                    {key}: {val}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">Saved {ss.createdAt}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {busyId === ss.id ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : (
                <>
                  <button
                    onClick={() => handleToggleAlert(ss.id, ss.alertsEnabled)}
                    title={ss.alertsEnabled ? "Disable alerts" : "Enable alerts"}
                    className={`p-2 rounded-xl border transition-all ${
                      ss.alertsEnabled
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "text-slate-400 bg-white/5 border-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {ss.alertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  </button>
                  <Link
                    href={`/search?${new URLSearchParams(ss.filters).toString()}`}
                    className="p-2 rounded-xl border text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-all"
                    title="Run this search"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(ss.id)}
                    title="Delete saved search"
                    className="p-2 rounded-xl border text-rose-400 bg-rose-500/5 border-rose-500/15 hover:bg-rose-500/15 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
