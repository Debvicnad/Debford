"use client";

import { useState, useTransition, useMemo } from "react";
import {
  type PendingItem,
  approveListing,
  rejectListing,
  publishAllPending,
} from "@/lib/actions/admin.actions";
import { ListingModerationModal } from "./ListingModerationModal";
import { Eye, Check, X, Search, Sparkles, CheckCircle2 } from "lucide-react";

export function PendingReviewsSection({
  initialItems,
}: {
  initialItems: PendingItem[];
}) {
  const [items, setItems] = useState<PendingItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Filter & Search state
  const [selectedType, setSelectedType] = useState<"all" | "sale" | "rental" | "auction">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [modalItem, setModalItem] = useState<PendingItem | null>(null);
  const [modalMode, setModalMode] = useState<"inspect" | "reject">("inspect");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = selectedType === "all" || item.type === selectedType;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q) ||
        item.make.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        (item.vin && item.vin.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [items, selectedType, searchQuery]);

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
        setModalItem(null);
      }
      setActiveActionId(null);
    });
  }

  function handleOpenRejectModal(item: PendingItem) {
    setModalItem(item);
    setModalMode("reject");
  }

  function handleConfirmReject(item: PendingItem, reason: string) {
    setActiveActionId(item.id);
    setMessage(null);
    startTransition(async () => {
      const res = await rejectListing(item.id, item.type, reason);
      if (res?.error) {
        setMessage({ text: res.error, type: "error" });
      } else {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setMessage({ text: `Rejected "${item.title}". Feedback sent to seller.`, type: "success" });
        setModalItem(null);
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
    <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-white/8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
              🚗
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Vehicle Listing Moderation</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {items.length} pending
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspect specifications, verify ownership, and publish or reject listings.
              </p>
            </div>
          </div>

          {items.length > 1 && (
            <button
              onClick={handleApproveAll}
              disabled={isPending}
              className="px-3.5 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Approve All ({items.length})</span>
            </button>
          )}
        </div>

        {/* Filter Chips & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(["all", "sale", "rental", "auction"] as const).map((tab) => {
              const count =
                tab === "all" ? items.length : items.filter((i) => i.type === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedType(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                    selectedType === tab
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "bg-[#131b2e] text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search make, model, seller, VIN..."
              className="w-full bg-[#131b2e] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {message && (
        <div
          className={`px-5 py-3 text-xs font-semibold border-b flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-300 border-rose-500/20"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Listing Cards */}
      <div className="p-5 sm:p-6 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-[#131b2e]/30 rounded-2xl border border-white/5">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm font-semibold text-slate-200">
              {items.length === 0 ? "Review queue is clear!" : "No listings match your search criteria."}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {items.length === 0
                ? "All submitted vehicle listings have been reviewed and published."
                : "Try resetting filters or adjusting search keywords."}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isActing = activeActionId === item.id && isPending;

            return (
              <div
                key={item.id}
                className="p-4 bg-[#0d121d] rounded-2xl border border-white/5 hover:border-white/10 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-800 border border-white/10 shrink-0 overflow-hidden relative">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🚗
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-white truncate hover:text-blue-400 transition-colors">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-md ${
                            item.type === "sale"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : item.type === "rental"
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-purple-500/15 text-purple-400"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <div className="text-xs font-extrabold text-emerald-400">
                        {item.price}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                        <span>👤 {item.sellerName}</span>
                        <span>•</span>
                        <span>🕒 {item.submittedAt}</span>
                        {item.vin && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-500 text-[10px]">
                              VIN: {item.vin.slice(0, 8)}…
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <button
                      onClick={() => {
                        setModalItem(item);
                        setModalMode("inspect");
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#131b2e] hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Inspect full vehicle details and photos"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleApprove(item)}
                      disabled={isActing}
                      className="px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isActing ? "Saving…" : "Approve"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenRejectModal(item)}
                      disabled={isActing}
                      className="px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspection / Rejection Modal */}
      <ListingModerationModal
        item={modalItem}
        isOpen={Boolean(modalItem)}
        mode={modalMode}
        isPending={isPending}
        onClose={() => setModalItem(null)}
        onApprove={handleApprove}
        onReject={handleConfirmReject}
      />
    </div>
  );
}
