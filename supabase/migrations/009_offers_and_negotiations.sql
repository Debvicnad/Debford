-- ============================================================
-- 009_offers_and_negotiations.sql
-- DEBFORD: Phase 3 Sell/Buy Offers & Ownership Transfers Schema
-- ============================================================

-- 1. Create vehicle_offers table
create table if not exists public.vehicle_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null check (amount > 0),
  original_price numeric not null check (original_price > 0),
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired')),
  counter_amount numeric check (counter_amount is null or counter_amount > 0),
  notes text,
  counter_notes text,
  contingencies text,
  expires_at timestamptz default (now() + interval '7 days'),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create ownership_transfers table
create table if not exists public.ownership_transfers (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  offer_id uuid references public.vehicle_offers(id) on delete set null,
  amount numeric check (amount is null or amount >= 0),
  currency text default 'USD',
  transfer_date timestamptz default now(),
  vin text,
  status text not null default 'pending' check (status in ('pending', 'in_escrow', 'completed', 'cancelled')),
  escrow_reference text,
  handover_notes text,
  created_at timestamptz not null default now()
);

-- Indexes for fast querying
create index if not exists idx_vehicle_offers_listing on public.vehicle_offers(listing_id);
create index if not exists idx_vehicle_offers_buyer on public.vehicle_offers(buyer_id);
create index if not exists idx_vehicle_offers_seller on public.vehicle_offers(seller_id);
create index if not exists idx_vehicle_offers_status on public.vehicle_offers(status);
create index if not exists idx_ownership_transfers_vehicle on public.ownership_transfers(vehicle_id);
create index if not exists idx_ownership_transfers_from_user on public.ownership_transfers(from_user_id);
create index if not exists idx_ownership_transfers_to_user on public.ownership_transfers(to_user_id);

-- Enable RLS
alter table public.vehicle_offers enable row level security;
alter table public.ownership_transfers enable row level security;

-- Offers RLS policies: buyer and seller can access their own offers
create policy "Buyers and sellers can view their offers"
  on public.vehicle_offers for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Authenticated buyers can create offers"
  on public.vehicle_offers for insert
  with check (auth.uid() = buyer_id);

create policy "Buyers and sellers can update their offers"
  on public.vehicle_offers for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Ownership transfers RLS policies
create policy "Parties can view their ownership transfers"
  on public.ownership_transfers for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Parties can insert ownership transfers"
  on public.ownership_transfers for insert
  with check (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Realtime publication
alter publication supabase_realtime add table public.vehicle_offers;
alter publication supabase_realtime add table public.ownership_transfers;
