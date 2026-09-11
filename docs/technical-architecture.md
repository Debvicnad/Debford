# DEBFORD — Technical Architecture

---

## 1. Architecture Overview

Debford is a full-stack automotive ecosystem built on a modern JAMStack-inspired architecture with a real relational backend.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│              Next.js 14+ (App Router) + TypeScript          │
│                    Tailwind CSS + React                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      GATEWAY LAYER                          │
│            Next.js API Routes + Edge Functions              │
│                  Supabase Edge Functions                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                     BACKEND LAYER                           │
│                       Supabase                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │PostgreSQL│ │   Auth   │ │ Storage  │ │   Realtime   │   │
│  │  + RLS   │ │  (JWT)   │ │ (S3-like)│ │  (WebSocket) │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14+ (App Router) | Framework, SSR, routing |
| TypeScript | 5+ | Type safety |
| React | 18+ | UI library |
| Tailwind CSS | 3+ | Styling |
| React Query / TanStack | 5+ | Data fetching, caching |
| Zustand | 4+ | Client state management |
| React Hook Form + Zod | Latest | Forms and validation |
| Lucide React | Latest | Icons |
| Embla Carousel | Latest | Image galleries |

### Backend
| Technology | Purpose |
|---|---|
| Supabase | Backend platform |
| PostgreSQL 15+ | Primary database |
| Supabase Auth | Authentication + sessions |
| Supabase Storage | File/image storage |
| Supabase Realtime | Live auction updates, messaging |
| Supabase Edge Functions | Server-side privileged operations |
| Row Level Security | Database-level authorization |
| Supabase-generated REST API | Auto-generated CRUD |

### Development Tools
| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code quality |
| Husky + lint-staged | Git hooks |
| Jest + Testing Library | Unit and integration tests |
| Playwright | E2E tests |
| Supabase CLI | Local development, migrations |

### Infrastructure
| Platform | Purpose |
|---|---|
| Vercel | Next.js deployment |
| Supabase | Database + backend |
| GitHub | Source control |

---

## 3. Folder Structure

```
debford/
├── docs/                          # Architecture documentation
│   ├── product-requirements.md
│   ├── technical-architecture.md
│   ├── database-schema.md
│   ├── security-model.md
│   ├── user-roles.md
│   ├── api-architecture.md
│   ├── design-system.md
│   └── development-roadmap.md
│
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── (public)/              # Public-facing routes
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── vehicles/
│   │   │   ├── rentals/
│   │   │   ├── auctions/
│   │   │   ├── services/
│   │   │   ├── parts/
│   │   │   └── membership/
│   │   ├── (auth)/                # Auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/           # Authenticated user dashboards
│   │   │   ├── garage/
│   │   │   ├── messages/
│   │   │   ├── account/
│   │   │   ├── dashboard/         # Seller/dealer/provider dashboard
│   │   │   └── sell/
│   │   └── (admin)/               # Admin panel
│   │       └── admin/
│   │
│   ├── components/
│   │   ├── ui/                    # Design system primitives
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Badge/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Dropdown/
│   │   │   ├── Tabs/
│   │   │   ├── Toast/
│   │   │   └── Skeleton/
│   │   ├── layout/                # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── MobileNav/
│   │   ├── vehicles/              # Vehicle-domain components
│   │   │   ├── VehicleCard/
│   │   │   ├── VehicleGallery/
│   │   │   ├── VehicleSpecs/
│   │   │   ├── VehicleFilters/
│   │   │   └── VehicleSearch/
│   │   ├── marketplace/           # Marketplace components
│   │   │   ├── ListingCard/
│   │   │   └── PriceDisplay/
│   │   ├── rentals/               # Rental components
│   │   ├── auctions/              # Auction components
│   │   │   ├── AuctionCard/
│   │   │   ├── BidPanel/
│   │   │   └── AuctionTimer/
│   │   ├── services/              # Services components
│   │   │   └── ServiceProviderCard/
│   │   ├── garage/                # Garage components
│   │   │   └── GarageVehicleCard/
│   │   ├── messaging/             # Messaging components
│   │   │   └── MessagePanel/
│   │   ├── admin/                 # Admin panel components
│   │   └── shared/                # Cross-domain shared components
│   │       ├── VerificationBadge/
│   │       ├── ReviewCard/
│   │       ├── StatusBadge/
│   │       ├── DealerCard/
│   │       └── NotificationCenter/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server Supabase client
│   │   │   ├── admin.ts           # Service-role client (server-only)
│   │   │   └── middleware.ts      # Auth middleware
│   │   ├── auth/
│   │   │   ├── actions.ts         # Server actions for auth
│   │   │   └── helpers.ts
│   │   ├── payments/
│   │   │   └── index.ts           # Payment abstraction layer
│   │   ├── maps/
│   │   │   └── index.ts           # Maps abstraction layer
│   │   └── utils/
│   │       ├── cn.ts              # Tailwind class merger
│   │       ├── format.ts          # Formatting utilities
│   │       └── validators.ts
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   ├── useVehicles.ts
│   │   ├── useListings.ts
│   │   ├── useRealtime.ts
│   │   └── useNotifications.ts
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── database.types.ts      # Auto-generated from Supabase
│   │   ├── vehicle.types.ts
│   │   ├── listing.types.ts
│   │   ├── user.types.ts
│   │   ├── auction.types.ts
│   │   ├── rental.types.ts
│   │   └── service.types.ts
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── filter.store.ts
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/                # Database migrations
│   ├── seed.sql                   # Seed data
│   ├── functions/                 # Edge Functions
│   │   ├── process-payment/
│   │   ├── auction-close/
│   │   └── send-notification/
│   └── config.toml
│
├── public/
│   ├── images/
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.local                     # Never commit
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Authentication Architecture

### Supabase Auth Flow
```
User → Sign Up/In → Supabase Auth → JWT → Browser Cookie
                                        ↓
                              Next.js Middleware
                                        ↓
                              Route Protection Check
                                        ↓
                              Application Profile Lookup
```

### Session Management
- Supabase Auth handles session cookies
- Next.js middleware validates session on every protected route
- Server components use `createServerClient` from `@supabase/ssr`
- Client components use `createBrowserClient`

### Profile Extension
Supabase Auth creates `auth.users` records.
Debford extends this with application-level `profiles` table connected via `id = auth.users.id`.

---

## 5. API Architecture

### Data Access Layers

**Layer 1 — Direct Supabase (Client)**
For: Public reads, authenticated user CRUD within RLS policies
How: Supabase browser client → PostgreSQL via auto-generated REST

**Layer 2 — Next.js Server Actions**
For: Form submissions, mutations requiring server validation
How: `"use server"` functions → Supabase server client

**Layer 3 — Next.js API Routes**
For: Webhooks, third-party callbacks (payment webhooks etc.)
How: `/api/*` routes → server-side Supabase admin client

**Layer 4 — Supabase Edge Functions**
For: Privileged operations (auction closing, payment processing, notifications)
How: Deno/TypeScript → Supabase admin client with service-role key

### URL Conventions
```
/api/webhooks/payment        → Payment provider webhooks
/api/webhooks/supabase       → Supabase webhooks
/api/auth/callback           → OAuth callback
```

---

## 6. Realtime Architecture

Used for:
- Live auction bid updates
- Messaging conversations
- Notification delivery

Implementation:
```
Supabase Realtime → WebSocket → React hook → UI update
```

Channels:
```
auction:{auction_id}      → bid events
conversation:{conv_id}    → message events
notifications:{user_id}   → user notifications
```

---

## 7. File Storage Architecture

### Supabase Storage Buckets
```
avatars/              → User profile photos
vehicles/             → Vehicle images (gallery)
vehicle-documents/    → Registration, service history PDFs
organizations/        → Dealership logos, documents
service-providers/    → Provider profiles, portfolio images
service-work/         → Before/after work images
parts/                → Parts listing images
messages/             → Message attachments
reviews/              → Review images
```

### Storage Security
- Buckets use RLS policies
- Public read for: `avatars`, `vehicles`, `service-providers`, `parts`
- Private (authenticated only): `vehicle-documents`, `organizations`, `messages`
- Admin only: `reviews` moderation access

---

## 8. Deployment Architecture

```
GitHub → Vercel CI/CD → Vercel Edge Network
                              ↓
                        Next.js App
                              ↓
                    Supabase (managed PostgreSQL)
```

### Environment Separation
- `development` → Local Supabase instance (CLI)
- `preview` → Supabase preview branch
- `production` → Supabase production project

---

## 9. Performance Strategy

- Next.js ISR for: vehicle listings, categories, makes/models
- Next.js SSR for: search results (dynamic filters)
- Client-side: favorites state, comparison, UI interactions
- Image optimization: Next.js `<Image>` component + Supabase CDN
- Pagination: cursor-based for messages, offset for listings
- Database: indexes on high-cardinality query columns
- Caching: React Query with appropriate stale times

---

## 10. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js App Router | SSR + streaming + server actions |
| Backend | Supabase | Managed Postgres + auth + storage + realtime |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| State | Zustand + React Query | Minimal client state, server-derived data |
| Auth | Supabase Auth | Integrated with RLS, handles sessions |
| Payments | Abstraction layer | Provider-agnostic, future flexibility |
| Maps | Abstraction layer | Provider-agnostic, future flexibility |
| Type safety | TypeScript strict | Production-grade safety |

---

_Last updated: 2026-09-09_
_Status: Architecture Phase 0_
