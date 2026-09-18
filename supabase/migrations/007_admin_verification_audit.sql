-- ============================================================
-- DEBFORD — Migration 007: Admin Verification & Audit Logging
-- ============================================================
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- 1. KYC APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.kyc_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    application_type TEXT NOT NULL CHECK (application_type IN ('individual_id', 'dealer_license')),
    full_name TEXT NOT NULL,
    id_type TEXT CHECK (id_type IN ('passport', 'driver_license', 'national_id')),
    id_number TEXT,
    issuing_country TEXT,
    business_name TEXT,
    license_number TEXT,
    business_type TEXT,
    city TEXT,
    country TEXT,
    document_urls JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_name TEXT NOT NULL DEFAULT 'Administrator',
    action_type TEXT NOT NULL CHECK (
        action_type IN (
            'approve_listing',
            'reject_listing',
            'verify_kyc',
            'reject_kyc',
            'verify_provider',
            'reject_provider',
            'change_user_role',
            'bulk_approve_listings'
        )
    ),
    target_type TEXT NOT NULL CHECK (
        target_type IN ('listing', 'user_kyc', 'service_provider', 'user_account')
    ),
    target_id TEXT NOT NULL,
    target_title TEXT NOT NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON public.kyc_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON public.kyc_applications(status);
CREATE INDEX IF NOT EXISTS idx_kyc_created_at ON public.kyc_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.admin_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.kyc_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- KYC Applications RLS
DROP POLICY IF EXISTS "Users can view own KYC applications" ON public.kyc_applications;
CREATE POLICY "Users can view own KYC applications"
    ON public.kyc_applications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own KYC applications" ON public.kyc_applications;
CREATE POLICY "Users can insert own KYC applications"
    ON public.kyc_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to KYC applications" ON public.kyc_applications;
CREATE POLICY "Admins have full access to KYC applications"
    ON public.kyc_applications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Audit Logs RLS
DROP POLICY IF EXISTS "Admins have full access to audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins have full access to audit logs"
    ON public.admin_audit_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
