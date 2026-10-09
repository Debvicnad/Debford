"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Gavel,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Play,
  Calendar,
  XCircle,
  FileCheck,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Filter,
  SlidersHorizontal,
  Info,
  ShieldAlert,
} from "lucide-react";
import {
  updateAuctionStatus,
  closeAuction,
  getAuctionParticipants,
  approveParticipant,
  rejectParticipant,
  settleAuction,
} from "@/lib/actions/auction.actions";

interface AuctionItem {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "registration" | "live" | "ended" | "settled" | "cancelled";
  starting_price: number;
  current_bid: number | null;
  reserve_price: number | null;
  buy_now_price: number | null;
  bid_increment: number;
  bids_count: number;
  starts_at: string;
  ends_at: string;
  currency: string;
  requires_registration: boolean;
  winner_id?: string | null;
  vehicle?: {
    id: string;
    year: number;
    make_name: string | null;
    model_name: string | null;
    images?: { url: string; is_primary: boolean }[];
  };
}

interface Participant {
  id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    verification_status?: string | null;
    average_rating?: number | null;
  };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  draft: {
    label: "Draft",
    color: "text-slate-300",
    bg: "bg-slate-800/80",
    border: "border-slate-700",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  registration: {
    label: "Registration Open",
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
  live: {
    label: "Live Bidding Arena",
    color: "text-rose-300",
    bg: "bg-rose-500/15",
    border: "border-rose-500/40",
  },
  ended: {
    label: "Concluded",
    color: "text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  settled: {
    label: "Settled & Delivered",
    color: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-slate-400",
    bg: "bg-slate-900",
    border: "border-slate-800",
  },
};

export function AuctionManagerClient({
  initialAuctions,
}: {
  initialAuctions: AuctionItem[];
}) {
  const [auctions, setAuctions] = useState<AuctionItem[]>(initialAuctions);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Participant Modal state
  const [participantModalAuction, setParticipantModalAuction] = useState<AuctionItem | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Settlement Modal state
  const [settlementAuction, setSettlementAuction] = useState<AuctionItem | null>(null);
  const [settlementAmount, setSettlementAmount] = useState<number>(0);
  const [settlementNotes, setSettlementNotes] = useState("");
  const [winnerIdInput, setWinnerIdInput] = useState("");

  const formatPrice = (amount: number | null | undefined, currency = "USD") => {
    if (amount == null) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status transition execution
  const handleTransition = (auctionId: string, nextStatus: any) => {
    startTransition(async () => {
      setNotification(null);
      const res = await updateAuctionStatus(auctionId, nextStatus);
      if (res.error) {
        setNotification({ type: "error", message: res.error });
        return;
      }
      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === auctionId ? { ...auc, status: nextStatus } : auc
        )
      );
      setNotification({
        type: "success",
        message: `Auction successfully transitioned to ${nextStatus.toUpperCase()}`,
      });
    });
  };

  // Conclude auction early / immediately
  const handleCloseAuction = (auctionId: string) => {
    if (!confirm("Are you sure you want to conclude live bidding on this auction now?")) return;
    startTransition(async () => {
      setNotification(null);
      const res = await closeAuction(auctionId);
      if (res.error) {
        setNotification({ type: "error", message: res.error });
        return;
      }
      setAuctions((prev) =>
        prev.map((auc) => (auc.id === auctionId ? { ...auc, status: "ended" } : auc))
      );
      setNotification({
        type: "success",
        message: "Auction closed. Highest bid verified. You may now proceed to settlement.",
      });
    });
  };

  // Open participant moderation modal
  const openParticipants = async (auction: AuctionItem) => {
    setParticipantModalAuction(auction);
    setLoadingParticipants(true);
    const res = await getAuctionParticipants(auction.id);
    setParticipants(res.participants ?? []);
    setLoadingParticipants(false);
  };

  // Approve participant
  const handleApproveParticipant = (participantId: string) => {
    if (!participantModalAuction) return;
    startTransition(async () => {
      const res = await approveParticipant(participantModalAuction.id, participantId);
      if (res.error) {
        setNotification({ type: "error", message: res.error });
        return;
      }
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, status: "approved" } : p))
      );
      setNotification({
        type: "success",
        message: "Bidder pre-registration approved.",
      });
    });
  };

  // Reject participant
  const handleRejectParticipant = (participantId: string) => {
    if (!participantModalAuction) return;
    const reason = prompt("Enter optional rejection reason:") || undefined;
    startTransition(async () => {
      const res = await rejectParticipant(participantModalAuction.id, participantId, reason);
      if (res.error) {
        setNotification({ type: "error", message: res.error });
        return;
      }
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, status: "rejected" } : p))
      );
      setNotification({
        type: "success",
        message: "Bidder pre-registration declined.",
      });
    });
  };

  // Open settlement modal
  const openSettlement = (auction: AuctionItem) => {
    setSettlementAuction(auction);
    setSettlementAmount(auction.current_bid ?? auction.starting_price);
    setWinnerIdInput(auction.winner_id ?? "demo-buyer-id");
    setSettlementNotes("Verified vehicle inspection sign-off and title escrow transfer ready.");
  };

  // Finalize settlement
  const handleFinalizeSettlement = () => {
    if (!settlementAuction) return;
    startTransition(async () => {
      setNotification(null);
      const res = await settleAuction({
        auctionId: settlementAuction.id,
        winnerId: winnerIdInput || "demo-winner-id",
        finalAmount: settlementAmount,
        notes: settlementNotes,
      });

      if (res.error) {
        setNotification({ type: "error", message: res.error });
        return;
      }

      setAuctions((prev) =>
        prev.map((auc) =>
          auc.id === settlementAuction.id ? { ...auc, status: "settled" } : auc
        )
      );
      setSettlementAuction(null);
      setNotification({
        type: "success",
        message: `Auction successfully settled! Buyer notified and escrow release triggered.`,
      });
    });
  };

  // Filtered list
  const filteredAuctions = auctions.filter((auc) => {
    const matchesStatus = statusFilter === "all" || auc.status === statusFilter;
    const matchesSearch =
      auc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auc.vehicle?.make_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auc.vehicle?.model_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Key metrics
  const activeArenasCount = auctions.filter((a) => a.status === "live").length;
  const registrationCount = auctions.filter((a) => a.status === "registration").length;
  const endedAwaitingSettlement = auctions.filter((a) => a.status === "ended").length;
  const settledTotalValue = auctions
    .filter((a) => a.status === "settled")
    .reduce((acc, cur) => acc + (cur.current_bid ?? cur.starting_price), 0);

  return (
    <div className="space-y-8">
      {/* ── Notification Banner ────────────────────────────────────────── */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Metric Snapshot Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Active Live Arenas
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black font-mono text-white mb-1">
            {activeArenasCount}
          </div>
          <div className="text-xs text-slate-500">Real-time live bidding</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Pre-Registration
            </span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black font-mono text-sky-300 mb-1">
            {registrationCount}
          </div>
          <div className="text-xs text-slate-500">Applicant review queues</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Awaiting Settlement
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-300 mb-1">
            {endedAwaitingSettlement}
          </div>
          <div className="text-xs text-slate-500">Concluded auctions</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Settled Volume
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-300 mb-1">
            {formatPrice(settledTotalValue)}
          </div>
          <div className="text-xs text-slate-500">Total closed value</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/70 border border-white/8 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search consignment catalog by title or model…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Auctions" },
            { id: "live", label: "Live Arenas" },
            { id: "registration", label: "Registration" },
            { id: "scheduled", label: "Scheduled" },
            { id: "draft", label: "Drafts" },
            { id: "ended", label: "Concluded" },
            { id: "settled", label: "Settled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Auctions List ────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredAuctions.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-slate-900/40 border border-white/5">
            <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No auctions found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              No auctions match the current filter. Launch a new consignment or reset your filters.
            </p>
            <Link
              href="/auctions/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Consignment</span>
            </Link>
          </div>
        ) : (
          filteredAuctions.map((auction) => {
            const statusStyle = STATUS_CONFIG[auction.status] || STATUS_CONFIG.draft;
            const primaryImg =
              auction.vehicle?.images?.find((i) => i.is_primary)?.url ??
              auction.vehicle?.images?.[0]?.url;

            const isLive = auction.status === "live";
            const isEnded = auction.status === "ended";
            const isSettled = auction.status === "settled";

            return (
              <div
                key={auction.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-white/8 hover:border-white/15 transition-all backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6"
              >
                {/* Vehicle Thumbnail & Basic Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl bg-slate-950 overflow-hidden relative shrink-0 border border-white/5">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={auction.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                        🏎️
                      </div>
                    )}
                    <span
                      className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        ID: •••{auction.id.slice(-6)}
                      </span>
                      {auction.requires_registration && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <Users className="w-3 h-3" />
                          <span>Pre-Registration Required</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white truncate hover:text-amber-400 transition-colors">
                      {auction.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                      <div>
                        Opening:{" "}
                        <strong className="text-white font-mono">
                          {formatPrice(auction.starting_price, auction.currency)}
                        </strong>
                      </div>
                      <div>
                        High Bid:{" "}
                        <strong className="text-amber-400 font-mono">
                          {formatPrice(auction.current_bid ?? auction.starting_price, auction.currency)}
                        </strong>
                      </div>
                      {auction.reserve_price && (
                        <div>
                          Reserve:{" "}
                          <strong className="text-slate-300 font-mono">
                            {formatPrice(auction.reserve_price, auction.currency)}
                          </strong>
                        </div>
                      )}
                      <div>
                        Bids:{" "}
                        <strong className="text-white font-mono">
                          {auction.bids_count}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Specific Controls & Modals Trigger */}
                <div className="flex items-center gap-2 flex-wrap lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                  {/* Preview live room link */}
                  <Link
                    href={`/auctions/${auction.id}`}
                    target="_blank"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/8 transition-all"
                    title="View Bidding Room"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Pre-Registration Moderation Button */}
                  {auction.requires_registration && (
                    <button
                      onClick={() => openParticipants(auction)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Moderate Bidders</span>
                    </button>
                  )}

                  {/* Status Lifecycle Dropdown / Triggers */}
                  {auction.status === "draft" && (
                    <>
                      <button
                        onClick={() => handleTransition(auction.id, "scheduled")}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Publish (Schedule)</span>
                      </button>
                      <button
                        onClick={() => handleTransition(auction.id, "cancelled")}
                        disabled={isPending}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                        title="Cancel Auction"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {auction.status === "scheduled" && (
                    <>
                      {auction.requires_registration && (
                        <button
                          onClick={() => handleTransition(auction.id, "registration")}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Open Registration</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleTransition(auction.id, "live")}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-md shadow-rose-600/30"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Arena Now</span>
                      </button>
                    </>
                  )}

                  {auction.status === "registration" && (
                    <button
                      onClick={() => handleTransition(auction.id, "live")}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-lg shadow-rose-600/30 animate-pulse"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Commence Live Bidding</span>
                    </button>
                  )}

                  {isLive && (
                    <button
                      onClick={() => handleCloseAuction(auction.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Conclude Arena</span>
                    </button>
                  )}

                  {isEnded && (
                    <button
                      onClick={() => openSettlement(auction)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Execute Settlement</span>
                    </button>
                  )}

                  {isSettled && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Settlement Concluded</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: PARTICIPANT PRE-REGISTRATION MODERATION ───────────── */}
      {participantModalAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold mb-1">
                  Participant Verification &amp; Security Gate
                </div>
                <h2 className="text-xl font-black text-white">
                  Bidder Access — {participantModalAuction.title}
                </h2>
              </div>
              <button
                onClick={() => setParticipantModalAuction(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1 scrollbar-thin">
              {loadingParticipants ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Loading registered applicants…
                </div>
              ) : participants.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No applicants registered for this auction yet.
                </div>
              ) : (
                participants.map((p) => {
                  const isApproved = p.status === "approved";
                  const isPending = p.status === "pending";
                  const isRejected = p.status === "rejected";

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/6 flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                          {p.user?.full_name?.slice(0, 2).toUpperCase() ?? "UB"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {p.user?.full_name ?? "Undisclosed Bidder"}
                            </span>
                            {p.user?.verification_status === "verified" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified KYC</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                                <ShieldAlert className="w-3 h-3" />
                                <span>Standard User</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Applied: {new Date(p.created_at).toLocaleDateString()} · Rating: ★{" "}
                            {p.user?.average_rating ?? "5.0"}
                          </div>
                        </div>
                      </div>

                      {/* Approval Status & Actions */}
                      <div className="flex items-center gap-2">
                        {isApproved && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Approved ✓
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            Declined ✕
                          </span>
                        )}
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApproveParticipant(p.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectParticipant(p.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-white/8 mt-6 flex justify-end">
              <button
                onClick={() => setParticipantModalAuction(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
              >
                Close Security Gate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: AUCTION SETTLEMENT & HANDOVER ──────────────────────── */}
      {settlementAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                  Commercial Handover &amp; Escrow Console
                </div>
                <h2 className="text-xl font-black text-white">Execute Final Settlement</h2>
              </div>
              <button
                onClick={() => setSettlementAuction(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/6">
                <div className="text-xs text-slate-400 mb-1">Auction Consignment:</div>
                <div className="text-sm font-bold text-white mb-2">
                  {settlementAuction.title}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>High Bidding Value:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {formatPrice(settlementAuction.current_bid ?? settlementAuction.starting_price, settlementAuction.currency)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Winning Bidder User ID / Account
                </label>
                <input
                  type="text"
                  value={winnerIdInput}
                  onChange={(e) => setWinnerIdInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. user-8842 or verified buyer profile UUID"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Final Settled Escrow Sum ({settlementAuction.currency})
                </label>
                <input
                  type="number"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Handover Notes &amp; Logistics Instructions
                </label>
                <textarea
                  rows={3}
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Notes on vehicle physical inspection, carrier details, or title documentation…"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  Finalizing will automatically alert the winning bidder, update the global ledger to{" "}
                  <strong>Settled</strong>, and initiate the Debford 48-hour title and escrow release.
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/8 mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSettlementAuction(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalizeSettlement}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isPending ? "Finalizing…" : "Confirm & Settle Auction"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
