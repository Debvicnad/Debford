"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type {
  ServiceRequestItem,
  ServiceQuoteItem,
  ServiceBookingItem,
  ServiceBookingStatus,
} from "@/types/service.types";
import {
  ALL_PROVIDERS,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_SERVICE_BOOKINGS,
} from "@/lib/data/services.data";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

// In-memory fallback state for requests, quotes, and bookings
// Persists in Node.js server memory during dev / preview
let inMemoryRequests: ServiceRequestItem[] = [...INITIAL_SERVICE_REQUESTS];
let inMemoryBookings: ServiceBookingItem[] = [...INITIAL_SERVICE_BOOKINGS];

export interface ServiceRequestPayload {
  serviceType: string;
  vehicleId?: string;
  vehicleDescription: string;
  title?: string;
  description: string;
  location: string;
  urgency: "flexible" | "this_week" | "urgent";
  preferredDate?: string;
  preferredTime?: string;
  budget?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface ServiceRecordPayload {
  vehicleId: string;
  title: string;
  serviceDate: string;
  serviceProvider: string;
  cost?: number;
  mileage?: number;
  notes?: string;
}

export interface VehicleDocumentPayload {
  vehicleId: string;
  documentType: "registration" | "insurance" | "service_record" | "inspection" | "title";
  title: string;
  url: string;
  expiryDate?: string;
}

export interface DirectBookingPayload {
  providerId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime?: string;
  vehicleDescription: string;
  vehicleId?: string;
  serviceAddress?: string;
  isMobileService?: boolean;
  totalAmount: number;
  notes?: string;
}

export interface SubmitQuotePayload {
  requestId: string;
  providerId: string;
  price: number;
  partsCost?: number;
  laborCost?: number;
  currency?: string;
  description: string;
  estimatedDays: number;
}

/**
 * Submit a service booking or quote request.
 */
export async function createServiceRequest(
  payload: ServiceRequestPayload
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const customerId = user?.id || "usr_guest_" + Math.random().toString(36).slice(2, 7);
  const customerName =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Guest Car Owner");

  const requestId = "req-" + Math.random().toString(36).slice(2, 9);
  const parsedBudget = payload.budget ? parseFloat(payload.budget) : undefined;
  const budgetMax = payload.budgetMax ?? parsedBudget;
  const budgetMin = payload.budgetMin;

  const newRequest: ServiceRequestItem = {
    id: requestId,
    customerId,
    customerName,
    vehicleId: payload.vehicleId,
    vehicle: payload.vehicleDescription,
    serviceType: payload.serviceType,
    title:
      payload.title ||
      `${payload.serviceType.toUpperCase()} Request for ${payload.vehicleDescription.slice(0, 30)}`,
    description: payload.description,
    vehicleDescription: payload.vehicleDescription,
    location: payload.location,
    urgency: payload.urgency,
    preferredDate: payload.preferredDate || undefined,
    preferredTime: payload.preferredTime || undefined,
    budgetMin,
    budgetMax,
    currency: "USD",
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quotesCount: 0,
    quotes: [],
  };

  // Try saving to Supabase if available
  try {
    const db = await getDb();
    const { data, error } = await db
      .from("service_requests")
      .insert({
        customer_id: customerId,
        service_type: payload.serviceType,
        vehicle_id: payload.vehicleId || null,
        title: newRequest.title,
        vehicle_description: payload.vehicleDescription,
        description: payload.description,
        location: payload.location,
        urgency: payload.urgency,
        preferred_date: payload.preferredDate || null,
        preferred_time: payload.preferredTime || null,
        budget_min: budgetMin || null,
        budget_max: budgetMax || null,
        currency: "USD",
        status: "open",
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      newRequest.id = data.id;
    }
  } catch {
    // Graceful fallback to memory store
  }

  // Prepend to in-memory store
  inMemoryRequests = [newRequest, ...inMemoryRequests];

  // Try creating notification
  try {
    if (user) {
      const db = await getDb();
      await db.from("notifications").insert({
        user_id: user.id,
        type: "service",
        title: "Service Request Submitted 🔧",
        body: `Your request for ${payload.serviceType} has been broadcast to verified specialists.`,
      });
    }
  } catch {
    // Ignore notification errors in dev
  }

  revalidatePath("/services");
  revalidatePath("/services/requests");
  revalidatePath("/dashboard");
  revalidatePath("/garage");

  return { success: true, requestId: newRequest.id };
}

/**
 * Fetch service requests with optional filter.
 */
export async function getServiceRequests(filter?: "all" | "mine" | "open"): Promise<ServiceRequestItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try Supabase first
  try {
    const db = await getDb();
    let query = db
      .from("service_requests")
      .select(`
        *,
        service_quotes (*)
      `)
      .order("created_at", { ascending: false });

    if (filter === "mine" && user) {
      query = query.eq("customer_id", user.id);
    } else if (filter === "open") {
      query = query.eq("status", "open");
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((r: any) => ({
        id: r.id,
        customerId: r.customer_id,
        customerName: r.customer_name || "Customer",
        vehicleId: r.vehicle_id,
        serviceType: r.service_type,
        title: r.title || `Service Request (${r.service_type})`,
        description: r.description,
        vehicleDescription: r.vehicle_description,
        location: r.location,
        urgency: r.urgency || "flexible",
        preferredDate: r.preferred_date,
        preferredTime: r.preferred_time,
        budgetMin: r.budget_min ? parseFloat(r.budget_min) : undefined,
        budgetMax: r.budget_max ? parseFloat(r.budget_max) : undefined,
        currency: r.currency || "USD",
        status: r.status || "open",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        quotesCount: r.service_quotes?.length ?? 0,
        quotes: (r.service_quotes || []).map((q: any) => {
          const prov = ALL_PROVIDERS.find((p) => p.id === q.provider_id) || ALL_PROVIDERS[0];
          return {
            id: q.id,
            requestId: q.request_id,
            providerId: q.provider_id,
            customerId: q.customer_id,
            price: parseFloat(q.price),
            partsCost: q.parts_cost ? parseFloat(q.parts_cost) : 0,
            laborCost: q.labor_cost ? parseFloat(q.labor_cost) : 0,
            currency: q.currency || "USD",
            description: q.description || "",
            estimatedDays: q.estimated_days || 1,
            validUntil: q.valid_until,
            status: q.status || "pending",
            createdAt: q.created_at,
            provider: {
              id: prov.id,
              name: prov.name,
              type: prov.type,
              rating: prov.rating,
              reviews: prov.reviews,
              location: prov.location,
              badges: prov.badges,
              initials: prov.initials,
            },
          };
        }),
      }));
    }
  } catch {
    // Fallback to memory
  }

  // Fallback filtering in memory
  if (filter === "mine" && user) {
    return inMemoryRequests.filter(
      (r) => r.customerId === user.id || r.customerId === "usr_mock_customer"
    );
  }
  if (filter === "open") {
    return inMemoryRequests.filter((r) => r.status === "open" || r.status === "quoted");
  }

  return inMemoryRequests;
}

/**
 * Fetch a single service request and all its associated quotes.
 */
export async function getServiceRequestById(id: string): Promise<ServiceRequestItem | null> {
  const req = inMemoryRequests.find((r) => r.id === id);
  if (req) return req;

  try {
    const db = await getDb();
    const { data: r, error } = await db
      .from("service_requests")
      .select(`
        *,
        service_quotes (*)
      `)
      .eq("id", id)
      .single();

    if (!error && r) {
      return {
        id: r.id,
        customerId: r.customer_id,
        customerName: r.customer_name || "Customer",
        vehicleId: r.vehicle_id,
        serviceType: r.service_type,
        title: r.title || `Service Request (${r.service_type})`,
        description: r.description,
        vehicleDescription: r.vehicle_description,
        location: r.location,
        urgency: r.urgency || "flexible",
        preferredDate: r.preferred_date,
        preferredTime: r.preferred_time,
        budgetMin: r.budget_min ? parseFloat(r.budget_min) : undefined,
        budgetMax: r.budget_max ? parseFloat(r.budget_max) : undefined,
        currency: r.currency || "USD",
        status: r.status || "open",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        quotesCount: r.service_quotes?.length ?? 0,
        quotes: (r.service_quotes || []).map((q: any) => {
          const prov = ALL_PROVIDERS.find((p) => p.id === q.provider_id) || ALL_PROVIDERS[0];
          return {
            id: q.id,
            requestId: q.request_id,
            providerId: q.provider_id,
            customerId: q.customer_id,
            price: parseFloat(q.price),
            partsCost: q.parts_cost ? parseFloat(q.parts_cost) : 0,
            laborCost: q.labor_cost ? parseFloat(q.labor_cost) : 0,
            currency: q.currency || "USD",
            description: q.description || "",
            estimatedDays: q.estimated_days || 1,
            validUntil: q.valid_until,
            status: q.status || "pending",
            createdAt: q.created_at,
            provider: {
              id: prov.id,
              name: prov.name,
              type: prov.type,
              rating: prov.rating,
              reviews: prov.reviews,
              location: prov.location,
              badges: prov.badges,
              initials: prov.initials,
            },
          };
        }),
      };
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Submit a quote for a service request (Provider flow).
 */
export async function submitServiceQuote(
  payload: SubmitQuotePayload
): Promise<{ success: boolean; quoteId?: string; error?: string }> {
  const provider = ALL_PROVIDERS.find((p) => p.id === payload.providerId) || ALL_PROVIDERS[0];
  const quoteId = "q-" + Math.random().toString(36).slice(2, 9);

  const newQuote: ServiceQuoteItem = {
    id: quoteId,
    requestId: payload.requestId,
    providerId: provider.id,
    customerId: "usr_mock_customer",
    price: payload.price,
    partsCost: payload.partsCost ?? 0,
    laborCost: payload.laborCost ?? payload.price,
    currency: payload.currency || "USD",
    description: payload.description,
    estimatedDays: payload.estimatedDays,
    status: "pending",
    createdAt: new Date().toISOString(),
    provider: {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      rating: provider.rating,
      reviews: provider.reviews,
      location: provider.location,
      badges: provider.badges,
      initials: provider.initials,
    },
  };

  // Update in memory request
  inMemoryRequests = inMemoryRequests.map((r) => {
    if (r.id === payload.requestId) {
      const existingQuotes = r.quotes || [];
      return {
        ...r,
        status: "quoted",
        quotesCount: existingQuotes.length + 1,
        quotes: [newQuote, ...existingQuotes],
        updatedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  // Try Supabase insert
  try {
    const db = await getDb();
    await db.from("service_quotes").insert({
      request_id: payload.requestId,
      provider_id: provider.id,
      customer_id: newQuote.customerId,
      price: payload.price,
      parts_cost: payload.partsCost || 0,
      labor_cost: payload.laborCost || payload.price,
      currency: payload.currency || "USD",
      description: payload.description,
      estimated_days: payload.estimatedDays,
      status: "pending",
    });

    await db
      .from("service_requests")
      .update({ status: "quoted", updated_at: new Date().toISOString() })
      .eq("id", payload.requestId);
  } catch {
    // Ignore fallback errors
  }

  revalidatePath(`/services/requests/${payload.requestId}`);
  revalidatePath("/services/requests");
  revalidatePath("/services");

  return { success: true, quoteId };
}

/**
 * Customer accepts a quote -> confirms booking & creates appointment.
 */
export async function acceptServiceQuote(
  quoteId: string,
  requestId: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const req = inMemoryRequests.find((r) => r.id === requestId);
  const quote = req?.quotes?.find((q) => q.id === quoteId);

  if (!req || !quote) {
    return { success: false, error: "Request or quote could not be found." };
  }

  // Update quote status and request status in memory
  inMemoryRequests = inMemoryRequests.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: "accepted",
        acceptedQuoteId: quoteId,
        quotes: (r.quotes || []).map((q) => ({
          ...q,
          status: q.id === quoteId ? ("accepted" as const) : ("rejected" as const),
          acceptedAt: q.id === quoteId ? new Date().toISOString() : undefined,
        })),
      };
    }
    return r;
  });

  // Create booking record
  const bookingId = "book-" + Math.random().toString(36).slice(2, 9);
  const newBooking: ServiceBookingItem = {
    id: bookingId,
    quoteId: quote.id,
    requestId: req.id,
    providerId: quote.providerId,
    customerId: req.customerId,
    vehicleId: req.vehicleId,
    serviceName: req.title || req.serviceType,
    scheduledDate: req.preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    scheduledTime: req.preferredTime || "10:00 AM",
    serviceAddress: req.location,
    isMobileService: false,
    totalAmount: quote.price,
    currency: quote.currency || "USD",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    provider: {
      id: quote.provider.id,
      name: quote.provider.name,
      location: quote.provider.location,
      initials: quote.provider.initials,
      rating: quote.provider.rating,
      phone: "+1 (555) 019-2831",
    },
    vehicleSummary: req.vehicleDescription,
  };

  inMemoryBookings = [newBooking, ...inMemoryBookings];

  // Try updating Supabase
  try {
    const db = await getDb();
    await db
      .from("service_quotes")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", quoteId);

    await db
      .from("service_quotes")
      .update({ status: "rejected" })
      .eq("request_id", requestId)
      .neq("id", quoteId);

    await db
      .from("service_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    await db.from("service_bookings").insert({
      quote_id: quoteId,
      request_id: requestId,
      provider_id: quote.providerId,
      customer_id: req.customerId,
      vehicle_id: req.vehicleId || null,
      service_name: req.title,
      scheduled_date: newBooking.scheduledDate,
      scheduled_time: newBooking.scheduledTime,
      service_address: req.location,
      total_amount: quote.price,
      status: "confirmed",
    });
  } catch {
    // fallback OK
  }

  revalidatePath(`/services/requests/${requestId}`);
  revalidatePath("/services/requests");
  revalidatePath("/services");
  revalidatePath("/garage");

  return { success: true, bookingId };
}

/**
 * Decline/reject a quote.
 */
export async function declineServiceQuote(
  quoteId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  inMemoryRequests = inMemoryRequests.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        quotes: (r.quotes || []).map((q) =>
          q.id === quoteId ? { ...q, status: "rejected" as const } : q
        ),
      };
    }
    return r;
  });

  try {
    const db = await getDb();
    await db
      .from("service_quotes")
      .update({ status: "rejected" })
      .eq("id", quoteId);
  } catch {
    // ignore
  }

  revalidatePath(`/services/requests/${requestId}`);
  revalidatePath("/services/requests");
  return { success: true };
}

/**
 * Direct booking from a provider's service package menu.
 */
export async function createDirectBooking(
  payload: DirectBookingPayload
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const provider = ALL_PROVIDERS.find((p) => p.id === payload.providerId) || ALL_PROVIDERS[0];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const customerId = user?.id || "usr_mock_customer";
  const bookingId = "book-" + Math.random().toString(36).slice(2, 9);

  const newBooking: ServiceBookingItem = {
    id: bookingId,
    providerId: provider.id,
    customerId,
    vehicleId: payload.vehicleId,
    serviceName: payload.serviceName,
    scheduledDate: payload.scheduledDate,
    scheduledTime: payload.scheduledTime || "10:00 AM",
    serviceAddress: payload.serviceAddress || provider.address,
    isMobileService: !!payload.isMobileService,
    totalAmount: payload.totalAmount,
    currency: "USD",
    status: "confirmed",
    completionNotes: payload.notes,
    createdAt: new Date().toISOString(),
    provider: {
      id: provider.id,
      name: provider.name,
      location: provider.location,
      initials: provider.initials,
      rating: provider.rating,
      phone: provider.phone,
    },
    vehicleSummary: payload.vehicleDescription,
  };

  inMemoryBookings = [newBooking, ...inMemoryBookings];

  // Try Supabase insert
  try {
    const db = await getDb();
    await db.from("service_bookings").insert({
      provider_id: provider.id,
      customer_id: customerId,
      vehicle_id: payload.vehicleId || null,
      service_name: payload.serviceName,
      scheduled_date: payload.scheduledDate,
      scheduled_time: payload.scheduledTime,
      service_address: payload.serviceAddress,
      is_mobile_service: !!payload.isMobileService,
      total_amount: payload.totalAmount,
      currency: "USD",
      status: "confirmed",
      completion_notes: payload.notes || null,
    });

    if (user) {
      await db.from("notifications").insert({
        user_id: user.id,
        type: "service",
        title: "Service Booking Confirmed 📅",
        body: `Your appointment for ${payload.serviceName} with ${provider.name} is confirmed for ${payload.scheduledDate}.`,
      });
    }
  } catch {
    // fallback OK
  }

  revalidatePath("/services/requests");
  revalidatePath("/services");
  revalidatePath(`/services/${provider.id}`);

  return { success: true, bookingId };
}

/**
 * Fetch all service bookings for the current user.
 */
export async function getUserBookings(): Promise<ServiceBookingItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const db = await getDb();
    let query = db
      .from("service_bookings")
      .select("*")
      .order("scheduled_date", { ascending: false });

    if (user) {
      query = query.eq("customer_id", user.id);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((b: any) => {
        const prov = ALL_PROVIDERS.find((p) => p.id === b.provider_id) || ALL_PROVIDERS[0];
        return {
          id: b.id,
          quoteId: b.quote_id,
          requestId: b.request_id,
          providerId: b.provider_id,
          customerId: b.customer_id,
          vehicleId: b.vehicle_id,
          serviceName: b.service_name,
          scheduledDate: b.scheduled_date,
          scheduledTime: b.scheduled_time,
          serviceAddress: b.service_address,
          isMobileService: !!b.is_mobile_service,
          totalAmount: parseFloat(b.total_amount),
          currency: b.currency || "USD",
          status: b.status || "confirmed",
          completionNotes: b.completion_notes,
          completedAt: b.completed_at,
          createdAt: b.created_at,
          provider: {
            id: prov.id,
            name: prov.name,
            location: prov.location,
            initials: prov.initials,
            rating: prov.rating,
            phone: prov.phone,
          },
          vehicleSummary: b.vehicle_summary || "Vehicle",
        };
      });
    }
  } catch {
    // ignore
  }

  return inMemoryBookings;
}

/**
 * Update service booking status. When status is 'completed',
 * auto-adds a service record to the garage vehicle history!
 */
export async function updateBookingStatus(
  bookingId: string,
  status: ServiceBookingStatus,
  completionNotes?: string
): Promise<{ success: boolean; error?: string }> {
  let updatedBooking: ServiceBookingItem | null = null;

  inMemoryBookings = inMemoryBookings.map((b) => {
    if (b.id === bookingId) {
      updatedBooking = {
        ...b,
        status,
        completionNotes: completionNotes || b.completionNotes,
        completedAt: status === "completed" ? new Date().toISOString() : b.completedAt,
      };
      return updatedBooking;
    }
    return b;
  });

  // If completed and vehicleId exists, automatically add a garage service history record
  if (status === "completed" && updatedBooking) {
    const booking = updatedBooking as ServiceBookingItem;
    if (booking.vehicleId) {
      try {
        await addVehicleServiceRecord({
          vehicleId: booking.vehicleId,
          title: booking.serviceName,
          serviceDate: booking.scheduledDate,
          serviceProvider: booking.provider.name,
          cost: booking.totalAmount,
          notes: completionNotes || "Service successfully completed via Debford Automotive Services.",
        });
      } catch {
        // non-blocking
      }
    }
  }

  try {
    const db = await getDb();
    await db
      .from("service_bookings")
      .update({
        status,
        completion_notes: completionNotes || null,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", bookingId);
  } catch {
    // ignore
  }

  revalidatePath("/services/requests");
  revalidatePath("/services");
  revalidatePath("/garage");

  return { success: true };
}

/**
 * Add a service history record to a vehicle.
 */
export async function addVehicleServiceRecord(
  payload: ServiceRecordPayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = await getDb();

  const formattedNotes = [
    payload.notes ? `Notes: ${payload.notes}` : null,
    payload.serviceProvider ? `Provider: ${payload.serviceProvider}` : null,
    payload.cost ? `Cost: $${payload.cost}` : null,
    payload.mileage ? `Mileage: ${payload.mileage} km` : null,
  ].filter(Boolean).join(" | ");

  try {
    if (user) {
      await db.from("vehicle_documents").insert({
        vehicle_id: payload.vehicleId,
        owner_id: user.id,
        document_type: "service_record",
        title: `${payload.title} (${payload.serviceDate})${formattedNotes ? ` - ${formattedNotes}` : ""}`,
        storage_path: `service-records/${payload.vehicleId}/${Date.now()}`,
        url: "#",
        expiry_date: payload.serviceDate || null,
      });

      if (payload.mileage) {
        await db
          .from("vehicles")
          .update({ mileage: payload.mileage })
          .eq("id", payload.vehicleId)
          .eq("owner_id", user.id);
      }
    }
  } catch {
    // non-fatal
  }

  revalidatePath(`/garage/${payload.vehicleId}`);
  revalidatePath("/garage");
  return { success: true };
}

/**
 * Add / upload a vehicle document.
 */
export async function addVehicleDocument(
  payload: VehicleDocumentPayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sign in to upload documents." };

  const db = await getDb();

  const { error } = await db.from("vehicle_documents").insert({
    vehicle_id: payload.vehicleId,
    owner_id: user.id,
    document_type: payload.documentType,
    title: payload.title,
    storage_path: `documents/${payload.vehicleId}/${Date.now()}`,
    url: payload.url || "#",
    expiry_date: payload.expiryDate || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/garage/${payload.vehicleId}`);
  return { success: true };
}

/**
 * Toggle saving a vehicle to user favorites.
 */
export async function toggleSaveVehicle(vehicleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to save vehicles." };

  const db = await getDb();

  const { data: existing } = await db
    .from("saved_listings")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", vehicleId)
    .maybeSingle();

  if (existing) {
    await db.from("saved_listings").delete().eq("id", existing.id);
    return { saved: false };
  }

  await db.from("saved_listings").insert({
    user_id: user.id,
    listing_id: vehicleId,
    listing_type: "sale",
  });

  return { saved: true };
}

/**
 * Save user search filter presets.
 */
export async function saveSearch(name: string, filters: Record<string, string>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to save searches." };

  const db = await getDb();

  const { error } = await db.from("saved_searches").insert({
    user_id: user.id,
    name,
    filters,
  });

  if (error) return { error: error.message };
  return { success: true };
}
