-- ============================================================
-- 008_commercial_auctions.sql
-- DEBFORD: Phase 6 Commercial & Collector Auctions Schema
-- ============================================================

-- 1. Create auctions table if not exists
create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  title text not null,
  description text,
  starting_price numeric not null check (starting_price >= 0),
  reserve_price numeric check (reserve_price is null or reserve_price >= 0),
  buy_now_price numeric check (buy_now_price is null or buy_now_price > starting_price),
  bid_increment numeric not null default 100 check (bid_increment > 0),
  current_bid numeric check (current_bid is null or current_bid >= 0),
  current_bidder_id uuid references public.profiles(id) on delete set null,
  bids_count integer not null default 0 check (bids_count >= 0),
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'registration', 'live', 'ended', 'settled', 'cancelled')),
  requires_registration boolean not null default false,
  registration_deadline timestamptz,
  max_participants integer check (max_participants is null or max_participants > 0),
  winner_id uuid references public.profiles(id) on delete set null,
  settlement_amount numeric check (settlement_amount is null or settlement_amount >= 0),
  settlement_notes text,
  settled_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create auction_bids table
create table if not exists public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null check (amount > 0),
  status text not null default 'active' check (status in ('active', 'lost', 'won', 'retracted')),
  created_at timestamptz not null default now()
);

-- 3. Create auction_participants table
create table if not exists public.auction_participants (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  unique(auction_id, user_id)
);

-- Indexes for performance
create index if not exists idx_auctions_status on public.auctions(status);
create index if not exists idx_auctions_seller_id on public.auctions(seller_id);
create index if not exists idx_auctions_ends_at on public.auctions(ends_at);
create index if not exists idx_auction_bids_auction_id on public.auction_bids(auction_id);
create index if not exists idx_auction_bids_bidder_id on public.auction_bids(bidder_id);
create index if not exists idx_auction_participants_auction_id on public.auction_participants(auction_id);
create index if not exists idx_auction_participants_user_id on public.auction_participants(user_id);

-- Enable RLS
alter table public.auctions enable row level security;
alter table public.auction_bids enable row level security;
alter table public.auction_participants enable row level security;

-- Auctions policies
create policy "Anyone can read published or live auctions"
  on public.auctions for select
  using (status in ('scheduled', 'registration', 'live', 'ended', 'settled') or auth.uid() = seller_id);

create policy "Operators can insert auctions"
  on public.auctions for insert
  with check (auth.uid() = seller_id);

create policy "Operators can update their own auctions"
  on public.auctions for update
  using (auth.uid() = seller_id or exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator')
  ));

-- Auction Bids policies
create policy "Anyone can read bids for public auctions"
  on public.auction_bids for select
  using (exists (
    select 1 from public.auctions where id = auction_bids.auction_id and status in ('scheduled', 'registration', 'live', 'ended', 'settled')
  ));

create policy "Authenticated users can place bids"
  on public.auction_bids for insert
  with check (auth.uid() = bidder_id);

-- Auction Participants policies
create policy "Users can view their own participant record or operator views all"
  on public.auction_participants for select
  using (
    auth.uid() = user_id or exists (
      select 1 from public.auctions where id = auction_participants.auction_id and seller_id = auth.uid()
    )
  );

create policy "Authenticated users can apply for participation"
  on public.auction_participants for insert
  with check (auth.uid() = user_id);

create policy "Operators can update participant status"
  on public.auction_participants for update
  using (
    exists (
      select 1 from public.auctions where id = auction_participants.auction_id and seller_id = auth.uid()
    )
  );

-- Realtime setup
alter publication supabase_realtime add table public.auctions;
alter publication supabase_realtime add table public.auction_bids;
alter publication supabase_realtime add table public.auction_participants;
