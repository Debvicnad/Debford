# DEBFORD — Supabase Architecture

---

## 1. Supabase Project Setup

### Required Supabase Services

| Service | Usage in Debford |
|---|---|
| PostgreSQL 15+ | Primary relational database |
| Supabase Auth | User authentication, sessions, JWT |
| Supabase Storage | Images, documents, attachments |
| Supabase Realtime | Live auction bids, messaging |
| Supabase Edge Functions | Payment processing, auction close, notifications |
| Supabase REST API | Auto-generated CRUD for standard operations |

---

## 2. Environment Configuration

### `.env.example` (public template — commit this)
```env
# Supabase (public — safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase (private — server/edge only, NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Payment Provider (private — server/edge only)
PAYMENT_SECRET_KEY=your-payment-secret-here
PAYMENT_WEBHOOK_SECRET=your-webhook-secret-here

# Maps (server-side only)
MAPS_API_KEY=your-maps-api-key-here

# AI (server/edge only)
AI_API_KEY=your-ai-api-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Debford
```

---

## 3. Supabase Client Setup

### Browser Client (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### Admin Client (`src/lib/supabase/admin.ts`) — SERVER ONLY
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// ONLY use in Edge Functions or server-only code
// NEVER import in client-side or browser code
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Never expose this
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

---

## 4. Auth Middleware (`src/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/garage',
  '/dashboard',
  '/messages',
  '/account',
  '/sell',
  '/admin',
]

const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_ROUTES.some(route => path.startsWith(route))
  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin route protection (further role check happens in page)
  if (ADMIN_ROUTES.some(route => path.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

---

## 5. Storage Bucket Configuration

### Bucket Setup (run once via Supabase dashboard or CLI)

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('vehicles', 'vehicles', true),
  ('vehicle-documents', 'vehicle-documents', false),
  ('organizations', 'organizations', false),
  ('service-providers', 'service-providers', true),
  ('service-work', 'service-work', true),
  ('parts', 'parts', true),
  ('messages', 'messages', false);
```

### Storage RLS Examples

```sql
-- Avatar: owner can upload/delete, anyone can view
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Vehicle documents: owner only
CREATE POLICY "vehicle_docs_owner_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'vehicle-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 6. Realtime Channel Design

### Auction Live Updates

```typescript
// Subscribe to auction bids
const channel = supabase
  .channel(`auction:${auctionId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bids',
    filter: `auction_id=eq.${auctionId}`,
  }, handleNewBid)
  .subscribe()
```

### Messaging

```typescript
// Subscribe to conversation messages
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, handleNewMessage)
  .subscribe()
```

### Notifications

```typescript
// Subscribe to user notifications
const channel = supabase
  .channel(`notifications:${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `profile_id=eq.${userId}`,
  }, handleNotification)
  .subscribe()
```

---

## 7. Edge Functions

### Structure

```
supabase/
└── functions/
    ├── process-payment/
    │   └── index.ts       → Handle payment webhooks, update transaction status
    ├── auction-close/
    │   └── index.ts       → Close auction, determine winner, create result
    ├── send-notification/
    │   └── index.ts       → Create notification records + push
    └── generate-invoice/
        └── index.ts       → Generate PDF invoice
```

### Example Edge Function Pattern

```typescript
// supabase/functions/auction-close/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { auctionId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Safe here — server only
  )

  // Reject any bids after close (extra safety)
  // Determine winning bid
  // Create auction_result record
  // Update auction status to 'ended'
  // Trigger winner notification

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## 8. Database Migrations

All schema changes must be made through Supabase migrations (never direct SQL in production without migration).

```
supabase/migrations/
├── 20240101000000_initial_schema.sql
├── 20240101000001_vehicle_taxonomy.sql
├── 20240101000002_marketplace_listings.sql
├── 20240101000003_rental_system.sql
├── 20240101000004_auction_system.sql
├── 20240101000005_services_marketplace.sql
├── 20240101000006_garage_system.sql
├── 20240101000007_parts_marketplace.sql
├── 20240101000008_messaging.sql
├── 20240101000009_notifications.sql
├── 20240101000010_reviews.sql
├── 20240101000011_verification.sql
├── 20240101000012_membership.sql
├── 20240101000013_transactions.sql
├── 20240101000014_rls_policies.sql
└── 20240101000015_seed_data.sql
```

---

## 9. Seed Data Plan

```sql
-- Vehicle types
INSERT INTO vehicle_types (name, slug) VALUES
  ('Car', 'car'), ('Motorcycle', 'motorcycle'), ('Truck', 'truck');

-- Car categories (16 initial)
-- Motorcycle categories (12 initial)
-- Truck categories (13 initial)

-- Popular makes (Toyota, BMW, Mercedes, Ford, Honda, Nissan, etc.)
-- Popular models per make
-- Test organizations (1 test dealership, 1 test rental company)
-- Test listings (10 published vehicle listings)
-- Membership plans (Free, Basic, Premium, Business)
-- Service categories (Repairs, Body, Tires, Customization, Parts)
```

---

_Last updated: 2026-09-09_
_Status: Architecture Phase 0_
