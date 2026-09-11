-- ============================================================
-- DEBFORD — Migration 004
-- Helper Functions & Views
-- ============================================================

-- ── increment_listing_views ───────────────────────────────────
-- Called from server to safely increment view count
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE sale_listings
  SET views_count = views_count + 1
  WHERE id = listing_id;
$$;

-- ── mark_notifications_read ───────────────────────────────────
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE notifications
  SET is_read = true, read_at = now()
  WHERE user_id = p_user_id AND is_read = false;
$$;

-- ── get_auction_min_bid ───────────────────────────────────────
-- Returns the minimum valid next bid for an auction
CREATE OR REPLACE FUNCTION get_auction_min_bid(p_auction_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(current_bid, starting_price) + COALESCE(bid_increment, 100)
  FROM auctions
  WHERE id = p_auction_id;
$$;

-- ── User profile stats trigger ────────────────────────────────
-- Auto-update profiles.sales_count and profiles.listings_count

CREATE OR REPLACE FUNCTION update_seller_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update listings count on insert/delete
  IF TG_TABLE_NAME = 'sale_listings' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE profiles SET listings_count = COALESCE(listings_count, 0) + 1
      WHERE id = NEW.seller_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE profiles SET listings_count = GREATEST(COALESCE(listings_count, 0) - 1, 0)
      WHERE id = OLD.seller_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER tr_listing_stats
AFTER INSERT OR DELETE ON sale_listings
FOR EACH ROW EXECUTE FUNCTION update_seller_stats();

-- ── Listing views & saves view ────────────────────────────────
CREATE OR REPLACE VIEW listing_stats AS
SELECT
  sl.id                 AS listing_id,
  sl.title,
  sl.views_count,
  sl.saves_count,
  sl.inquiries_count,
  sl.price,
  sl.currency,
  sl.status,
  sl.seller_id,
  v.make_name,
  v.model_name,
  v.year
FROM sale_listings sl
JOIN vehicles v ON v.id = sl.vehicle_id;

-- ── Auction leaderboard view ──────────────────────────────────
CREATE OR REPLACE VIEW auction_leaderboard AS
SELECT
  ab.auction_id,
  ab.bidder_id,
  ab.amount,
  ab.created_at,
  ab.status,
  p.full_name AS bidder_name,
  ROW_NUMBER() OVER (PARTITION BY ab.auction_id ORDER BY ab.amount DESC) AS rank
FROM auction_bids ab
LEFT JOIN profiles p ON p.id = ab.bidder_id;

-- Grant access to the authenticated role
GRANT SELECT ON listing_stats TO authenticated;
GRANT SELECT ON auction_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION increment_listing_views TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_auction_min_bid TO anon, authenticated;

-- ── Vehicle taxonomy public read policies & seed ─────────────
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vehicle_types_public_read" ON vehicle_types;
CREATE POLICY "vehicle_types_public_read" ON vehicle_types FOR SELECT USING (true);

ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vehicle_categories_public_read" ON vehicle_categories;
CREATE POLICY "vehicle_categories_public_read" ON vehicle_categories FOR SELECT USING (true);

-- Seed vehicle types if missing
INSERT INTO vehicle_types (name, slug, icon, sort_order) VALUES
    ('Car', 'car', '🚗', 1),
    ('Motorcycle', 'motorcycle', '🏍️', 2),
    ('Truck', 'truck', '🚛', 3),
    ('Van', 'van', '🚐', 4),
    ('Bus', 'bus', '🚌', 5),
    ('RV / Motorhome', 'rv', '🚎', 6),
    ('Heavy Equipment', 'heavy-equipment', '🚜', 7),
    ('Boat / Marine', 'boat', '⛵', 8)
ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Allow vehicle_type_id to be nullable so vehicle publishing never crashes on missing taxonomy
ALTER TABLE vehicles ALTER COLUMN vehicle_type_id DROP NOT NULL;
