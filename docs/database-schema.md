# DEBFORD — Database Schema

> Complete relational database design for the Debford automotive ecosystem.
> Database: PostgreSQL 15+ via Supabase
> All tables use `uuid` primary keys and include `created_at` / `updated_at` timestamps.

---

## 1. Core User & Organization Tables

### `profiles`
Extension of Supabase `auth.users`. One-to-one relationship.

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  first_name    TEXT,
  last_name     TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  date_of_birth DATE,
  bio           TEXT,
  role          TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer','private_seller','dealer','rental_provider',
                                'service_professional','auction_operator','admin')),
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  last_seen_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `organizations`
Business entities: dealerships, rental companies, service centers, auction operators.

```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  type            TEXT NOT NULL
                  CHECK (type IN ('dealership','rental_company','service_center',
                                  'parts_seller','auction_operator')),
  description     TEXT,
  logo_url        TEXT,
  website         TEXT,
  email           TEXT,
  phone           TEXT,
  tax_number      TEXT,
  registration_number TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  verification_status TEXT DEFAULT 'unverified'
                  CHECK (verification_status IN ('unverified','pending','basic_verified',
                                                  'business_verified','dealer_verified')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `organization_members`
Users who belong to an organization with a role.

```sql
CREATE TABLE organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('owner','admin','manager','sales','mechanic','support','member')),
  is_active       BOOLEAN DEFAULT TRUE,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, profile_id)
);
```

### `organization_locations`
```sql
CREATE TABLE organization_locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  label           TEXT,
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  state           TEXT,
  country         TEXT NOT NULL,
  postal_code     TEXT,
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  is_primary      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Vehicle Taxonomy Tables

### `vehicle_types`
```sql
CREATE TABLE vehicle_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,  -- 'car', 'motorcycle', 'truck'
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `vehicle_categories`
```sql
CREATE TABLE vehicle_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id),
  parent_id       UUID REFERENCES vehicle_categories(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  icon            TEXT,
  image_url       TEXT,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_type_id, slug)
);
```

### `vehicle_makes`
```sql
CREATE TABLE vehicle_makes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  country_of_origin TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `vehicle_models`
```sql
CREATE TABLE vehicle_models (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id         UUID NOT NULL REFERENCES vehicle_makes(id),
  vehicle_type_id UUID NOT NULL REFERENCES vehicle_types(id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  production_start_year INT,
  production_end_year   INT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(make_id, slug)
);
```

### `vehicle_variants`
```sql
CREATE TABLE vehicle_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id        UUID NOT NULL REFERENCES vehicle_models(id),
  name            TEXT NOT NULL,
  year            INT NOT NULL,
  engine_code     TEXT,
  trim_level      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Core Vehicle Tables

### `vehicles`
The master vehicle record. Shared across sale, rental, auction listings.

```sql
CREATE TABLE vehicles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES profiles(id),
  organization_id   UUID REFERENCES organizations(id),
  vehicle_type_id   UUID NOT NULL REFERENCES vehicle_types(id),
  category_id       UUID REFERENCES vehicle_categories(id),
  make_id           UUID REFERENCES vehicle_makes(id),
  model_id          UUID REFERENCES vehicle_models(id),
  variant_id        UUID REFERENCES vehicle_variants(id),

  -- Core identity
  year              INT NOT NULL,
  make_name         TEXT,            -- Fallback if not in DB
  model_name        TEXT,            -- Fallback if not in DB
  variant_name      TEXT,
  vin               TEXT UNIQUE,
  registration_plate TEXT,
  color             TEXT,
  interior_color    TEXT,

  -- Specifications
  mileage           INT,
  mileage_unit      TEXT DEFAULT 'km' CHECK (mileage_unit IN ('km','mi')),
  fuel_type         TEXT CHECK (fuel_type IN ('petrol','diesel','electric','hybrid',
                                              'lpg','cng','hydrogen','other')),
  transmission      TEXT CHECK (transmission IN ('manual','automatic','semi_automatic',
                                                 'cvt','dct','other')),
  engine_size       DECIMAL(4,1),    -- Liters, e.g. 2.5
  engine_cylinders  INT,
  power_hp          INT,
  torque_nm         INT,
  drive_type        TEXT CHECK (drive_type IN ('fwd','rwd','awd','4wd')),
  doors             INT,
  seats             INT,
  body_type         TEXT,

  -- Status
  condition         TEXT DEFAULT 'used' CHECK (condition IN ('new','used','certified_pre_owned','salvage')),
  status            TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','sold','scrapped')),

  -- Description
  description       TEXT,
  notes             TEXT,           -- Internal notes

  -- Location
  country           TEXT,
  city              TEXT,
  latitude          DECIMAL(10, 8),
  longitude         DECIMAL(11, 8),

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### `vehicle_features`
```sql
CREATE TABLE vehicle_features (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  category    TEXT,           -- 'safety','comfort','technology','exterior','interior'
  feature     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `vehicle_images`
```sql
CREATE TABLE vehicle_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  alt_text     TEXT,
  is_primary   BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### `vehicle_documents`
```sql
CREATE TABLE vehicle_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES profiles(id),
  type         TEXT NOT NULL CHECK (type IN ('registration','insurance','service_history',
                                             'inspection','title','other')),
  label        TEXT,
  storage_path TEXT NOT NULL,
  url          TEXT NOT NULL,
  expires_at   DATE,
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### `vehicle_history`
```sql
CREATE TABLE vehicle_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL CHECK (event_type IN ('ownership_transfer','service',
                                                    'inspection','accident','modification',
                                                    'registration','auction','other')),
  description   TEXT,
  date          DATE,
  mileage       INT,
  provider      TEXT,
  cost          DECIMAL(12,2),
  currency      TEXT DEFAULT 'USD',
  notes         TEXT,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Marketplace — Listings

### `sale_listings`
```sql
CREATE TABLE sale_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  seller_id       UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  price           DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  is_negotiable   BOOLEAN DEFAULT TRUE,
  status          TEXT DEFAULT 'draft'
                  CHECK (status IN ('draft','pending_review','published',
                                    'reserved','sold','expired','cancelled')),
  listing_type    TEXT DEFAULT 'sale' CHECK (listing_type IN ('sale','consignment')),
  description     TEXT,
  highlights      TEXT[],
  views_count     INT DEFAULT 0,
  published_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `listing_favorites`
```sql
CREATE TABLE listing_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES sale_listings(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, profile_id)
);
```

### `listing_inquiries`
```sql
CREATE TABLE listing_inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES sale_listings(id),
  buyer_id    UUID NOT NULL REFERENCES profiles(id),
  seller_id   UUID NOT NULL REFERENCES profiles(id),
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'open' CHECK (status IN ('open','responded','closed')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `offers`
```sql
CREATE TABLE offers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES sale_listings(id),
  buyer_id    UUID NOT NULL REFERENCES profiles(id),
  seller_id   UUID NOT NULL REFERENCES profiles(id),
  amount      DECIMAL(12,2) NOT NULL,
  currency    TEXT DEFAULT 'USD',
  message     TEXT,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','rejected','countered','withdrawn','expired')),
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Rental System

### `rental_listings`
```sql
CREATE TABLE rental_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  provider_id     UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  pickup_location TEXT NOT NULL,
  pickup_city     TEXT NOT NULL,
  pickup_country  TEXT NOT NULL,
  pickup_latitude  DECIMAL(10,8),
  pickup_longitude DECIMAL(11,8),
  daily_rate      DECIMAL(10,2) NOT NULL,
  weekly_rate     DECIMAL(10,2),
  monthly_rate    DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  min_rental_days INT DEFAULT 1,
  max_rental_days INT,
  security_deposit DECIMAL(10,2),
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('draft','active','paused','inactive')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `rental_bookings`
```sql
CREATE TABLE rental_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_listing_id UUID NOT NULL REFERENCES rental_listings(id),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  renter_id       UUID NOT NULL REFERENCES profiles(id),
  provider_id     UUID NOT NULL REFERENCES profiles(id),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  pickup_time     TIME,
  return_time     TIME,
  total_days      INT NOT NULL,
  daily_rate      DECIMAL(10,2) NOT NULL,
  total_amount    DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','active','completed',
                                    'cancelled','no_show')),
  cancellation_reason TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent overlapping confirmed bookings via application + DB constraint
  CONSTRAINT no_overlap_check CHECK (start_date < end_date)
);
```

### `rental_contracts`
```sql
CREATE TABLE rental_contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL UNIQUE REFERENCES rental_bookings(id),
  contract_url    TEXT,
  signed_by_renter BOOLEAN DEFAULT FALSE,
  signed_at_renter TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `rental_inspections`
```sql
CREATE TABLE rental_inspections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES rental_bookings(id),
  type        TEXT NOT NULL CHECK (type IN ('pickup','return')),
  fuel_level  INT CHECK (fuel_level BETWEEN 0 AND 100),
  mileage     INT,
  notes       TEXT,
  damage_notes TEXT,
  conducted_by UUID REFERENCES profiles(id),
  inspected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Auction System

### `auctions`
```sql
CREATE TABLE auctions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id     UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  type            TEXT DEFAULT 'standard'
                  CHECK (type IN ('standard','reserve','no_reserve','sealed_bid')),
  status          TEXT DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','registration_open',
                                    'live','ending','ended','cancelled','settled')),
  registration_start TIMESTAMPTZ,
  registration_end   TIMESTAMPTZ,
  start_time         TIMESTAMPTZ NOT NULL,
  end_time           TIMESTAMPTZ NOT NULL,
  timezone           TEXT DEFAULT 'UTC',
  terms_and_conditions TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);
```

### `auction_items`
```sql
CREATE TABLE auction_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id      UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
  lot_number      INT,
  title           TEXT NOT NULL,
  description     TEXT,
  reserve_price   DECIMAL(12,2),
  starting_bid    DECIMAL(12,2) NOT NULL DEFAULT 0,
  bid_increment   DECIMAL(10,2) NOT NULL DEFAULT 100,
  current_bid     DECIMAL(12,2),
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','active','sold','passed','cancelled')),
  winner_id       UUID REFERENCES profiles(id),
  winning_bid     DECIMAL(12,2),
  item_start_time TIMESTAMPTZ,
  item_end_time   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `auction_participants`
```sql
CREATE TABLE auction_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id      UUID NOT NULL REFERENCES auctions(id),
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  status          TEXT DEFAULT 'registered'
                  CHECK (status IN ('applied','registered','approved','rejected','banned')),
  registered_at   TIMESTAMPTZ DEFAULT NOW(),
  approved_at     TIMESTAMPTZ,
  approved_by     UUID REFERENCES profiles(id),
  UNIQUE(auction_id, profile_id)
);
```

### `bids`
**Immutable** — bids are never updated or deleted. Full audit trail.

```sql
CREATE TABLE bids (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_item_id UUID NOT NULL REFERENCES auction_items(id),
  auction_id      UUID NOT NULL REFERENCES auctions(id),
  bidder_id       UUID NOT NULL REFERENCES profiles(id),
  amount          DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  bid_type        TEXT DEFAULT 'manual' CHECK (bid_type IN ('manual','auto','system')),
  is_winning      BOOLEAN DEFAULT FALSE,
  placed_at       TIMESTAMPTZ DEFAULT NOW()
  -- NO updated_at — bids are immutable records
);
```

### `auction_results`
```sql
CREATE TABLE auction_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_item_id UUID NOT NULL UNIQUE REFERENCES auction_items(id),
  auction_id      UUID NOT NULL REFERENCES auctions(id),
  winner_id       UUID REFERENCES profiles(id),
  winning_bid_id  UUID REFERENCES bids(id),
  final_price     DECIMAL(12,2),
  currency        TEXT DEFAULT 'USD',
  result          TEXT NOT NULL CHECK (result IN ('sold','passed','cancelled')),
  settled         BOOLEAN DEFAULT FALSE,
  settled_at      TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Services Marketplace

### `service_categories`
```sql
CREATE TABLE service_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES service_categories(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `service_providers`
```sql
CREATE TABLE service_providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  business_name   TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  experience_years INT,
  is_mobile       BOOLEAN DEFAULT FALSE,  -- Can come to customer
  service_radius_km INT,
  rating          DECIMAL(3,2),
  review_count    INT DEFAULT 0,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `service_provider_services`
```sql
CREATE TABLE service_provider_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES service_categories(id),
  name            TEXT NOT NULL,
  description     TEXT,
  pricing_type    TEXT CHECK (pricing_type IN ('fixed','hourly','quote_based','starting_from')),
  price           DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  duration_hours  DECIMAL(4,1),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `service_requests`
```sql
CREATE TABLE service_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES profiles(id),
  vehicle_id      UUID REFERENCES vehicles(id),
  category_id     UUID REFERENCES service_categories(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  preferred_date  DATE,
  preferred_time  TEXT,
  location_city   TEXT,
  location_country TEXT,
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  budget_min      DECIMAL(10,2),
  budget_max      DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'open'
                  CHECK (status IN ('open','quoted','accepted','in_progress',
                                    'completed','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `service_quotes`
```sql
CREATE TABLE service_quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID NOT NULL REFERENCES service_requests(id),
  provider_id     UUID NOT NULL REFERENCES service_providers(id),
  customer_id     UUID NOT NULL REFERENCES profiles(id),
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  description     TEXT,
  estimated_days  INT,
  valid_until     TIMESTAMPTZ,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','rejected','withdrawn','expired')),
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `service_bookings`
```sql
CREATE TABLE service_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        UUID REFERENCES service_quotes(id),
  request_id      UUID REFERENCES service_requests(id),
  provider_id     UUID NOT NULL REFERENCES service_providers(id),
  customer_id     UUID NOT NULL REFERENCES profiles(id),
  vehicle_id      UUID REFERENCES vehicles(id),
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME,
  total_amount    DECIMAL(12,2),
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','in_progress','completed','cancelled','no_show')),
  completion_notes TEXT,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Parts Marketplace

### `part_categories`
```sql
CREATE TABLE part_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES part_categories(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `parts`
```sql
CREATE TABLE parts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  category_id     UUID NOT NULL REFERENCES part_categories(id),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  brand           TEXT,
  part_number     TEXT,
  description     TEXT,
  condition       TEXT CHECK (condition IN ('new','used','refurbished','oem','aftermarket')),
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  stock_quantity  INT DEFAULT 1,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','inactive','out_of_stock','discontinued')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `part_compatibility`
```sql
CREATE TABLE part_compatibility (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id     UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  make_id     UUID REFERENCES vehicle_makes(id),
  model_id    UUID REFERENCES vehicle_models(id),
  variant_id  UUID REFERENCES vehicle_variants(id),
  year_from   INT,
  year_to     INT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Garage System

### `user_vehicles` (Garage)
```sql
CREATE TABLE user_vehicles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id),
  vehicle_id  UUID REFERENCES vehicles(id),
  -- Denormalized fields for garage vehicles not yet in DB
  make_name   TEXT,
  model_name  TEXT,
  year        INT,
  nickname    TEXT,
  cover_image_url TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  current_mileage INT,
  is_primary  BOOLEAN DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `vehicle_service_history`
```sql
CREATE TABLE vehicle_service_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vehicle_id UUID NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
  service_booking_id UUID REFERENCES service_bookings(id),
  title           TEXT NOT NULL,
  type            TEXT CHECK (type IN ('maintenance','repair','inspection','upgrade','other')),
  date            DATE NOT NULL,
  mileage         INT,
  cost            DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  provider_name   TEXT,
  description     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `maintenance_reminders`
```sql
CREATE TABLE maintenance_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_vehicle_id UUID NOT NULL REFERENCES user_vehicles(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  due_date        DATE,
  due_mileage     INT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','completed','dismissed','overdue')),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Transactions & Payments

### `orders`
```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id        UUID NOT NULL REFERENCES profiles(id),
  seller_id       UUID NOT NULL REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  order_type      TEXT NOT NULL CHECK (order_type IN ('vehicle_sale','rental','service','part','membership')),
  reference_id    UUID,             -- Points to sale_listing, rental_booking, etc.
  reference_table TEXT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','paid','processing',
                                    'completed','cancelled','refunded','disputed')),
  subtotal        DECIMAL(12,2) NOT NULL,
  fees            DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `transactions`
```sql
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id),
  payment_intent_id TEXT,           -- Payment provider reference
  provider        TEXT,             -- 'stripe','paystack','flutterwave',etc.
  amount          DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          TEXT NOT NULL
                  CHECK (status IN ('pending','processing','succeeded','failed',
                                    'cancelled','refunded','partially_refunded')),
  failure_reason  TEXT,
  payment_method  TEXT,
  metadata        JSONB,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. Messaging

### `conversations`
```sql
CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT DEFAULT 'direct'
                CHECK (type IN ('direct','inquiry','service_request','rental','support')),
  reference_id  UUID,             -- Listing, service request, etc.
  reference_table TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### `conversation_participants`
```sql
CREATE TABLE conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  last_read_at    TIMESTAMPTZ,
  UNIQUE(conversation_id, profile_id)
);
```

### `messages`
```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),
  content         TEXT,
  message_type    TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','file','system')),
  is_edited       BOOLEAN DEFAULT FALSE,
  edited_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `message_attachments`
```sql
CREATE TABLE message_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url         TEXT NOT NULL,
  file_name   TEXT,
  file_size   INT,
  mime_type   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. Reviews & Ratings

### `reviews`
```sql
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id     UUID NOT NULL REFERENCES profiles(id),
  target_type     TEXT NOT NULL CHECK (target_type IN ('dealer','seller','rental_provider',
                                                        'service_provider','part_seller')),
  target_id       UUID NOT NULL,    -- References the relevant entity
  reference_type  TEXT,             -- 'sale','rental','service','part'
  reference_id    UUID,
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           TEXT,
  content         TEXT,
  status          TEXT DEFAULT 'published'
                  CHECK (status IN ('pending','published','hidden','removed')),
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `review_responses`
```sql
CREATE TABLE review_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES profiles(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 13. Verification

### `verification_requests`
```sql
CREATE TABLE verification_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  type            TEXT NOT NULL CHECK (type IN ('identity','business','dealer','professional')),
  requested_level TEXT NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','under_review','approved','rejected','needs_more_info')),
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  notes           TEXT,
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 14. Notifications

### `notifications`
```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB,
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  action_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 15. Membership

### `membership_plans`
```sql
CREATE TABLE membership_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  price_monthly   DECIMAL(10,2),
  price_yearly    DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  features        JSONB,            -- Flexible feature configuration
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `memberships`
```sql
CREATE TABLE memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  plan_id         UUID NOT NULL REFERENCES membership_plans(id),
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','cancelled','expired','paused')),
  billing_cycle   TEXT CHECK (billing_cycle IN ('monthly','yearly')),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 16. Key Indexes

```sql
-- Vehicle discovery
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type_id);
CREATE INDEX idx_vehicles_make ON vehicles(make_id);
CREATE INDEX idx_vehicles_model ON vehicles(model_id);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);

-- Sale listings
CREATE INDEX idx_sale_listings_status ON sale_listings(status);
CREATE INDEX idx_sale_listings_vehicle ON sale_listings(vehicle_id);
CREATE INDEX idx_sale_listings_seller ON sale_listings(seller_id);
CREATE INDEX idx_sale_listings_price ON sale_listings(price);
CREATE INDEX idx_sale_listings_published ON sale_listings(published_at DESC);

-- Auctions
CREATE INDEX idx_bids_item ON bids(auction_item_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_amount ON bids(auction_item_id, amount DESC);
CREATE INDEX idx_bids_placed ON bids(placed_at DESC);

-- Rental bookings
CREATE INDEX idx_rental_bookings_dates ON rental_bookings(rental_listing_id, start_date, end_date);
CREATE INDEX idx_rental_bookings_status ON rental_bookings(status);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_profile ON notifications(profile_id, is_read, created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
```

---

_Last updated: 2026-09-09_
_Status: Architecture Phase 0 — Schema Design Complete_
