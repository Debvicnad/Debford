-- ============================================================
-- DEBFORD — Fix: handle_new_user Trigger & Profiles Insert Policy
-- ============================================================
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- 1. Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create fixed function with explicit search_path and safe role parsing
CREATE OR REPLACE FUNCTION public.handle_new_user()
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

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  )
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
  -- Prevent database error from bricking auth signup
  RAISE WARNING 'handle_new_user encountered error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Re-create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure INSERT policy exists for profiles table
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (true);

-- 5. Backfill any existing users in auth.users that don't have a profile yet
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  id,
  COALESCE(email, ''),
  COALESCE(raw_user_meta_data->>'full_name', split_part(COALESCE(email, ''), '@', 1)),
  CASE
    WHEN (raw_user_meta_data->>'role') IN ('buyer', 'seller', 'dealer', 'service_provider', 'parts_seller', 'auctioneer', 'admin')
      THEN (raw_user_meta_data->>'role')::public.user_role
    ELSE 'buyer'::public.user_role
  END
FROM auth.users
ON CONFLICT (id) DO NOTHING;
