"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Send,
  Car,
  Tag,
  Clock,
  CheckCheck,
  ArrowLeft,
  DollarSign,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Lock,
  ChevronRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ConversationItem,
  MessageItem,
  getConversationMessages,
  sendMessage as sendServerMessage,
  markConversationRead,
} from "@/lib/actions/message.actions";

interface Props {
  initialConversations: ConversationItem[];
  currentUserId: string;
  initialSelectedId?: string | null;
  prefillMessage?: string | null;
}

const QUICK_REPLIES = [
  "Is this vehicle still available in the showroom?",
  "Can you share the 150-point inspection report?",
  "Is the asking price negotiable with escrow?",
  "Can I schedule a private viewing this Saturday?",
  "Does the vehicle have a verified clean title?",
];

const INITIAL_DEMO_MESSAGES: Record<string, MessageItem[]> = {
  "conv-demo-1": [
    {
      id: "m-d1-1",
      conversation_id: "conv-demo-1",
      sender_id: "usr-stuttgart",
      content: "Hello! Thank you for inquiring about the 2023 Porsche 911 GT3 RS Clubsport. The car is in immaculate condition with single-owner history.",
      type: "text",
      created_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      is_mine: false,
    },
    {
      id: "m-d1-2",
      conversation_id: "conv-demo-1",
      sender_id: "demo-user-1",
      content: "Hi James, looks stunning. Has the car done any track days, and can we schedule an in-person ramp viewing?",
      type: "text",
      created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      is_mine: true,
    },
    {
      id: "m-d1-3",
      conversation_id: "conv-demo-1",
      sender_id: "usr-stuttgart",
      content: "Zero track miles — climate-controlled collector garage only. The 150-point ramp inspection is scheduled for 10 AM Saturday. Title is clean and ready.",
      type: "text",
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      is_mine: false,
    },
  ],
  "conv-demo-2": [
    {
      id: "m-d2-1",
      conversation_id: "conv-demo-2",
      sender_id: "usr-sarah",
      content: "Hi, I'm very interested in your BMW M4 Competition Coupe.",
      type: "text",
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      is_mine: false,
    },
    {
      id: "m-d2-2",
      conversation_id: "conv-demo-2",
      sender_id: "usr-sarah",
      content: "Offered $76,500 — \"Ready to authorize holding deposit in Debford Escrow Vault today.\"",
      type: "offer",
      metadata: {
        offer_amount: 76500,
        status: "pending",
        note: "Ready to authorize holding deposit in Debford Escrow Vault today.",
      },
      created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      is_mine: false,
    },
  ],
  "conv-demo-3": [
    {
      id: "m-d3-1",
      conversation_id: "conv-demo-3",
      sender_id: "usr-apex",
      content: "Dyno run confirmed +54 WHP with the Akrapovič titanium system and ECU Stage 2 tune. Ready for pickup whenever you are.",
      type: "text",
      created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      is_mine: false,
    },
  ],
};

export function MessagesClient({
  initialConversations,
  currentUserId,
  initialSelectedId,
  prefillMessage,
}: Props) {
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId || (initialConversations.length > 0 ? initialConversations[0].id : null)
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState<string>(prefillMessage || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const router = useRouter();

  // Offer modal state
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
    }
  }, [initialSelectedId]);

  // Load messages when conversation selection changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);

    if (selectedId.startsWith("conv-demo-")) {
      const demoMsgs = INITIAL_DEMO_MESSAGES[selectedId] || [];
      setMessages(demoMsgs);
      setLoadingMessages(false);
    } else {
      getConversationMessages(selectedId)
        .then((msgs) => {
          if (isMounted) {
            setMessages(msgs);
            setLoadingMessages(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoadingMessages(false);
        });

      markConversationRead(selectedId);
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
    );

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  // Supabase Realtime subscription for incoming messages
  useEffect(() => {
    if (!selectedId || selectedId.startsWith("conv-demo-")) return;

    const channel = supabase
      .channel(`live_messages_${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newRow.id)) return prev;
            return [
              ...prev,
              {
                id: newRow.id,
                conversation_id: newRow.conversation_id,
                sender_id: newRow.sender_id,
                content: newRow.content ?? "",
                type: newRow.type ?? "text",
                metadata: newRow.metadata ?? null,
                created_at: newRow.created_at,
                is_mine: newRow.sender_id === currentUserId,
              },
            ];
          });

          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedId
                ? {
                    ...c,
                    last_message: newRow.content ?? "New message",
                    last_message_at: newRow.created_at,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, currentUserId, supabase]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages]);

  // Send message handler
  const handleSend = useCallback(
    async (textToSend?: string) => {
      const content = (textToSend !== undefined ? textToSend : input).trim();
      if (!content || !selectedId || sending) return;

      const tempId = `temp_${Date.now()}`;
      const optimisticMsg: MessageItem = {
        id: tempId,
        conversation_id: selectedId,
        sender_id: currentUserId,
        content,
        type: "text",
        created_at: new Date().toISOString(),
        is_mine: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setInput("");
      setSending(true);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, last_message: content, last_message_at: optimisticMsg.created_at }
            : c
        )
      );

      if (!selectedId.startsWith("conv-demo-")) {
        const res = await sendServerMessage(selectedId, content, "text");
        if (res.success && res.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
          );
        }
      } else {
        // Simulated response in demo mode after 1.2 seconds
        setTimeout(() => {
          const replyMsg: MessageItem = {
            id: `reply_${Date.now()}`,
            conversation_id: selectedId,
            sender_id: "usr-simulated",
            content: "Got it! Thanks for the update. Let's proceed with the escrow arrangement.",
            type: "text",
            created_at: new Date().toISOString(),
            is_mine: false,
          };
          setMessages((prev) => [...prev, replyMsg]);
        }, 1200);
      }

      setSending(false);
    },
    [input, selectedId, currentUserId, sending]
  );

  // Send formal Offer message
  const handleSendOffer = async () => {
    const amountNum = parseFloat(offerAmount.replace(/[^0-9.]/g, ""));
    if (!amountNum || amountNum <= 0 || !selectedId || submittingOffer) return;

    setSubmittingOffer(true);
    const content = `Offered $${amountNum.toLocaleString()}${offerNote ? ` — "${offerNote}"` : ""}`;
    const metadata = {
      offer_amount: amountNum,
      status: "pending",
      note: offerNote.trim(),
    };

    const tempId = `temp_offer_${Date.now()}`;
    const optimisticMsg: MessageItem = {
      id: tempId,
      conversation_id: selectedId,
      sender_id: currentUserId,
      content,
      type: "offer",
      metadata,
      created_at: new Date().toISOString(),
      is_mine: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsOfferOpen(false);
    setOfferAmount("");
    setOfferNote("");

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, last_message: content, last_message_at: optimisticMsg.created_at }
          : c
      )
    );

    if (!selectedId.startsWith("conv-demo-")) {
      const res = await sendServerMessage(selectedId, content, "offer", metadata);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
        );
      }
    }
    setSubmittingOffer(false);
  };

  const filteredConversations = conversations.filter((c) => {
    const nameMatch = c.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const listingMatch = c.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery === "" || nameMatch || listingMatch;
  });

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const otherUser = selectedConv?.other_user;
  const currentListing = selectedConv?.listing;

  return (
    <div className="h-full flex overflow-hidden" style={{ backgroundColor: "#06090e" }}>
      {/* ── 1. SIDEBAR: Conversations List ── */}
      <aside
        className={`w-full md:w-80 lg:w-96 shrink-0 border-r flex flex-col ${
          selectedId ? "hidden md:flex" : "flex"
        }`}
        style={{
          backgroundColor: "rgba(8, 12, 20, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Negotiations & Chats</span>
                {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-blue-500 text-white rounded-full">
                    {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)}
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
              <Lock className="w-2.5 h-2.5" />
              <span>256-Bit SSL</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat or vehicle..."
              className="w-full bg-[#0d121f] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-none">
          {filteredConversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                💬
              </div>
              <p className="text-xs font-medium text-slate-300">
                {searchQuery ? "No chats match your query" : "No active negotiations"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedId;
              const other = conv.other_user;
              const initial = other?.full_name?.charAt(0).toUpperCase() ?? "U";

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative group cursor-pointer ${
                    isSelected
                      ? "bg-blue-600/15 border-l-4 border-blue-500 shadow-inner"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {other?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={other.avatar_url}
                        alt={other.full_name}
                        className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}>
                        {initial}
                      </div>
                    )}
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {other?.full_name || "Debford User"}
                      </span>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>

                    {conv.listing && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold mb-1 truncate">
                        <Car className="w-3 h-3 shrink-0" />
                        <span className="truncate">{conv.listing.title}</span>
                      </div>
                    )}

                    <p
                      className={`text-xs truncate ${
                        conv.unread_count > 0 ? "text-white font-semibold" : "text-slate-400"
                      }`}
                    >
                      {conv.last_message || "Started a conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── 2. MAIN CHAT AREA ── */}
      {selectedId && selectedConv ? (
        <main className="flex-1 flex flex-col min-w-0 bg-[#06090e] relative">
          {/* Top Bar Header */}
          <header
            className="h-16 px-4 md:px-6 border-b flex items-center justify-between shrink-0 z-10"
            style={{
              backgroundColor: "rgba(8, 12, 20, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
              >
                {otherUser?.full_name?.charAt(0).toUpperCase() ?? "U"}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white truncate">
                    {otherUser?.full_name || "Debford Member"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Seller & Depository Escrow Protected
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {currentListing && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsOfferOpen(true)}
                    className="px-3.5 py-2 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:opacity-95 cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 4px 12px -2px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Make Offer</span>
                  </button>

                  <Link
                    href={`/checkout?type=vehicle&id=${currentListing.id}`}
                    className="hidden sm:flex px-3.5 py-2 text-slate-950 text-xs font-extrabold rounded-xl items-center gap-1.5 shadow-md transition-all hover:opacity-95"
                    style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Reserve Escrow</span>
                  </Link>
                </>
              )}
            </div>
          </header>

          {/* Attached Listing Info Card Banner */}
          {currentListing && (
            <div
              className="px-4 md:px-6 py-2.5 border-b flex items-center justify-between gap-4 text-xs"
              style={{
                backgroundColor: "rgba(13, 18, 31, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {currentListing.imageUrl ? (
                  <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={currentListing.imageUrl}
                      alt={currentListing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">
                    Listing in Negotiation
                  </span>
                  <span className="text-white font-semibold truncate block text-xs">
                    {currentListing.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Agreed Price</span>
                  <span className="text-sm font-black text-blue-400 font-mono">
                    ${currentListing.price?.toLocaleString()}
                  </span>
                </div>
                <Link
                  href={`/vehicles/${currentListing.id}`}
                  target="_blank"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="View vehicle showroom page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Message Thread Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-none">
            {loadingMessages ? (
              <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-500">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-xs">Connecting to encrypted channel...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Encrypted Channel Established</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Message this specialist or seller directly. All financial commitments are secured under Debford Escrow.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.is_mine || msg.sender_id === currentUserId;
                const isOffer = msg.type === "offer";
                const offerAmountVal = msg.metadata?.offer_amount;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2 group`}
                  >
                    {!isMine && (
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1"
                        style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                      >
                        {otherUser?.full_name?.charAt(0).toUpperCase() ?? "U"}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs transition-all shadow-md ${
                        isOffer
                          ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-white rounded-2xl"
                          : isMine
                          ? "text-white rounded-br-sm"
                          : "border border-white/10 text-slate-100 rounded-bl-sm"
                      }`}
                      style={{
                        background: !isOffer
                          ? isMine
                            ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                            : "rgba(13, 18, 31, 0.85)"
                          : undefined,
                      }}
                    >
                      {/* Special Offer Card Bubble */}
                      {isOffer ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 pb-2">
                            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-black uppercase tracking-wider">
                              <Tag className="w-3.5 h-3.5" />
                              <span>Official Vehicle Purchase Offer</span>
                            </div>
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                              {msg.metadata?.status ?? "Pending Review"}
                            </span>
                          </div>

                          <div className="py-1">
                            <span className="text-[10px] text-slate-400 block">Proposed Purchase Amount</span>
                            <div className="text-2xl font-black text-white font-mono">
                              ${Number(offerAmountVal || 0).toLocaleString()}
                            </div>
                            {msg.metadata?.note && (
                              <p className="text-xs text-amber-200/90 italic mt-1.5 bg-black/20 p-2 rounded-xl">
                                &ldquo;{msg.metadata.note}&rdquo;
                              </p>
                            )}
                          </div>

                          {/* Action to proceed to escrow */}
                          {currentListing && (
                            <Link
                              href={`/checkout?type=vehicle&id=${currentListing.id}`}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Authorize Escrow Holding Deposit</span>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}

                      {/* Footer: Timestamp & Read Status */}
                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                          isMine ? "text-blue-100/70" : "text-slate-500"
                        }`}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          <span className="ml-1">
                            <CheckCheck className="w-3 h-3 text-blue-200 inline" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions Strip */}
          <div
            className="px-4 md:px-6 py-2 border-t flex items-center gap-2 overflow-x-auto scrollbar-none"
            style={{
              backgroundColor: "rgba(13, 18, 31, 0.6)",
              borderColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Quick:
            </span>
            {QUICK_REPLIES.map((replyText, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(replyText)}
                className="shrink-0 text-[11px] text-slate-300 hover:text-white bg-[#0d121f] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 rounded-full px-3 py-1 transition-all cursor-pointer"
              >
                {replyText}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div
            className="p-4 md:p-5 border-t"
            style={{
              backgroundColor: "rgba(8, 12, 20, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-3 bg-[#0d121f] border border-white/10 rounded-2xl p-2 focus-within:border-blue-500/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your encrypted message... (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 4px 12px -2px rgba(37, 99, 235, 0.4)",
                }}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Empty State */
        <main className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center bg-[#06090e]">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-4xl mb-4 shadow-xl">
            💬
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Automotive Negotiation Hub</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Select a conversation on the left to review offers, coordinate inspection ramps, or negotiate directly under Debford Escrow Protection.
          </p>
        </main>
      )}

      {/* ── 3. MAKE AN OFFER MODAL ── */}
      {isOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 border"
            style={{
              backgroundColor: "#0d121f",
              borderColor: "rgba(255, 255, 255, 0.12)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Tag className="w-4 h-4 text-blue-400" />
                <span>Submit Formal Vehicle Offer</span>
              </div>
              <button
                onClick={() => setIsOfferOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {currentListing && (
              <div className="p-3.5 rounded-2xl bg-[#080c14] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
                  <span className="text-xs font-bold text-white">{currentListing.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Asking Price</span>
                  <span className="text-xs font-mono font-black text-blue-400">
                    ${currentListing.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Offer Amount (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={currentListing ? `${currentListing.price}` : "25000"}
                    className="w-full bg-[#080c14] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              {currentListing?.price && (
                <div className="flex items-center gap-2 pt-1">
                  {[
                    { label: "Asking Price", factor: 1.0 },
                    { label: "-5% ($" + Math.round(currentListing.price * 0.95).toLocaleString() + ")", factor: 0.95 },
                    { label: "-10% ($" + Math.round(currentListing.price * 0.9).toLocaleString() + ")", factor: 0.9 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setOfferAmount(String(Math.round(currentListing.price * p.factor)))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-slate-300 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Message / Settlement Terms (Optional)
                </label>
                <textarea
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  placeholder="e.g. Willing to close immediately, holding deposit ready in Escrow."
                  rows={2}
                  className="w-full bg-[#080c14] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-[10px] text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Offers are protected. No funds will be disbursed until inspection is approved.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOfferOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOffer}
                disabled={!offerAmount || submittingOffer}
                className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 4px 16px -2px rgba(37, 99, 235, 0.4)",
                }}
              >
                {submittingOffer ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Official Offer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
