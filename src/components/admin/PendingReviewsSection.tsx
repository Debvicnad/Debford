"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  type PendingItem,
  approveListing,
  rejectListing,
  publishAllPending,
} from "@/lib/actions/admin.actions";

export function PendingReviewsSection({
  initialItems,
}: {
  initialItems: PendingItem[];
}) {
  const [items, setItems] = useState<PendingItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  function handleApprove(item: PendingItem) {
    setActiveActionId(item.id);
    setMessage(null);
    startTransition(async () => {
      const res = await approveListing(item.id, item.type);
      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setMessage({ text: `Approved "${item.title}" — now published live on marketplace!`, type: "success" });
      }
      setActiveActionId(null);
    });
  }

  function handleReject(item: PendingItem) {
    setActiveActionId(item.id);
    setMessage(null);
    startTransition(async () => {
      const res = await rejectListing(item.id, item.type);
      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setMessage({ text: `Rejected "${item.title}". Seller has been notified.`, type: "success" });
      }
      setActiveActionId(null);
    });
  }

  function handleApproveAll() {
    setMessage(null);
    startTransition(async () => {
      const res = await publishAllPending();
      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setItems([]);
        setMessage({ text: "All pending listings have been approved and published live!", type: "success" });
      }
    });
  }

  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/8 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Pending Review</h2>
          <span className="w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {items.length}
          </span>
        </div>
        {items.length > 1 && (
          <button
            onClick={handleApproveAll}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            ⚡ Approve All ({items.length})
          </button>
        )}
      </div>

      {/* Notification banner */}
      {message && (
        <div
          className={`px-4 py-3 text-xs font-medium border-b ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border-rose-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* List */}
      <div className="p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm font-medium text-slate-300">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">
              No listings currently waiting for review.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const isActing = activeActionId === item.id && isPending;

            return (
              <div
                key={item.id}
                className="p-3.5 surface-base rounded-xl border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex gap-3 mb-2.5">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-slate-800 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>🚗</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-bold bg-blue-500/15 text-blue-400 rounded shrink-0">
                        {item.type}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-300 mt-0.5">
                      {item.price}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1 truncate">
                      <span>👤 {item.sellerName}</span>
                      <span>•</span>
                      <span>🕒 {item.submittedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  {item.slug && (
                    <Link
                      href={`/vehicles/${item.slug}`}
                      target="_blank"
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white glass border border-white/10 rounded-lg transition-colors"
                    >
                      👁️ Preview
                    </Link>
                  )}
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={isActing}
                    className="flex-1 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isActing ? "Processing…" : "✓ Approve & Publish"}
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    disabled={isActing}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
