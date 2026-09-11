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
  Check,
  ArrowLeft,
  DollarSign,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
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
  "Is this vehicle still available?",
  "Can you share more photos or service records?",
  "Is the price negotiable?",
  "Can I schedule a viewing & test drive?",
  "Does it have a clean title?",
];

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

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/vehicles");
    }
  };

  // Offer modal state
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // If initialSelectedId changes or is set initially
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

    // Mark conversation read in database & update local count
    markConversationRead(selectedId);
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread_count: 0 } : c))
    );

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  // Supabase Realtime subscription for incoming messages in active conversation
  useEffect(() => {
    if (!selectedId) return;

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
            // Deduplicate if already present (e.g. from optimistic update)
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

          // Also update last message in conversation sidebar
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

  // Scroll to bottom when messages list updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingMessages]);

  // Send plain text message
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

      // Update sidebar preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, last_message: content, last_message_at: optimisticMsg.created_at }
            : c
        )
      );

      const res = await sendServerMessage(selectedId, content, "text");
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
        );
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

    // Update conversation sidebar preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, last_message: content, last_message_at: optimisticMsg.created_at }
          : c
      )
    );

    const res = await sendServerMessage(selectedId, content, "offer", metadata);
    if (res.success && res.message) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (res.message as MessageItem) : m))
      );
    }
    setSubmittingOffer(false);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const nameMatch = c.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const listingMatch = c.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery === "" || nameMatch || listingMatch;
  });

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const otherUser = selectedConv?.other_user;
  const currentListing = selectedConv?.listing;

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-[#0a0d14]">
      {/* ============================================================ */}
      {/* 1. SIDEBAR: Conversations List */}
      {/* ============================================================ */}
      <aside
        className={`w-full md:w-80 lg:w-96 shrink-0 bg-[#0d121d] border-r border-white/5 flex flex-col ${
          selectedId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGoBack}
                className="p-1.5 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
                title="Return to previous page"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Messages</span>
                {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
                    {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)}
                  </span>
                )}
              </h1>
            </div>
            <button
              type="button"
              onClick={handleGoBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer shadow-sm group"
              title="Return to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Done</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats or listings..."
              className="w-full bg-[#131b2e] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filteredConversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                💬
              </div>
              <p className="text-sm font-medium text-slate-300">
                {searchQuery ? "No conversations match your search" : "No conversations yet"}
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                {searchQuery
                  ? "Try searching for a different name or vehicle model."
                  : "When you contact a seller or a buyer messages your listing, your chats will appear here."}
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
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative group ${
                    isSelected
                      ? "bg-blue-600/10 border-l-4 border-blue-500"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {other?.avatar_url ? (
                      <Image
                        src={other.avatar_url}
                        alt={other.full_name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-base shadow-sm">
                        {initial}
                      </div>
                    )}
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-[#0d121d] rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        {other?.full_name || "Debford User"}
                      </span>
                      {conv.last_message_at && (
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {new Date(conv.last_message_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Listing reference tag if attached */}
                    {conv.listing && (
                      <div className="flex items-center gap-1 text-[11px] text-blue-400/90 font-medium mb-1 truncate">
                        <Car className="w-3 h-3 shrink-0" />
                        <span className="truncate">{conv.listing.title}</span>
                      </div>
                    )}

                    {/* Last message */}
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

      {/* ============================================================ */}
      {/* 2. MAIN CHAT AREA */}
      {/* ============================================================ */}
      {selectedId && selectedConv ? (
        <main className="flex-1 flex flex-col min-w-0 bg-[#0a0d14] relative">
          {/* Top Bar Header */}
          <header className="h-16 px-4 md:px-6 bg-[#0d121d]/80 backdrop-blur border-b border-white/5 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back button on mobile */}
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* User Details */}
              <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                {otherUser?.full_name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white truncate">
                    {otherUser?.full_name || "Debford User"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                {otherUser?.email && (
                  <p className="text-[11px] text-slate-500 truncate">{otherUser.email}</p>
                )}
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {currentListing && (
                <button
                  type="button"
                  onClick={() => setIsOfferOpen(true)}
                  className="px-3.5 py-1.5 gradient-brand hover:opacity-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Make Offer</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleGoBack}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer group"
                title="Exit messages and return to previous page"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Done Messaging</span>
              </button>
            </div>
          </header>

          {/* Attached Listing Info Card Banner */}
          {currentListing && (
            <div className="px-4 md:px-6 py-2.5 bg-[#101726]/70 border-b border-white/5 flex items-center justify-between gap-4 text-xs">
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
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">
                    Inquiring about
                  </span>
                  <span className="text-white font-semibold truncate block">
                    {currentListing.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Listing Price</span>
                  <span className="text-sm font-extrabold text-blue-400">
                    ${currentListing.price?.toLocaleString()}
                  </span>
                </div>
                <Link
                  href={`/vehicles/${currentListing.id}`}
                  target="_blank"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="View vehicle listing page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Message Thread Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {loadingMessages ? (
              <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-500">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-xs">Loading message history...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Start the conversation</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Send a message to discuss vehicle specs, pricing, history, or to schedule a viewing.
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
                      <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1">
                        {otherUser?.full_name?.charAt(0).toUpperCase() ?? "U"}
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] sm:max-w-[70%] rounded-2xl p-3.5 text-sm transition-all shadow-sm ${
                        isOffer
                          ? "bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 text-white rounded-2xl"
                          : isMine
                          ? "gradient-brand text-white rounded-br-sm"
                          : "bg-[#131b2e] border border-white/10 text-slate-100 rounded-bl-sm"
                      }`}
                    >
                      {/* Special Offer Card Bubble */}
                      {isOffer ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 pb-2">
                            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                              <Tag className="w-3.5 h-3.5" />
                              <span>Official Vehicle Offer</span>
                            </div>
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-400/30">
                              {msg.metadata?.status ?? "Submitted"}
                            </span>
                          </div>

                          <div className="py-1">
                            <div className="text-2xl font-black text-white">
                              ${Number(offerAmountVal || 0).toLocaleString()}
                            </div>
                            {msg.metadata?.note && (
                              <p className="text-xs text-amber-200/80 italic mt-1">
                                &ldquo;{msg.metadata.note}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}

                      {/* Message Footer: Timestamp and Read Check */}
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

          {/* Quick Replies Chips */}
          <div className="px-4 md:px-6 py-2 border-t border-white/5 bg-[#0d121d]/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Suggestions:
            </span>
            {QUICK_REPLIES.map((replyText, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(replyText)}
                className="shrink-0 text-xs text-slate-300 hover:text-white bg-[#131b2e] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 rounded-full px-3 py-1 transition-all"
              >
                {replyText}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-4 md:p-5 bg-[#0d121d] border-t border-white/5">
            <div className="flex items-center gap-3 bg-[#131b2e] border border-white/10 rounded-2xl p-2 focus-within:border-blue-500/50 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center text-white shrink-0 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 cursor-pointer"
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
        /* Empty State (No conversation selected) */
        <main className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center bg-[#0a0d14]">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-4 shadow-xl">
            💬
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Your Live Conversations</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            Select a conversation on the left to review offers, coordinate test drives, or message
            sellers and verified buyers in real time.
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Previous Page</span>
          </button>
        </main>
      )}

      {/* ============================================================ */}
      {/* 3. MAKE AN OFFER MODAL */}
      {/* ============================================================ */}
      {isOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d121d] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Tag className="w-5 h-5 text-blue-400" />
                <span>Submit Vehicle Offer</span>
              </div>
              <button
                onClick={() => setIsOfferOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentListing && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Vehicle</span>
                  <span className="text-sm font-semibold text-white">{currentListing.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Asking Price</span>
                  <span className="text-sm font-bold text-blue-400">
                    ${currentListing.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Offer Amount (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={currentListing ? `${currentListing.price}` : "25000"}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Message / Conditions (Optional)
                </label>
                <textarea
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  placeholder="e.g. Ready to pay cash and complete inspection this Saturday."
                  rows={2}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOfferOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOffer}
                disabled={!offerAmount || submittingOffer}
                className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                {submittingOffer ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Offer</span>
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
