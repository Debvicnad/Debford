# DEBFORD — Development Roadmap

---

## Overview

Debford is built in progressive phases. Each phase produces working, tested, and secure functionality.

No phase begins in earnest until the previous phase is stable and coherent.

---

## PHASE 0 — Architecture & Documentation ← CURRENT

**Goal:** Establish the engineering foundation before writing application code.

### Deliverables
- [x] Product Requirements Document (`docs/product-requirements.md`)
- [x] Technical Architecture (`docs/technical-architecture.md`)
- [x] Database Schema (`docs/database-schema.md`)
- [x] Security Model (`docs/security-model.md`)
- [x] Development Roadmap (`docs/development-roadmap.md`)
- [ ] Design System (`docs/design-system.md`)
- [ ] Entity Relationship Diagram (`docs/erd.md`)

### Blockers
- [ ] Git must be installed — `git` not found on PATH
- [ ] Node.js must be installed — `node`, `npm`, `npx` not found on PATH

---

## PHASE 1 — Foundation

**Goal:** Working application shell with authentication, profiles, roles, and admin scaffold.

### Features
- [ ] Project initialization (Next.js 14 + TypeScript + Tailwind)
- [ ] Supabase project creation and local CLI setup
- [ ] Environment variables setup (`.env.example`)
- [ ] Design system implementation (tokens, typography, components)
- [ ] Global layout (Header, Footer, mobile nav)
- [ ] Authentication pages (sign up, sign in, sign out, reset password)
- [ ] Supabase Auth integration with SSR
- [ ] User profiles (create, read, update)
- [ ] Role system (`profiles.role`)
- [ ] Protected routes (Next.js middleware)
- [ ] Organizations (create, manage)
- [ ] Organization members
- [ ] Admin panel foundation (users list, basic controls)
- [ ] Notification system scaffold
- [ ] Basic RLS policies for profiles, organizations

### Estimated effort: 2–3 weeks

---

## PHASE 2 — Vehicle Marketplace

**Goal:** Core vehicle catalog with listings, search, filtering, and vehicle detail pages.

### Features
- [ ] Vehicle taxonomy (types, categories, makes, models, variants)
- [ ] Admin: Manage vehicle categories, makes, models
- [ ] Vehicle record creation
- [ ] Vehicle image upload (Supabase Storage)
- [ ] Vehicle features
- [ ] Vehicle documents
- [ ] Sale listings (create, edit, publish)
- [ ] Listing states (draft → review → published → sold)
- [ ] Vehicle search and advanced filters
- [ ] Vehicle listing page (grid/list view)
- [ ] Vehicle detail page (gallery, specs, seller info, CTA)
- [ ] Listing favorites
- [ ] Vehicle comparison
- [ ] Dealer profile pages
- [ ] Private seller profiles
- [ ] Listing views tracking
- [ ] Listing inquiries
- [ ] Seed data (makes, models, test listings)
- [ ] RLS for vehicles and listings

### Estimated effort: 3–4 weeks

---

## PHASE 3 — Sell / Buy

**Goal:** Full buy/sell workflow including offers, orders, and payment architecture.

### Features
- [ ] Seller dashboard (my listings, inquiries, offers)
- [ ] Dealer inventory management dashboard
- [ ] Offer system (make offer, counter, accept, reject)
- [ ] Order creation
- [ ] Transaction states
- [ ] Payment abstraction layer
- [ ] Payment integration (primary provider TBD)
- [ ] Payment webhook handling (Edge Function)
- [ ] Invoice generation
- [ ] Sold vehicle status propagation
- [ ] Ownership transfer record

### Estimated effort: 3–4 weeks

---

## PHASE 4 — Rentals

**Goal:** Full vehicle rental system with availability, booking, and inspection.

### Features
- [ ] Rental listing creation and management
- [ ] Rental rates (daily/weekly/monthly)
- [ ] Availability calendar
- [ ] Booking request
- [ ] Provider approval/rejection
- [ ] Double-booking prevention (DB constraint + server validation)
- [ ] Rental booking workflow (pending → confirmed → active → completed)
- [ ] Rental contracts
- [ ] Pre/post rental inspections
- [ ] Rental dashboard (provider)
- [ ] My bookings (renter)
- [ ] Rental cancellation handling
- [ ] RLS for rental tables

### Estimated effort: 2–3 weeks

---

## PHASE 5 — Services Marketplace

**Goal:** Full automotive services marketplace with provider profiles, requests, quotes, and bookings.

### Features
- [ ] Service categories (admin managed)
- [ ] Service provider registration and profile
- [ ] Service listings
- [ ] Service request creation (customer)
- [ ] Multi-provider quote system
- [ ] Quote comparison
- [ ] Booking creation from accepted quote
- [ ] Service booking workflow
- [ ] Provider dashboard
- [ ] Service reviews and ratings
- [ ] Provider verification
- [ ] Provider portfolio (work images)
- [ ] RLS for service tables

### Estimated effort: 3–4 weeks

---

## PHASE 6 — Commercial Auctions

**Goal:** Full commercial vehicle auction system with live bidding, real-time updates, and settlement.

### Features
- [ ] Auction creation and configuration
- [ ] Auction item (vehicle) registration
- [ ] Participant registration and approval
- [ ] Auction state management (draft → scheduled → registration → live → ended)
- [ ] Bidding (immutable bid records)
- [ ] Minimum bid increment enforcement
- [ ] Reserve price logic
- [ ] Supabase Realtime live bid updates
- [ ] Auction countdown timer
- [ ] Bid validation (active auction, eligible participant, min amount)
- [ ] Auction closing (Edge Function, bid after close rejected)
- [ ] Winner determination
- [ ] Settlement workflow
- [ ] Auction operator dashboard
- [ ] Auction history
- [ ] RLS for auction tables

### Estimated effort: 4–5 weeks

---

## PHASE 7 — Garage & Parts

**Goal:** Personal vehicle ownership management and parts marketplace.

### Features
- [ ] My Garage (add vehicles, manage)
- [ ] Garage vehicle detail (specs, notes, mileage)
- [ ] Service history (manual + auto from bookings)
- [ ] Maintenance reminders
- [ ] Vehicle expense tracking
- [ ] Vehicle documents in garage
- [ ] Parts categories (admin managed)
- [ ] Parts listing (seller)
- [ ] Parts search and compatibility filter
- [ ] Parts detail page
- [ ] Parts ordering scaffold
- [ ] "Find parts for my vehicle" flow

### Estimated effort: 3–4 weeks

---

## PHASE 8 — Membership

**Goal:** Membership plan management, subscriptions, and benefit tracking.

### Features
- [ ] Membership plans (admin configurable)
- [ ] Plan comparison page
- [ ] Subscription purchase
- [ ] Membership dashboard
- [ ] Benefit enforcement
- [ ] Membership payment integration
- [ ] Membership renewal
- [ ] Cancellation handling
- [ ] Membership usage tracking

### Estimated effort: 2–3 weeks

---

## PHASE 9 — Advanced Features & AI

**Goal:** AI-powered automotive assistant, advanced search, and platform analytics.

### Features
- [ ] AI vehicle search (natural language → structured filters)
- [ ] AI listing assistant (description, specs, title generation)
- [ ] AI service matching
- [ ] AI automotive assistant (Q&A, maintenance advice)
- [ ] Advanced saved searches with alerts
- [ ] Platform analytics dashboard (admin)
- [ ] Advanced dealer analytics
- [ ] Recommendation engine
- [ ] Performance optimizations
- [ ] Advanced SEO

### Estimated effort: 6–8 weeks

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

_Last updated: 2026-09-09_
_Status: Phase 0 — Documentation in progress_
