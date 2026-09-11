"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function getDb() {
  const admin = createAdminClient();
  if (admin) return admin;
  return await createClient();
}

export interface ServiceRequestPayload {
  serviceType: string;
  vehicleId?: string;
  vehicleDescription: string;
  description: string;
  location: string;
  urgency: "flexible" | "this_week" | "urgent";
  preferredDate?: string;
  budget?: string;
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

/**
 * Submit a service booking or quote request.
 */
export async function createServiceRequest(payload: ServiceRequestPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to request a service." };

  const db = await getDb();

  const { data, error } = await db.from("service_requests").insert({
    customer_id: user.id,
    service_type: payload.serviceType,
    vehicle_id: payload.vehicleId || null,
    vehicle_description: payload.vehicleDescription,
    description: payload.description,
    location: payload.location,
    urgency: payload.urgency,
    preferred_date: payload.preferredDate || null,
    budget_max: payload.budget ? parseFloat(payload.budget) : null,
    status: "open",
  }).select("id").single();

  if (error) return { error: error.message };

  // Create notification for user
  await db.from("notifications").insert({
    user_id: user.id,
    type: "service",
    title: "Service Request Submitted 🔧",
    body: `Your request for ${payload.serviceType} has been published to verified specialists.`,
  });

  revalidatePath("/services");
  revalidatePath("/dashboard");
  revalidatePath("/garage");

  return { success: true, requestId: data?.id };
}

/**
 * Add a service history record to a vehicle.
 */
export async function addVehicleServiceRecord(payload: ServiceRecordPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to add service records." };

  const db = await getDb();

  // Create document entry of type service_record
  const formattedNotes = [
    payload.notes ? `Notes: ${payload.notes}` : null,
    payload.serviceProvider ? `Provider: ${payload.serviceProvider}` : null,
    payload.cost ? `Cost: $${payload.cost}` : null,
    payload.mileage ? `Mileage: ${payload.mileage} km` : null,
  ].filter(Boolean).join(" | ");

  const { error } = await db.from("vehicle_documents").insert({
    vehicle_id: payload.vehicleId,
    owner_id: user.id,
    document_type: "service_record",
    title: `${payload.title} (${payload.serviceDate})`,
    storage_path: `service-records/${payload.vehicleId}/${Date.now()}`,
    url: "#",
    expiry_date: payload.serviceDate || null,
  });

  if (error) return { error: error.message };

  // Update vehicle mileage if provided and higher than current
  if (payload.mileage) {
    await db
      .from("vehicles")
      .update({ mileage: payload.mileage })
      .eq("id", payload.vehicleId)
      .eq("owner_id", user.id);
  }

  revalidatePath(`/garage/${payload.vehicleId}`);
  revalidatePath("/garage");
  return { success: true };
}

/**
 * Add / upload a vehicle document.
 */
export async function addVehicleDocument(payload: VehicleDocumentPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to upload documents." };

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

  if (error) return { error: error.message };

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
