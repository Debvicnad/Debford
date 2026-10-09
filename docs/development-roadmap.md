# DEBFORD â€” Development Roadmap

---

## Overview

Debford is built in progressive phases. Each phase produces working, tested, and secure functionality.

No phase begins in earnest until the previous phase is stable and coherent.

---

## PHASE 0 â€” Architecture & Documentation âœ… COMPLETE

**Goal:** Establish the engineering foundation before writing application code.

### Deliverables
- [x] Product Requirements Document (`docs/product-requirements.md`)
- [x] Technical Architecture (`docs/technical-architecture.md`)
- [x] Database Schema (`docs/database-schema.md`)
- [x] Security Model (`docs/security-model.md`)
- [x] Development Roadmap (`docs/development-roadmap.md`)
- [x] Design System (`docs/design-system.md`)
- [x] Entity Relationship Diagram (`docs/erd.md`)

---

## PHASE 1 â€” Foundation âœ… COMPLETE

**Goal:** Working application shell with authentication, profiles, roles, and admin scaffold.

### Features
- [x] Project initialization (Next.js + TypeScript + Tailwind)
- [x] Supabase project creation and local CLI setup
- [x] Environment variables setup (`.env.example`)
- [x] Design system implementation (tokens, typography, components)
- [x] Global layout (Navbar, Footer, MobileBottomNav)
- [x] Authentication pages (sign up, sign in, sign out, reset password)
- [x] Supabase Auth integration with SSR
- [x] User profiles (create, read, update) â€” `ProfileClient`
- [x] Role system (`profiles.role`)
- [x] Protected routes (Next.js middleware)
- [x] Organizations (create, manage)
- [x] Organization members
- [x] Admin panel foundation â€” `AdminDashboardHub`, user controls, audit log
- [x] Notification system â€” `NotificationsHubClient`
- [x] Basic RLS policies for profiles, organizations

---

## PHASE 2 â€” Vehicle Marketplace âœ… COMPLETE

**Goal:** Core vehicle catalog with listings, search, filtering, and vehicle detail pages.

### Features
- [x] Vehicle taxonomy (types, categories, makes, models, variants)
- [x] Admin: Manage vehicle categories, makes, models
- [x] Vehicle record creation
- [x] Vehicle image upload (Supabase Storage)
- [x] Vehicle features
- [x] Vehicle documents
- [x] Sale listings (create, edit, publish) â€” multi-step `SellWizard`
- [x] Listing states (draft â†’ review â†’ published â†’ sold)
- [x] Vehicle search and advanced filters â€” `SearchPage`
- [x] Vehicle listing page (grid/list view) â€” `VehiclesPage`
- [x] Vehicle detail page (gallery, specs, seller info, CTA)
- [x] Listing favorites â€” `SavedPage`
- [x] Vehicle comparison â€” `ComparePage`
- [x] Dealer profile pages â€” `DealershipPage`
- [x] Private seller profiles
- [x] Listing views tracking
- [x] Listing inquiries â€” Messages integration
- [x] Seed data (makes, models, test listings)
- [x] RLS for vehicles and listings

---

## PHASE 3 â€” Sell / Buy âœ… COMPLETE

**Goal:** Full buy/sell workflow including offers, orders, and payment architecture.

### Features
- [x] Seller dashboard (my listings, inquiries, offers) â€” `DashboardPage`
- [x] Dealer inventory management dashboard â€” `DealershipPage`
- [x] Offer system (make offer, counter, accept, reject) â€” `OffersManagementClient`
- [x] Order creation
- [x] Transaction states
- [x] Payment abstraction layer â€” Stripe integration via `stripe.actions.ts`
- [x] Payment integration (Stripe Checkout)
- [x] Payment webhook handling (Edge Function)
- [x] Invoice generation
- [x] Sold vehicle status propagation
- [x] Ownership transfer record â€” `009_offers_and_negotiations.sql`

---

## PHASE 4 â€” Rentals âœ… COMPLETE

**Goal:** Full vehicle rental system with availability, booking, and inspection.

### Features
- [x] Rental listing creation and management
- [x] Rental rates (daily/weekly/monthly)
- [x] Availability calendar
- [x] Booking request â€” `RentalBookingForm`
- [x] Provider approval/rejection
- [x] Double-booking prevention
- [x] Rental booking workflow (pending â†’ confirmed â†’ active â†’ completed)
- [x] Rental contracts
- [x] Pre/post rental inspections
- [x] Rental dashboard (provider)
- [x] My bookings (renter)
- [x] Rental cancellation handling
- [x] RLS for rental tables

---

## PHASE 5 â€” Services Marketplace âœ… COMPLETE

**Goal:** Full automotive services marketplace with provider profiles, requests, quotes, and bookings.

### Features
- [x] Service categories (admin managed)
- [x] Service provider registration and profile â€” `ProvidersDirectoryClient`
- [x] Service listings â€” `services/[id]`
- [x] Service request creation (customer) â€” `ServiceRequestWizard`
- [x] Multi-provider quote system â€” `ServiceRequestsHubClient`
- [x] Quote comparison â€” `ServiceQuoteCard`
- [x] Booking creation from accepted quote â€” `acceptServiceQuote`
- [x] Service booking workflow
- [x] Provider dashboard
- [x] Service reviews and ratings â€” `ReviewsClient`
- [x] Provider verification
- [x] Provider portfolio (work images) â€” `ProviderDetailView`
- [x] RLS for service tables â€” `006_services_marketplace.sql`

---

## PHASE 6 â€” Commercial Auctions âœ… COMPLETE

**Goal:** Full commercial vehicle auction system with live bidding, real-time updates, and settlement.

### Features
- [x] Auction creation and configuration â€” `AuctionCreateWizard`
- [x] Auction item (vehicle) registration
- [x] Participant registration and approval
- [x] Auction state management (draft â†’ scheduled â†’ registration â†’ live â†’ ended)
- [x] Bidding (immutable bid records) â€” `LiveBiddingPanel`
- [x] Minimum bid increment enforcement
- [x] Reserve price logic
- [x] Supabase Realtime live bid updates
- [x] Auction countdown timer â€” `useCountdown`
- [x] Bid validation (active auction, eligible participant, min amount)
- [x] Auction closing (Edge Function, bid after close rejected)
- [x] Winner determination
- [x] Settlement workflow â€” `AuctionManagerClient`
- [x] Auction operator dashboard â€” `auctions/manage`
- [x] Auction history â€” `auctions?tab=ended`
- [x] RLS for auction tables â€” `008_commercial_auctions.sql`

---

## PHASE 7 â€” Garage & Parts âœ… COMPLETE

**Goal:** Personal vehicle ownership management and parts marketplace.

### Features
- [x] My Garage (add vehicles, manage) â€” `GaragePage`
- [x] Garage vehicle detail (specs, notes, mileage) â€” `GarageVehicleClient`
- [x] Service history (manual + auto from bookings) â€” `addVehicleServiceRecord`
- [x] Maintenance reminders â€” `addMaintenanceReminder`, `completeMaintenanceReminder`
- [x] Vehicle expense tracking â€” `addVehicleExpense`
- [x] Vehicle documents in garage â€” `addVehicleDocument`
- [x] Parts categories (admin managed) â€” `part_categories` table
- [x] Parts listing (seller) â€” `PartsClient`, `PartCard`
- [x] Parts search and compatibility filter
- [x] Parts detail page â€” `parts/[id]`
- [x] Parts ordering â€” `placePartsOrder` with `parts_orders` table
- [x] "Find parts for my vehicle" flow
- [x] Database schema â€” `010_garage_and_parts.sql`

---

## PHASE 8 â€” Membership âœ… COMPLETE

**Goal:** Membership plan management, subscriptions, and benefit tracking.

### Features
- [x] Membership plans (admin configurable) â€” `membership_plans` table
- [x] Plan comparison page â€” `MembershipClient`
- [x] Subscription purchase (Stripe Checkout + instant activation)
- [x] Membership dashboard
- [x] Benefit enforcement
- [x] Membership payment integration â€” `switchMembershipPlan`
- [x] Membership renewal
- [x] Cancellation handling â€” `cancelMembershipSubscription`
- [x] Membership usage tracking â€” `membership_usage` table
- [x] Subscription event audit log â€” `subscription_events` table
- [x] Database schema â€” `011_membership_and_subscriptions.sql`

---

## PHASE 9 â€” Advanced Features & AI â† CURRENT

**Goal:** AI-powered automotive assistant, advanced search, and platform analytics.

### Features
- [x] AI vehicle search (natural language â†’ structured filters)
- [x] AI listing assistant (description, specs, title generation)
- [x] AI service matching
- [x] AI automotive assistant (Q&A, maintenance advice) â€” `AIAssistantClient` (DEBA)
- [ ] Advanced saved searches with alerts
- [ ] Platform analytics dashboard (admin) â€” stub present, needs full metrics
- [ ] Advanced dealer analytics
- [ ] Recommendation engine
- [ ] Performance optimizations (caching, ISR, edge middleware)
- [ ] Advanced SEO (sitemap, structured data, OG images)

### Estimated effort: 6â€“8 weeks

---

## Technology Installation Requirements

Before Phase 1 can begin, the following must be installed:

| Tool | Required For | Download |
|---|---|---|
| Git | Version control | https://git-scm.com |
| Node.js (LTS) | Next.js, npm, npx | https://nodejs.org |
| Supabase CLI | Local DB, migrations | `npm i -g supabase` |
| VS Code (recommended) | Development | https://code.visualstudio.com |

---

## Supabase Setup Required

Before Phase 1 can begin:

1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project for Debford
3. Copy the project URL and anon key to `.env.local`
4. Enable Row Level Security on all tables
5. Optionally: install Supabase CLI for local development

---

## Migration Files

Run these in order in your Supabase SQL Editor:

| File | Phase | Description |
|---|---|---|
| `001_core_schema.sql` | 1 | Profiles, vehicles, listings, organizations, messages, notifications |
| `002_storage_buckets.sql` | 1 | Supabase Storage bucket setup |
| `003_realtime.sql` | 6 | Realtime publication for auction bids |
| `004_functions.sql` | 1–2 | DB functions and triggers |
| `005_fix_handle_new_user.sql` | 1 | Auth user trigger fix |
| `006_services_marketplace.sql` | 5 | Service requests, quotes, bookings, providers |
| `007_admin_verification_audit.sql` | 1 | KYC, admin audit log, verification |
| `008_commercial_auctions.sql` | 6 | Auctions, bids, participants, settlement |
| `009_offers_and_negotiations.sql` | 3 | Vehicle offers, ownership transfers |
| `010_garage_and_parts.sql` | 7 | Garage records, expenses, reminders, parts marketplace |
| `011_membership_and_subscriptions.sql` | 8 | Membership plans, subscription events, usage tracking |

---

_Last updated: 2026-10-10_
_Status: Phase 9 — AI & Advanced Features in progress_
