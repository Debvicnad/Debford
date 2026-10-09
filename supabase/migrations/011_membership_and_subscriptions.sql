-- ============================================================
-- 011_membership_and_subscriptions.sql
-- DEBFORD: Phase 8 -- Membership & Subscription Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- ============================================================
-- STEP 1: Extend profiles with subscription columns
-- (membership_tier already exists from 001_core_schema.sql)
-- ============================================================
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS subscription_status TEXT
        CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled', 'expired', NULL)),
    ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS subscription_stripe_id TEXT,   -- Stripe Subscription ID
    ADD COLUMN IF NOT EXISTS billing_cycle TEXT
        CHECK (billing_cycle IN ('monthly', 'annual', NULL));

-- ============================================================
-- STEP 2: MEMBERSHIP PLANS (admin-configured)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier TEXT NOT NULL UNIQUE
        CHECK (tier IN ('free', 'basic', 'pro', 'enterprise')),
    name TEXT NOT NULL,
    description TEXT,
    -- Pricing
    price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price_annual DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    -- Stripe price IDs for Checkout Sessions
    stripe_price_monthly TEXT,
    stripe_price_annual TEXT,
    -- Feature limits
    listings_limit INTEGER,          -- NULL = unlimited
    featured_listings INTEGER DEFAULT 0,
    photo_uploads_per_listing INTEGER DEFAULT 10,
    auction_bids_per_month INTEGER,
    can_access_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    can_access_crm BOOLEAN NOT NULL DEFAULT FALSE,
    can_list_rental BOOLEAN NOT NULL DEFAULT FALSE,
    can_list_parts BOOLEAN NOT NULL DEFAULT FALSE,
    can_list_services BOOLEAN NOT NULL DEFAULT FALSE,
    response_time_hours INTEGER,     -- Promised response SLA
    -- Display
    badge_label TEXT,                -- "Pro Dealer", "Enterprise Fleet"
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 3: SUBSCRIPTION EVENTS (audit log for billing changes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL
        CHECK (event_type IN (
            'subscribed', 'upgraded', 'downgraded', 'renewed',
            'cancelled', 'payment_failed', 'trial_started', 'trial_ended'
        )),
    from_tier TEXT,
    to_tier TEXT,
    billing_cycle TEXT,
    amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    stripe_event_id TEXT,
    stripe_invoice_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 4: MEMBERSHIP BENEFIT USAGE TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.membership_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,  -- Start of usage period (first day of month)
    period_end DATE NOT NULL,    -- End of usage period (last day of month)
    listings_used INTEGER NOT NULL DEFAULT 0,
    featured_listings_used INTEGER NOT NULL DEFAULT 0,
    bids_placed INTEGER NOT NULL DEFAULT 0,
    service_requests_posted INTEGER NOT NULL DEFAULT 0,
    parts_listings_active INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, period_start)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
    ON public.profiles(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
    ON public.profiles(subscription_status)
    WHERE subscription_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier
    ON public.profiles(membership_tier);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id
    ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at
    ON public.subscription_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_event_id
    ON public.subscription_events(stripe_event_id)
    WHERE stripe_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_membership_usage_user_id
    ON public.membership_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_usage_period
    ON public.membership_usage(period_start DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_usage ENABLE ROW LEVEL SECURITY;

-- Membership Plans: public read (anyone can see plan details), admin write
CREATE POLICY "public_read_membership_plans" ON public.membership_plans
    FOR SELECT USING (is_active = TRUE);
CREATE POLICY "admin_manage_membership_plans" ON public.membership_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subscription Events: user reads own, admin reads all, service role inserts
CREATE POLICY "user_read_own_subscription_events" ON public.subscription_events
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_read_all_subscription_events" ON public.subscription_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
CREATE POLICY "service_insert_subscription_events" ON public.subscription_events
    FOR INSERT WITH CHECK (true);

-- Membership Usage: user reads own
CREATE POLICY "user_read_own_membership_usage" ON public.membership_usage
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_manage_membership_usage" ON public.membership_usage
    FOR ALL USING (true);

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
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_membership_plans_updated_at') THEN
        CREATE TRIGGER set_membership_plans_updated_at
            BEFORE UPDATE ON public.membership_plans
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_membership_usage_updated_at') THEN
        CREATE TRIGGER set_membership_usage_updated_at
            BEFORE UPDATE ON public.membership_usage
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END;
$$;

-- ============================================================
-- SEED: DEFAULT MEMBERSHIP PLANS
-- ============================================================
INSERT INTO public.membership_plans
    (tier, name, description, price_monthly, price_annual, currency,
     listings_limit, featured_listings, photo_uploads_per_listing,
     auction_bids_per_month, can_access_analytics, can_access_crm,
     can_list_rental, can_list_parts, can_list_services,
     response_time_hours, badge_label, is_popular, sort_order)
VALUES
    (
        'free', 'Free Tier',
        'Get started with basic vehicle listings and browsing.',
        0, 0, 'USD',
        3, 0, 6, 5,
        FALSE, FALSE, FALSE, FALSE, FALSE,
        NULL, NULL, FALSE, 1
    ),
    (
        'basic', 'Basic Seller',
        'For private sellers — more listings, more photos, and verified seller badge.',
        19, 180, 'USD',
        15, 2, 12, 20,
        FALSE, FALSE, FALSE, TRUE, FALSE,
        48, 'Verified Seller', FALSE, 2
    ),
    (
        'pro', 'Pro Dealer',
        'Full dealership toolkit with analytics, CRM, rental and parts listings.',
        49, 468, 'USD',
        100, 10, 20, 100,
        TRUE, TRUE, TRUE, TRUE, TRUE,
        24, 'Pro Dealer', TRUE, 3
    ),
    (
        'enterprise', 'Enterprise Fleet',
        'Unlimited listings, priority support, white-glove onboarding for large fleets.',
        199, 1908, 'USD',
        NULL, 50, 40, NULL,
        TRUE, TRUE, TRUE, TRUE, TRUE,
        4, 'Enterprise Fleet', FALSE, 4
    )
ON CONFLICT (tier) DO UPDATE
    SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price_monthly = EXCLUDED.price_monthly,
        price_annual = EXCLUDED.price_annual,
        listings_limit = EXCLUDED.listings_limit,
        featured_listings = EXCLUDED.featured_listings,
        is_popular = EXCLUDED.is_popular,
        updated_at = NOW();

-- ============================================================
-- END: 011_membership_and_subscriptions.sql
-- ============================================================
