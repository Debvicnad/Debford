-- ============================================================
-- DEBFORD — Migration 006: Services Marketplace, Quotes & Bookings
-- ============================================================
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- 1. SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL,
    title TEXT,
    description TEXT NOT NULL,
    vehicle_description TEXT NOT NULL,
    location TEXT NOT NULL,
    urgency TEXT DEFAULT 'flexible' CHECK (urgency IN ('flexible', 'this_week', 'urgent')),
    preferred_date DATE,
    preferred_time TEXT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICE QUOTES
CREATE TABLE IF NOT EXISTS public.service_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    parts_cost DECIMAL(10,2) DEFAULT 0.00,
    labor_cost DECIMAL(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    estimated_days INTEGER DEFAULT 1,
    valid_until TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'expired')),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICE BOOKINGS
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.service_quotes(id) ON DELETE SET NULL,
    request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TEXT,
    service_address TEXT,
    is_mobile_service BOOLEAN DEFAULT FALSE,
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON public.service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_type ON public.service_requests(service_type);

CREATE INDEX IF NOT EXISTS idx_service_quotes_request ON public.service_quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_service_quotes_provider ON public.service_quotes(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_quotes_customer ON public.service_quotes(customer_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_customer ON public.service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider ON public.service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.service_bookings(status);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Service Requests Policies
CREATE POLICY "Anyone can view open service requests"
    ON public.service_requests FOR SELECT
    USING (status = 'open' OR auth.uid() = customer_id);

CREATE POLICY "Users can create service requests"
    ON public.service_requests FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their service requests"
    ON public.service_requests FOR UPDATE
    USING (auth.uid() = customer_id);

-- Service Quotes Policies
CREATE POLICY "Users can view quotes for their own requests or submitted by them"
    ON public.service_quotes FOR SELECT
    USING (
        auth.uid() = customer_id OR
        EXISTS (
            SELECT 1 FROM public.service_providers
            WHERE service_providers.id = service_quotes.provider_id
            AND service_providers.user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can create quotes"
    ON public.service_quotes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.service_providers
            WHERE service_providers.id = service_quotes.provider_id
            AND service_providers.user_id = auth.uid()
        )
    );

CREATE POLICY "Providers or Customers can update quotes"
    ON public.service_quotes FOR UPDATE
    USING (
        auth.uid() = customer_id OR
        EXISTS (
            SELECT 1 FROM public.service_providers
            WHERE service_providers.id = service_quotes.provider_id
            AND service_providers.user_id = auth.uid()
        )
    );

-- Service Bookings Policies
CREATE POLICY "Users can view their own bookings"
    ON public.service_bookings FOR SELECT
    USING (
        auth.uid() = customer_id OR
        EXISTS (
            SELECT 1 FROM public.service_providers
            WHERE service_providers.id = service_bookings.provider_id
            AND service_providers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create bookings"
    ON public.service_bookings FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Parties can update their bookings"
    ON public.service_bookings FOR UPDATE
    USING (
        auth.uid() = customer_id OR
        EXISTS (
            SELECT 1 FROM public.service_providers
            WHERE service_providers.id = service_bookings.provider_id
            AND service_providers.user_id = auth.uid()
        )
    );
