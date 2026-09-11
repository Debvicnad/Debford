/**
 * Debford Type Definitions — Vehicles
 */

export type VehicleType = "car" | "motorcycle" | "truck";

export type FuelType =
  | "petrol"
  | "diesel"
  | "electric"
  | "hybrid"
  | "lpg"
  | "cng"
  | "hydrogen"
  | "other";

export type Transmission =
  | "manual"
  | "automatic"
  | "semi_automatic"
  | "cvt"
  | "dct"
  | "other";

export type DriveType = "fwd" | "rwd" | "awd" | "4wd";

export type VehicleCondition =
  | "new"
  | "used"
  | "certified_pre_owned"
  | "salvage";

export type VehicleStatus = "active" | "inactive" | "sold" | "scrapped";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "reserved"
  | "sold"
  | "expired"
  | "cancelled";

export interface VehicleType_ {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface VehicleCategory {
  id: string;
  vehicle_type_id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  country_of_origin?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface VehicleModel {
  id: string;
  make_id: string;
  vehicle_type_id: string;
  name: string;
  slug: string;
  production_start_year?: number;
  production_end_year?: number;
  is_active: boolean;
  created_at: string;
  // Joined
  make?: VehicleMake;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  organization_id?: string;
  vehicle_type_id: string;
  category_id?: string;
  make_id?: string;
  model_id?: string;
  variant_id?: string;
  // Core identity
  year: number;
  make_name?: string;
  model_name?: string;
  variant_name?: string;
  vin?: string;
  registration_plate?: string;
  color?: string;
  interior_color?: string;
  // Specifications
  mileage?: number;
  mileage_unit: "km" | "mi";
  fuel_type?: FuelType;
  transmission?: Transmission;
  engine_size?: number;
  engine_cylinders?: number;
  power_hp?: number;
  torque_nm?: number;
  drive_type?: DriveType;
  doors?: number;
  seats?: number;
  body_type?: string;
  // Status
  condition: VehicleCondition;
  status: VehicleStatus;
  // Description
  description?: string;
  notes?: string;
  // Location
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  // Joined relations
  images?: VehicleImage[];
  features?: VehicleFeature[];
  make?: VehicleMake;
  model?: VehicleModel;
  category?: VehicleCategory;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  storage_path: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface VehicleFeature {
  id: string;
  vehicle_id: string;
  category?: string;
  feature: string;
  created_at: string;
}

export interface SaleListing {
  id: string;
  vehicle_id: string;
  seller_id: string;
  organization_id?: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  is_negotiable: boolean;
  status: ListingStatus;
  description?: string;
  highlights?: string[];
  views_count: number;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  vehicle?: Vehicle;
}

// Filter types for search
export interface VehicleFilters {
  type?: VehicleType;
  category?: string;
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  condition?: VehicleCondition;
  location?: string;
  query?: string;
}
