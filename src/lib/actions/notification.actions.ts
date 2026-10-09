"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  // Computed / UI properties
  link?: string;
  cta?: string;
  icon?: string;
}

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

// ── Demo Curated Notifications ─────────────────────────────────────
const DEMO_NOTIFICATIONS: DbNotification[] = [
  {
    id: "demo-n1",
    user_id: "demo-user",
    type: "bid",
    title: "High Bid Outbid Alert ⚠️",
    body: "A competing bidder placed a higher bid of $215,000 on the 2023 Porsche 911 GT3 RS Weissach Package.",
    data: { link: "/auctions/demo", cta: "Place Counter Bid", icon: "🔨" },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
    link: "/auctions/demo",
    cta: "Place Counter Bid",
    icon: "🔨",
  },
  {
    id: "demo-n2",
    user_id: "demo-user",
    type: "escrow",
    title: "Escrow Deposit Secured in Vault 🛡️",
    body: "Your holding deposit of $25,000 for 2023 Porsche 911 GT3 RS is locked under Debford Escrow Custody.",
    data: { link: "/checkout", cta: "Inspect Escrow Vault", icon: "🛡️" },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 24 * 60000).toISOString(),
    link: "/checkout",
    cta: "Inspect Escrow Vault",
    icon: "🛡️",
  },
  {
    id: "demo-n3",
    user_id: "demo-user",
    type: "message",
    title: "New Private Message from James Kowalski 💬",
    body: "Is the vehicle available for private ramp inspection and paint meter reading this Saturday morning?",
    data: { link: "/messages", cta: "Open Chat Console", icon: "💬" },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 48 * 60000).toISOString(),
    link: "/messages",
    cta: "Open Chat Console",
    icon: "💬",
  },
  {
    id: "demo-n4",
    user_id: "demo-user",
    type: "listing",
    title: "Marketplace Listing Published ✅",
    body: "Your listing '2023 BMW M4 Competition Coupe' passed editorial validation and is now live in the showroom.",
    data: { link: "/garage", cta: "View in Garage", icon: "✅" },
    is_read: true,
    read_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    link: "/garage",
    cta: "View in Garage",
    icon: "✅",
  },
  {
    id: "demo-n5",
    user_id: "demo-user",
    type: "offer",
    title: "Direct Purchase Offer Received 💰",
    body: "Sarah Mitchell submitted a verified offer of $76,500 with escrow commitment for your BMW M4.",
    data: { link: "/messages", cta: "Review Offer Terms", icon: "💰" },
    is_read: true,
    read_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    link: "/messages",
    cta: "Review Offer Terms",
    icon: "💰",
  },
  {
    id: "demo-n6",
    user_id: "demo-user",
    type: "system",
    title: "Watchlist Price Drop Alert 📉",
    body: "A vehicle in your saved watchlist (2022 BMW 5 Series 530i) has dropped in price by $3,000 to $58,000.",
    data: { link: "/saved", cta: "View in Saved Vault", icon: "📉" },
    is_read: true,
    read_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    link: "/saved",
    cta: "View in Saved Vault",
    icon: "📉",
  },
  {
    id: "demo-n7",
    user_id: "demo-user",
    type: "billing",
    title: "Collector VIP Privileges Active 💳",
    body: "Your Debford Collector VIP tier has renewed. Zero-commission marketplace sales and concierge transport unlocked.",
    data: { link: "/membership", cta: "Manage Privileges", icon: "💳" },
    is_read: true,
    read_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    link: "/membership",
    cta: "Manage Privileges",
    icon: "💳",
  },
  {
    id: "demo-n8",
    user_id: "demo-user",
    type: "system",
    title: "Welcome to Debford Private Fleet 🎉",
    body: "Your collector credentials are verified. Complete 150-point vehicle registration in your Digital Glovebox.",
    data: { link: "/garage", cta: "Open Glovebox", icon: "🎉" },
    is_read: true,
    read_at: new Date(Date.now() - 100 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 168 * 3600000).toISOString(),
    link: "/garage",
    cta: "Open Glovebox",
    icon: "🎉",
  },
];

function formatNotification(n: any): DbNotification {
  const data = n.data || {};
  let icon = data.icon || "🔔";
  if (!data.icon) {
    if (n.type === "bid" || n.type === "auction") icon = "🔨";
    else if (n.type === "escrow") icon = "🛡️";
    else if (n.type === "message") icon = "💬";
    else if (n.type === "listing") icon = "✅";
    else if (n.type === "offer") icon = "💰";
    else if (n.type === "billing") icon = "💳";
    else icon = "🔔";
  }

  return {
    id: n.id,
    user_id: n.user_id,
    type: n.type,
    title: n.title,
    body: n.body,
    data: n.data,
    is_read: Boolean(n.is_read),
    read_at: n.read_at,
    created_at: n.created_at,
    link: data.link || "/dashboard",
    cta: data.cta || "View Details",
    icon,
  };
}

/**
 * Fetch notifications for the current authenticated user.
 */
export async function getNotifications(filter?: string): Promise<{
  notifications: DbNotification[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Demo fallback for guest preview
      let list = [...DEMO_NOTIFICATIONS];
      if (filter && filter !== "all") {
        if (filter === "unread") {
          list = list.filter((n) => !n.is_read);
        } else {
          list = list.filter((n) => n.type === filter);
        }
      }
      const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length;
      return { notifications: list, unreadCount };
    }

    const db = await getDb();
    let query = db
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(60);

    if (filter && filter !== "all") {
      if (filter === "unread") {
        query = query.eq("is_read", false);
      } else {
        query = query.eq("type", filter);
      }
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let list = [...DEMO_NOTIFICATIONS];
      if (filter && filter !== "all") {
        if (filter === "unread") {
          list = list.filter((n) => !n.is_read);
        } else {
          list = list.filter((n) => n.type === filter);
        }
      }
      const unreadCount = DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length;
      return { notifications: list, unreadCount };
    }

    const formatted = data.map(formatNotification);
    const unreadCount = formatted.filter((n) => !n.is_read).length;

    return { notifications: formatted, unreadCount };
  } catch (err: any) {
    return {
      notifications: DEMO_NOTIFICATIONS,
      unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length,
      error: err?.message,
    };
  }
}

/**
 * Fetch unread notification count only.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length;

    const db = await getDb();
    const { count, error } = await db
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error || count == null) return DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length;
    return count;
  } catch {
    return DEMO_NOTIFICATIONS.filter((n) => !n.is_read).length;
  }
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // In demo mode, treat as successful
      return { success: true };
    }

    const db = await getDb();
    const { error } = await db
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Mark all notifications as read for current user.
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true };
    }

    const db = await getDb();
    const { error } = await db
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Delete / dismiss a notification.
 */
export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true };
    }

    const db = await getDb();
    const { error } = await db
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Clear all notifications for current user.
 */
export async function clearAllNotifications(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true };
    }

    const db = await getDb();
    const { error } = await db
      .from("notifications")
      .delete()
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Create a new notification helper.
 */
export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  cta?: string;
  icon?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const db = await getDb();
    const { data, error } = await db
      .from("notifications")
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: {
          link: input.link,
          cta: input.cta,
          icon: input.icon,
        },
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
