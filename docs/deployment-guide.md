# DEBFORD — Production Deployment & Operations Guide

> **Production deployment checklist and operations manual for the Debford automotive ecosystem.**

---

## 1. Architecture Overview

```
                                      ┌────────────────┐
                                      │  Vercel Edge   │
                                      │  (Next.js 16)  │
                                      └───────┬────────┘
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      ▼                       ▼                       ▼
            ┌───────────────────┐   ┌──────────────────┐   ┌─────────────────┐
            │     Supabase      │   │      Stripe      │   │     Resend      │
            │ PostgreSQL + Auth │   │ Checkout/Webhook │   │  Transactional  │
            │ + Realtime + RLS  │   │  Payment Engine  │   │      Email      │
            └───────────────────┘   └──────────────────┘   └─────────────────┘
```

---

## 2. Supabase Production Setup

### Step 1: Create Supabase Project
1. Navigate to [supabase.com](https://supabase.com) and create a production project in your target region.
2. Note your **Project URL**, **anon public key**, and **service_role secret key** from **Project Settings → API**.

### Step 2: Run Database Migrations
Execute the SQL migration files sequentially in the Supabase SQL Editor:

| Order | Migration File | Purpose |
|---|---|---|
| 1 | `001_core_schema.sql` | Profiles, vehicles, listings, organizations, messages, notifications |
| 2 | `002_storage_buckets.sql` | Storage buckets for vehicle images, KYC documents, avatar uploads |
| 3 | `003_realtime.sql` | Realtime publication for live auction bidding |
| 4 | `004_functions.sql` | Core database triggers and stored functions |
| 5 | `005_fix_handle_new_user.sql` | Auth user trigger for automatic profile generation |
| 6 | `006_services_marketplace.sql` | Service requests, quotes, bookings, and provider profiles |
| 7 | `007_admin_verification_audit.sql` | KYC documents, moderation status, audit log trail |
| 8 | `008_commercial_auctions.sql` | Commercial auction events, live bids, participants, settlements |
| 9 | `009_offers_and_negotiations.sql` | Vehicle offers, counter-offers, ownership transfer records |
| 10 | `010_garage_and_parts.sql` | Garage vehicles, maintenance reminders, expense tracker, parts |
| 11 | `011_membership_and_subscriptions.sql` | Membership plans, subscription events, benefit enforcement |

### Step 3: Storage Buckets Configuration
Verify the following storage buckets are set to public read:
- `vehicle-images` (Public)
- `avatars` (Public)
- `parts-images` (Public)
- `documents` (Private — RLS restricted to authenticated owner and admin)

---

## 3. Vercel Deployment Workflow

### Step 1: Import Repository
1. Log in to [vercel.com](https://vercel.com) and click **Add New → Project**.
2. Select the GitHub repository: `Debvicnad/Debford`.
3. Framework Preset: **Next.js** (automatically detected).
4. Build Command: `npm run build`
5. Output Directory: `.next`

### Step 2: Configure Environment Variables
Add the following production environment variables under **Settings → Environment Variables**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]

# Application URL
NEXT_PUBLIC_APP_URL=https://debford.com
NEXT_PUBLIC_APP_NAME=Debford

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Transactional Email (Optional)
RESEND_API_KEY=re_...
```

---

## 4. Stripe Webhook Configuration

1. In the Stripe Dashboard, navigate to **Developers → Webhooks**.
2. Add an endpoint pointing to:
   ```
   https://debford.com/api/webhooks/stripe
   ```
3. Subscribe to the following events:
   - `checkout.session.completed` (Escrow deposits, parts orders, membership purchases)
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
4. Copy the **Signing Secret** into `STRIPE_WEBHOOK_SECRET` in Vercel.

---

## 5. Domain & SEO Configuration

1. **DNS Setup**: Add an `A` record pointing to `76.76.21.21` and `CNAME` for `www` to `cname.vercel-dns.com`.
2. **SSL**: Automatic Let's Encrypt SSL is provisioned by Vercel upon DNS propagation.
3. **Search Engine Sitemap**: Submit your sitemap to Google Search Console:
   ```
   https://debford.com/sitemap.xml
   ```
4. **Robots Policy**: Verify crawler indexing rules at:
   ```
   https://debford.com/robots.txt
   ```

---

## 6. PWA & Mobile Installation

Debford includes progressive web application (PWA) capabilities out of the box:
- Manifest: `/manifest.json`
- Service Worker: `/sw.js` (network-first caching with offline fallback)
- App Icons: `public/icons/` (72px to 512px)
- Prompt: Built-in `ServiceWorkerRegister` client banner for one-tap install on iOS Safari and Android Chrome.

---

## 7. Automated CI/CD Pipeline

Every push or pull request to the `main` branch automatically triggers the GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **TypeScript Typecheck**: `npx tsc --noEmit`
2. **Automated Vitest Suite**: `npm test` (Pricing, Auction validation, AI recommendation math)
3. **Production Turbopack Build**: `npm run build` (38 routes compiled and prerendered)

---

## 8. Post-Deployment Verification (Smoke Test)

Run the following checks once deployed:
- [ ] Visit homepage `https://debford.com` — verify hero visuals and vehicle discovery
- [ ] Test vehicle showroom `/vehicles` and detail page `/vehicles/[id]`
- [ ] Verify AI Recommendation engine matches load on vehicle details
- [ ] Check `/manifest.json` and `/sw.js` return HTTP 200
- [ ] Test `/auctions` and live bidding telemetry
- [ ] Verify `/dealership` command centre and telemetry charts
- [ ] Check `/admin` dashboard analytics panel
- [ ] Test `/login` and demo operator session persistence
