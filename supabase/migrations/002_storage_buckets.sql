-- ============================================================
-- DEBFORD — Migration 002
-- Supabase Storage Buckets & Policies
-- ============================================================
-- Run this AFTER 001_core_schema.sql in your Supabase SQL Editor
-- ============================================================

-- Create the vehicle-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,                                        -- Public bucket (images are public)
  10485760,                                    -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS Policies ──────────────────────────────────────

-- Anyone can read vehicle images (they are public)
CREATE POLICY "vehicle_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

-- Authenticated owners can upload to their own folder
CREATE POLICY "vehicle_images_owner_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Owners can update their own images
CREATE POLICY "vehicle_images_owner_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Owners can delete their own images
CREATE POLICY "vehicle_images_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ── Documents bucket ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-documents',
  'vehicle-documents',
  false,                                       -- Private bucket
  20971520,                                    -- 20 MB per file
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Only the document owner can read
CREATE POLICY "vehicle_documents_owner_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vehicle-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "vehicle_documents_owner_write"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "vehicle_documents_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ── Avatar bucket ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,                                     -- 2 MB per avatar
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_write"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_owner_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
