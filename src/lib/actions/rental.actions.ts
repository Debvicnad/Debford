"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

export interface CreateRentalBookingPayload {
  rentalId: string;
  startDate: string;
  endDate: string;
  delivery: boolean;
  deliveryAddress?: string;
  extras?: string[];
  specialRequests?: string;
}

/**
 * Create a new rental reservation / booking
 */
export async function createRentalBooking(payload: CreateRentalBookingPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to book a vehicle rental." };

  if (!payload.startDate || !payload.endDate) {
    return { error: "Please choose pickup and return dates." };
  }

  const start = new Date(payload.startDate);
  const end = new Date(payload.endDate);

  if (end <= start) {
    return { error: "Return date must be after pickup date." };
  }

  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const db = await getDb();

  // 1. Fetch listing details
  const { data: listing, error: listingError } = await db
    .from("rental_listings")
    .select("id, title, price_per_day, price_per_week, price_per_month, security_deposit, currency, owner_id, delivery_available, status, total_bookings")
    .eq("id", payload.rentalId)
    .single();

  if (listingError || !listing) {
    return { error: "Rental listing not found." };
  }

  if (listing.owner_id === user.id) {
    return { error: "You cannot rent your own vehicle." };
  }

  // 2. Check for date conflicts
  const { data: existingBookings } = await db
    .from("rental_bookings")
    .select("id, start_date, end_date")
    .eq("listing_id", payload.rentalId)
    .in("status", ["confirmed", "active", "pending"])
    .or(`and(start_date.lte.${payload.endDate},end_date.gte.${payload.startDate})`);

  if (existingBookings && existingBookings.length > 0) {
    return { error: "The vehicle is already booked for all or part of these dates. Please choose different dates." };
  }

  // 3. Calculate rates
  const effectiveDailyRate = days >= 28 && listing.price_per_month
    ? Number(listing.price_per_month) / 30
    : days >= 7 && listing.price_per_week
    ? Number(listing.price_per_week) / 7
    : Number(listing.price_per_day);

  const rentalSubtotal = days * effectiveDailyRate;
  const extrasCost = (payload.extras?.length ?? 0) * 15 * days;
  const deliveryCost = payload.delivery ? 45 : 0;
  const deposit = Number(listing.security_deposit ?? 0);
  const totalAmount = rentalSubtotal + extrasCost + deliveryCost;

  // 4. Insert booking
  const { data: booking, error: bookingError } = await db
    .from("rental_bookings")
    .insert({
      listing_id: payload.rentalId,
      renter_id: user.id,
      start_date: payload.startDate,
      end_date: payload.endDate,
      daily_rate: effectiveDailyRate,
      total_days: days,
      subtotal: rentalSubtotal + extrasCost + deliveryCost,
      security_deposit: deposit,
      total_amount: totalAmount,
      currency: listing.currency ?? "USD",
      status: "confirmed",
      special_requests: [
        payload.delivery ? `Delivery Address: ${payload.deliveryAddress}` : null,
        payload.extras?.length ? `Extras: ${payload.extras.join(", ")}` : null,
        payload.specialRequests ? `Notes: ${payload.specialRequests}` : null,
      ].filter(Boolean).join(" | "),
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return { error: bookingError?.message ?? "Failed to create booking." };
  }

  // 5. Increment listing total_bookings counter
  await db
    .from("rental_listings")
    .update({ total_bookings: (listing.total_bookings ?? 0) + 1 })
    .eq("id", payload.rentalId);

  // 6. Send notifications
  // To Renter
  await db.from("notifications").insert({
    user_id: user.id,
    type: "rental",
    title: "Rental Reservation Confirmed! 🚗",
    body: `Your rental for "${listing.title}" from ${payload.startDate} to ${payload.endDate} (${days} days) is confirmed.`,
  });

  // To Host
  if (listing.owner_id) {
    await db.from("notifications").insert({
      user_id: listing.owner_id,
      type: "rental",
      title: "New Rental Booking! 📅",
      body: `A renter booked "${listing.title}" for ${days} days (${payload.startDate} - ${payload.endDate}). Total: $${totalAmount.toLocaleString()}.`,
    });
  }

  revalidatePath(`/rentals/${payload.rentalId}`);
  revalidatePath("/rentals");
  revalidatePath("/dashboard");

  return { success: true, bookingId: booking.id, totalAmount };
}

/**
 * Cancel a rental booking
 */
export async function cancelRentalBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const db = await getDb();

  const { error } = await db
    .from("rental_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("renter_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
