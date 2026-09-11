"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

export interface PartOrderItem {
  partId: string;
  title: string;
  price: number;
  quantity: number;
  seller: string;
}

export interface CheckoutPartOrderPayload {
  items: PartOrderItem[];
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: "card" | "paypal" | "apple_pay";
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export interface PlacePartsOrderResult {
  success?: boolean;
  error?: string;
  orderId?: string;
  total?: number;
}

/**
 * Place a multi-item parts purchase order
 */
export async function placePartsOrder(payload: CheckoutPartOrderPayload): Promise<PlacePartsOrderResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = await getDb();

  // Create notifications and simulated payment / order entry
  const orderId = `PO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  if (user) {
    await db.from("notifications").insert({
      user_id: user.id,
      type: "payment",
      title: "📦 Parts Order Confirmed!",
      body: `Order #${orderId} for ${payload.items.length} item(s) ($${payload.total.toLocaleString()}) has been placed. Shipping to ${payload.city}, ${payload.country}.`,
    });
  }

  revalidatePath("/cart");
  revalidatePath("/dashboard");
  revalidatePath("/parts");

  return { success: true, orderId, total: payload.total };
}
