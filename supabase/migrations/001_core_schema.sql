-- ============================================================
-- DEBFORD — Database Migration 001
-- Core Platform Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'hydrogen', 'other');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'semi_automatic', 'cvt', 'dct', 'other');
CREATE TYPE drive_type AS ENUM ('fwd', 'rwd', 'awd', '4wd');
CREATE TYPE vehicle_condition AS ENUM ('new', 'used', 'certified_pre_owned', 'salvage');
CREATE TYPE vehicle_status AS ENUM ('active', 'inactive', 'sold', 'scrapped');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'published', 'reserved', 'sold', 'expired', 'cancelled');
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'dealer', 'service_provider', 'parts_seller', 'auctioneer', 'admin');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE org_type AS ENUM ('dealership', 'auction_house', 'rental_company', 'service_center', 'parts_supplier', 'other');
CREATE TYPE rental_duration_type AS ENUM ('hourly', 'daily', 'weekly', 'monthly');
CREATE TYPE bid_status AS ENUM ('active', 'won', 'lost', 'cancelled', 'rejected');
CREATE TYPE auction_status AS ENUM ('upcoming', 'live', 'ended', 'cancelled');
CREATE TYPE message_type AS ENUM ('text', 'image', 'document', 'offer', 'system');
CREATE TYPE notification_type AS ENUM ('message', 'bid', 'offer', 'listing', 'service', 'payment', 'system');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE membership_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    role user_role NOT NULL DEFAULT 'buyer',
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    membership_tier membership_tier NOT NULL DEFAULT 'free',
    -- Location
    country TEXT DEFAULT 'US',
    city TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    -- Preferences
    preferred_currency TEXT DEFAULT 'USD',
    preferred_language TEXT DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    -- Stats
    listings_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    purchases_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    -- Flags
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    -- Timestamps
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORGANIZATIONS (Dealerships, Auction Houses, etc.)
-- ============================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type org_type NOT NULL DEFAULT 'dealership',
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    -- Contact
    email TEXT,
    phone TEXT,
    website TEXT,
    -- Location
    country TEXT,
    city TEXT,
    address TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    -- Verification
    verification_status verification_status DEFAULT 'unverified',
    license_number TEXT,
    -- Stats
    listings_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    -- Flags
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'agent', -- owner, manager, agent, viewer
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ============================================================
-- VEHICLE TAXONOMY
-- ============================================================
CREATE TABLE vehicle_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO vehicle_types (name, slug, icon, sort_order) VALUES
    ('Car', 'car', '🚗', 1),
    ('Motorcycle', 'motorcycle', '🏍️', 2),
    ('Truck', 'truck', '🚛', 3),
    ('Van', 'van', '🚐', 4),
    ('Bus', 'bus', '🚌', 5),
    ('RV / Motorhome', 'rv', '🚎', 6),
    ('Heavy Equipment', 'heavy-equipment', '🚜', 7),
    ('Boat / Marine', 'boat', '⛵', 8);

CREATE TABLE vehicle_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES vehicle_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vehicle_type_id, slug)
);

CREATE TABLE vehicle_makes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    country_of_origin TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make_id UUID NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    production_start_year INTEGER,
    production_end_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(make_id, slug)
);

CREATE TABLE vehicle_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    fuel_type fuel_type,
    transmission transmission_type,
    engine_size DECIMAL(3,1),
    power_hp INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES vehicle_categories(id) ON DELETE SET NULL,
    make_id UUID REFERENCES vehicle_makes(id) ON DELETE SET NULL,
    model_id UUID REFERENCES vehicle_models(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES vehicle_variants(id) ON DELETE SET NULL,
    -- Core identity
    year INTEGER NOT NULL CHECK (year >= 1886 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
    make_name TEXT, -- denormalized for search
    model_name TEXT,
    variant_name TEXT,
    vin TEXT,
    registration_plate TEXT,
    -- Appearance
    color TEXT,
    interior_color TEXT,
    -- Specifications
    mileage INTEGER CHECK (mileage >= 0),
    mileage_unit TEXT DEFAULT 'km' CHECK (mileage_unit IN ('km', 'mi')),
    fuel_type fuel_type,
    transmission transmission_type,
    engine_size DECIMAL(3,1),
    engine_cylinders INTEGER,
    power_hp INTEGER,
    torque_nm INTEGER,
    drive_type drive_type,
    doors INTEGER,
    seats INTEGER,
    body_type TEXT,
    -- Condition
    condition vehicle_condition NOT NULL DEFAULT 'used',
    status vehicle_status NOT NULL DEFAULT 'active',
    -- Description
    description TEXT,
    notes TEXT,
    -- Location
    country TEXT,
    city TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    category TEXT,
    feature TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- registration, insurance, service_record, inspection, title
    title TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SALE LISTINGS
-- ============================================================
CREATE TABLE sale_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    -- Listing details
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    is_negotiable BOOLEAN DEFAULT TRUE,
    -- Status
    status listing_status NOT NULL DEFAULT 'draft',
    -- Content
    description TEXT,
    highlights TEXT[],
    -- Analytics
    views_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    -- Dates
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RENTALS
-- ============================================================
CREATE TABLE rental_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    -- Pricing
    price_per_day DECIMAL(10,2) NOT NULL CHECK (price_per_day > 0),
    price_per_week DECIMAL(10,2),
    price_per_month DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    -- Requirements
    min_age INTEGER DEFAULT 21,
    min_license_years INTEGER DEFAULT 1,
    requires_credit_card BOOLEAN DEFAULT TRUE,
    -- Location
    pickup_location TEXT,
    delivery_available BOOLEAN DEFAULT FALSE,
    -- Status
    status listing_status DEFAULT 'draft',
    is_instant_book BOOLEAN DEFAULT FALSE,
    -- Stats
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    -- Dates
    available_from DATE,
    available_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rental_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES rental_listings(id) ON DELETE RESTRICT,
    renter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_time TIMESTAMPTZ,
    return_time TIMESTAMPTZ,
    -- Pricing
    daily_rate DECIMAL(10,2) NOT NULL,
    total_days INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed')),
    -- Meta
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (end_date > start_date)
);

-- ============================================================
-- AUCTIONS
-- ============================================================
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    -- Auction config
    title TEXT NOT NULL,
    description TEXT,
    starting_price DECIMAL(12,2) NOT NULL CHECK (starting_price > 0),
    reserve_price DECIMAL(12,2),
    buy_now_price DECIMAL(12,2),
    bid_increment DECIMAL(10,2) DEFAULT 100,
    currency TEXT DEFAULT 'USD',
    -- Status
    status auction_status DEFAULT 'upcoming',
    -- Results
    current_bid DECIMAL(12,2),
    current_bidder_id UUID REFERENCES profiles(id),
    winning_bid DECIMAL(12,2),
    winner_id UUID REFERENCES profiles(id),
    bids_count INTEGER DEFAULT 0,
    -- Timing
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ends_at > starts_at)
);

CREATE TABLE auction_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    status bid_status DEFAULT 'active',
    is_auto_bid BOOLEAN DEFAULT FALSE,
    max_auto_bid DECIMAL(12,2),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICES MARKETPLACE
-- ============================================================
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO service_categories (name, slug, icon) VALUES
    ('Mechanical Repair', 'mechanical', '🔧'),
    ('Body & Paint', 'body-paint', '🎨'),
    ('Electrical', 'electrical', '⚡'),
    ('Tyres & Wheels', 'tyres', '🔄'),
    ('Detailing & Cleaning', 'detailing', '✨'),
    ('Inspection & Diagnostics', 'inspection', '🔍'),
    ('Customization & Upgrades', 'customization', '🛠️'),
    ('Towing & Recovery', 'towing', '🚗');

CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    -- Profile
    business_name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    -- Services
    service_category_ids UUID[],
    specializations TEXT[],
    vehicle_brands TEXT[],
    -- Pricing
    hourly_rate DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    -- Location
    country TEXT,
    city TEXT,
    address TEXT,
    service_radius_km INTEGER,
    mobile_service BOOLEAN DEFAULT FALSE,
    -- Verification
    verification_status verification_status DEFAULT 'unverified',
    license_number TEXT,
    -- Stats
    jobs_completed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    reviews_count INTEGER DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTS MARKETPLACE
-- ============================================================
CREATE TABLE parts_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parts_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE parts_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    category_id UUID REFERENCES parts_categories(id) ON DELETE SET NULL,
    -- Part details
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    part_number TEXT,
    brand TEXT,
    condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'used', 'refurbished', 'oem')),
    -- Compatibility
    compatible_makes TEXT[],
    compatible_models TEXT[],
    compatible_years INT4RANGE,
    -- Pricing
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    currency TEXT DEFAULT 'USD',
    stock_quantity INTEGER DEFAULT 1,
    -- Status
    status listing_status DEFAULT 'draft',
    -- Stats
    views_count INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGING
-- ============================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Context
    listing_id UUID, -- can reference any listing type
    listing_type TEXT, -- 'sale', 'rental', 'auction', 'service', 'parts'
    -- Status
    is_archived BOOLEAN DEFAULT FALSE,
    -- Timestamps
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    unread_count INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    type message_type DEFAULT 'text',
    content TEXT,
    metadata JSONB,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS & RATINGS
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    -- Context
    context_type TEXT, -- 'sale', 'rental', 'service', 'parts'
    context_id UUID,
    -- Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT,
    -- Moderation
    is_approved BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- One review per context
    UNIQUE(reviewer_id, context_type, context_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED ITEMS
-- ============================================================
CREATE TABLE saved_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_type TEXT NOT NULL, -- 'sale', 'rental', 'auction', 'parts'
    listing_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_type, listing_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verification ON profiles(verification_status);

-- Vehicles
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type_id);
CREATE INDEX idx_vehicles_make ON vehicles(make_id);
CREATE INDEX idx_vehicles_model ON vehicles(model_id);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_condition ON vehicles(condition);
CREATE INDEX idx_vehicles_location ON vehicles(country, city);

-- Sale listings
CREATE INDEX idx_sale_listings_status ON sale_listings(status);
CREATE INDEX idx_sale_listings_seller ON sale_listings(seller_id);
CREATE INDEX idx_sale_listings_vehicle ON sale_listings(vehicle_id);
CREATE INDEX idx_sale_listings_price ON sale_listings(price);
CREATE INDEX idx_sale_listings_published ON sale_listings(published_at DESC) WHERE status = 'published';

-- Auctions
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_ends_at ON auctions(ends_at);
CREATE INDEX idx_auction_bids_auction ON auction_bids(auction_id, created_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sale_listings_updated BEFORE UPDATE ON sale_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rental_listings_updated BEFORE UPDATE ON rental_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_auctions_updated BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_messages_updated BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  parsed_role public.user_role := 'buyer'::public.user_role;
  raw_role text;
BEGIN
  raw_role := NEW.raw_user_meta_data->>'role';
  IF raw_role IS NOT NULL AND raw_role IN ('buyer', 'seller', 'dealer', 'service_provider', 'parts_seller', 'auctioneer', 'admin') THEN
    parsed_role := raw_role::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(COALESCE(NEW.email, ''), '@', 1)),
    parsed_role
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user encountered error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: public read, self-write, insert
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);

-- Vehicles: public read, owner write
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_owner_insert" ON vehicles FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "vehicles_owner_update" ON vehicles FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "vehicles_owner_delete" ON vehicles FOR DELETE USING (auth.uid() = owner_id);

-- Vehicle images
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_images_public_read" ON vehicle_images FOR SELECT USING (true);
CREATE POLICY "vehicle_images_owner_write" ON vehicle_images FOR ALL
  USING (EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_id AND v.owner_id = auth.uid()));

-- Sale listings: public read published, owner write
ALTER TABLE sale_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale_listings_public_read" ON sale_listings FOR SELECT
  USING (status = 'published' OR auth.uid() = seller_id);
CREATE POLICY "sale_listings_seller_insert" ON sale_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "sale_listings_seller_update" ON sale_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "sale_listings_seller_delete" ON sale_listings FOR DELETE USING (auth.uid() = seller_id);

-- Auctions: public read, seller write
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auctions_public_read" ON auctions FOR SELECT USING (true);
CREATE POLICY "auctions_seller_write" ON auctions FOR ALL USING (auth.uid() = seller_id);

-- Bids: bidder read own, public read auction bids
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bids_public_read" ON auction_bids FOR SELECT USING (true);
CREATE POLICY "bids_auth_insert" ON auction_bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Messages: participants only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_participant_read" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "messages_participant_insert" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid())
  );

-- Notifications: own only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Saved listings: own only
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_own" ON saved_listings FOR ALL USING (auth.uid() = user_id);

-- Reviews: public read, reviewer write own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_approved = true OR reviewer_id = auth.uid());
CREATE POLICY "reviews_auth_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_reviewer_update" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);
