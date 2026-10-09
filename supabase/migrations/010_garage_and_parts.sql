-- ============================================================
-- 010_garage_and_parts.sql
-- DEBFORD: Phase 7 -- Garage & Parts Marketplace Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- ============================================================
-- GARAGE: MAINTENANCE REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vehicle_maintenance_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_type TEXT NOT NULL DEFAULT 'custom'
        CHECK (reminder_type IN (
            'oil_change', 'tyre_rotation', 'brake_inspection',
            'air_filter', 'timing_belt', 'battery', 'wiper_blades',
            'coolant_flush', 'transmission_fluid', 'registration_renewal',
            'insurance_renewal', 'mot_service', 'custom'
        )),
    due_date DATE,
    due_mileage INTEGER,
    interval_days INTEGER,
    interval_mileage INTEGER,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_notified_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GARAGE: SERVICE HISTORY RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vehicle_service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_booking_id UUID REFERENCES public.service_bookings(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    service_date DATE NOT NULL,
    service_provider TEXT,
    service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
    mileage_at_service INTEGER,
    cost DECIMAL(10, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    parts_replaced TEXT[],
    receipt_url TEXT,
    is_auto_synced BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GARAGE: EXPENSE TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vehicle_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'other'
        CHECK (category IN (
            'fuel', 'insurance', 'maintenance', 'repairs', 'tyres',
            'registration', 'parking', 'tolls', 'detailing', 'parts', 'other'
        )),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mileage_at_expense INTEGER,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARTS MARKETPLACE: CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.part_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.part_categories(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARTS MARKETPLACE: LISTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parts_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.part_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    part_number TEXT,
    brand TEXT,
    oem_cross_reference TEXT[],
    condition TEXT NOT NULL DEFAULT 'new'
        CHECK (condition IN ('new', 'oem', 'refurbished', 'used')),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    compatibility_description TEXT,
    compatible_makes TEXT[],
    compatible_models TEXT[],
    compatible_years_from INTEGER,
    compatible_years_to INTEGER,
    stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
    weight_grams INTEGER,
    ships_from TEXT,
    shipping_notes TEXT,
    material TEXT,
    country_of_origin TEXT,
    install_time_minutes INTEGER,
    special_tools_required TEXT[],
    warranty TEXT,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'sold_out', 'draft', 'archived')),
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARTS MARKETPLACE: IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parts_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL REFERENCES public.parts_listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARTS MARKETPLACE: ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parts_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES public.parts_listings(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    shipping_address TEXT,
    shipping_method TEXT,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tracking_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'payment_received', 'processing',
            'shipped', 'delivered', 'cancelled', 'refunded', 'disputed'
        )),
    stripe_payment_intent_id TEXT,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARTS MARKETPLACE: REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parts_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL REFERENCES public.parts_listings(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.parts_orders(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    body TEXT,
    verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (part_id, reviewer_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vmr_vehicle_id ON public.vehicle_maintenance_reminders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vmr_owner_id ON public.vehicle_maintenance_reminders(owner_id);
CREATE INDEX IF NOT EXISTS idx_vmr_due_date ON public.vehicle_maintenance_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_vsh_vehicle_id ON public.vehicle_service_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vsh_owner_id ON public.vehicle_service_history(owner_id);
CREATE INDEX IF NOT EXISTS idx_vsh_service_date ON public.vehicle_service_history(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_ve_vehicle_id ON public.vehicle_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_ve_owner_id ON public.vehicle_expenses(owner_id);
CREATE INDEX IF NOT EXISTS idx_ve_category ON public.vehicle_expenses(category);
CREATE INDEX IF NOT EXISTS idx_ve_expense_date ON public.vehicle_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_pl_seller_id ON public.parts_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_pl_category_id ON public.parts_listings(category_id);
CREATE INDEX IF NOT EXISTS idx_pl_condition ON public.parts_listings(condition);
CREATE INDEX IF NOT EXISTS idx_pl_status ON public.parts_listings(status);
CREATE INDEX IF NOT EXISTS idx_pl_price ON public.parts_listings(price);
CREATE INDEX IF NOT EXISTS idx_pl_brand ON public.parts_listings(brand);
CREATE INDEX IF NOT EXISTS idx_pl_fts
    ON public.parts_listings
    USING GIN(to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(compatibility_description, '') || ' ' ||
        coalesce(brand, '')
    ));
CREATE INDEX IF NOT EXISTS idx_pi_part_id ON public.parts_images(part_id);
CREATE INDEX IF NOT EXISTS idx_po_buyer_id ON public.parts_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_po_seller_id ON public.parts_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_po_part_id ON public.parts_orders(part_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON public.parts_orders(status);
CREATE INDEX IF NOT EXISTS idx_pr_part_id ON public.parts_reviews(part_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.vehicle_maintenance_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_manage_reminders" ON public.vehicle_maintenance_reminders
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "owner_manage_service_history" ON public.vehicle_service_history
    FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "public_read_service_history" ON public.vehicle_service_history
    FOR SELECT USING (true);

CREATE POLICY "owner_private_expenses" ON public.vehicle_expenses
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "public_read_part_categories" ON public.part_categories
    FOR SELECT USING (true);
CREATE POLICY "admin_manage_part_categories" ON public.part_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "public_read_active_parts" ON public.parts_listings
    FOR SELECT USING (status IN ('active', 'sold_out'));
CREATE POLICY "seller_manage_own_parts" ON public.parts_listings
    FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "public_read_parts_images" ON public.parts_images
    FOR SELECT USING (true);
CREATE POLICY "seller_manage_parts_images" ON public.parts_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.parts_listings
            WHERE id = part_id AND seller_id = auth.uid()
        )
    );

CREATE POLICY "buyer_manage_own_parts_orders" ON public.parts_orders
    FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "seller_read_own_parts_orders" ON public.parts_orders
    FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "seller_update_own_parts_orders" ON public.parts_orders
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "public_read_parts_reviews" ON public.parts_reviews
    FOR SELECT USING (true);
CREATE POLICY "reviewer_manage_own_reviews" ON public.parts_reviews
    FOR ALL USING (auth.uid() = reviewer_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_vmr_updated_at') THEN
        CREATE TRIGGER set_vmr_updated_at
            BEFORE UPDATE ON public.vehicle_maintenance_reminders
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_vsh_updated_at') THEN
        CREATE TRIGGER set_vsh_updated_at
            BEFORE UPDATE ON public.vehicle_service_history
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_ve_updated_at') THEN
        CREATE TRIGGER set_ve_updated_at
            BEFORE UPDATE ON public.vehicle_expenses
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_pl_updated_at') THEN
        CREATE TRIGGER set_pl_updated_at
            BEFORE UPDATE ON public.parts_listings
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_po_updated_at') THEN
        CREATE TRIGGER set_po_updated_at
            BEFORE UPDATE ON public.parts_orders
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END;
$$;

-- ============================================================
-- SEED: DEFAULT PART CATEGORIES
-- ============================================================
INSERT INTO public.part_categories (name, slug, description, icon, sort_order)
VALUES
    ('Engine',          'engine',          'Engine components, filters, gaskets, oil, pistons',           'Flame',          1),
    ('Brakes',          'brakes',          'Brake pads, rotors, callipers, lines, fluids',                'Disc',           2),
    ('Suspension',      'suspension',      'Shock absorbers, springs, bushings, control arms',            'Zap',            3),
    ('Electrical',      'electrical',      'Batteries, alternators, sensors, ignition coils',             'Cpu',            4),
    ('Body Parts',      'body-parts',      'Bumpers, panels, doors, mirrors, grilles',                   'Car',            5),
    ('Lighting',        'lighting',        'Headlights, tail lights, LEDs, fog lights',                  'Sun',            6),
    ('Interior',        'interior',        'Seats, dashboards, trim, mats, steering wheels',             'LayoutDashboard',7),
    ('Tyres & Wheels',  'tyres-wheels',    'Tyres, alloy wheels, steel rims, TPMS sensors',              'Circle',         8),
    ('Exhaust',         'exhaust',         'Exhaust pipes, mufflers, catalytic converters, headers',     'Wind',           9),
    ('Cooling',         'cooling',         'Radiators, water pumps, thermostats, coolant reservoirs',    'Droplets',      10),
    ('Transmission',    'transmission',    'Gearbox components, clutch kits, driveshafts, CV joints',    'Settings',      11),
    ('Accessories',     'accessories',     'Towbars, roof racks, dash cams, seat covers, mats',          'Package',       12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- END: 010_garage_and_parts.sql
-- ============================================================
