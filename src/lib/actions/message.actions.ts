"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  is_mine: boolean;
}

export interface ConversationItem {
  id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  other_user: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  listing?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    imageUrl?: string;
  } | null;
}

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

/**
 * Get all conversations for the authenticated user.
 */
export async function getMyConversations(): Promise<{ conversations: ConversationItem[]; currentUserId: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { conversations: [], currentUserId: null };

  const db = await getDb();

  // Find all conversation IDs user participates in
  const { data: participantRows } = await db
    .from("conversation_participants")
    .select("conversation_id, unread_count, joined_at")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (!participantRows || participantRows.length === 0) {
    return { conversations: [], currentUserId: user.id };
  }

  const conversationIds = participantRows.map((r) => r.conversation_id);

  // Fetch conversations metadata
  const { data: convData } = await db
    .from("conversations")
    .select("id, listing_id, listing_type, last_message_at")
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false });

  // Fetch all other participants in these conversations
  const { data: allParticipants } = await db
    .from("conversation_participants")
    .select(`
      conversation_id,
      user_id,
      profiles:user_id (id, full_name, avatar_url, email)
    `)
    .in("conversation_id", conversationIds)
    .neq("user_id", user.id);

  // Fetch listing details if any
  const listingIds = (convData ?? []).map((c) => c.listing_id).filter(Boolean);
  let listingsMap: Record<string, any> = {};

  if (listingIds.length > 0) {
    const { data: listings } = await db
      .from("sale_listings")
      .select(`
        id, title, price, currency,
        vehicle:vehicles (
          id,
          images:vehicle_images (url, is_primary)
        )
      `)
      .in("id", listingIds);

    if (listings) {
      for (const l of listings as any[]) {
        const primaryImg = l.vehicle?.images?.find((i: any) => i.is_primary)?.url ?? l.vehicle?.images?.[0]?.url;
        listingsMap[l.id] = {
          id: l.id,
          title: l.title,
          price: l.price,
          currency: l.currency ?? "USD",
          imageUrl: primaryImg,
        };
      }
    }
  }

  // Fetch last message for each conversation
  const { data: latestMessages } = await db
    .from("messages")
    .select("conversation_id, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  const lastMsgMap: Record<string, { content: string; created_at: string }> = {};
  if (latestMessages) {
    for (const m of latestMessages) {
      if (!lastMsgMap[m.conversation_id]) {
        lastMsgMap[m.conversation_id] = { content: m.content, created_at: m.created_at };
      }
    }
  }

  const otherUserMap: Record<string, any> = {};
  if (allParticipants) {
    for (const p of allParticipants as any[]) {
      if (p.profiles) {
        otherUserMap[p.conversation_id] = p.profiles;
      }
    }
  }

  const unreadMap = Object.fromEntries(participantRows.map((r) => [r.conversation_id, r.unread_count ?? 0]));

  const result: ConversationItem[] = (convData ?? []).map((c) => {
    const otherUser = otherUserMap[c.id] ?? {
      id: "unknown",
      full_name: "Debford User",
      email: "",
    };
    const lastMsg = lastMsgMap[c.id];

    return {
      id: c.id,
      last_message: lastMsg?.content ?? "Conversation started",
      last_message_at: lastMsg?.created_at ?? c.last_message_at,
      unread_count: unreadMap[c.id] ?? 0,
      other_user: {
        id: otherUser.id,
        full_name: otherUser.full_name ?? otherUser.email?.split("@")[0] ?? "User",
        avatar_url: otherUser.avatar_url,
        email: otherUser.email,
      },
      listing: c.listing_id ? listingsMap[c.listing_id] ?? null : null,
    };
  });

  return { conversations: result, currentUserId: user.id };
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getConversationMessages(conversationId: string): Promise<MessageItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const db = await getDb();

  const { data } = await db
    .from("messages")
    .select("id, conversation_id, sender_id, content, type, metadata, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((m) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    sender_id: m.sender_id,
    content: m.content ?? "",
    type: m.type ?? "text",
    metadata: m.metadata ?? null,
    created_at: m.created_at,
    is_mine: m.sender_id === user.id,
  }));
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  type: "text" | "image" | "document" | "offer" | "system" = "text",
  metadata: Record<string, any> | null = null
) {
  if (!content.trim()) return { error: "Message cannot be empty." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to send messages." };

  const db = await getDb();

  // 1. Insert message
  const { data: newMsg, error: msgError } = await db
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      type,
      metadata: metadata || null,
    })
    .select("id, conversation_id, sender_id, content, type, metadata, created_at")
    .single();

  if (msgError) return { error: msgError.message };

  // 2. Update conversation last_message_at
  await db
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  // 3. Find other participant to increment unread count & send notification
  const { data: others } = await db
    .from("conversation_participants")
    .select("user_id, unread_count")
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id);

  if (others && others.length > 0) {
    for (const other of others) {
      await db
        .from("conversation_participants")
        .update({ unread_count: (other.unread_count ?? 0) + 1 })
        .eq("conversation_id", conversationId)
        .eq("user_id", other.user_id);

      // Create notification
      const senderName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "A user";
      await db.from("notifications").insert({
        user_id: other.user_id,
        type: "message",
        title: `Message from ${senderName}`,
        body: content.slice(0, 100),
      });
    }
  }

  revalidatePath("/messages");
  return {
    success: true,
    message: {
      ...newMsg,
      is_mine: true,
    },
  };
}

/**
 * Mark all messages in a conversation as read for current user.
 */
export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const db = await getDb();

  await db
    .from("conversation_participants")
    .update({ unread_count: 0, last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);
}

/**
 * Get or create a conversation between current user and a seller for a vehicle listing.
 */
export async function getOrCreateConversation(sellerId: string, listingId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to message a seller." };

  if (user.id === sellerId) {
    return { error: "You cannot message yourself about your own vehicle." };
  }

  const db = await getDb();

  // Check if a conversation between these two users already exists for this listing
  const { data: myConvs } = await db
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (myConvs && myConvs.length > 0) {
    const myIds = myConvs.map((c) => c.conversation_id);

    // Find if seller is also in any of these conversations
    const { data: shared } = await db
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", sellerId)
      .in("conversation_id", myIds);

    if (shared && shared.length > 0) {
      if (listingId) {
        // Find the one matching this listing, or fallback to first shared
        const { data: matchingListingConv } = await db
          .from("conversations")
          .select("id")
          .in("id", shared.map((s) => s.conversation_id))
          .eq("listing_id", listingId)
          .maybeSingle();

        if (matchingListingConv) {
          return { conversationId: matchingListingConv.id };
        }
      } else {
        return { conversationId: shared[0].conversation_id };
      }
    }
  }

  // Create new conversation
  const { data: newConv, error: convError } = await db
    .from("conversations")
    .insert({
      listing_id: listingId ?? null,
      listing_type: listingId ? "sale" : null,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (convError || !newConv) {
    return { error: convError?.message ?? "Failed to create conversation." };
  }

  // Add both participants
  await db.from("conversation_participants").insert([
    { conversation_id: newConv.id, user_id: user.id },
    { conversation_id: newConv.id, user_id: sellerId },
  ]);

  revalidatePath("/messages");
  return { conversationId: newConv.id };
}
