-- ============================================================
-- DEBFORD — Database Migration 012
-- Security: RLS Policies for Previously Unprotected Tables
-- ============================================================
-- 
-- Audit Finding: 14 tables were created in migration 001
-- without ENABLE ROW LEVEL SECURITY statements.
--
-- This is a FORWARD-ONLY migration. Do NOT modify earlier
-- migrations. Apply this after all previous migrations.
--
-- Deployment: Supabase SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
-- SECTION 1: HIGH SENSITIVITY — User & Business Data
-- These tables contain PII, financial data, or access control.
-- Strict least-privilege policies required.
-- ============================================================

-- CONVERSATIONS: Only participants can view or create
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_participant_select"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_auth_insert"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_participant_update"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = id
        AND cp.user_id = auth.uid()
    )
  );


-- CONVERSATION_PARTICIPANTS: Only participants can see who is in a conversation
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_participants_own_select"
  ON conversation_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_id
        AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "conv_participants_auth_insert"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- ORGANIZATIONS: Owner can manage; members can view their own org; public can see verified orgs
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_public_read"
  ON organizations FOR SELECT
  USING (is_active = true);

CREATE POLICY "organizations_owner_insert"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "organizations_owner_update"
  ON organizations FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "organizations_owner_delete"
  ON organizations FOR DELETE
  USING (auth.uid() = owner_id);


-- ORGANIZATION_MEMBERS: Only org owners and members can see membership records
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_member_select"
  ON organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id
        AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "org_members_owner_insert"
  ON organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id
        AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "org_members_owner_manage"
  ON organization_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id
        AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "org_members_owner_delete"
  ON organization_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id
        AND o.owner_id = auth.uid()
    )
  );


-- RENTAL_BOOKINGS: Renter can see own bookings; rental owner can see bookings for their fleet
ALTER TABLE rental_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rental_bookings_renter_select"
  ON rental_bookings FOR SELECT
  USING (
    renter_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rental_listings rl
      WHERE rl.id = rental_id
        AND rl.owner_id = auth.uid()
    )
  );

CREATE POLICY "rental_bookings_renter_insert"
  ON rental_bookings FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "rental_bookings_renter_update"
  ON rental_bookings FOR UPDATE
  USING (
    renter_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM rental_listings rl
      WHERE rl.id = rental_id
        AND rl.owner_id = auth.uid()
    )
  );


-- VEHICLE_DOCUMENTS: Only vehicle owner can access their documents
-- Public documents (is_public = true) are visible to all authenticated users
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_documents_owner_select"
  ON vehicle_documents FOR SELECT
  USING (
    owner_id = auth.uid()
    OR (
      is_public = true
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_id
          AND v.status = 'active'
      )
    )
  );

CREATE POLICY "vehicle_documents_owner_insert"
  ON vehicle_documents FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "vehicle_documents_owner_update"
  ON vehicle_documents FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "vehicle_documents_owner_delete"
  ON vehicle_documents FOR DELETE
  USING (auth.uid() = owner_id);


-- ============================================================
-- SECTION 2: MEDIUM SENSITIVITY — Service & Rental Listings
-- ============================================================

-- RENTAL_LISTINGS: Public read for published listings; owner manages their own
ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rental_listings_public_read"
  ON rental_listings FOR SELECT
  USING (status = 'published' OR auth.uid() = owner_id);

CREATE POLICY "rental_listings_owner_insert"
  ON rental_listings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "rental_listings_owner_update"
  ON rental_listings FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "rental_listings_owner_delete"
  ON rental_listings FOR DELETE
  USING (auth.uid() = owner_id);


-- SERVICE_PROVIDERS: Public read for active/verified providers; owner manages own profile
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_providers_public_read"
  ON service_providers FOR SELECT
  USING (is_active = true);

CREATE POLICY "service_providers_owner_insert"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "service_providers_owner_update"
  ON service_providers FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "service_providers_owner_delete"
  ON service_providers FOR DELETE
  USING (auth.uid() = owner_id);


-- ============================================================
-- SECTION 3: LOW SENSITIVITY — Read-Only Lookup Tables
-- These are platform configuration data (makes, models, etc.)
-- Public read is safe and required for search/filtering.
-- Only platform admins (via service role) should write.
-- ============================================================

-- VEHICLE_MAKES
ALTER TABLE vehicle_makes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_makes_public_read"
  ON vehicle_makes FOR SELECT
  USING (is_active = true);

-- Writes restricted to service role (admin client only, no user-level policy)


-- VEHICLE_MODELS
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_models_public_read"
  ON vehicle_models FOR SELECT
  USING (is_active = true);


-- VEHICLE_VARIANTS
ALTER TABLE vehicle_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_variants_public_read"
  ON vehicle_variants FOR SELECT
  USING (is_active = true);


-- VEHICLE_FEATURES: Attached to a vehicle; readable by anyone who can see the vehicle
ALTER TABLE vehicle_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_features_public_read"
  ON vehicle_features FOR SELECT
  USING (true);

CREATE POLICY "vehicle_features_owner_write"
  ON vehicle_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
        AND v.owner_id = auth.uid()
    )
  );


-- PARTS_CATEGORIES: Read-only lookup for parts marketplace
ALTER TABLE parts_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parts_categories_public_read"
  ON parts_categories FOR SELECT
  USING (true);


-- SERVICE_CATEGORIES: Read-only lookup for services marketplace
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_categories_public_read"
  ON service_categories FOR SELECT
  USING (true);


-- ============================================================
-- END OF MIGRATION 012
-- ============================================================
