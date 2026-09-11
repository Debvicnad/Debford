"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CreateListingPayload {
  // Vehicle
  listingType: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  variant?: string;
  vin?: string;
  condition: string;
  mileage?: number;
  mileageUnit: string;
  color?: string;
  location: string;
  registrationPlate?: string;
  // Specs
  fuelType?: string;
  transmission?: string;
  engineSize?: number;
  powerHp?: number;
  torqueNm?: number;
  driveType?: string;
  doors?: number;
  seats?: number;
  bodyType?: string;
  interiorColor?: string;
  selectedFeatures?: string[];
  description?: string;
  // Photos (storage paths — uploaded first on client)
  photoStoragePaths?: string[];
  primaryPhotoIndex?: number;
  // Pricing
  price?: number;
  currency: string;
  isNegotiable?: boolean;
  pricePerDay?: number;
  startingPrice?: number;
  reservePrice?: number;
  buyNowPrice?: number;
  auctionStartDate?: string;
  auctionEndDate?: string;
  highlights?: string[];
}

/**
 * Creates a vehicle + listing in one transaction-like sequence.
 * Returns the new listing ID on success.
 */
export async function createListing(payload: CreateListingPayload) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a listing." };
  }

  try {
    // Use admin client if available (bypasses RLS for taxonomy lookup), otherwise user client
    const admin = createAdminClient();
    const db = admin ?? supabase;

    // 1. Resolve vehicle_type_id safely
    const slugAliases: Record<string, string> = {
      heavy: "heavy-equipment",
      "heavy-equipment": "heavy-equipment",
      moto: "motorcycle",
      bike: "motorcycle",
      motorcycles: "motorcycle",
      trucks: "truck",
      cars: "car",
      vans: "van",
      buses: "bus",
      boats: "boat",
    };

    const targetSlug = slugAliases[payload.vehicleType?.toLowerCase() ?? ""] ?? payload.vehicleType?.toLowerCase() ?? "car";

    // Try finding by exact slug
    let { data: vType } = await db
      .from("vehicle_types")
      .select("id")
      .eq("slug", targetSlug)
      .maybeSingle();

    // If not found by slug, try falling back to 'car'
    if (!vType) {
      const { data: vFallback } = await db
        .from("vehicle_types")
        .select("id")
        .eq("slug", "car")
        .maybeSingle();
      vType = vFallback;
    }

    // If still not found, take ANY first vehicle type
    if (!vType) {
      const { data: anyType } = await db
        .from("vehicle_types")
        .select("id")
        .limit(1)
        .maybeSingle();
      vType = anyType;
    }

    // 2. Create the vehicle record
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .insert({
        owner_id: user.id,
        vehicle_type_id: vType?.id ?? null,
        year: payload.year,
        make_name: payload.make,
        model_name: payload.model,
        variant_name: payload.variant,
        vin: payload.vin,
        condition: payload.condition,
        mileage: payload.mileage,
        mileage_unit: payload.mileageUnit,
        color: payload.color,
        interior_color: payload.interiorColor,
        fuel_type: payload.fuelType,
        transmission: payload.transmission,
        engine_size: payload.engineSize,
        power_hp: payload.powerHp,
        torque_nm: payload.torqueNm,
        drive_type: payload.driveType,
        doors: payload.doors,
        seats: payload.seats,
        body_type: payload.bodyType,
        description: payload.description,
        registration_plate: payload.registrationPlate,
        city: payload.location,
        status: "active",
      })
      .select("id")
      .single();

    if (vehicleError || !vehicle) {
      return { error: vehicleError?.message ?? "Failed to create vehicle." };
    }

    // 3. Insert vehicle images (paths uploaded from client-side)
    if (payload.photoStoragePaths && payload.photoStoragePaths.length > 0) {
      const { data: { publicUrl: baseUrl } } = supabase
        .storage
        .from("vehicle-images")
        .getPublicUrl("");

      await supabase.from("vehicle_images").insert(
        payload.photoStoragePaths.map((path, i) => ({
          vehicle_id: vehicle.id,
          storage_path: path,
          url: `${baseUrl}${path}`,
          is_primary: i === (payload.primaryPhotoIndex ?? 0),
          sort_order: i,
        }))
      );
    }

    // 4. Insert vehicle features
    if (payload.selectedFeatures && payload.selectedFeatures.length > 0) {
      await supabase.from("vehicle_features").insert(
        payload.selectedFeatures.map((feature) => ({
          vehicle_id: vehicle.id,
          feature,
        }))
      );
    }

    // 5. Create the listing based on type
    let listingId: string | null = null;

    if (payload.listingType === "sale") {
      const slug = `${payload.make}-${payload.model}-${payload.year}-${Date.now()}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");

      const { data: listing, error: listingError } = await supabase
        .from("sale_listings")
        .insert({
          vehicle_id: vehicle.id,
          seller_id: user.id,
          title: `${payload.year} ${payload.make} ${payload.model}${payload.variant ? ` ${payload.variant}` : ""}`,
          slug,
          price: payload.price,
          currency: payload.currency,
          is_negotiable: payload.isNegotiable,
          highlights: payload.highlights,
          description: payload.description,
          status: "pending_review",
        })
        .select("id")
        .single();

      if (listingError) return { error: listingError.message };
      listingId = listing?.id ?? null;

    } else if (payload.listingType === "rental") {
      const { data: listing, error: listingError } = await supabase
        .from("rental_listings")
        .insert({
          vehicle_id: vehicle.id,
          owner_id: user.id,
          title: `${payload.year} ${payload.make} ${payload.model}`,
          description: payload.description,
          price_per_day: payload.pricePerDay,
          currency: payload.currency,
          status: "pending_review",
        })
        .select("id")
        .single();

      if (listingError) return { error: listingError.message };
      listingId = listing?.id ?? null;

    } else if (payload.listingType === "auction") {
      const { data: listing, error: listingError } = await supabase
        .from("auctions")
        .insert({
          vehicle_id: vehicle.id,
          seller_id: user.id,
          title: `${payload.year} ${payload.make} ${payload.model}`,
          description: payload.description,
          starting_price: payload.startingPrice,
          reserve_price: payload.reservePrice,
          buy_now_price: payload.buyNowPrice,
          currency: payload.currency,
          starts_at: payload.auctionStartDate,
          ends_at: payload.auctionEndDate,
          status: "upcoming",
        })
        .select("id")
        .single();

      if (listingError) return { error: listingError.message };
      listingId = listing?.id ?? null;
    }

    revalidatePath("/dashboard");
    revalidatePath("/garage");

    return { success: true, vehicleId: vehicle.id, listingId };

  } catch (err) {
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Upload a vehicle photo to Supabase Storage and return the storage path.
 * Called from the client before submitting the listing form.
 */
export async function getPhotoUploadUrl(
  vehicleId: string,
  fileName: string,
  mimeType: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const path = `${user.id}/${vehicleId}/${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from("vehicle-images")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return { error: error?.message ?? "Failed to generate signed upload URL" };
  }

  return { signedUrl: data.signedUrl, path, token: data.token };
}

/**
 * Persist uploaded photo paths into vehicle_images table.
 */
export async function saveVehicleImages(
  vehicleId: string,
  images: { path: string; isPrimary: boolean; sortOrder: number }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (!images.length) return { success: true };

  const rows = images.map((img) => {
    const { data } = supabase.storage.from("vehicle-images").getPublicUrl(img.path);
    return {
      vehicle_id: vehicleId,
      storage_path: img.path,
      url: data.publicUrl,
      is_primary: img.isPrimary,
      sort_order: img.sortOrder,
    };
  });

  const { error } = await supabase.from("vehicle_images").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/garage");
  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  return { success: true };
}
