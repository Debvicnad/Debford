-- ============================================================
-- DEBFORD — Migration 003
-- Realtime Subscriptions
-- ============================================================
-- Run after 002_storage_buckets.sql
-- ============================================================

-- Enable Supabase Realtime on the tables that need live updates

-- Auction bids: live bidding feed
ALTER PUBLICATION supabase_realtime ADD TABLE auction_bids;

-- Auctions: current bid / status changes
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;

-- Messages: real-time chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Notifications: push to user
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- Realtime RLS note:
-- The Realtime server respects RLS policies. Clients will only
-- receive change events for rows they are allowed to SELECT.
-- No additional policy setup needed — existing RLS covers it.
-- ============================================================
