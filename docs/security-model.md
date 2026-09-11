# DEBFORD — Security Model

---

## 1. Security Philosophy

Security is not a feature — it is the foundation.

Debford enforces authorization at three independent layers:

```
Layer 1: Frontend route protection (Next.js middleware)
Layer 2: Server-side validation (Server Actions / API Routes)
Layer 3: Database-level enforcement (Row Level Security)
```

**Compromise of any single layer must not result in unauthorized data access.**

---

## 2. Authentication

### Provider
Supabase Auth

### Methods (initial)
- Email + Password
- OTP / Magic Link
- OAuth (extensible: Google, Apple, Facebook — configure in Supabase dashboard)

### Session Handling
- Supabase manages JWT sessions via HTTP-only cookies (SSR pattern)
- `@supabase/ssr` used for Next.js integration
- Tokens refreshed automatically
- Session validated on every protected server-side render

### Profile Connection
```
auth.users (Supabase managed)
    ↓ id (same UUID)
profiles (application managed)
```

Never access `auth.users` directly in application code. Use `profiles` for application data.

---

## 3. Row Level Security (RLS)

**RLS must be enabled on every table containing user data.**

### Global Policy Patterns

```sql
-- Read own data only
CREATE POLICY "users_own_data" ON table_name
  FOR ALL USING (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "admin_full_access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public read
CREATE POLICY "public_read" ON table_name
  FOR SELECT USING (true);
```

---

## 4. Table-Level RLS Policies

### `profiles`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Any | Public fields visible; sensitive fields restricted |
| SELECT (own) | Authenticated | Full own profile |
| UPDATE | Owner | Own profile only |
| DELETE | Admin | Admin only |

### `vehicles`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Any | Public vehicles visible |
| INSERT | Authenticated | Own vehicles only |
| UPDATE | Owner or org member | Own or organization vehicle |
| DELETE | Owner or admin | Owner or admin |

### `sale_listings`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Any | Published listings visible |
| SELECT (draft) | Owner or admin | Own draft listings |
| INSERT | Authenticated seller/dealer | Own listings |
| UPDATE | Owner or admin | Own or admin |
| DELETE | Owner or admin | Own or admin |

### `bids`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Authenticated | Own bids or auction operator |
| INSERT | Registered participant | Active auction only |
| UPDATE | NONE | Bids are immutable |
| DELETE | NONE | Bids are never deleted |

### `rental_bookings`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Renter or provider | Own bookings only |
| INSERT | Authenticated renter | Valid listing, no overlap |
| UPDATE | Provider or renter | Own bookings, valid status transition |

### `messages`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Participant | Own conversations only |
| INSERT | Participant | Own conversations only |
| UPDATE | Sender | Own messages only |

### `orders` / `transactions`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Buyer, seller, admin | Own orders only |
| INSERT | System/server only | Via server action or edge function |
| UPDATE | System/server only | Via webhook or edge function |

### `notifications`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Owner | Own notifications only |
| INSERT | System only | Via edge function |
| UPDATE | Owner | Mark as read |

### `vehicle_documents`
| Operation | Who | Condition |
|---|---|---|
| SELECT | Owner or verified admin | Own documents only |
| INSERT | Owner | Own vehicle only |

---

## 5. Role-Based Access Matrix

| Resource | Customer | Private Seller | Dealer | Rental Provider | Service Pro | Auction Operator | Admin |
|---|---|---|---|---|---|---|---|
| Browse vehicles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create vehicle listing | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage dealership | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Create rental listing | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Bid in auction | ✅* | ✅* | ✅* | ✅* | ✅* | ❌ | ✅ |
| Create auction | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| List services | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Access garage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve listings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*With registration and eligibility approval

---

## 6. Organization Security

A user's access to organization resources is governed by their `organization_members` record.

```sql
-- Organization member policy example
CREATE POLICY "org_member_access" ON vehicles
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid() AND is_active = TRUE
    )
  );
```

**A user who is removed from an organization immediately loses access.**

---

## 7. Payment Security

- Payment processing happens **server-side only** (Supabase Edge Functions)
- Payment provider webhooks must be verified with signature validation
- Never mark an order as paid based on a client-side callback
- Payment secrets (`PAYMENT_SECRET_KEY`) are never exposed to the browser
- Transaction status is only updated by verified webhook handlers

---

## 8. File Storage Security

### Storage Bucket Policies
| Bucket | Public Read | Authenticated Write | Owner Delete |
|---|---|---|---|
| avatars | ✅ | ✅ (own) | ✅ (own) |
| vehicles | ✅ | ✅ (own vehicles) | ✅ (own) |
| vehicle-documents | ❌ | ✅ (own vehicles) | ✅ (own) |
| organizations | ❌ | ✅ (org members) | ✅ (org admin) |
| service-providers | ✅ | ✅ (own profile) | ✅ (own) |
| service-work | ✅ | ✅ (providers) | ✅ (own) |
| parts | ✅ | ✅ (sellers) | ✅ (own) |
| messages | ❌ | ✅ (participants) | ❌ |

---

## 9. API Security

### Server Actions
- All mutations use `"use server"` server actions
- Re-validate auth session before every mutation
- Never trust client-provided `user_id` — always use `auth.uid()` from session

### API Routes (Webhooks)
- Verify provider signature on all incoming webhooks
- Rate limit sensitive endpoints
- Log all admin and privileged API calls

### Edge Functions
- Use service-role key only inside Edge Functions
- Never expose service-role key in any client bundle
- Validate request origin and auth token before privileged operations

---

## 10. Environment Variables Security

```
# ✅ SAFE — exposed to client (Next.js public)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# ❌ NEVER expose to client
SUPABASE_SERVICE_ROLE_KEY     → Edge Functions / API routes only
PAYMENT_SECRET_KEY            → Edge Functions / API routes only
MAPS_API_KEY                  → Server-side only
AI_API_KEY                    → Edge Functions only
```

---

## 11. Audit Trail

The following operations produce immutable audit records:

| Event | Table |
|---|---|
| Bid placed | `bids` (immutable) |
| Auction state change | `auctions` (status + timestamps) |
| Listing status change | `sale_listings` (status + timestamps) |
| Verification decision | `verification_requests` (status + reviewer + timestamp) |
| Payment processed | `transactions` (immutable per event) |
| Admin action | Future: `admin_audit_log` |
| Booking status change | `rental_bookings` (status transitions) |

---

## 12. Data Protection Principles

- Minimize data collection to what is necessary
- Store only hashed/masked sensitive data where possible
- Never log full payment card data
- VIN and registration plates are stored but access-controlled
- User data deletion workflow must cascade appropriately
- Phone numbers and emails protected by RLS

---

_Last updated: 2026-09-09_
_Status: Architecture Phase 0_
