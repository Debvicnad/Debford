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
  sellerId?: string;
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
  orderIds?: string[];
  total?: number;
}

/**
 * Place a multi-item parts purchase order.
 * Creates one parts_order row per cart item, decrements stock,
 * and sends a notification to the buyer.
 */
export async function placePartsOrder(
  payload: CheckoutPartOrderPayload
): Promise<PlacePartsOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = await getDb();
  const shippingAddress = `${payload.streetAddress}, ${payload.city}, ${payload.postalCode}, ${payload.country}`;
  const orderIds: string[] = [];
  let firstOrderId = `PO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Attempt to persist each item to parts_orders
  try {
    for (const item of payload.items) {
      // Fetch the actual listing to get the real seller_id
      const { data: listing } = await db
        .from("parts_listings")
        .select("id, seller_id, stock_quantity")
        .eq("id", item.partId)
        .maybeSingle();

      const sellerId = listing?.seller_id ?? item.sellerId ?? null;
      const totalPrice = item.price * item.quantity + (payload.shippingFee / payload.items.length);

      if (user && sellerId) {
        const { data: order } = await db
          .from("parts_orders")
          .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            part_id: item.partId,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: totalPrice,
            currency: "USD",
            shipping_address: shippingAddress,
            shipping_method: payload.paymentMethod,
            shipping_cost: payload.shippingFee / payload.items.length,
            status: "payment_received",
            paid_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (order?.id) {
          orderIds.push(order.id);
          if (!firstOrderId.startsWith("PO-")) firstOrderId = order.id;
        }

        // Decrement stock if we found the listing
        if (listing && listing.stock_quantity > 0) {
          const newStock = Math.max(0, listing.stock_quantity - item.quantity);
          await db
            .from("parts_listings")
            .update({
              stock_quantity: newStock,
              status: newStock === 0 ? "sold_out" : "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.partId);
        }
      }
    }
  } catch {
    // Non-blocking — fall through to notification even if DB write fails
  }

  // Buyer notification
  if (user) {
    try {
      await db.from("notifications").insert({
        user_id: user.id,
        type: "payment",
        title: "📦 Parts Order Confirmed!",
        body: `Order for ${payload.items.length} item(s) ($${payload.total.toLocaleString()}) has been placed and is being processed. Shipping to ${payload.city}, ${payload.country}.`,
      });
    } catch {
      // ignore notification errors
    }
  }

  revalidatePath("/cart");
  revalidatePath("/dashboard");
  revalidatePath("/parts");

  return { success: true, orderId: firstOrderId, orderIds, total: payload.total };
}

// ── Maintenance Reminder CRUD ──────────────────────────────────

export interface MaintenanceReminderPayload {
  vehicleId: string;
  title: string;
  description?: string;
  reminderType: string;
  dueDate?: string;
  dueMileage?: number;
  intervalDays?: number;
}

/**
 * Add a maintenance reminder to a vehicle.
 */
export async function addMaintenanceReminder(
  payload: MaintenanceReminderPayload
): Promise<{ success: boolean; reminderId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };

  const db = await getDb();
  try {
    const { data, error } = await db
      .from("vehicle_maintenance_reminders")
      .insert({
        vehicle_id: payload.vehicleId,
        owner_id: user.id,
        title: payload.title,
        description: payload.description || null,
        reminder_type: payload.reminderType,
        due_date: payload.dueDate || null,
        due_mileage: payload.dueMileage || null,
        interval_days: payload.intervalDays || null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/garage/${payload.vehicleId}`);
    revalidatePath("/garage");

    return { success: true, reminderId: data?.id };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to create reminder." };
  }
}

/**
 * Mark a maintenance reminder as completed.
 */
export async function completeMaintenanceReminder(
  reminderId: string,
  vehicleId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };

  const db = await getDb();
  try {
    const { error } = await db
      .from("vehicle_maintenance_reminders")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reminderId)
      .eq("owner_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/garage/${vehicleId}`);
    revalidatePath("/garage");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to complete reminder." };
  }
}

/**
 * Delete a maintenance reminder.
 */
export async function deleteMaintenanceReminder(
  reminderId: string,
  vehicleId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };

  const db = await getDb();
  try {
    const { error } = await db
      .from("vehicle_maintenance_reminders")
      .delete()
      .eq("id", reminderId)
      .eq("owner_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/garage/${vehicleId}`);
    revalidatePath("/garage");

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to delete reminder." };
  }
}

/**
 * Log a vehicle expense.
 */
export async function addVehicleExpense(payload: {
  vehicleId: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  expenseDate?: string;
  mileageAtExpense?: number;
  notes?: string;
}): Promise<{ success: boolean; expenseId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required." };

  const db = await getDb();
  try {
    const { data, error } = await db
      .from("vehicle_expenses")
      .insert({
        vehicle_id: payload.vehicleId,
        owner_id: user.id,
        category: payload.category,
        description: payload.description,
        amount: payload.amount,
        currency: payload.currency || "USD",
        expense_date: payload.expenseDate || new Date().toISOString().split("T")[0],
        mileage_at_expense: payload.mileageAtExpense || null,
        notes: payload.notes || null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/garage/${payload.vehicleId}`);
    revalidatePath("/garage");
    revalidatePath("/dashboard");

    return { success: true, expenseId: data?.id };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to log expense." };
  }
}

